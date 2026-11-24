import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Pill, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  Sliders, 
  Box 
} from 'lucide-react';
import { OtcMedicine, UserProfile } from '../types/medical';
import { 
  getMedicineInventory, 
  DEFAULT_SERVO_CONFIG 
} from '../services/dispensingService';
import { MedicineInventory, ServoConfig } from '../types/dispensing';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface DispenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: OtcMedicine;
  patientProfile: UserProfile;
  onProceedToPayment: (quantity: number, servoConfig: ServoConfig) => void;
  onOpenHardwareGuide: () => void;
}

export const DispenseModal: React.FC<DispenseModalProps> = ({
  isOpen,
  onClose,
  medicine,
  patientProfile,
  onProceedToPayment,
  onOpenHardwareGuide
}) => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);

  const preferredQuantity = medicine.preferredQuantity || 1;
  const [stockInfo, setStockInfo] = useState<MedicineInventory | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [confirmedDosage, setConfirmedDosage] = useState(false);
  const [confirmedSafetyWarning, setConfirmedSafetyWarning] = useState(false);

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
    } catch {
      // Non-fatal fallback
    } finally {
      setIsLoadingStock(false);
    }
  };

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

  const handleDispenseSubmit = () => {
    if (!confirmedDosage || !confirmedSafetyWarning) {
      setErrorMsg(ui.checkboxRequiredErr);
      return;
    }

    if (stockInfo && stockInfo.availableQuantity < preferredQuantity) {
      setErrorMsg(`${ui.insufficientStockErr} (${stockInfo.availableQuantity})`);
      return;
    }

    onProceedToPayment(preferredQuantity, servoConfig);
    onClose();
  };

  if (!isOpen) return null;

  const isOutOfStock = stockInfo !== null && stockInfo.availableQuantity < preferredQuantity;
  const canSubmit = confirmedDosage && confirmedSafetyWarning && !isOutOfStock;
  const localizedUnit = getLocalizedUnit();
  const patientDisplayName = patientProfile.name?.trim() || ui.patientWord;

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
                {ui.iotDispenserBadge}
              </span>
              <h2 className="text-base font-semibold leading-tight">{ui.authorizeDispenseTitle}</h2>
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

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Real Product Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{medicine.name}</h3>
                <p className="text-xs text-teal-700 font-medium">{medicine.category}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-teal-100 text-teal-800 font-semibold shrink-0">
                {ui.slotBadge} #{stockInfo?.slotNumber || 1}
              </span>
            </div>

            <p className="text-xs text-slate-600">
              <strong className="text-slate-800">{ui.dosageShort}:</strong> {medicine.dosageGuide}
            </p>

            {medicine.safetyCaution && (
              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <strong>{ui.cautionShort}:</strong> {medicine.safetyCaution}
              </p>
            )}
          </div>

          {/* Stock & Locked MediMitra Preferred Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Box className="w-3.5 h-3.5 text-teal-600" />
                <span>{ui.dispenserStockLabel}</span>
              </div>
              {isLoadingStock ? (
                <div className="text-xs text-slate-400">{ui.checkingStock}</div>
              ) : isOutOfStock ? (
                <div className="text-xs font-semibold text-rose-600">{ui.outOfStock}</div>
              ) : (
                <div className="text-sm font-semibold text-slate-800">
                  {stockInfo?.availableQuantity} {localizedUnit} {ui.availableLabel}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/50 space-y-1">
              <span className="text-xs text-teal-800 font-semibold block">
                {ui.preferredQtyLabel}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">
                  {preferredQuantity} {localizedUnit}
                </span>
                <span className="text-xs text-slate-500">
                  ({preferredQuantity} {preferredQuantity > 1 ? ui.cyclesWord : ui.cycleWord})
                </span>
              </div>
              <span className="text-[11px] text-teal-700 block">
                {ui.preferredQtyNote}
              </span>
            </div>
          </div>

          {/* Hardware & Servo Calibration Notice */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1.5">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-700" />
                <span>{ui.servoConfigTitle}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowCalibration(!showCalibration)}
                className="text-teal-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showCalibration ? ui.hideSettings : ui.calibrateServo}</span>
              </button>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              GPIO <strong>{servoConfig.gpioPin}</strong> • {servoConfig.initialAngle}° → {servoConfig.dispenseAngle}° → {servoConfig.returnAngle}° • {servoConfig.holdTimeMs}ms. {ui.servoConfigDesc}
            </p>

            {showCalibration && (
              <div className="pt-2.5 mt-2 border-t border-teal-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">{ui.dispenseAngleLabel}</label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    value={servoConfig.dispenseAngle}
                    onChange={(e) => setServoConfig({ ...servoConfig, dispenseAngle: Number(e.target.value) || 45 })}
                    className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-semibold">{ui.holdDurationLabel}</label>
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
              {ui.requiredAuthTitle}
            </span>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-slate-200/60">
              <input
                type="checkbox"
                checked={confirmedDosage}
                onChange={(e) => setConfirmedDosage(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
              />
              <span>
                {ui.confirmDosageText(medicine.dosageGuide, patientDisplayName, patientProfile.age)}
              </span>
            </label>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer p-2.5 rounded-xl hover:bg-slate-50 border border-slate-200/60">
              <input
                type="checkbox"
                checked={confirmedSafetyWarning}
                onChange={(e) => setConfirmedSafetyWarning(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer shrink-0"
              />
              <span>
                {ui.confirmServoText(preferredQuantity, servoConfig.dispenseAngle)}
              </span>
            </label>
          </div>

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
            <span>{ui.wiringFirmwareBtn}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-white transition-colors cursor-pointer w-full sm:w-auto"
            >
              {ui.cancelBtn}
            </button>
            <button
              type="button"
              onClick={handleDispenseSubmit}
              disabled={!canSubmit}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{ui.proceedToQrBtn}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
