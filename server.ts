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
import crypto from 'crypto';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

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

const EXPECTED_DEVICE_TOKEN = (process.env.DEVICE_SECRET_TOKEN || '').trim() || 'mm_esp32_sec_key_2025';
const DATA_DIR = path.resolve('.data');
const LEDGER_FILE = path.join(DATA_DIR, 'kiosk-ledger.json');

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

interface ServerCheckoutRecord {
  transactionId: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPriceInr: number;
  expectedAmountInr: number;
  expectedAmountPaise: number;
  userId: string;
  userEmail: string;
  deviceId: string;
  servoConfig: {
    gpioPin: number;
    initialAngle: number;
    dispenseAngle: number;
    returnAngle: number;
    holdTimeMs: number;
  };
  razorpayOrderId: string;
  razorpayQrId?: string;
  razorpayQrImageUrl?: string;
  status: 'CREATED' | 'VERIFIED' | 'EXPIRED';
  verifiedPaymentId?: string;
  claimedCommandId?: string;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
}

interface ServerDispenseCommand {
  commandId: string;
  medicineId: string;
  medicineName: string;
  requestedQuantity: number;
  cycles: number;
  deviceId: string;
  userId: string;
  userEmail: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  executionResult: string;
  errorReason?: string;
  servoConfig: {
    gpioPin: number;
    initialAngle: number;
    dispenseAngle: number;
    returnAngle: number;
    holdTimeMs: number;
  };
  paymentTransactionId: string;
  paymentAmount: number;
  paymentStatus: 'VERIFIED';
  createdAt: string;
  claimedAt?: string;
  completedAt?: string;
  updatedAt: string;
}

interface ServerDeviceStatus {
  deviceId: string;
  deviceName: string;
  status: 'ONLINE' | 'OFFLINE';
  lastHeartbeat: string;
  ipAddress?: string;
  wifiSsid?: string;
  wifiRssi?: number;
  servoPin: number;
  servoInitialAngle: number;
  servoDispenseAngle: number;
  servoHoldTimeMs: number;
}

interface KioskLedger {
  checkouts: Record<string, ServerCheckoutRecord>;
  consumedPaymentIds: Record<string, string>;
  commands: Record<string, ServerDispenseCommand>;
  devices: Record<string, ServerDeviceStatus>;
}

function loadLedger(): KioskLedger {
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf8'));
      return {
        checkouts: parsed?.checkouts || {},
        consumedPaymentIds: parsed?.consumedPaymentIds || {},
        commands: parsed?.commands || {},
        devices: parsed?.devices || {}
      };
    }
  } catch {
    // Fall back to fresh ledger
  }
  return { checkouts: {}, consumedPaymentIds: {}, commands: {}, devices: {} };
}

const ledger: KioskLedger = loadLedger();

