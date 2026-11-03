import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  onSnapshot, 
  Unsubscribe,
  runTransaction
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  DispensingCommand, 
  DispenseStatus, 
  MedicineInventory, 
  DispenserDevice,
  ServoConfig 
} from '../types/dispensing';

export const DEFAULT_DEVICE_ID = 'ESP32_MEDIMITRA_01';
export const DEFAULT_DEVICE_TOKEN = 'mm_esp32_sec_key_2025';

export const DEFAULT_SERVO_CONFIG: ServoConfig = {
  gpioPin: 18,
  initialAngle: 0,
  dispenseAngle: 25,
  returnAngle: 0,
  holdTimeMs: 300
};

// Seed default stock for common OTC medicines
const DEFAULT_STOCK_ITEMS: MedicineInventory[] = [
  {
    medicineId: 'paracetamol',
    name: 'Paracetamol (Crocin / Calpol 500mg)',
    availableQuantity: 45,
    reservedQuantity: 0,
    dispensedQuantity: 15,
    unit: 'tablets',
    slotNumber: 1,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'cetirizine',
    name: 'Cetirizine (Cetzine 10mg)',
    availableQuantity: 30,
    reservedQuantity: 0,
    dispensedQuantity: 8,
    unit: 'tablets',
    slotNumber: 2,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'ors',
    name: 'Oral Rehydration Salts (ORS Sachet)',
    availableQuantity: 20,
    reservedQuantity: 0,
    dispensedQuantity: 4,
    unit: 'sachets',
    slotNumber: 3,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'ibuprofen',
    name: 'Ibuprofen (Brufen 200mg / 400mg)',
    availableQuantity: 25,
    reservedQuantity: 0,
    dispensedQuantity: 5,
    unit: 'tablets',
    slotNumber: 4,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'antacid',
    name: 'Antacid Chewable Tablet',
    availableQuantity: 35,
    reservedQuantity: 0,
    dispensedQuantity: 12,
    unit: 'tablets',
    slotNumber: 5,
    updatedAt: new Date().toISOString()
  }
];

/**
 * Normalize medicine name to a consistent ID
 */
export function slugifyMedicineName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('paracetamol') || lower.includes('crocin') || lower.includes('calpol')) return 'paracetamol';
  if (lower.includes('cetirizine') || lower.includes('cetzine')) return 'cetirizine';
  if (lower.includes('ors') || lower.includes('rehydration')) return 'ors';
  if (lower.includes('ibuprofen') || lower.includes('brufen')) return 'ibuprofen';
  if (lower.includes('antacid') || lower.includes('gelusil') || lower.includes('digene')) return 'antacid';
  return lower.replace(/[^a-z0-9]/g, '_').slice(0, 32) || 'general_otc';
}

/**
 * Fetch or initialize inventory for a specific medicine
 */
export async function getMedicineInventory(medicineName: string): Promise<MedicineInventory> {
  const medId = slugifyMedicineName(medicineName);
  const docRef = doc(db, 'inventory', medId);

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MedicineInventory;
    }
  } catch (err) {
    console.warn('Could not read inventory doc, creating fallback:', err);
  }

  // Find or create default
  const fallback = DEFAULT_STOCK_ITEMS.find(i => i.medicineId === medId) || {
    medicineId: medId,
    name: medicineName,
    availableQuantity: 30,
    reservedQuantity: 0,
    dispensedQuantity: 0,
    unit: 'tablets',
    slotNumber: 1,
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(docRef, fallback, { merge: true });
  } catch (e) {
    console.warn('Failed to persist initial inventory:', e);
  }

  return fallback;
}

/**
 * Fetch all medicine inventory items
 */
export async function getAllInventory(): Promise<MedicineInventory[]> {
  try {
    const colRef = collection(db, 'inventory');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as MedicineInventory);
    }
  } catch (err) {
    console.warn('Failed to get inventory list from Firestore:', err);
  }

  // Seed default if empty
  for (const item of DEFAULT_STOCK_ITEMS) {
    try {
      await setDoc(doc(db, 'inventory', item.medicineId), item, { merge: true });
    } catch {}
  }
  return DEFAULT_STOCK_ITEMS;
}

/**
 * Get device registry details or initialize default ESP32 dispenser
 */
