import type { DispensingCommand, ServoConfig } from '../types/dispensing';

export type PaymentTransactionStatus =
  | 'CREATED'
  | 'PENDING_MERCHANT_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export interface PaymentTransaction {
  transactionId: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPriceInr: number;
  expectedAmountInr: number;
  userId: string;
  userEmail: string;
  paymentMethod: 'UPI_QR' | 'RAZORPAY';
  status: PaymentTransactionStatus;
  dispenseClaimed: boolean;
  claimedCommandId?: string;
  createdAt: string;
  expiresAt: string;
  verifiedAt?: string;
  updatedAt: string;
}

export interface AutomatedCheckoutSession {
  configured: true;
  transactionId: string;
  orderId: string;
  keyId: string;
  amountPaise: number;
  expectedAmountInr: number;
  unitPriceInr: number;
  qrId: string | null;
  qrImageUrl: string | null;
  expiresAt: string;
}

export interface UnconfiguredCheckoutResponse {
  configured: false;
  reason: string;
}

export interface PaymentPollResponse {
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'ERROR';
  transactionId?: string;
  amountInr?: number;
  verifiedPaymentId?: string;
  command?: DispensingCommand | null;
  error?: string;
}

// Commercial OTC product pricing dictionary (in INR)
const MEDICINE_PRICES: Record<string, number> = {
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

export function getMedicinePrice(medicineName: string): number {
  const lower = medicineName.toLowerCase();
  for (const key of Object.keys(MEDICINE_PRICES)) {
    if (key !== 'default' && lower.includes(key)) {
      return MEDICINE_PRICES[key];
    }
  }
  return MEDICINE_PRICES.default;
}

export async function createAutomatedCheckout(params: {
  medicineName: string;
  quantity: number;
  userId: string;
  userEmail: string;
  servoConfig?: Partial<ServoConfig>;
}): Promise<AutomatedCheckoutSession | UnconfiguredCheckoutResponse> {
  try {
    const res = await fetch('/api/payments/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        configured: false,
        reason:
          'Automated bank verification requires the MediMitra Node server with RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET configured.'
      };
    }

    const data = await res.json();
    if (res.status === 503 || data?.configured === false) {
      return {
        configured: false,
        reason:
          data?.error ||
          'Automatic payment gateway keys (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured yet.'
      };
    }

    if (!res.ok) {
      throw new Error(data?.error || 'Could not initialize payment order on server.');
    }

    return data as AutomatedCheckoutSession;
  } catch (err: any) {
    if (err instanceof TypeError) {
      return {
        configured: false,
        reason:
          'Payment verification server is unreachable from this static host. Run with the MediMitra server enabled and Razorpay keys configured.'
      };
    }
    throw err;
  }
}

export async function pollAutomatedPaymentStatus(transactionId: string): Promise<PaymentPollResponse> {
  try {
    const res = await fetch(`/api/payments/status/${encodeURIComponent(transactionId)}`, {
      cache: 'no-store'
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { status: 'ERROR', error: 'Unexpected response from payment server.' };
    }
    return (await res.json()) as PaymentPollResponse;
  } catch {
    return { status: 'PENDING' };
  }
}

export async function verifyServerRazorpayPayment(params: {
  transactionId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{
  verified: boolean;
  transactionId: string;
  amountInr: number;
  razorpayPaymentId: string;
  command: DispensingCommand;
}> {
  const res = await fetch('/api/payments/verify-razorpay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok || !data?.verified) {
    throw new Error(data?.error || 'Payment signature verification failed.');
  }
  return data;
}
