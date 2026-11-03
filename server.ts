import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  runTransaction
} from 'firebase/firestore';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Load Firebase Config
let firebaseConfig: any = {};
try {
  const configPath = path.resolve('firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (err) {
  console.warn('Could not load firebase-applet-config.json:', err);
}

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

const EXPECTED_DEVICE_TOKEN = process.env.DEVICE_SECRET_TOKEN || 'mm_esp32_sec_key_2025';

// Middleware for ESP32 device authentication
function authenticateDevice(req: Request, res: Response, next: Function) {
  const token = req.headers['x-device-token'] || req.query.token || req.body?.token;
  if (!token || token !== EXPECTED_DEVICE_TOKEN) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing device authentication token',
      code: 'AUTH_FAILED'
    });
  }
  next();
}

// -------------------------------------------------------------
// ESP32 REST API ENDPOINTS
// -------------------------------------------------------------

/**
 * 1. ESP32 Heartbeat endpoint
 * ESP32 periodically sends ping with IP and device ID
 */
app.post('/api/device/heartbeat', authenticateDevice, async (req: Request, res: Response) => {
  try {
    const { deviceId = 'ESP32_MEDIMITRA_01' } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    const deviceRef = doc(db, 'devices', deviceId);
    await setDoc(deviceRef, {
      deviceId,
      deviceName: 'MediMitra Smart Dispenser Unit 1',
      status: 'ONLINE',
      lastHeartbeat: new Date().toISOString(),
      ipAddress: String(clientIp),
      servoPin: 18,
      servoInitialAngle: 0,
      servoDispenseAngle: 25,
      servoHoldTimeMs: 300
    }, { merge: true });

    return res.json({
      status: 'OK',
      deviceId,
      serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Device heartbeat error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 2. ESP32 Command Polling Endpoint
 * Atomically claims the next PENDING command for this device and switches to PROCESSING
 */
app.get('/api/device/poll', authenticateDevice, async (req: Request, res: Response) => {
  try {
    const deviceId = (req.query.deviceId as string) || 'ESP32_MEDIMITRA_01';
    const commandsRef = collection(db, 'dispensing_commands');
    
    // Find oldest pending command for this device
    const q = query(
      commandsRef, 
      where('deviceId', '==', deviceId), 
      where('status', '==', 'PENDING'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return res.json({
        status: 'IDLE',
        hasCommand: false,
        command: null
      });
    }

    const docSnapshot = snapshot.docs[0];
    const commandDocRef = doc(db, 'dispensing_commands', docSnapshot.id);
    let claimedCommand: any = null;

    // Atomically claim the command to prevent double-execution
    await runTransaction(db, async (txn) => {
      const freshSnap = await txn.get(commandDocRef);
      if (!freshSnap.exists()) return;
      const data = freshSnap.data();
      if (data.status !== 'PENDING') return;

      const now = new Date().toISOString();
      txn.update(commandDocRef, {
        status: 'PROCESSING',
        claimedAt: now,
        updatedAt: now,
        executionResult: 'Claimed by ESP32. Servo movement initiated.'
      });

      claimedCommand = {
        ...data,
        status: 'PROCESSING',
        claimedAt: now
      };
    });

    if (!claimedCommand) {
      return res.json({
        status: 'IDLE',
        hasCommand: false,
        command: null
      });
    }

    // Return sanitized command payload for ESP32
    return res.json({
      status: 'COMMAND_AVAILABLE',
      hasCommand: true,
      command: {
        commandId: claimedCommand.commandId,
        medicineId: claimedCommand.medicineId,
        medicineName: claimedCommand.medicineName,
        requestedQuantity: claimedCommand.requestedQuantity || 1,
        cycles: claimedCommand.cycles || claimedCommand.requestedQuantity || 1,
        servo: {
          gpioPin: claimedCommand.servoConfig?.gpioPin || 18,
          initialAngle: claimedCommand.servoConfig?.initialAngle ?? 0,
          dispenseAngle: claimedCommand.servoConfig?.dispenseAngle ?? 25,
          returnAngle: claimedCommand.servoConfig?.returnAngle ?? 0,
          holdTimeMs: claimedCommand.servoConfig?.holdTimeMs ?? 300
        }
      }
    });
  } catch (error: any) {
    console.error('Device poll error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 3. ESP32 Command Acknowledgment Endpoint
 * ESP32 notifies when physical movement is complete or failed
 */
app.post('/api/device/ack', authenticateDevice, async (req: Request, res: Response) => {
  try {
    const { 
      commandId, 
      status, // 'COMPLETED' | 'FAILED'
      executionResult, 
      errorMessage,
      cyclesExecuted = 1 
    } = req.body;

    if (!commandId || !status) {
      return res.status(400).json({ error: 'Missing required parameters (commandId, status)' });
    }

    const commandDocRef = doc(db, 'dispensing_commands', commandId);
    const snap = await getDoc(commandDocRef);

    if (!snap.exists()) {
      return res.status(404).json({ error: 'Command not found' });
    }

    const cmdData = snap.data();
    const now = new Date().toISOString();

    const finalStatus = status === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
    const resultMsg = executionResult || (
      finalStatus === 'COMPLETED' 
        ? `Physical servo executed ${cyclesExecuted} dispensing cycle(s) (0° -> 25° -> 0°). Tablet confirmed dispensed.` 
        : `Dispensing failed: ${errorMessage || 'Hardware or sensor timeout.'}`
    );

    // Update command record
    await updateDoc(commandDocRef, {
      status: finalStatus,
      completedAt: now,
      updatedAt: now,
      executionResult: resultMsg,
      ...(errorMessage ? { errorReason: errorMessage } : {})
    });

    // Update inventory if completed
    if (finalStatus === 'COMPLETED' && cmdData.medicineId) {
      const invRef = doc(db, 'inventory', cmdData.medicineId);
      const invSnap = await getDoc(invRef);
      if (invSnap.exists()) {
        const invData = invSnap.data();
        await updateDoc(invRef, {
          reservedQuantity: Math.max(0, (invData.reservedQuantity || 0) - cmdData.requestedQuantity),
          dispensedQuantity: (invData.dispensedQuantity || 0) + cmdData.requestedQuantity,
          updatedAt: now
        });
      }
    } else if (finalStatus === 'FAILED' && cmdData.medicineId) {
      // Revert reserved stock back to available
      const invRef = doc(db, 'inventory', cmdData.medicineId);
      const invSnap = await getDoc(invRef);
      if (invSnap.exists()) {
        const invData = invSnap.data();
        await updateDoc(invRef, {
          availableQuantity: (invData.availableQuantity || 0) + cmdData.requestedQuantity,
          reservedQuantity: Math.max(0, (invData.reservedQuantity || 0) - cmdData.requestedQuantity),
          updatedAt: now
        });
      }
    }

    return res.json({
      success: true,
      commandId,
      status: finalStatus,
      message: 'Command acknowledged and recorded in Firebase.'
    });
  } catch (error: any) {
    console.error('Device ack error:', error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 4. General Device Configuration Status
 */
app.get('/api/device/config', async (req: Request, res: Response) => {
  return res.json({
    appName: 'MediMitra Smart Dispenser System',
    supportedHardware: 'ESP32 NodeMCU / DevKit V1 + SG90 Servo',
    defaultPin: 18,
    defaultInitialAngle: 0,
    defaultDispenseAngle: 25,
    defaultHoldTimeMs: 300,
    apiEndpoints: {
      poll: '/api/device/poll?deviceId=ESP32_MEDIMITRA_01',
      ack: '/api/device/ack',
      heartbeat: '/api/device/heartbeat'
    }
  });
});

// -------------------------------------------------------------
// VITE / STATIC CLIENT MOUNTING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist'))) {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediMitra Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
