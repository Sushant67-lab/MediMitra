import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Pill, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Sliders, 
  CheckCircle2,
  Box,
  RotateCw
} from 'lucide-react';
import { OtcMedicine, UserProfile } from '../types/medical';
import { 
  getMedicineInventory, 
  createDispensingCommand, 
  DEFAULT_SERVO_CONFIG 
} from '../services/dispensingService';
import { MedicineInventory, ServoConfig, DispensingCommand } from '../types/dispensing';

interface DispenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: OtcMedicine;
  patientProfile: UserProfile;
  onProceedToPayment: (quantity: number, servoConfig: ServoConfig) => void;
  onCommandCreated?: (command: DispensingCommand) => void;
  onOpenHardwareGuide: () => void;
}

export const DispenseModal: React.FC<DispenseModalProps> = ({
  isOpen,
  onClose,
  medicine,
  patientProfile,
  onProceedToPayment,
  onCommandCreated,
  onOpenHardwareGuide
}) => {
  const [quantity, setQuantity] = useState(1);
  const [stockInfo, setStockInfo] = useState<MedicineInventory | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Safety checkboxes required for clinical authorization
  const [confirmedDosage, setConfirmedDosage] = useState(false);
  const [confirmedSafetyWarning, setConfirmedSafetyWarning] = useState(false);

  // Calibration settings (configurable 25°, 300ms)
  const [showCalibration, setShowCalibration] = useState(false);
  const [servoConfig, setServoConfig] = useState<ServoConfig>({
    ...DEFAULT_SERVO_CONFIG
  });

  useEffect(() => {
    if (isOpen) {
      loadInventory();
      setConfirmedDosage(false);
      setConfirmedSafetyWarning(false);
      setErrorMsg(null);
    }
  }, [isOpen, medicine]);

  const loadInventory = async () => {
    setIsLoadingStock(true);
    try {
      const inv = await getMedicineInventory(medicine.name);
      setStockInfo(inv);
    } catch (e) {
      console.warn('Failed to fetch stock info', e);
    } finally {
      setIsLoadingStock(false);
    }
  };

  const handleDispenseSubmit = async () => {
    if (!confirmedDosage || !confirmedSafetyWarning) {
      setErrorMsg('Please confirm clinical and safety verification checkboxes before dispensing.');
      return;
    }

    if (stockInfo && stockInfo.availableQuantity < quantity) {
      setErrorMsg(`Insufficient stock in slot ${stockInfo.slotNumber}. Only ${stockInfo.availableQuantity} available.`);
      return;
    }

    // Pass verified parameters to QR payment step
    onProceedToPayment(quantity, servoConfig);
    onClose();
  };

  if (!isOpen) return null;

  const isOutOfStock = stockInfo !== null && stockInfo.availableQuantity <= 0;
  const canSubmit = confirmedDosage && confirmedSafetyWarning && !isOutOfStock && !isAuthorizing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-100">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-200">
                Automatic IoT Dispenser
              </span>
              <h2 className="text-base font-semibold leading-tight">Authorize Medicine Dispense</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Medicine Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{medicine.name}</h3>
                <p className="text-xs text-teal-700 font-medium">{medicine.category}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 font-semibold">
                Slot #{stockInfo?.slotNumber || 1}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              <strong className="text-slate-800">Dosage:</strong> {medicine.dosageGuide}
            </p>

            {medicine.safetyCaution && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <strong>Caution:</strong> {medicine.safetyCaution}
              </p>
            )}
          </div>

          {/* Stock & Quantity Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Inventory Status */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Box className="w-3.5 h-3.5 text-teal-600" />
                <span>Dispenser Stock</span>
              </div>
              {isLoadingStock ? (
                <div className="text-xs text-slate-400">Checking stock...</div>
              ) : isOutOfStock ? (
                <div className="text-xs font-semibold text-rose-600">Out of Stock (0 remaining)</div>
              ) : (
                <div className="text-sm font-semibold text-slate-800">
                  {stockInfo?.availableQuantity} {stockInfo?.unit || 'tablets'} Available
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
              <label className="text-xs text-slate-500 font-medium block">
                Dispense Quantity
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  -
                </button>
                <span className="font-semibold text-slate-900 text-sm w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(stockInfo?.availableQuantity || 3, quantity + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  +
                </button>
                <span className="text-xs text-slate-400">({quantity} cycle{quantity > 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>

          {/* Hardware & Servo Calibration Notice */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1.5">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-700" />
                <span>Physical ESP32 & Servo Configuration</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCalibration(!showCalibration)}
                className="text-teal-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showCalibration ? 'Hide Settings' : 'Calibrate Servo'}</span>
              </button>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Target Pin: <strong>GPIO {servoConfig.gpioPin}</strong> • Motion Arc: <strong>{servoConfig.initialAngle}° → {servoConfig.dispenseAngle}° → {servoConfig.returnAngle}°</strong> • Hold: <strong>{servoConfig.holdTimeMs}ms</strong>.
              The motor activates ONLY after clinical confirmation below.
            </p>

            {/* Expandable Calibration Controls */}
            {showCalibration && (
              <div className="pt-2.5 mt-2 border-t border-teal-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Dispense Angle (°)</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={servoConfig.dispenseAngle}
                    onChange={(e) => setServoConfig({ ...servoConfig, dispenseAngle: Number(e.target.value) || 25 })}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">Hold Duration (ms)</label>
                  <input
                    type="number"
                    min="150"
                    max="2000"
                    step="50"
                    value={servoConfig.holdTimeMs}
                    onChange={(e) => setServoConfig({ ...servoConfig, holdTimeMs: Number(e.target.value) || 300 })}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Clinical Authorization Checkboxes */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Required Clinical Authorization
            </span>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-slate-50 border border-slate-200/60">
              <input
                type="checkbox"
                checked={confirmedDosage}
                onChange={(e) => setConfirmedDosage(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <span>
                I confirm the medicine dosage (<strong>{medicine.dosageGuide}</strong>) is appropriate for 
                patient <strong>{patientProfile.name}</strong> ({patientProfile.age}y).
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer p-2 rounded-xl hover:bg-slate-50 border border-slate-200/60">
              <input
                type="checkbox"
                checked={confirmedSafetyWarning}
                onChange={(e) => setConfirmedSafetyWarning(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
              />
              <span>
                I authorize physical dispensing and understand the ESP32 servo motor will execute {quantity} rotation cycle(s) (0° → 25° → 0°).
              </span>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onOpenHardwareGuide}
            className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ESP32 Wiring & Firmware Code</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isAuthorizing}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDispenseSubmit}
              disabled={!canSubmit}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>PROCEED TO QR PAYMENT</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
