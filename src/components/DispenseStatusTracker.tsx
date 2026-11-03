import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Cpu, 
  AlertTriangle, 
  XCircle, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Pill, 
  Check, 
  HelpCircle,
  WifiOff,
  Receipt,
  RotateCw,
  ExternalLink
} from 'lucide-react';
import { DispensingCommand, DispenseStatus } from '../types/dispensing';
import { 
  subscribeToDispensingCommand, 
  cancelDispensingCommand, 
  simulatePhysicalServoDispensing 
} from '../services/dispensingService';

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
  const [command, setCommand] = useState<DispensingCommand>(initialCommand);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simAngle, setSimAngle] = useState(0);
  const [simStepMsg, setSimStepMsg] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Subscribe to real-time updates from Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeToDispensingCommand(
      command.commandId,
      (updatedCmd) => {
        setCommand(updatedCmd);
      },
      (err) => {
        console.warn('Realtime subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [command.commandId]);

  // Handle Cancellation
  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      await cancelDispensingCommand(command.commandId);
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel command');
    } finally {
      setIsCancelling(false);
    }
  };

  // Run Hardware Simulation (for browser demonstration without physical ESP32)
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      await simulatePhysicalServoDispensing(command.commandId, (msg, angle) => {
        setSimStepMsg(msg);
        setSimAngle(angle);
      });
    } catch (err) {
      console.error('Simulation error:', err);
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
    { label: 'Dispatch Authorized', desc: 'Clinical & payment verified' },
    { label: 'Waiting for ESP32', desc: 'Queued in Firebase' },
    { label: 'Dispensing in Progress', desc: 'Servo rotating 0° → 25° → 0°' },
    { label: 'Medicine Dispensed', desc: 'Hardware acknowledgment received' },
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
            ) : isFailed ? (
              <XCircle className="w-6 h-6" />
            ) : (
              <RotateCw className="w-6 h-6 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                {command.commandId}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isCompleted 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : isFailed 
                  ? 'bg-rose-100 text-rose-800' 
                  : 'bg-teal-100 text-teal-800'
              }`}>
                {command.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {isCompleted 
                ? 'Medicine Dispensed Successfully' 
                : isProcessing 
                ? 'Dispensing in Progress...' 
                : isPending 
                ? 'Waiting for ESP32 Hardware Handshake' 
                : isFailed 
                ? 'Dispensing Failed' 
                : isCancelled 
                ? 'Dispensing Cancelled' 
                : 'Dispensing Status'}
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenHardwareGuide}
          className="text-xs text-teal-700 hover:text-teal-900 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 hover:bg-teal-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>ESP32 Hardware Guide & Pinout</span>
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
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
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
        {/* Left: Dispensed Item Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
            <span className="text-slate-500 font-medium">Prescribed Item</span>
            <span className="font-bold text-slate-900">{command.medicineName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Authorized Quantity</span>
            <span className="font-semibold text-slate-800">{command.requestedQuantity} unit(s) ({command.cycles} cycle)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Target ESP32 Device</span>
            <span className="font-mono text-teal-800 font-medium">{command.deviceId}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Servo Movement</span>
            <span className="font-semibold text-slate-800">
              GPIO {command.servoConfig.gpioPin} (0° → {command.servoConfig.dispenseAngle}° → 0°)
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600">
            <strong>Execution Log:</strong> {command.executionResult}
          </div>
        </div>

        {/* Right: Live SG90 Servo Arc Gauge */}
        <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/70 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
          <div className="text-xs font-semibold text-teal-950 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-teal-700" />
            <span>Physical Servo Motion Status</span>
          </div>

          {/* Graphical Angle Gauge */}
          <div className="relative w-36 h-20 flex items-end justify-center">
            {/* Base Arc */}
            <svg className="w-36 h-20" viewBox="0 0 100 55">
              <path
                d="M 10 50 A 40 40 0 0 1 90 50"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Highlight for 0° to 25° */}
              <path
                d="M 10 50 A 40 40 0 0 1 30 20"
                fill="none"
                stroke="#0d9488"
                strokeWidth="6"
                strokeLinecap="round"
              />
              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2={50 - 35 * Math.cos(((simAngle || (isCompleted ? 0 : 0)) * Math.PI) / 180)}
                y2={50 - 35 * Math.sin(((simAngle || (isCompleted ? 0 : 0)) * Math.PI) / 180)}
                stroke="#0f766e"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="50" cy="50" r="4" fill="#0f766e" />
            </svg>
          </div>

          <div className="text-xs">
            <span className="text-slate-500 font-medium">Current Position: </span>
            <strong className="text-teal-900 font-mono text-sm">{simAngle || 0}°</strong>
            <span className="text-slate-400 text-[10px] ml-1">(Initial: 0° | Dispense: 25°)</span>
          </div>

          {simStepMsg && (
            <p className="text-[11px] text-teal-800 font-medium bg-white px-2 py-0.5 rounded-full border border-teal-200">
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
            <span>Hardware Simulation & Testing:</span>
          </span>
          <p className="text-[11px] text-amber-800">
            If your ESP32 board is not yet flashed or currently offline, you can test the exact 0° → 25° → 0° cycle in the browser.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunSimulation}
          disabled={isSimulating || isCompleted}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          {isSimulating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Simulating Servo...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Test Servo Cycle (0°→25°→0°)</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div>
          {cancelError && (
            <span className="text-xs text-rose-600 font-medium">{cancelError}</span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isPending && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer w-full sm:w-auto"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Request'}
            </button>
          )}

          {isCompleted && (
            <button
              onClick={onDismiss}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
            >
              Done & Return to Report
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