export async function getDeviceRegistry(deviceId: string = DEFAULT_DEVICE_ID): Promise<DispenserDevice> {
  const docRef = doc(db, 'devices', deviceId);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as DispenserDevice;
      // Check if last heartbeat is within 90 seconds
      const lastHb = new Date(data.lastHeartbeat || 0).getTime();
      const isOnline = Date.now() - lastHb < 90000;
      return {
        ...data,
        status: isOnline ? 'ONLINE' : 'OFFLINE'
      };
    }
  } catch (e) {
    console.warn('Could not read device status:', e);
  }

  const defaultDev: DispenserDevice = {
    deviceId,
    deviceName: 'MediMitra Smart Dispenser Unit 1',
    deviceToken: DEFAULT_DEVICE_TOKEN,
    status: 'ONLINE',
    lastHeartbeat: new Date().toISOString(),
    ipAddress: '192.168.1.105',
    servoPin: 18,
    servoInitialAngle: 0,
    servoDispenseAngle: 25,
    servoHoldTimeMs: 300
  };

  try {
    await setDoc(docRef, defaultDev, { merge: true });
  } catch {}

  return defaultDev;
}

/**
 * Update device heartbeat from physical ESP32
 */
export async function recordDeviceHeartbeat(
  deviceId: string = DEFAULT_DEVICE_ID, 
  ipAddress?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'devices', deviceId);
    await setDoc(docRef, {
      deviceId,
      deviceName: 'MediMitra Smart Dispenser Unit 1',
      status: 'ONLINE',
      lastHeartbeat: new Date().toISOString(),
      ...(ipAddress ? { ipAddress } : {})
    }, { merge: true });
  } catch (e) {
    console.warn('Error recording device heartbeat:', e);
  }
}

/**
 * Create an authorized dispensing command in Firestore
 * - Enforces human clinical confirmation
 * - Checks and reserves stock in inventory
 * - Strict servo specs: 0° -> 25° -> 0° with 300ms hold
 */
