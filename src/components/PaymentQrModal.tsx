import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  X,
  CheckCircle2,
  QrCode,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Loader2,
  KeyRound
} from 'lucide-react';
import { OtcMedicine, UserProfile } from '../types/medical';
import { DispensingCommand, ServoConfig } from '../types/dispensing';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';
import {
  AutomatedCheckoutSession,
  createAutomatedCheckout,
  getMedicinePrice,
  pollAutomatedPaymentStatus,
  verifyServerRazorpayPayment
} from '../services/paymentService';

export { getMedicinePrice };

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: OtcMedicine;
  quantity: number;
  patientProfile: UserProfile;
  servoConfig?: ServoConfig;
  onPaymentSuccess: (paymentDetails: {
    transactionId: string;
    amount: number;
    paymentMethod: string;
    timestamp: string;
    command?: DispensingCommand | null;
  }) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

async function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  medicine,
  quantity,
  patientProfile,
  servoConfig,
  onPaymentSuccess
}) => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);

  const unitPrice = getMedicinePrice(medicine.name);
  const totalAmount = unitPrice * quantity;

  const [session, setSession] = useState<AutomatedCheckoutSession | null>(null);
  const [notConfiguredReason, setNotConfiguredReason] = useState<string | null>(null);
  const [phase, setPhase] = useState<'LOADING' | 'READY' | 'VERIFYING' | 'VERIFIED' | 'EXPIRED' | 'UNCONFIGURED'>('LOADING');
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [checkoutEpoch, setCheckoutEpoch] = useState(0);

  const unlockedTriggeredRef = useRef(false);
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  onPaymentSuccessRef.current = onPaymentSuccess;

  const getLocalizedUnit = () => {
    const lowerName = medicine.name.toLowerCase();
    const u =
      medicine.unitLabel ||
      (lowerName.includes('sachet')
        ? 'sachet'
        : lowerName.includes('powder') || lowerName.includes('lotion') || lowerName.includes('suspension') || lowerName.includes('spray')
          ? 'bottle'
          : lowerName.includes('ointment') || lowerName.includes('cream')
            ? 'tube'
            : lowerName.includes('strip') || lowerName.includes('lozenge')
              ? 'pack'
              : 'tablet');

    switch (u) {
      case 'sachet': return ui.unitSachet;
      case 'bottle': return ui.unitBottle;
      case 'tube': return ui.unitTube;
      case 'pack': return ui.unitPack;
      default: return ui.unitTablet;
    }
  };

  const completeVerification = (
    txId: string,
    amount: number,
    paymentId: string,
    command: DispensingCommand | null | undefined
  ) => {
    if (unlockedTriggeredRef.current) return;
    unlockedTriggeredRef.current = true;
    setVerifiedPaymentId(paymentId);
    setPhase('VERIFIED');
    setTimeout(() => {
      onPaymentSuccessRef.current({
        transactionId: txId,
        amount,
        paymentMethod: 'RAZORPAY',
        timestamp: new Date().toISOString(),
        command
      });
    }, 1100);
  };

  // Initialize server-side checkout session and start automatic gateway verification polling
  useEffect(() => {
    if (!isOpen) {
      setSession(null);
      setNotConfiguredReason(null);
      setVerifiedPaymentId(null);
      setErrorMsg(null);
      setPhase('LOADING');
      unlockedTriggeredRef.current = false;
      return;
    }

    let cancelled = false;
    let pollTimer: number | null = null;
    unlockedTriggeredRef.current = false;
    setErrorMsg(null);
    setNotConfiguredReason(null);
    setVerifiedPaymentId(null);
    setPhase('LOADING');
    setTimerSeconds(300);

    (async () => {
      try {
        const res = await createAutomatedCheckout({
          medicineName: medicine.name,
          quantity,
          userId: patientProfile.id || 'kiosk_user',
          userEmail: patientProfile.email || 'patient@medimitra.local',
          servoConfig
        });

        if (cancelled) return;

        if (!res.configured) {
          setNotConfiguredReason(res.reason);
          setPhase('UNCONFIGURED');
          return;
        }

        setSession(res);
        setPhase('READY');

        // Continuously check directly with Razorpay via server whether funds have been captured
        pollTimer = window.setInterval(async () => {
          if (cancelled || unlockedTriggeredRef.current) return;
          const pollRes = await pollAutomatedPaymentStatus(res.transactionId);
          if (cancelled) return;

          if (pollRes.status === 'VERIFIED') {
            if (pollTimer) clearInterval(pollTimer);
            completeVerification(
              res.transactionId,
              pollRes.amountInr || res.expectedAmountInr,
              pollRes.verifiedPaymentId || 'Gateway Captured',
              pollRes.command
            );
          } else if (pollRes.status === 'EXPIRED') {
            if (pollTimer) clearInterval(pollTimer);
            setPhase('EXPIRED');
          }
        }, 2500);
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || 'Unable to start automated checkout.');
          setPhase('READY');
        }
      }
    })();

    const countdown = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      clearInterval(countdown);
    };
  }, [isOpen, medicine.name, quantity, patientProfile.id, patientProfile.email, checkoutEpoch]);

  useEffect(() => {
    if (timerSeconds === 0 && phase === 'READY') {
      setPhase('EXPIRED');
    }
  }, [timerSeconds, phase]);

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const localizedUnit = getLocalizedUnit();

  const handleOpenRazorpayCheckout = async () => {
    if (!session) return;
    setErrorMsg(null);
    setIsOpeningCheckout(true);
    try {
      const loaded = await loadRazorpayCheckoutScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Could not load Razorpay checkout SDK. Check internet connection.');
      }

      const rzp = new window.Razorpay({
        key: session.keyId,
        amount: session.amountPaise,
        currency: 'INR',
        name: 'MediMitra Smart Dispenser',
        description: `${medicine.name} (${quantity} ${localizedUnit})`,
        order_id: session.orderId,
        prefill: {
          name: patientProfile.name || 'Patient',
          email: patientProfile.email || ''
        },
        theme: { color: '#0f766e' },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setPhase('VERIFYING');
          try {
            const verified = await verifyServerRazorpayPayment({
              transactionId: session.transactionId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            completeVerification(
              verified.transactionId,
              verified.amountInr,
              verified.razorpayPaymentId,
              verified.command
            );
          } catch (verifyErr: any) {
            setPhase('READY');
            setErrorMsg(verifyErr?.message || 'Bank payment could not be verified.');
          }
        }
      });

      rzp.on('payment.failed', (resp: any) => {
        setErrorMsg(resp?.error?.description || 'Payment failed or was cancelled.');
      });

      rzp.open();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not open payment gateway.');
    } finally {
      setIsOpeningCheckout(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-colors"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-100">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {ui.secureCheckoutBadge} • Auto-Verified
              </span>
              <h2 className="text-base font-semibold leading-tight">
                {phase === 'VERIFIED' ? ui.paymentSuccessTitle : 'Self-Service Bank Checkout'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VERIFIED STATE */}
        {phase === 'VERIFIED' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{ui.paymentSuccessTitle}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                ₹{totalAmount}.00 confirmed automatically with bank gateway
              </p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-mono space-y-1">
              <div>Order: {session?.transactionId}</div>
              {verifiedPaymentId && <div>Payment Ref: {verifiedPaymentId}</div>}
            </div>
            <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold animate-pulse">
              {ui.dispatchingEsp32}
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Order Summary Strip */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/70 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{ui.prescribedProductLabel}</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm block truncate">{medicine.name}</span>
                <span className="text-[11px] text-teal-700 dark:text-teal-400 block">
                  {quantity} {localizedUnit} × ₹{unitPrice}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-medium">{ui.totalToPayLabel}</span>
                <span className="text-xl font-bold text-teal-900 dark:text-teal-300">₹{totalAmount}</span>
              </div>
            </div>

            {phase === 'LOADING' && (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
                <span>Generating bank-verified checkout session...</span>
              </div>
            )}

            {phase === 'VERIFYING' && (
              <div className="py-10 flex flex-col items-center justify-center gap-3 text-xs text-teal-900 dark:text-teal-300 font-semibold">
                <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
                <span>Confirming exact payment arrival with bank gateway...</span>
              </div>
            )}

            {phase === 'UNCONFIGURED' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 space-y-3 text-xs text-amber-950 dark:text-amber-100">
                <div className="flex items-start gap-2.5">
                  <KeyRound className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Automatic Payment Gateway Keys Needed</p>
                    <p className="text-amber-900 dark:text-amber-200 leading-relaxed">
                      {notConfiguredReason ||
                        'Because this kiosk operates 100% publicly with no shopkeeper, it verifies payments automatically via Razorpay APIs before releasing medicine.'}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/60 text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-white">Quick 2-Minute Setup:</p>
                  <p>1. Create or open your Razorpay Dashboard (Test or Live API Keys).</p>
                  <p>2. Add <code className="font-mono font-bold">RAZORPAY_KEY_ID</code> and <code className="font-mono font-bold">RAZORPAY_KEY_SECRET</code> in AI Studio <strong>Settings &rarr; Secrets</strong>.</p>
                  <p>3. Refresh — every scan will then verify bank credit automatically.</p>
                </div>
              </div>
            )}

            {phase === 'EXPIRED' && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-center space-y-3">
                <p className="text-xs font-semibold text-amber-950 dark:text-amber-200">
                  This payment session expired before funds arrived.
                </p>
                <button
                  type="button"
                  onClick={() => setCheckoutEpoch((e) => e + 1)}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Generate Fresh Payment Session</span>
                </button>
              </div>
            )}

            {phase === 'READY' && session && (
              <div className="space-y-4">
                {session.qrImageUrl && (
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2.5">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                      <img
                        src={session.qrImageUrl}
                        alt="Razorpay Dynamic Single-Use UPI QR"
                        className="w-48 h-48 object-contain rounded-lg"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                      <span>Listening automatically for ₹{totalAmount} payment...</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isOpeningCheckout}
                  onClick={handleOpenRazorpayCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  {isOpeningCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Secure Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay ₹{totalAmount} via UPI / GPay / PhonePe / Card</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                  <span className="font-mono">Order: {session.transactionId}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <strong className="text-slate-700 dark:text-slate-200 font-mono">{formattedTime}</strong>
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  Dispenser unlocks automatically the instant our server confirms ₹{totalAmount} was captured by Razorpay.
                </p>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium cursor-pointer"
            >
              {ui.cancelTransactionBtn}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
