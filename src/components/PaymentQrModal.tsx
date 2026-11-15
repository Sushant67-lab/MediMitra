import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  QrCode, 
  Clock
} from 'lucide-react';
import { OtcMedicine, UserProfile } from '../types/medical';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: OtcMedicine;
  quantity: number;
  patientProfile: UserProfile;
  onPaymentSuccess: (paymentDetails: {
    transactionId: string;
    amount: number;
    paymentMethod: string;
    timestamp: string;
  }) => void;
}

// Commercial OTC product pricing dictionary (in INR ₹)
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
    if (lower.includes(key)) return MEDICINE_PRICES[key];
  }
  return MEDICINE_PRICES.default;
}

export const PaymentQrModal: React.FC<PaymentQrModalProps> = ({
  isOpen,
  onClose,
  medicine,
  quantity,
  onPaymentSuccess
}) => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);

  const unitPrice = getMedicinePrice(medicine.name);
  const totalAmount = unitPrice * quantity;
  const [transactionId] = useState(() => `TXN-MM-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`);
  
  const [paymentStatus, setPaymentStatus] = useState<'WAITING' | 'VERIFYING' | 'SUCCESS'>('WAITING');
  const [timerSeconds, setTimerSeconds] = useState(300);

  const upiId = 'medimitra.health@okaxis';
  const paymentQrImageSrc = './assets/aistudio/image_102b2352.png';

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

  useEffect(() => {
    if (!isOpen) return;
    setPaymentStatus('WAITING');
    setTimerSeconds(300);

    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSimulatePayment = () => {
    setPaymentStatus('VERIFYING');
    setTimeout(() => {
      setPaymentStatus('SUCCESS');
      setTimeout(() => {
        onPaymentSuccess({
          transactionId,
          amount: totalAmount,
          paymentMethod: 'UPI',
          timestamp: new Date().toISOString()
        });
      }, 1200);
    }, 1800);
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const localizedUnit = getLocalizedUnit();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-100">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-200">
                {ui.secureCheckoutBadge}
              </span>
              <h2 className="text-base font-semibold leading-tight">{ui.scanQrTitle}</h2>
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

        {paymentStatus === 'SUCCESS' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{ui.paymentSuccessTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">₹{totalAmount}.00 {ui.receivedViaUpi}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-mono">
              {transactionId}
            </div>
            <p className="text-xs text-teal-700 font-semibold animate-pulse">
              {ui.dispatchingEsp32}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Order Summary Strip */}
            <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs text-slate-500 block">{ui.prescribedProductLabel}</span>
                <span className="font-bold text-slate-900 text-sm block truncate">{medicine.name}</span>
                <span className="text-[11px] text-teal-700 block">
                  {quantity} {localizedUnit} × ₹{unitPrice}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-500 block uppercase font-medium">{ui.totalToPayLabel}</span>
                <span className="text-xl font-bold text-teal-900">₹{totalAmount}</span>
              </div>
            </div>

            {/* QR Code Canvas Card */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
                <img
                  src={paymentQrImageSrc}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = './assets/payment_qr.png';
                  }}
                  alt="UPI Payment QR"
                  className="w-56 h-56 object-contain rounded-xl shadow-xs"
                />
                {paymentStatus === 'VERIFYING' && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-teal-900">{ui.verifyingPayment}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 font-semibold">GPay</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 font-semibold">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 font-semibold">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700 font-semibold">BHIM UPI</span>
              </div>

              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{ui.qrExpiresIn}: <strong className="text-slate-800 font-mono">{formattedTime}</strong></span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 space-y-0.5">
              <span>{ui.upiIdLabel}: <strong className="text-slate-800 font-mono">{upiId}</strong></span>
              <p className="text-[10px] text-slate-400">{ui.scanAnyUpiHint}</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={paymentStatus === 'VERIFYING'}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {paymentStatus === 'VERIFYING' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{ui.verifyingBank}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{ui.iHavePaidBtn} (₹{totalAmount})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                {ui.cancelTransactionBtn}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