function persistLedger() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tmpPath = `${LEDGER_FILE}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(ledger, null, 2), 'utf8');
    fs.renameSync(tmpPath, LEDGER_FILE);
  } catch {
    // Non-fatal persistence fallback
  }
}

function safeStringCompare(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, 'utf8');
    const bBuf = Buffer.from(b, 'utf8');
    if (aBuf.length === 0 || aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

function safeHexCompare(aHex: string, bHex: string): boolean {
  try {
    const aBuf = Buffer.from(aHex, 'hex');
    const bBuf = Buffer.from(bHex, 'hex');
    if (aBuf.length === 0 || aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

// Middleware for ESP32 device authentication
function authenticateDevice(req: Request, res: Response, next: Function) {
  const rawToken = String(req.headers['x-device-token'] || req.query.token || req.body?.token || '').trim();
  if (!rawToken || !safeStringCompare(rawToken, EXPECTED_DEVICE_TOKEN)) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing device authentication token',
      code: 'AUTH_FAILED'
    });
  }
  next();
}

function slugifyMedicineName(name: string): string {
  const lower = String(name || '').toLowerCase();
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

const SERVER_MEDICINE_PRICES: Record<string, number> = {
  dolo: 12,
  crocin: 10,
  calpol: 45,
  brufen: 18,
  electral: 22,
  cetzine: 18,
  otrivin: 55,
  candid: 55,
  caladryl: 65,
  betadine: 45,
  'band-aid': 30,
  bandaid: 30,
  eno: 10,
  strepsils: 35,
  clotrimazole: 55,
  calamine: 65,
  powder: 30,
  paracetamol: 10,
  cetirizine: 18,
  loratadine: 15,
  ors: 22,
  ibuprofen: 18,
  antacid: 10,
  lozenge: 35,
  povidone: 45,
  saline: 55,
  default: 15
};

function getServerMedicinePrice(medicineName: string): number {
  const lower = String(medicineName || '').toLowerCase();
  for (const key of Object.keys(SERVER_MEDICINE_PRICES)) {
    if (key !== 'default' && lower.includes(key)) {
      return SERVER_MEDICINE_PRICES[key];
    }
  }
  return SERVER_MEDICINE_PRICES.default;
}

function getRazorpayCredentials(): { keyId: string; keySecret: string; configured: boolean } {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  return {
    keyId,
    keySecret,
    configured: Boolean(keyId && keySecret)
  };
}

function issueVerifiedCommandForCheckout(
  record: ServerCheckoutRecord,
  razorpayPaymentId: string
): ServerDispenseCommand {
  if (record.status === 'VERIFIED' && record.claimedCommandId && ledger.commands[record.claimedCommandId]) {
    return ledger.commands[record.claimedCommandId];
  }

  const alreadyClaimedTx = ledger.consumedPaymentIds[razorpayPaymentId];
  if (alreadyClaimedTx && alreadyClaimedTx !== record.transactionId) {
    throw new Error('This payment has already been claimed by another dispense order.');
  }

  const now = new Date().toISOString();
  const commandId = `SRV-CMD-${Date.now()}-${crypto.randomInt(1000, 9999)}`;

  const command: ServerDispenseCommand = {
    commandId,
    medicineId: record.medicineId,
    medicineName: record.medicineName,
    requestedQuantity: record.quantity,
    cycles: record.quantity,
    deviceId: record.deviceId,
    userId: record.userId,
    userEmail: record.userEmail,
    status: 'PENDING',
    executionResult: `Payment verified automatically via gateway (${razorpayPaymentId}). Dispenser unlocked.`,
    servoConfig: record.servoConfig,
    paymentTransactionId: record.transactionId,
    paymentAmount: record.expectedAmountInr,
    paymentStatus: 'VERIFIED',
    createdAt: now,
    updatedAt: now
  };

  record.status = 'VERIFIED';
  record.verifiedPaymentId = razorpayPaymentId;
  record.claimedCommandId = commandId;
  record.verifiedAt = now;

  ledger.consumedPaymentIds[razorpayPaymentId] = record.transactionId;
  ledger.commands[commandId] = command;
  persistLedger();

  return command;
}

// -------------------------------------------------------------
// AUTOMATED PAYMENT VERIFICATION ENDPOINTS (ZERO-HUMAN KIOSK)
// -------------------------------------------------------------

app.get('/api/payments/config', (_req: Request, res: Response) => {
  const { keyId, configured } = getRazorpayCredentials();
  return res.json({
    razorpayEnabled: configured,
    razorpayKeyId: configured ? keyId : null
  });
});

app.post('/api/payments/create-checkout', async (req: Request, res: Response) => {
  const { keyId, keySecret, configured } = getRazorpayCredentials();
  if (!configured) {
    return res.status(503).json({
      configured: false,
      error:
        'Automatic payment gateway is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Secrets so the kiosk can verify bank payments automatically.'
    });
  }

  try {
    const body = req.body || {};
    const medicineName = String(body.medicineName || '').trim().slice(0, 120);
    if (!medicineName) {
      return res.status(400).json({ error: 'Medicine name is required.' });
    }

    const quantity = Math.max(1, Math.min(10, Math.floor(Number(body.quantity) || 1)));
    const unitPriceInr = getServerMedicinePrice(medicineName);
    const expectedAmountInr = unitPriceInr * quantity;
    const expectedAmountPaise = expectedAmountInr * 100;
    const deviceId = SAFE_ID_REGEX.test(String(body.deviceId || ''))
      ? String(body.deviceId)
      : 'ESP32_MEDIMITRA_01';

    const rawServo = body.servoConfig || {};
    const servoConfig = {
      gpioPin: Math.max(1, Math.min(39, Math.floor(Number(rawServo.gpioPin) || 18))),
      initialAngle: Math.max(0, Math.min(180, Math.floor(Number(rawServo.initialAngle ?? 0)))),
      dispenseAngle: Math.max(10, Math.min(180, Math.floor(Number(rawServo.dispenseAngle) || 45))),
      returnAngle: Math.max(0, Math.min(180, Math.floor(Number(rawServo.returnAngle ?? 0)))),
      holdTimeMs: Math.max(100, Math.min(3000, Math.floor(Number(rawServo.holdTimeMs) || 300)))
    };

    const transactionId = `TXN-MM-${Date.now().toString().slice(-6)}-${crypto.randomInt(100, 999)}`;
    const nowMs = Date.now();
    const expiresAtMs = nowMs + 5 * 60 * 1000;
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    // 1. Create canonical Razorpay Order
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: expectedAmountPaise,
        currency: 'INR',
        receipt: transactionId.slice(0, 40),
        notes: {
          transactionId,
          medicineName: medicineName.slice(0, 100),
          quantity: String(quantity)
        }
      })
    });

    const orderData: any = await orderRes.json();
    if (!orderRes.ok || !orderData?.id) {
      return res.status(502).json({
        error: orderData?.error?.description || 'Failed to create Razorpay payment order.'
      });
    }

    // 2. Best-effort Dynamic Single-Use UPI QR (if enabled on merchant Razorpay account)
    let razorpayQrId: string | undefined;
    let razorpayQrImageUrl: string | undefined;
    try {
      const qrRes = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'upi_qr',
          name: 'MediMitra Smart Dispenser',
          usage: 'single_use',
          fixed_amount: true,
          payment_amount: expectedAmountPaise,
          description: `${medicineName.slice(0, 40)} x${quantity} (${transactionId})`,
          close_by: Math.floor(expiresAtMs / 1000),
          notes: {
            transactionId,
            orderId: orderData.id
          }
        })
      });

      const qrData: any = await qrRes.json();
      if (qrRes.ok && qrData?.id && qrData?.image_url) {
        razorpayQrId = String(qrData.id);
        razorpayQrImageUrl = String(qrData.image_url);
      }
    } catch {
      // Dynamic QR API optional; Standard Razorpay UPI Checkout still provides live QR & UPI intents
    }

    const record: ServerCheckoutRecord = {
      transactionId,
      medicineId: slugifyMedicineName(medicineName),
      medicineName,
      quantity,
      unitPriceInr,
      expectedAmountInr,
      expectedAmountPaise,
      userId: String(body.userId || 'kiosk_user').slice(0, 128),
      userEmail: String(body.userEmail || 'patient@medimitra.local').trim().toLowerCase().slice(0, 150),
      deviceId,
      servoConfig,
      razorpayOrderId: String(orderData.id),
      ...(razorpayQrId ? { razorpayQrId } : {}),
      ...(razorpayQrImageUrl ? { razorpayQrImageUrl } : {}),
      status: 'CREATED',
      createdAt: new Date(nowMs).toISOString(),
      expiresAt: new Date(expiresAtMs).toISOString()
    };

    ledger.checkouts[transactionId] = record;
    persistLedger();

    return res.json({
      configured: true,
      transactionId,
      orderId: record.razorpayOrderId,
      keyId,
      amountPaise: expectedAmountPaise,
      expectedAmountInr,
      unitPriceInr,
      qrId: razorpayQrId || null,
      qrImageUrl: razorpayQrImageUrl || null,
      expiresAt: record.expiresAt
    });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return res.status(500).json({ error: error?.message || 'Unable to initialize payment checkout.' });
  }
});

app.get('/api/payments/status/:transactionId', async (req: Request, res: Response) => {
  const transactionId = String(req.params.transactionId || '').trim();
  if (!SAFE_ID_REGEX.test(transactionId)) {
    return res.status(400).json({ error: 'Invalid transaction ID.' });
  }

  const record = ledger.checkouts[transactionId];
  if (!record) {
    return res.status(404).json({ error: 'Payment checkout session not found.' });
  }

  if (record.status === 'VERIFIED' && record.claimedCommandId) {
    return res.json({
      status: 'VERIFIED',
      transactionId: record.transactionId,
      amountInr: record.expectedAmountInr,
      verifiedPaymentId: record.verifiedPaymentId,
      command: ledger.commands[record.claimedCommandId] || null
    });
  }

  if (Date.now() > Date.parse(record.expiresAt)) {
    record.status = 'EXPIRED';
    persistLedger();
    return res.json({ status: 'EXPIRED', transactionId: record.transactionId });
  }

  const { keyId, keySecret, configured } = getRazorpayCredentials();
  if (!configured) {
    return res.status(503).json({ status: 'ERROR', error: 'Payment gateway not configured.' });
  }

  const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const checkCapturedPayment = (items: any[]): any | null => {
    if (!Array.isArray(items)) return null;
    for (const p of items) {
      if (
        p &&
        p.status === 'captured' &&
        p.currency === 'INR' &&
        Number(p.amount) === record.expectedAmountPaise &&
        p.id &&
        (!ledger.consumedPaymentIds[String(p.id)] ||
          ledger.consumedPaymentIds[String(p.id)] === record.transactionId)
      ) {
        return p;
      }
    }
    return null;
  };

  try {
    let matchedPayment: any = null;

    if (record.razorpayQrId) {
      const qrPayRes = await fetch(
        `https://api.razorpay.com/v1/payments/qr_codes/${encodeURIComponent(record.razorpayQrId)}/payments`,
        { headers: { Authorization: `Basic ${basicAuth}` } }
      );
      if (qrPayRes.ok) {
        const qrPayJson: any = await qrPayRes.json();
        matchedPayment = checkCapturedPayment(qrPayJson?.items);
      }
    }

    if (!matchedPayment && record.razorpayOrderId) {
      const orderPayRes = await fetch(
        `https://api.razorpay.com/v1/orders/${encodeURIComponent(record.razorpayOrderId)}/payments`,
        { headers: { Authorization: `Basic ${basicAuth}` } }
      );
      if (orderPayRes.ok) {
        const orderPayJson: any = await orderPayRes.json();
        matchedPayment = checkCapturedPayment(orderPayJson?.items);
      }
    }

    if (matchedPayment) {
      const command = issueVerifiedCommandForCheckout(record, String(matchedPayment.id));
      return res.json({
        status: 'VERIFIED',
        transactionId: record.transactionId,
        amountInr: record.expectedAmountInr,
        verifiedPaymentId: String(matchedPayment.id),
        command
      });
    }

    return res.json({
      status: 'PENDING',
      transactionId: record.transactionId,
      expiresAt: record.expiresAt
    });
  } catch (error: any) {
    return res.json({
      status: 'PENDING',
      transactionId: record.transactionId,
      expiresAt: record.expiresAt,
      checkNotice: error?.message || 'Waiting for gateway sync'
    });
  }
});

