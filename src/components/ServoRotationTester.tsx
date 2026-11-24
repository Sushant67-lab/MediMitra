import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  Loader2,
  RotateCw,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react';
import {
  cancelDispensingCommand,
  DEFAULT_DEVICE_ID,
  isDeviceOnlineNow,
  subscribeToDeviceStatus,
  subscribeToDispensingCommand,
  triggerServoTestCommand
} from '../services/dispensingService';
import { DispensingCommand, DispenserDevice } from '../types/dispensing';

interface ServoRotationTesterProps {
  onHornAngleChange?: (angle: number) => void;
  onOpenFullWiring?: () => void;
  compact?: boolean;
}

export const ServoRotationTester: React.FC<ServoRotationTesterProps> = ({
  onHornAngleChange,
  onOpenFullWiring,
  compact = false
}) => {
  const [deviceInfo, setDeviceInfo] = useState<DispenserDevice | null>(null);
  const [isTestingServo, setIsTestingServo] = useState(false);
  const [testCommand, setTestCommand] = useState<DispensingCommand | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [displayAngle, setDisplayAngle] = useState(0);

  const unsubTestRef = useRef<(() => void) | null>(null);
  const animTimerRef = useRef<number[]>([]);

  const updateAngle = (angle: number) => {
    setDisplayAngle(angle);
    onHornAngleChange?.(angle);
  };

  useEffect(() => {
    const unsubDevice = subscribeToDeviceStatus(DEFAULT_DEVICE_ID, (info) => {
      setDeviceInfo(info);
    });
    return () => {
      unsubDevice();
      if (unsubTestRef.current) unsubTestRef.current();
      animTimerRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const isEspOnline = isDeviceOnlineNow(deviceInfo);

  const runVisualHornSweep = () => {
    animTimerRef.current.forEach((id) => window.clearTimeout(id));
    animTimerRef.current = [];
    updateAngle(0);
    animTimerRef.current.push(window.setTimeout(() => updateAngle(45), 180));
    animTimerRef.current.push(window.setTimeout(() => updateAngle(0), 1000));
  };

  const handleTestServoMotor = async () => {
    setTestError(null);
    setIsTestingServo(true);
    runVisualHornSweep();

    if (unsubTestRef.current) {
      unsubTestRef.current();
      unsubTestRef.current = null;
    }

    try {
      const cmd = await triggerServoTestCommand(DEFAULT_DEVICE_ID);
      setTestCommand(cmd);
      unsubTestRef.current = subscribeToDispensingCommand(
        cmd.commandId,
        (updated) => {
          setTestCommand(updated);
          if (updated.status === 'PROCESSING') {
            updateAngle(45);
          } else if (
            updated.status === 'COMPLETED' ||
            updated.status === 'FAILED' ||
            updated.status === 'CANCELLED'
          ) {
            updateAngle(0);
            setIsTestingServo(false);
          }
        },
        (err) => {
          setTestError(err.message);
          setIsTestingServo(false);
        }
      );
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Unable to send servo test command.');
      setIsTestingServo(false);
    }
  };

  const handleCancelTest = async () => {
    if (!testCommand) return;
    await cancelDispensingCommand(testCommand.commandId);
    setIsTestingServo(false);
    updateAngle(0);
    setTestCommand((prev) =>
      prev ? { ...prev, status: 'CANCELLED', executionResult: 'Test cancelled.' } : null
    );
  };

  return (
    <div
      className={`rounded-2xl bg-white border border-slate-200 ${
        compact ? 'p-3.5' : 'p-4 sm:p-5 shadow-xs'
      } flex flex-col gap-3`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          {/* Live Mobile-Friendly 0° -> 45° -> 0° Mini Servo Dial */}
          <div className="shrink-0 w-16 h-14 rounded-xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center px-1.5 py-1">
            <svg viewBox="0 0 64 36" className="w-12 h-7 overflow-visible">
              <path
                d="M 8 30 A 24 24 0 0 1 56 30"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 8 30 A 24 24 0 0 1 15 13"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="32"
                y1="30"
                x2={32 - 21 * Math.cos((displayAngle * Math.PI) / 180)}
                y2={30 - 21 * Math.sin((displayAngle * Math.PI) / 180)}
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="32" cy="30" r="3" fill="#f8fafc" />
            </svg>
            <span className="text-[10px] font-mono font-bold text-teal-300 tabular-nums leading-none">
              {displayAngle}° / 45°
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Servo Rotation Test (GPIO 18 • 0° → 45° → 0°)
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                  isEspOnline ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isEspOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{isEspOnline ? 'ESP32 Online' : 'ESP32 Offline'}</span>
              </span>
            </div>

            {testError ? (
              <p className="text-[11px] text-rose-700 font-medium">{testError}</p>
            ) : testCommand ? (
              <p
                className={`text-[11px] font-medium flex items-center gap-1.5 ${
                  testCommand.status === 'COMPLETED'
                    ? 'text-emerald-700'
                    : testCommand.status === 'FAILED' || testCommand.status === 'CANCELLED'
                    ? 'text-rose-700'
                    : 'text-amber-700'
                }`}
              >
                {testCommand.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : testCommand.status === 'FAILED' || testCommand.status === 'CANCELLED' ? (
                  <XCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                )}
                <span>
                  {testCommand.status === 'COMPLETED'
                    ? 'Servo Test Passed! Motor turned 0° → 45° → 0°.'
                    : testCommand.status === 'PROCESSING'
                    ? 'ESP32 claimed test — rotating servo 0° → 45°...'
                    : testCommand.status === 'CANCELLED'
                    ? 'Servo test cancelled.'
                    : isEspOnline
                    ? 'Test pulse sent — ESP32 picking up within 2.5s...'
                    : 'Test queued in cloud — waiting for ESP32 to come Online & connect Wi-Fi.'}
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 leading-snug">
                Tap below to check the 0° → 45° → 0° motor rotation without changing medicine stock.
              </p>
            )}
          </div>
        </div>

        {/* Mobile-friendly full-width action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          {testCommand?.status === 'PENDING' && (
            <button
              type="button"
              onClick={handleCancelTest}
              className="flex-1 sm:flex-initial justify-center px-3 py-2.5 sm:py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          )}
          {onOpenFullWiring && (
            <button
              type="button"
              onClick={onOpenFullWiring}
              className="flex-1 sm:flex-initial justify-center px-3 py-2.5 sm:py-2 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Wiring &amp; Code</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleTestServoMotor}
            disabled={isTestingServo && (testCommand?.status === 'PROCESSING' || !testCommand)}
            className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            {isTestingServo && (testCommand?.status === 'PROCESSING' || !testCommand) ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RotateCw className="w-3.5 h-3.5" />
            )}
            <span>Test Servo Motor (0° → 45° → 0°)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
