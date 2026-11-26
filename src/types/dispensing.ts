export type DispenseStatus = 
  | 'WAITING_CONFIRMATION'
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNKNOWN'
  | 'DEVICE_OFFLINE';

export interface ServoConfig {
  gpioPin: number;
  initialAngle: number;
  dispenseAngle: number;
  returnAngle: number;
  holdTimeMs: number;
}

export interface DispensingCommand {
  commandId: string;
  medicineId: string;
  medicineName: string;
  requestedQuantity: number;
  cycles: number;
  deviceId: string;
  userId: string;
  userEmail: string;
  status: DispenseStatus;
  executionResult: string;
  servoConfig: ServoConfig;
  paymentTransactionId: string;
  paymentAmount: number;
  paymentStatus: 'VERIFIED' | 'HARDWARE_TEST';
  createdAt: string;
  claimedAt?: string;
  completedAt?: string;
  updatedAt: string;
  errorReason?: string;
}

export interface MedicineInventory {
  medicineId: string;
  name: string;
  availableQuantity: number;
  reservedQuantity: number;
  dispensedQuantity: number;
  unit: string;
  slotNumber: number;
  updatedAt: string;
}

export interface DispenserDevice {
  deviceId: string;
  deviceName: string;
  deviceToken?: string;
  status: 'ONLINE' | 'OFFLINE';
  lastHeartbeat: unknown;
  ipAddress?: string;
  wifiSsid?: string;
  wifiRssi?: number;
  servoPin: number;
  servoInitialAngle: number;
  servoDispenseAngle: number;
  servoHoldTimeMs: number;
}