app.post('/api/payments/verify-razorpay', async (req: Request, res: Response) => {
  const { keyId, keySecret, configured } = getRazorpayCredentials();
  if (!configured) {
    return res.status(503).json({
      verified: false,
      error: 'Razorpay gateway keys are not configured on this server.'
    });
  }

  try {
    const {
      transactionId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    const cleanTxId = String(transactionId || '').trim();
    if (!SAFE_ID_REGEX.test(cleanTxId) || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        verified: false,
        error: 'Missing required payment verification fields.'
      });
    }

    const record = ledger.checkouts[cleanTxId];
    if (!record) {
      return res.status(404).json({
        verified: false,
        error: 'Checkout session expired or not found on server.'
      });
    }

    if (record.razorpayOrderId !== String(razorpay_order_id)) {
      return res.status(403).json({
        verified: false,
        error: 'Order ID does not match active checkout session.'
      });
    }

    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeHexCompare(expectedSig, String(razorpay_signature))) {
      return res.status(403).json({
        verified: false,
        error: 'Cryptographic payment signature verification failed.'
      });
    }

    // Verify directly with Razorpay Payments API that real funds are captured for exact amount & order
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const payRes = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(String(razorpay_payment_id))}`,
      { headers: { Authorization: `Basic ${basicAuth}` } }
    );

    const payData: any = await payRes.json();
    if (!payRes.ok) {
      return res.status(502).json({
        verified: false,
        error: payData?.error?.description || 'Could not confirm payment status with Razorpay.'
      });
    }

    if (
      payData.status !== 'captured' ||
      payData.currency !== 'INR' ||
      payData.order_id !== record.razorpayOrderId ||
      Number(payData.amount) !== record.expectedAmountPaise
    ) {
      return res.status(403).json({
        verified: false,
        error: 'Payment was not captured or paid amount did not match medicine total.'
      });
    }

    const command = issueVerifiedCommandForCheckout(record, String(razorpay_payment_id));
    return res.json({
      verified: true,
      transactionId: record.transactionId,
      amountInr: record.expectedAmountInr,
      razorpayPaymentId: String(razorpay_payment_id),
      command
    });
  } catch (error: any) {
    console.error('Razorpay verify error:', error);
    return res.status(500).json({
      verified: false,
      error: error?.message || 'Automatic payment verification failed.'
    });
  }
});

app.post('/api/payments/razorpay-webhook', (req: any, res: Response) => {
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  if (!webhookSecret) {
    return res.status(503).json({ received: false, error: 'Webhook secret not configured.' });
  }
  const signature = String(req.headers['x-razorpay-signature'] || '');
  const rawBody: Buffer = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (!safeHexCompare(expectedSig, signature)) {
    return res.status(403).json({ received: false, error: 'Invalid webhook signature.' });
  }

  try {
    const event = req.body || {};
    const payEntity = event?.payload?.payment?.entity;
    const qrEntity = event?.payload?.qr_code?.entity;

    if (payEntity?.status === 'captured' && payEntity?.currency === 'INR' && payEntity?.id) {
      const targetOrderId = String(payEntity.order_id || '');
      const targetQrId = String(qrEntity?.id || '');
      const matchingRecord = Object.values(ledger.checkouts).find(
        (r) =>
          (targetOrderId && r.razorpayOrderId === targetOrderId) ||
          (targetQrId && r.razorpayQrId === targetQrId)
      );

      if (matchingRecord && Number(payEntity.amount) === matchingRecord.expectedAmountPaise) {
        issueVerifiedCommandForCheckout(matchingRecord, String(payEntity.id));
      }
    }
  } catch (err) {
    console.warn('Webhook processing note:', err);
  }

  return res.json({ received: true });
});

// -------------------------------------------------------------
// SERVER-MANAGED VERIFIED DISPENSE STATUS ENDPOINTS
// -------------------------------------------------------------

app.get('/api/dispense/status/:commandId', (req: Request, res: Response) => {
  const commandId = String(req.params.commandId || '').trim();
  if (!SAFE_ID_REGEX.test(commandId)) {
    return res.status(400).json({ error: 'Invalid command ID.' });
  }
  const cmd = ledger.commands[commandId];
  if (!cmd) {
    return res.status(404).json({ found: false });
  }
  return res.json({ found: true, command: cmd });
});

app.post('/api/dispense/cancel/:commandId', (req: Request, res: Response) => {
  const commandId = String(req.params.commandId || '').trim();
  if (!SAFE_ID_REGEX.test(commandId)) {
    return res.status(400).json({ error: 'Invalid command ID.' });
  }
  const cmd = ledger.commands[commandId];
  if (!cmd) {
    return res.status(404).json({ error: 'Command not found.' });
  }
  if (cmd.status === 'PROCESSING' || cmd.status === 'COMPLETED') {
    return res.status(409).json({ error: `Cannot cancel: command is already ${cmd.status}.` });
  }
  cmd.status = 'CANCELLED';
  cmd.executionResult = 'Cancelled prior to hardware dispensing.';
  cmd.updatedAt = new Date().toISOString();
  persistLedger();
  return res.json({ success: true, command: cmd });
});

app.post('/api/dispense/simulate/:commandId', (req: Request, res: Response) => {
  const commandId = String(req.params.commandId || '').trim();
  if (!SAFE_ID_REGEX.test(commandId)) {
    return res.status(400).json({ error: 'Invalid command ID.' });
  }
  const cmd = ledger.commands[commandId];
  if (!cmd) {
    return res.status(404).json({ error: 'Command not found.' });
  }
  const nextStatus = req.body?.status;
  if (nextStatus === 'PROCESSING' || nextStatus === 'COMPLETED') {
    const now = new Date().toISOString();
    cmd.status = nextStatus;
    if (nextStatus === 'PROCESSING' && !cmd.claimedAt) cmd.claimedAt = now;
    if (nextStatus === 'COMPLETED') cmd.completedAt = now;
    if (typeof req.body?.executionResult === 'string') {
      cmd.executionResult = req.body.executionResult.slice(0, 500);
    }
    cmd.updatedAt = now;
    persistLedger();
  }
  return res.json({ success: true, command: cmd });
});

// -------------------------------------------------------------
// ESP32 REST API ENDPOINTS (POLLING VERIFIED SERVER QUEUE + FIRESTORE)
// -------------------------------------------------------------

app.get('/api/device/status/:deviceId', (req: Request, res: Response) => {
  const deviceId = String(req.params.deviceId || 'ESP32_MEDIMITRA_01').trim();
  if (!SAFE_ID_REGEX.test(deviceId)) {
    return res.status(400).json({ error: 'Invalid device ID.' });
  }
  const dev = ledger.devices[deviceId] || null;
  return res.json({ device: dev });
});

app.post('/api/device/heartbeat', authenticateDevice, async (req: Request, res: Response) => {
  try {
    const rawDevId = String(req.body?.deviceId || 'ESP32_MEDIMITRA_01').trim();
    const deviceId = SAFE_ID_REGEX.test(rawDevId) ? rawDevId : 'ESP32_MEDIMITRA_01';
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = new Date().toISOString();

    const devStatus: ServerDeviceStatus = {
      deviceId,
      deviceName: 'MediMitra Smart Dispenser Unit 1',
      status: 'ONLINE',
      lastHeartbeat: now,
      ipAddress: String(req.body?.ipAddress || clientIp).slice(0, 64),
      wifiSsid: req.body?.wifiSsid ? String(req.body.wifiSsid).slice(0, 64) : undefined,
      wifiRssi: typeof req.body?.wifiRssi === 'number' ? req.body.wifiRssi : undefined,
      servoPin: 18,
      servoInitialAngle: 0,
      servoDispenseAngle: 45,
      servoHoldTimeMs: 300
    };

    ledger.devices[deviceId] = devStatus;
    persistLedger();

    // Best-effort sync to Firestore /devices/{deviceId} so Firebase-connected tabs also see Online
    try {
      await setDoc(doc(db, 'devices', deviceId), {
        deviceId,
        deviceName: devStatus.deviceName,
        status: 'ONLINE',
        lastHeartbeat: now,
        ipAddress: devStatus.ipAddress,
        ...(devStatus.wifiSsid ? { wifiSsid: devStatus.wifiSsid } : {}),
        servoPin: 18,
        servoInitialAngle: 0,
        servoDispenseAngle: 45,
        servoHoldTimeMs: 300
      }, { merge: true });
    } catch {
      // Non-fatal if Firebase sync unavailable
    }

    return res.json({
      status: 'OK',
      deviceId,
      serverTime: now
    });
  } catch (error: any) {
    console.error('Device heartbeat error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/device/poll', authenticateDevice, async (req: Request, res: Response) => {
  try {
    const rawDevId = String(req.query.deviceId || 'ESP32_MEDIMITRA_01').trim();
    const deviceId = SAFE_ID_REGEX.test(rawDevId) ? rawDevId : 'ESP32_MEDIMITRA_01';

    // 1. Priority: Claim verified server-queued command (from automated Razorpay verification)
    const pendingServerCmd = Object.values(ledger.commands)
      .filter((c) => c.status === 'PENDING' && c.deviceId === deviceId)
      .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))[0];

    if (pendingServerCmd) {
      const now = new Date().toISOString();
      pendingServerCmd.status = 'PROCESSING';
      pendingServerCmd.claimedAt = now;
      pendingServerCmd.updatedAt = now;
      pendingServerCmd.executionResult = 'Claimed by ESP32. Servo movement initiated.';
      persistLedger();

      return res.json({
        status: 'COMMAND_AVAILABLE',
        hasCommand: true,
        command: {
          commandId: pendingServerCmd.commandId,
          medicineId: pendingServerCmd.medicineId,
          medicineName: pendingServerCmd.medicineName,
          requestedQuantity: pendingServerCmd.requestedQuantity || 1,
          cycles: pendingServerCmd.cycles || pendingServerCmd.requestedQuantity || 1,
          servo: pendingServerCmd.servoConfig
        }
      });
    }

    // 2. Fallback: Check Firestore dispensing_commands (e.g., Hardware Servo Test commands)
    const commandsRef = collection(db, 'dispensing_commands');
    const q = query(commandsRef, where('status', '==', 'PENDING'), limit(20));
    const snapshot = await getDocs(q);
    const matchingDoc = snapshot.docs.find((d) => d.data()?.deviceId === deviceId);

    if (!matchingDoc) {
      return res.json({
        status: 'IDLE',
        hasCommand: false,
        command: null
      });
    }

    const commandDocRef = doc(db, 'dispensing_commands', matchingDoc.id);
    let claimedCommand: any = null;

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
          dispenseAngle: claimedCommand.servoConfig?.dispenseAngle ?? 45,
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

app.post('/api/device/ack', authenticateDevice, async (req: Request, res: Response) => {
  try {
    const {
      commandId,
      status,
      executionResult,
      errorMessage,
      cyclesExecuted = 1
    } = req.body || {};

    const cleanCmdId = String(commandId || '').trim();
    if (!SAFE_ID_REGEX.test(cleanCmdId) || !status) {
      return res.status(400).json({ error: 'Missing required parameters (commandId, status)' });
    }

    const now = new Date().toISOString();
    const finalStatus = status === 'COMPLETED' ? 'COMPLETED' : 'FAILED';
    const resultMsg =
      (executionResult && String(executionResult).slice(0, 500)) ||
      (finalStatus === 'COMPLETED'
        ? `Physical servo executed ${cyclesExecuted} dispensing cycle(s) (0° -> 45° -> 0°). Product dispensed.`
        : `Dispensing failed: ${errorMessage || 'Hardware or sensor timeout.'}`);

    // 1. Acknowledge server-managed command if present
    const serverCmd = ledger.commands[cleanCmdId];
    if (serverCmd) {
      serverCmd.status = finalStatus;
      serverCmd.completedAt = now;
      serverCmd.updatedAt = now;
      serverCmd.executionResult = resultMsg;
      if (errorMessage) serverCmd.errorReason = String(errorMessage).slice(0, 240);
      persistLedger();

      return res.json({
        success: true,
        commandId: cleanCmdId,
        status: finalStatus,
        message: 'Command acknowledged and recorded on server.'
      });
    }

    // 2. Fallback: Acknowledge Firestore command
    const commandDocRef = doc(db, 'dispensing_commands', cleanCmdId);
    const snap = await getDoc(commandDocRef);

    if (!snap.exists()) {
      return res.status(404).json({ error: 'Command not found' });
    }

    await updateDoc(commandDocRef, {
      status: finalStatus,
      completedAt: now,
      updatedAt: now,
      executionResult: resultMsg,
      ...(errorMessage ? { errorReason: String(errorMessage).slice(0, 240) } : {})
    });

    return res.json({
      success: true,
      commandId: cleanCmdId,
      status: finalStatus,
      message: 'Command acknowledged and recorded in Firebase.'
    });
  } catch (error: any) {
    console.error('Device ack error:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.get('/api/device/config', (_req: Request, res: Response) => {
  return res.json({
    appName: 'MediMitra Smart Dispenser System',
    supportedHardware: 'ESP32 NodeMCU / DevKit V1 + SG90 Servo',
    defaultPin: 18,
    defaultInitialAngle: 0,
    defaultDispenseAngle: 45,
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
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediMitra Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