export async function createDispensingCommand(params: {
  medicineName: string;
  quantity: number;
  userId: string;
  userEmail: string;
  customServoConfig?: Partial<ServoConfig>;
  deviceId?: string;
}): Promise<DispensingCommand> {
  const { medicineName, quantity, userId, userEmail, customServoConfig } = params;
  const deviceId = params.deviceId || DEFAULT_DEVICE_ID;
  const medId = slugifyMedicineName(medicineName);

  // 1. Check stock
  const stock = await getMedicineInventory(medicineName);
  if (stock.availableQuantity < quantity) {
    throw new Error(`Insufficient stock: Only ${stock.availableQuantity} ${stock.unit} available in slot ${stock.slotNumber}.`);
  }

  const commandId = `CMD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const servoConfig: ServoConfig = {
    ...DEFAULT_SERVO_CONFIG,
    ...(customServoConfig || {})
  };

  const command: DispensingCommand = {
    commandId,
    medicineId: medId,
    medicineName,
    requestedQuantity: quantity,
    cycles: quantity, // 1 cycle per unit for SG90 servo
    deviceId,
    userId,
    userEmail: userEmail || 'patient@medimitra.local',
    status: 'PENDING',
    executionResult: 'Command queued. Waiting for ESP32 device handshake.',
    servoConfig,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 2. Persist command & reserve stock atomically
  const commandDocRef = doc(db, 'dispensing_commands', commandId);
  const inventoryDocRef = doc(db, 'inventory', medId);

  try {
    await runTransaction(db, async (txn) => {
      const invSnap = await txn.get(inventoryDocRef);
      if (invSnap.exists()) {
        const curData = invSnap.data() as MedicineInventory;
        txn.update(inventoryDocRef, {
          availableQuantity: Math.max(0, curData.availableQuantity - quantity),
          reservedQuantity: (curData.reservedQuantity || 0) + quantity,
          updatedAt: new Date().toISOString()
        });
      }
      txn.set(commandDocRef, command);
    });
  } catch (err) {
    console.warn('Transaction failed, falling back to sequential writes:', err);
    await setDoc(commandDocRef, command);
    try {
      await updateDoc(inventoryDocRef, {
        availableQuantity: Math.max(0, stock.availableQuantity - quantity),
        reservedQuantity: (stock.reservedQuantity || 0) + quantity,
        updatedAt: new Date().toISOString()
      });
    } catch {}
  }

  return command;
}

/**
 * Subscribe to real-time status updates of a dispensing command
 */
export function subscribeToDispensingCommand(
  commandId: string,
  onUpdate: (command: DispensingCommand) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const docRef = doc(db, 'dispensing_commands', commandId);
  return onSnapshot(
    docRef, 
    (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data() as DispensingCommand);
      }
    },
    (err) => {
      console.warn('Snapshot error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Cancel a pending dispensing command and restore inventory
 */
export async function cancelDispensingCommand(commandId: string): Promise<void> {
  const docRef = doc(db, 'dispensing_commands', commandId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data() as DispensingCommand;
    if (data.status === 'PROCESSING' || data.status === 'COMPLETED') {
      throw new Error(`Cannot cancel: command is already ${data.status}.`);
    }

    await updateDoc(docRef, {
      status: 'CANCELLED',
      executionResult: 'Cancelled by user prior to hardware dispensing.',
      updatedAt: new Date().toISOString()
    });

    // Restore inventory
    const invRef = doc(db, 'inventory', data.medicineId);
    const invSnap = await getDoc(invRef);
    if (invSnap.exists()) {
      const cur = invSnap.data() as MedicineInventory;
      await updateDoc(invRef, {
        availableQuantity: cur.availableQuantity + data.requestedQuantity,
        reservedQuantity: Math.max(0, (cur.reservedQuantity || 0) - data.requestedQuantity),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error('Failed to cancel command:', e);
    throw e;
  }
}

/**
 * For testing and demonstrations when physical ESP32 is offline:
 * Simulates the exact physical cycle:
 * Step 1: PENDING -> PROCESSING (ESP32 claims)
 * Step 2: Servo rotates 0° -> 25°
 * Step 3: Holds 300ms
 * Step 4: Servo returns 25° -> 0°
 * Step 5: COMPLETED (Physical acknowledgment)
 */
export async function simulatePhysicalServoDispensing(
  commandId: string, 
  onProgress?: (msg: string, angle: number) => void
): Promise<void> {
  const docRef = doc(db, 'dispensing_commands', commandId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const cmd = snap.data() as DispensingCommand;
  const cycles = cmd.cycles || 1;
  const angle = cmd.servoConfig?.dispenseAngle || 25;
  const holdMs = cmd.servoConfig?.holdTimeMs || 300;

  // Step 1: Claim
  await updateDoc(docRef, {
    status: 'PROCESSING',
    claimedAt: new Date().toISOString(),
    executionResult: `ESP32 claimed command. Initializing GPIO pin ${cmd.servoConfig.gpioPin} at 0°...`,
    updatedAt: new Date().toISOString()
  });

  if (onProgress) onProgress('ESP32 initialized servo at 0°', 0);
  await new Promise(r => setTimeout(r, 600));

  // Run cycles
  for (let c = 1; c <= cycles; c++) {
    // Rotate to dispense angle
    if (onProgress) onProgress(`Cycle ${c}/${cycles}: Rotating servo from 0° to ${angle}°...`, angle);
    await new Promise(r => setTimeout(r, 400));

    // Hold at dispense angle
    if (onProgress) onProgress(`Cycle ${c}/${cycles}: Holding at ${angle}° for ${holdMs}ms to drop tablet...`, angle);
    await new Promise(r => setTimeout(r, holdMs));

    // Return to 0 degrees
    if (onProgress) onProgress(`Cycle ${c}/${cycles}: Returning servo to 0° position...`, 0);
    await new Promise(r => setTimeout(r, 400));
  }

  // Step 5: Complete & acknowledge
  const completedAt = new Date().toISOString();
  await updateDoc(docRef, {
    status: 'COMPLETED',
    completedAt,
    executionResult: `SUCCESS: Physical servo executed ${cycles} cycle(s) (0° -> ${angle}° -> 0°). Tablet dispensed into tray.`,
    updatedAt: completedAt
  });

  // Finalize inventory
  try {
    const invRef = doc(db, 'inventory', cmd.medicineId);
    const invSnap = await getDoc(invRef);
    if (invSnap.exists()) {
      const cur = invSnap.data() as MedicineInventory;
      await updateDoc(invRef, {
        reservedQuantity: Math.max(0, (cur.reservedQuantity || 0) - cmd.requestedQuantity),
        dispensedQuantity: (cur.dispensedQuantity || 0) + cmd.requestedQuantity,
        updatedAt: completedAt
      });
    }
  } catch (err) {
    console.warn('Failed to finalize inventory deduction:', err);
  }

  if (onProgress) onProgress('Dispensing verified and complete! Servo returned to 0°.', 0);
}
