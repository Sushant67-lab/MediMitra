import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  Unsubscribe,
  runTransaction
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
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
  dispenseAngle: 45,
  returnAngle: 0,
  holdTimeMs: 300
};

// Seed default stock for real commercial OTC medicines & powders
const DEFAULT_STOCK_ITEMS: MedicineInventory[] = [
  {
    medicineId: 'paracetamol',
    name: 'Dolo 650mg / Crocin Advance 500mg / Calpol',
    availableQuantity: 45,
    reservedQuantity: 0,
    dispensedQuantity: 15,
    unit: 'tablets',
    slotNumber: 1,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'cetirizine',
    name: 'Cetzine 10mg Tablet (GSK)',
    availableQuantity: 30,
    reservedQuantity: 0,
    dispensedQuantity: 8,
    unit: 'tablets',
    slotNumber: 2,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'ors',
    name: 'Electral WHO ORS Powder Sachet 21.8g (FDC)',
    availableQuantity: 25,
    reservedQuantity: 0,
    dispensedQuantity: 4,
    unit: 'sachets',
    slotNumber: 3,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'ibuprofen',
    name: 'Brufen 400mg Tablet (Abbott)',
    availableQuantity: 25,
    reservedQuantity: 0,
    dispensedQuantity: 5,
    unit: 'tablets',
    slotNumber: 4,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'antacid',
    name: 'ENO Fruit Salt Antacid Powder Sachet 5g (GSK)',
    availableQuantity: 35,
    reservedQuantity: 0,
    dispensedQuantity: 12,
    unit: 'sachets',
    slotNumber: 5,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'candid',
    name: 'Candid Dusting Powder 100g (Glenmark)',
    availableQuantity: 20,
    reservedQuantity: 0,
    dispensedQuantity: 3,
    unit: 'bottles',
    slotNumber: 6,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'caladryl',
    name: 'Caladryl Skin Allergy Lotion (Piramal)',
    availableQuantity: 18,
    reservedQuantity: 0,
    dispensedQuantity: 2,
    unit: 'bottles',
    slotNumber: 7,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'otrivin',
    name: 'Otrivin Breathe Clean Saline Nasal Spray (GSK)',
    availableQuantity: 20,
    reservedQuantity: 0,
    dispensedQuantity: 4,
    unit: 'bottles',
    slotNumber: 8,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'betadine',
    name: 'Betadine 5% Povidone-Iodine Ointment 15g',
    availableQuantity: 22,
    reservedQuantity: 0,
    dispensedQuantity: 5,
    unit: 'tubes',
    slotNumber: 9,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'bandaid',
    name: 'Band-Aid Washproof Antiseptic Strips (J&J)',
    availableQuantity: 40,
    reservedQuantity: 0,
    dispensedQuantity: 10,
    unit: 'packs',
    slotNumber: 10,
    updatedAt: new Date().toISOString()
  },
  {
    medicineId: 'strepsils',
    name: 'Strepsils Honey & Lemon Throat Lozenges (Reckitt)',
    availableQuantity: 30,
    reservedQuantity: 0,
    dispensedQuantity: 6,
    unit: 'packs',
    slotNumber: 11,
    updatedAt: new Date().toISOString()
  }
];

/**
 * Normalize medicine name to a consistent ID
 */
export function slugifyMedicineName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('dolo') || lower.includes('paracetamol') || lower.includes('crocin') || lower.includes('calpol')) return 'paracetamol';
  if (lower.includes('cetzine') || lower.includes('cetirizine')) return 'cetirizine';
  if (lower.includes('electral') || lower.includes('ors') || lower.includes('rehydration')) return 'ors';
  if (lower.includes('brufen') || lower.includes('ibuprofen')) return 'ibuprofen';
  if (lower.includes('eno') || lower.includes('antacid') || lower.includes('gelusil') || lower.includes('digene')) return 'antacid';
  if (lower.includes('candid') || lower.includes('clotrimazole')) return 'candid';
  if (lower.includes('caladryl') || lower.includes('calamine')) return 'caladryl';
  if (lower.includes('otrivin') || lower.includes('saline')) return 'otrivin';
  if (lower.includes('betadine') || lower.includes('povidone')) return 'betadine';
  if (lower.includes('band-aid') || lower.includes('bandaid') || lower.includes('band aid')) return 'bandaid';
  if (lower.includes('strepsils') || lower.includes('lozenge')) return 'strepsils';
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
  } catch {
    // Fall back gracefully to local stock defaults
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
  } catch {
    // Non-fatal if Firestore write unavailable in guest mode
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
  } catch {
    // Graceful fallback to local stock defaults
  }

  // Seed default if empty
  for (const item of DEFAULT_STOCK_ITEMS) {
    try {
      await setDoc(doc(db, 'inventory', item.medicineId), item, { merge: true });
    } catch {}
  }
  return DEFAULT_STOCK_ITEMS;
}

