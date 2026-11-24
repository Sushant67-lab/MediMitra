import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Cpu, 
  XCircle, 
  Play, 
  RotateCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { DispensingCommand, DispenseStatus, DispenserDevice } from '../types/dispensing';
import { 
  subscribeToDispensingCommand, 
  cancelDispensingCommand, 
  simulatePhysicalServoDispensing,
  subscribeToDeviceStatus,
  isDeviceOnlineNow
} from '../services/dispensingService';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface DispenseStatusTrackerProps {
  command: DispensingCommand;
  onDismiss: () => void;
  onOpenHardwareGuide: () => void;
}

export const DispenseStatusTracker: React.FC<DispenseStatusTrackerProps> = ({
  command: initialCommand,
  onDismiss,
  onOpenHardwareGuide
}) => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);

  const [command, setCommand] = useState<DispensingCommand>(initialCommand);
  const [deviceInfo, setDeviceInfo] = useState<DispenserDevice | null>(null);
  const [, setTick] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simAngle, setSimAngle] = useState(0);
  const [simStepMsg, setSimStepMsg] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToDispensingCommand(
      command.commandId,
      (updatedCmd) => {
        setCommand(updatedCmd);
      }
    );

    const unsubDevice = subscribeToDeviceStatus(command.deviceId, (dev) => {
      setDeviceInfo(dev);
    });
    const timer = setInterval(() => setTick(t => t + 1), 10000);

    return () => {
      unsubscribe();
      unsubDevice();
      clearInterval(timer);
    };
  }, [command.commandId, command.deviceId]);

  const isDeviceOnline = isDeviceOnlineNow(deviceInfo);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelDispensingCommand(command.commandId);
      setCommand((prev) => ({
        ...prev,
        status: 'CANCELLED',
        updatedAt: new Date().toISOString()
      }));
    } catch {
      // Non-fatal fallback
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      await simulatePhysicalServoDispensing(
        command.commandId,
        (msg, angle) => {
          setSimStepMsg(msg);
          setSimAngle(angle);
        },
        command,
        (updated) => setCommand(updated)
      );
    } catch {
      // Simulation handled cleanly
    } finally {
      setIsSimulating(false);
      setSimAngle(0);
    }
  };

  const getStatusStepIndex = (status: DispenseStatus): number => {
    switch (status) {
      case 'WAITING_CONFIRMATION': return 0;
      case 'PENDING': return 1;
      case 'PROCESSING': return 2;
      case 'COMPLETED': return 3;
      default: return 1;
    }
  };

  const currentStep = getStatusStepIndex(command.status);
  const isPending = command.status === 'PENDING';
  const isProcessing = command.status === 'PROCESSING' || isSimulating;
  const isCompleted = command.status === 'COMPLETED';
  const isFailed = command.status === 'FAILED';
  const isCancelled = command.status === 'CANCELLED';

  const steps = [
    { label: ui.step1Label, desc: ui.step1Desc },
    { label: ui.step2Label, desc: ui.step2Desc },
    { label: ui.step3Label, desc: ui.step3Desc },
    { label: ui.step4Label, desc: ui.step4Desc }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="bg-white rounded-3xl border-2 border-teal-500/30 shadow-xl overflow-hidden p-6 space-y-6"
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
            isCompleted 
              ? 'bg-emerald-100 text-emerald-700' 
              : isFailed 
              ? 'bg-rose-100 text-rose-700' 
              : 'bg-teal-100 text-teal-700'
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isFailed || isCancelled ? (
              <XCircle className="w-6 h-6" />
            ) : (
              <RotateCw className="w-6 h-6 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {command.commandId}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isCompleted 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : isFailed || isCancelled
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-teal-100 text-teal-800'
              }`}>
                {command.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {isCompleted 
                ? ui.statusCompletedTitle
                : isProcessing 
                ? ui.statusProcessingTitle
                : isPending 
                ? ui.statusPendingTitle
                : isFailed 
                ? ui.statusFailedTitle
                : isCancelled 
                ? ui.statusCancelledTitle
                : ui.statusDefaultTitle}
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenHardwareGuide}
          className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 hover:bg-teal-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>{ui.hardwareGuidePinoutBtn}</span>
        </button>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {steps.map((st, i) => {
          const isPassed = currentStep > i || isCompleted;
          const isCurrent = currentStep === i && !isCompleted;
          return (
            <div
              key={i}
              className={`p-3 rounded-2xl border transition-all ${
                isPassed 
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                  : isCurrent 
                  ? 'bg-teal-50/80 border-teal-400 text-teal-950 ring-2 ring-teal-500/20 shadow-xs' 
                  : 'bg-slate-50 border-slate-200/80 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isPassed 
                    ? 'bg-emerald-600 text-white' 
                    : isCurrent 
                    ? 'bg-teal-600 text-white animate-pulse' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {isPassed ? '✓' : i + 1}
                </div>
                <span className="text-xs font-semibold">{st.label}</span>
              </div>
              <p className="text-[10px] leading-tight text-slate-500 font-normal">
                {st.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Command & Hardware Status Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 gap-2">
            <span className="text-slate-500 font-medium shrink-0">{ui.prescribedItemLabel}</span>
            <span className="font-bold text-slate-900 text-right">{command.medicineName}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">{ui.authorizedQtyLabel}</span>
            <span className="font-semibold text-slate-800">
              {command.requestedQuantity} ({command.cycles} {command.cycles > 1 ? ui.cyclesWord : ui.cycleWord})
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">{ui.targetDeviceLabel}</span>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <span className="font-mono text-teal-800 font-medium">{command.deviceId}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                isDeviceOnline
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {isDeviceOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>
                  {isDeviceOnline
                    ? `${ui.esp32OnlineStatus}${deviceInfo?.ipAddress ? ` (${deviceInfo.ipAddress})` : ''}`
                    : ui.esp32OfflineStatus}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-500">{ui.servoMovementLabel}</span>
            <span className="font-semibold text-slate-800">
              GPIO {command.servoConfig.gpioPin} (0° → {command.servoConfig.dispenseAngle}° → 0°)
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600">
            <strong>{ui.executionLogLabel}:</strong> {command.executionResult}
          </div>
        </div>

        {/* Live SG90 Servo Arc Gauge */}
        <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/70 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
          <div className="text-xs font-semibold text-teal-950 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-teal-700" />
            <span>{ui.servoMotionStatusTitle}</span>
          </div>

          <div className="relative w-36 h-20 flex items-end justify-center">
            <svg className="w-36 h-20" viewBox="0 0 100 55">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 10 50 A 40 40 0 0 1 21.7 21.7"
                fill="none"
                stroke="#0d9488"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <line
                x1="50"
                y1="50"
                x2={50 - 35 * Math.cos(((simAngle || 0) * Math.PI) / 180)}
                y2={50 - 35 * Math.sin(((simAngle || 0) * Math.PI) / 180)}
                stroke="#0f766e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="4" fill="#0f766e" />
            </svg>
          </div>

          <div className="text-xs">
            <span className="text-slate-500 font-medium">{ui.currentPositionLabel}: </span>
            <strong className="text-teal-900 font-mono text-sm">{simAngle || 0}°</strong>
            <span className="text-slate-400 text-[10px] ml-1">(0° → 45°)</span>
          </div>

          {simStepMsg && (
            <p className="text-[11px] text-teal-800 font-medium bg-white px-2.5 py-0.5 rounded-full border border-teal-200">
              {simStepMsg}
            </p>
          )}
        </div>
      </div>

      {/* Simulator Banner / Actions */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5 text-center sm:text-left">
          <span className="font-semibold text-amber-950 flex items-center justify-center sm:justify-start gap-1">
            <Play className="w-3.5 h-3.5 text-amber-700" />
            <span>{ui.simBannerTitle}:</span>
          </span>
          <p className="text-[11px] text-amber-800">
            {ui.simBannerDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunSimulation}
          disabled={isSimulating || isCompleted || isCancelled}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          {isSimulating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{ui.simulatingServoBtn}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>{ui.testServoCycleBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100">
        {isPending && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer w-full sm:w-auto"
          >
            {isCancelling ? ui.cancellingBtn : ui.cancelRequestBtn}
          </button>
        )}

        {(isCompleted || isCancelled) && (
          <button
            onClick={onDismiss}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
          >
            {ui.doneReturnBtn}
          </button>
        )}
      </div>
    </motion.div>
  );
};