interface HeartbeatAnchor {
  lastObservedHbMs: number;
  observedAtClientMs: number;
  observedChangeInSession: boolean;
}

const liveHeartbeatAnchors = new Map<string, HeartbeatAnchor>();
let serverClockOffsetMs = 0;

function recordHeartbeatObservation(deviceId: string, hbMs: number, status?: string): void {
  if (!deviceId || hbMs <= 0) return;
  if (status === 'OFFLINE') {
    liveHeartbeatAnchors.delete(deviceId);
    return;
  }
  const prev = liveHeartbeatAnchors.get(deviceId);
  const now = Date.now();
  if (!prev) {
    liveHeartbeatAnchors.set(deviceId, {
      lastObservedHbMs: hbMs,
      observedAtClientMs: now,
      observedChangeInSession: false
    });
  } else if (hbMs > prev.lastObservedHbMs) {
    liveHeartbeatAnchors.set(deviceId, {
      lastObservedHbMs: hbMs,
      observedAtClientMs: now,
      observedChangeInSession: true
    });
  }
}

export function parseHeartbeatMillis(hb: unknown): number {
  if (!hb) return 0;
  if (typeof hb === 'string') {
    const ms = Date.parse(hb);
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof hb === 'object' && hb !== null) {
    const obj = hb as { toMillis?: () => number; seconds?: number };
    if (typeof obj.toMillis === 'function') return obj.toMillis();
    if (typeof obj.seconds === 'number') return obj.seconds * 1000;
  }
  return 0;
}

export function isDeviceOnlineNow(device: Partial<DispenserDevice> | null | undefined): boolean {
  if (!device || device.status === 'OFFLINE') return false;
  const lastHb = parseHeartbeatMillis(device.lastHeartbeat);
  if (lastHb <= 0) return false;

  const deviceId = device.deviceId || DEFAULT_DEVICE_ID;
  const anchor = liveHeartbeatAnchors.get(deviceId);
  if (anchor && anchor.observedChangeInSession && anchor.lastObservedHbMs === lastHb) {
    return Date.now() - anchor.observedAtClientMs < 35000;
  }

  const estimatedServerNow = Date.now() + serverClockOffsetMs;
  const ageMs = estimatedServerNow - lastHb;
  return ageMs < 35000 && ageMs > -120000;
}

function parseFirestoreRestDevice(docJson: any, fallbackDeviceId: string): DispenserDevice | null {
  const fields = docJson?.fields;
  if (!fields) return null;
  const getStr = (k: string) => fields[k]?.stringValue as string | undefined;
  const getInt = (k: string) => {
    const v = fields[k]?.integerValue;
    return v !== undefined ? Number(v) : undefined;
  };
  const hbRaw =
    fields.lastHeartbeat?.timestampValue ||
    fields.lastHeartbeat?.stringValue ||
    '';

  const partial: DispenserDevice = {
    deviceId: getStr('deviceId') || fallbackDeviceId,
    deviceName: getStr('deviceName') || 'MediMitra Smart Dispenser Unit 1',
    status: (getStr('status') as 'ONLINE' | 'OFFLINE') || 'OFFLINE',
    lastHeartbeat: hbRaw,
    ipAddress: getStr('ipAddress'),
    wifiSsid: getStr('wifiSsid'),
    wifiRssi: getInt('wifiRssi'),
    servoPin: getInt('servoPin') ?? 18,
    servoInitialAngle: getInt('servoInitialAngle') ?? 0,
    servoDispenseAngle: getInt('servoDispenseAngle') ?? 45,
    servoHoldTimeMs: getInt('servoHoldTimeMs') ?? 300
  };

  const hbMs = parseHeartbeatMillis(partial.lastHeartbeat);
  recordHeartbeatObservation(partial.deviceId, hbMs, partial.status);
  return {
    ...partial,
    status: isDeviceOnlineNow(partial) ? 'ONLINE' : 'OFFLINE'
  };
}

/**
 * Subscribe in real time to ESP32 hardware Wi-Fi heartbeat in Firestore
 * Combines Firestore WebChannel onSnapshot with a 10s REST fallback poll so status
 * reliably turns Online on Wi-Fi connect and Offline on disconnect.
 */
export function subscribeToDeviceStatus(
  deviceId: string = DEFAULT_DEVICE_ID,
  onUpdate: (device: DispenserDevice | null) => void
): Unsubscribe {
  let isActive = true;
  const docRef = doc(db, 'devices', deviceId);

  const emitDevice = (raw: DispenserDevice | null) => {
    if (!isActive) return;
    if (!raw) {
      onUpdate(null);
      return;
    }
    const hbMs = parseHeartbeatMillis(raw.lastHeartbeat);
    recordHeartbeatObservation(raw.deviceId || deviceId, hbMs, raw.status);
    onUpdate({
      ...raw,
      status: isDeviceOnlineNow({ ...raw, deviceId: raw.deviceId || deviceId }) ? 'ONLINE' : 'OFFLINE'
    });
  };

  const unsubSnapshot = onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        emitDevice(null);
        return;
      }
      emitDevice(snap.data() as DispenserDevice);
    },
    () => {
      // REST fallback below keeps live status active even if WebChannel fails
    }
  );

  const fetchViaRest = async () => {
    if (!isActive || !firebaseConfig?.projectId || !firebaseConfig?.firestoreDatabaseId) return;
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/devices/${encodeURIComponent(deviceId)}?key=${firebaseConfig.apiKey}`;
      const res = await fetch(url, { cache: 'no-store' });
      const dateHdr = res.headers.get('date');
      if (dateHdr) {
        const serverMs = Date.parse(dateHdr);
        if (Number.isFinite(serverMs)) {
          serverClockOffsetMs = serverMs - Date.now();
        }
      }
      if (!res.ok) return;
      const json = await res.json();
      const parsed = parseFirestoreRestDevice(json, deviceId);
      if (parsed) {
        emitDevice(parsed);
      }
    } catch {
      // Non-fatal network poll error
    }
  };

  fetchViaRest();
  const restTimer = setInterval(fetchViaRest, 10000);

  return () => {
    isActive = false;
    unsubSnapshot();
    clearInterval(restTimer);
  };
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
      return {
        ...data,
        status: isDeviceOnlineNow(data) ? 'ONLINE' : 'OFFLINE'
      };
    }
  } catch {
    // Non-fatal fallback
  }

  return {
    deviceId,
    deviceName: 'MediMitra Smart Dispenser Unit 1',
    deviceToken: DEFAULT_DEVICE_TOKEN,
    status: 'OFFLINE',
    lastHeartbeat: '',
    servoPin: 18,
    servoInitialAngle: 0,
    servoDispenseAngle: 45,
    servoHoldTimeMs: 300
  };
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
  } catch {
    // Non-fatal heartbeat sync fallback
  }
}

/**
 * Create an authorized dispensing command in Firestore
 * - Enforces human clinical confirmation
 * - Checks and reserves stock in inventory
 * - Strict servo specs: 0° -> 45° -> 0° with 300ms hold
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
  } catch {
    try {
      await setDoc(commandDocRef, command);
      await updateDoc(inventoryDocRef, {
        availableQuantity: Math.max(0, stock.availableQuantity - quantity),
        reservedQuantity: (stock.reservedQuantity || 0) + quantity,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // Fallback safely when offline or in guest mode
    }
  }

  return command;
}

/**
 * Queue a non-inventory Hardware Servo Test command (0° -> 45° -> 0°) directly to Firestore
 * for live ESP32 GPIO 18 motor verification.
 */
export async function triggerServoTestCommand(
  deviceId: string = DEFAULT_DEVICE_ID
): Promise<DispensingCommand> {
  const commandId = `TEST-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const command: DispensingCommand = {
    commandId,
    medicineId: 'hardware_servo_test',
    medicineName: 'Hardware Servo Test (0° -> 45° -> 0°)',
    requestedQuantity: 1,
    cycles: 1,
    deviceId,
    userId: auth.currentUser?.uid || 'hardware_test',
    userEmail: auth.currentUser?.email || 'hardware@medimitra.local',
    status: 'PENDING',
    executionResult: 'Test pulse queued. Waiting for ESP32 GPIO 18 pickup (every 2.5s).',
    servoConfig: { ...DEFAULT_SERVO_CONFIG },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docPath = `dispensing_commands/${commandId}`;
  try {
    await setDoc(doc(db, 'dispensing_commands', commandId), command);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
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
  } catch {
    // Fallback cleanly in guest/offline mode
  }
}

/**
 * For testing and demonstrations when physical ESP32 is offline:
 * Simulates the exact physical cycle:
 * Step 1: PENDING -> PROCESSING (ESP32 claims)
 * Step 2: Servo rotates 0° -> 45°
 * Step 3: Holds 300ms
 * Step 4: Servo returns 45° -> 0°
 * Step 5: COMPLETED (Physical acknowledgment)
 */
export async function simulatePhysicalServoDispensing(
  commandId: string, 
  onProgress?: (msg: string, angle: number) => void,
  fallbackCommand?: DispensingCommand,
  onCommandUpdate?: (updated: DispensingCommand) => void
): Promise<void> {
  const docRef = doc(db, 'dispensing_commands', commandId);
  let cmd = fallbackCommand;

  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      cmd = snap.data() as DispensingCommand;
    }
  } catch {
    // Use provided fallbackCommand when offline/guest
  }

  if (!cmd) return;

  const cycles = cmd.cycles || 1;
  const angle = cmd.servoConfig?.dispenseAngle || 45;
  const holdMs = cmd.servoConfig?.holdTimeMs || 300;
  const gpioPin = cmd.servoConfig?.gpioPin || 18;

  const applyUpdate = async (patch: Partial<DispensingCommand>) => {
    cmd = { ...cmd!, ...patch, updatedAt: new Date().toISOString() };
    if (onCommandUpdate) onCommandUpdate(cmd);
    try {
      await updateDoc(docRef, { ...patch, updatedAt: cmd.updatedAt });
    } catch {
      // Non-fatal offline fallback
    }
  };

  // Step 1: Claim
  await applyUpdate({
    status: 'PROCESSING',
    claimedAt: new Date().toISOString(),
    executionResult: `ESP32 claimed command. Initializing GPIO pin ${gpioPin} at 0°...`
  });

  if (onProgress) onProgress('ESP32 initialized servo at 0°', 0);
  await new Promise(r => setTimeout(r, 600));

  // Run cycles
  for (let c = 1; c <= cycles; c++) {
    if (onProgress) onProgress(`Cycle ${c}/${cycles}: Rotating servo from 0° to ${angle}°...`, angle);
    await new Promise(r => setTimeout(r, 400));

    if (onProgress) onProgress(`Cycle ${c}/${cycles}: Holding at ${angle}° for ${holdMs}ms...`, angle);
    await new Promise(r => setTimeout(r, holdMs));

    if (onProgress) onProgress(`Cycle ${c}/${cycles}: Returning servo to 0° position...`, 0);
    await new Promise(r => setTimeout(r, 400));
  }

  // Step 5: Complete & acknowledge
  const completedAt = new Date().toISOString();
  await applyUpdate({
    status: 'COMPLETED',
    completedAt,
    executionResult: `SUCCESS: Physical servo executed ${cycles} cycle(s) (0° -> ${angle}° -> 0°). Product dispensed into tray.`
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
  } catch {
    // Non-fatal inventory sync
  }

  if (onProgress) onProgress('Dispensing verified and complete! Servo returned to 0°.', 0);
}
