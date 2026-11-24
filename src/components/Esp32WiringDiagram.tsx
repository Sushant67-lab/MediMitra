import React, { useState } from 'react';
import {
  Box,
  Check,
  Copy,
  Download,
  FileCode2,
  PlayCircle,
  Zap
} from 'lucide-react';
import { Esp32WiringDiagram3D } from './Esp32WiringDiagram3D';
import { Esp32WiringVideoModal } from './Esp32WiringVideoModal';
import { ServoRotationTester } from './ServoRotationTester';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';
import { WIRING_VIDEO_TRANSLATIONS } from '../data/wiringVideoTranslations';

const COPYABLE_WIRING_TEXT = `MediMitra ESP32 DevKit V1 (30-Pin) + SG90 Servo Wiring
====================================================
How BOTH the Servo AND ESP32 get 5V Power (4 Simple Wires):

1. ORANGE / YELLOW Wire (Signal): ESP32 Pin D18 (GPIO 18, 7th pin from top-right) ---> SG90 Servo YELLOW or ORANGE wire
2. RED Wire A (Servo Power)     : External 5V 2A Power Supply (+)                ---> SG90 Servo RED wire
3. RED Wire B (ESP32 Power)  : External 5V 2A Power Supply (+)                ---> ESP32 VIN (bottom-left pin)
4. BLACK/BROWN Wire (GND)    : External 5V Supply (-) GND ---> ESP32 GND      ---> SG90 Servo BROWN wire

Important Safety Note (USB vs VIN):
- Running Standalone (USB unplugged): Keep RED Wire B connected to ESP32 VIN so the ESP32 turns ON.
- Uploading Code via PC USB Cable : Unplug RED Wire B from VIN first (or turn OFF the 5V supply) before plugging in PC USB.
- Alternative Power: Leave VIN unconnected and power the ESP32 using a 5V phone charger plugged into its USB port (keep Common GND connected).`;

const LEFT_PIN_INDICES = Array.from({ length: 15 }, (_, idx) => idx);
const RIGHT_PIN_INDICES = Array.from({ length: 15 }, (_, idx) => idx);

export const Esp32WiringDiagram: React.FC = () => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);
  const videoStrings = WIRING_VIDEO_TRANSLATIONS[language] || WIRING_VIDEO_TRANSLATIONS.en;
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [copiedConnections, setCopiedConnections] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const [svgHornAngle, setSvgHornAngle] = useState(0);

  const handleCopyConnections = async () => {
    try {
      await navigator.clipboard.writeText(COPYABLE_WIRING_TEXT);
      setCopiedConnections(true);
      setTimeout(() => setCopiedConnections(false), 2400);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = COPYABLE_WIRING_TEXT;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      setCopiedConnections(true);
      setTimeout(() => setCopiedConnections(false), 2400);
    }
  };

  const handleDownloadSvg = () => {
    const svgEl = document.getElementById('esp32-power-wiring-svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgEl);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'medimitra_esp32_5v_servo_schematic.svg';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Clean 30-Pin ESP32 DevKit V1 geometry centered at x = 445
  const boardX = 355;
  const boardY = 98;
  const boardW = 180;
  const boardH = 294;
  const pinStartY = 140;
  const pinStepY = 16;
  const leftPinX = boardX + 10;
  const rightPinX = boardX + boardW - 10;

  // Highlighted physical pin coordinates
  const gpio18Y = pinStartY + 6 * pinStepY; // Pin 7 from top-right (y = 236)
  const gpio2Y = pinStartY + 11 * pinStepY; // Pin 12 from top-right (y = 316)
  const gndY = pinStartY + 13 * pinStepY; // Pin 14 from top on both sides (y = 348)
  const vinY = pinStartY + 14 * pinStepY; // Pin 15 bottom-left (y = 364)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Toolbar Header */}
      <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold tracking-tight truncate">
          ESP32 DevKit V1 (30-Pin) + 5V Supply + SG90 Servo
        </span>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>{ui.diagramMode2d}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>{ui.diagramMode3d}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsVideoOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{videoStrings.buttonLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyConnections}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              copiedConnections
                ? 'bg-emerald-600 text-white'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            {copiedConnections ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedConnections ? 'Copied' : 'Copy Connections'}</span>
          </button>

          {viewMode === '2d' && (
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Download Schematic SVG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-50 p-2.5 sm:p-3 space-y-3">
        {viewMode === '3d' ? (
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
            <Esp32WiringDiagram3D />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <svg
              id="esp32-power-wiring-svg"
              viewBox="0 0 920 462"
              className="w-full h-auto block select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="cleanGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
                <marker id="servoArcArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" />
                </marker>
              </defs>

              {/* Crisp Blueprint Canvas */}
              <rect x="0" y="0" width="920" height="462" fill="#ffffff" />
              <rect x="12" y="12" width="896" height="438" rx="10" fill="url(#cleanGrid)" stroke="#e2e8f0" strokeWidth="1.2" />

              {/* Title Top-Left */}
              <text x="32" y="36" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="13.5" fontWeight="700" fill="#0f172a">
                Clean 4-Wire Standalone Diagram (Powers BOTH ESP32 &amp; Servo)
              </text>
              <text x="32" y="52" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="10.2" fill="#64748b">
                Zero Crossing Wires · Connect +5V to BOTH Servo RED and ESP32 VIN when USB cable is unplugged
              </text>

              {/* ========================================================= */}
              {/* LANE 1 (RED +5V): PSU (+5V) -> SPLITS TO SERVO RED & ESP32 VIN */}
              {/* ========================================================= */}
              {/* Main Red trunk out of PSU +5V (218, 212) to junction (286, 212) */}
              <path
                d="M 218 212 H 286"
                fill="none"
                stroke="#dc2626"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Wire 2A: Overhead Red branch to SG90 RED (+5V) */}
              <path
                d="M 286 212 V 62 H 608 V 192 H 636"
                fill="none"
                stroke="#dc2626"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Wire 2B: Red branch straight to ESP32 VIN (powers ESP32 without USB!) */}
              <path
                d={`M 286 212 V ${vinY} H ${leftPinX}`}
                fill="none"
                stroke="#dc2626"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx="286" cy="212" r="5.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.8" />

              <rect x="348" y="50" width="212" height="22" rx="6" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1.2" />
              <text x="454" y="64.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fontWeight="700" fill="#991b1b">
                +5V RED (TO SERVO + ESP32 VIN)
              </text>

              {/* Clean callout for Wire 2B powering ESP32 */}
              <rect x="234" y="276" width="104" height="32" rx="6" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1.2" />
              <text x="286" y="290" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.2" fontWeight="700" fill="#991b1b">
                Powers ESP32
              </text>
              <text x="286" y="302" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#dc2626">
                +5V → VIN Pin
              </text>

              {/* ========================================================= */}
              {/* LANE 2 (ORANGE PWM): ESP32 D18 -> SG90 ORANGE (STRAIGHT)  */}
              {/* ========================================================= */}
              <path
                d={`M ${rightPinX} ${gpio18Y} H 628`}
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <rect x="534" y="209" width="94" height="20" rx="5" fill="#fff7ed" stroke="#fdba74" strokeWidth="1.2" />
              <text x="581" y="222.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9.5" fontWeight="700" fill="#c2410c">
                D18 → PWM
              </text>

              {/* ========================================================= */}
              {/* LANE 3 (BLACK / BROWN GND): PSU (-) -> BOTTOM RAIL -> ESP32 RIGHT GND & SERVO BROWN */}
              {/* ========================================================= */}
              <path
                d={`M 218 ${gndY} H 248 V 422 H 608 V 284 H 636`}
                fill="none"
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />

              {/* Tie ESP32 Right GND Pin cleanly down into Common Ground Bus */}
              <path
                d={`M ${rightPinX} ${gndY} H 576 V 422`}
                fill="none"
                stroke="#0f172a"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx="576" cy="422" r="5.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.8" />

              {/* Bottom GND Label Pill placed cleanly clear of x=576 junction */}
              <rect x="302" y="410" width="224" height="24" rx="6" fill="#0f172a" />
              <text x="414" y="425.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fontWeight="700" fill="#ffffff">
                COMMON GND (PSU + ESP32 + SERVO)
              </text>

              {/* ========================================================= */}
              {/* 1. LEFT BLOCK: EXTERNAL 5V 2A POWER SUPPLY                */}
              {/* ========================================================= */}
              <g>
                <rect x="36" y="158" width="182" height="214" rx="12" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
                <rect x="36" y="158" width="182" height="34" rx="12" fill="#0f172a" />
                <rect x="36" y="180" width="182" height="12" fill="#0f172a" />
                <text x="127" y="179.5" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="11" fontWeight="700" fill="#ffffff">
                  EXTERNAL 5V SUPPLY
                </text>

                {/* Positive Terminal (+5V) */}
                <rect x="52" y="200" width="154" height="24" rx="6" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.4" />
                <text x="126" y="216" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fontWeight="700" fill="#991b1b">
                  +5V OUT (+)
                </text>
                <circle cx="218" cy="212" r="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1.8" />

                {/* Spec Note inside PSU */}
                <rect x="52" y="242" width="150" height="72" rx="8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.2" />
                <text x="127" y="263" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="11" fontWeight="700" fill="#1e293b">
                  5V 2A DC Adapter
                </text>
                <text x="127" y="281" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fill="#475569">
                  Powers BOTH ESP32
                </text>
                <text x="127" y="296" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fill="#475569">
                  and SG90 Servo
                </text>

                {/* Negative Terminal (GND) */}
                <rect x="52" y="336" width="154" height="24" rx="6" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.4" />
                <text x="126" y="352" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fontWeight="700" fill="#0f172a">
                  GND (-)
                </text>
                <circle cx="218" cy={gndY} r="6" fill="#0f172a" stroke="#ffffff" strokeWidth="1.8" />
              </g>

              {/* ========================================================= */}
              {/* 2. CENTER BLOCK: ESP32 DEVKIT V1 (CLEAN READABLE PINS)    */}
              {/* ========================================================= */}
              <g>
                <text x={boardX + boardW / 2} y="90" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#0f172a">
                  ESP32 DEVKIT V1 (30-Pin)
                </text>

                {/* Main PCB */}
                <rect x={boardX} y={boardY} width={boardW} height={boardH} rx="12" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

                {/* Corner Mounting Holes */}
                <circle cx={boardX + 12} cy={boardY + 12} r="4" fill="#cbd5e1" />
                <circle cx={boardX + boardW - 12} cy={boardY + 12} r="4" fill="#cbd5e1" />
                <circle cx={boardX + 12} cy={boardY + boardH - 12} r="4" fill="#cbd5e1" />
                <circle cx={boardX + boardW - 12} cy={boardY + boardH - 12} r="4" fill="#cbd5e1" />

                {/* Top PCB Antenna Trace */}
                <rect x={boardX + 46} y={boardY + 8} width="88" height="20" rx="3" fill="#0f172a" />
                <path
                  d={`M ${boardX + 56} ${boardY + 23} v -10 h 11 v 10 h 11 v -10 h 11 v 10 h 11 v -10 h 11 v 10`}
                  fill="none"
                  stroke="#eab308"
                  strokeWidth="1.8"
                />

                {/* ESP-WROOM-32 Metal Shield */}
                <rect x={boardX + 44} y={boardY + 34} width="92" height="72" rx="6" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
                <text x={boardX + 90} y={boardY + 67} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fontWeight="700" fill="#0f172a">
                  ESP-WROOM-32
                </text>
                <text x={boardX + 90} y={boardY + 82} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="8.5" fontWeight="600" fill="#334155">
                  Wi-Fi Module
                </text>

                {/* On-board Status LED Indicator */}
                <circle cx={boardX + 90} cy={gpio2Y - 12} r="5" fill="#3b82f6" stroke="#bfdbfe" strokeWidth="1.5" />
                <text x={boardX + 90} y={gpio2Y - 22} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="8" fontWeight="600" fill="#93c5fd">
                  Blue LED (D2)
                </text>

                {/* Micro-USB / USB-C Port (cleanly positioned below pins) */}
                <rect x={boardX + 66} y={boardY + boardH - 12} width="48" height="18" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                <text x={boardX + 90} y={boardY + boardH} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7.5" fontWeight="700" fill="#0f172a">
                  USB Port
                </text>

                {/* Clean Header Pads (15 Left) */}
                {LEFT_PIN_INDICES.map((idx) => {
                  const py = pinStartY + idx * pinStepY;
                  const isGnd = idx === 13;
                  const isVin = idx === 14;
                  return (
                    <circle
                      key={`L-${idx}`}
                      cx={leftPinX}
                      cy={py}
                      r={isVin ? 5.6 : isGnd ? 4.2 : 3.1}
                      fill={isVin ? '#ef4444' : isGnd ? '#0f172a' : '#475569'}
                      stroke={isVin ? '#ffffff' : isGnd ? '#94a3b8' : '#64748b'}
                      strokeWidth={isVin ? 2 : 0.9}
                    />
                  );
                })}

                {/* Clean Header Pads (15 Right) */}
                {RIGHT_PIN_INDICES.map((idx) => {
                  const py = pinStartY + idx * pinStepY;
                  const isGpio18 = idx === 6;
                  const isGnd = idx === 13;
                  return (
                    <circle
                      key={`R-${idx}`}
                      cx={rightPinX}
                      cy={py}
                      r={isGpio18 || isGnd ? 5.6 : 3.1}
                      fill={isGpio18 ? '#f97316' : isGnd ? '#0f172a' : '#475569'}
                      stroke={isGpio18 || isGnd ? '#ffffff' : '#64748b'}
                      strokeWidth={isGpio18 || isGnd ? 2 : 0.9}
                    />
                  );
                })}

                {/* Highlight Callout Badges ONLY for Wired Pins */}
                {/* Left VIN (bottom-left corner pin — powered by RED Wire 2B) */}
                <rect x={leftPinX + 10} y={vinY - 10} width="84" height="20" rx="5" fill="#dc2626" stroke="#fecaca" strokeWidth="1.2" />
                <text x={leftPinX + 52} y={vinY + 3.5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9" fontWeight="700" fill="#ffffff">
                  VIN (+5V IN)
                </text>

                {/* Right D18 / GPIO 18 (7th pin from top-right) */}
                <rect x={rightPinX - 110} y={gpio18Y - 11} width="100" height="22" rx="5" fill="#f97316" stroke="#ffedd5" strokeWidth="1.2" />
                <text x={rightPinX - 60} y={gpio18Y + 3.5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fontWeight="700" fill="#ffffff">
                  D18 (GPIO 18)
                </text>
                <text x={rightPinX - 14} y={gpio18Y - 15} textAnchor="end" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="8" fontWeight="600" fill="#fdba74">
                  7th pin down
                </text>

                {/* Right GND (2nd pin from bottom-right) */}
                <rect x={rightPinX - 78} y={gndY - 10} width="68" height="20" rx="5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
                <text x={rightPinX - 44} y={gndY + 3.5} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9.5" fontWeight="700" fill="#ffffff">
                  GND
                </text>
              </g>

              {/* ========================================================= */}
              {/* 3. RIGHT BLOCK: SG90 MICRO SERVO MOTOR                    */}
              {/* ========================================================= */}
              <g>
                <text x="804" y="106" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#0f172a">
                  SG90 SERVO MOTOR
                </text>

                {/* Clean 45° Dispense Sweep Preview */}
                <line x1="804" y1="126" x2="804" y2="175" stroke="#cbd5e1" strokeWidth="1.4" strokeDasharray="3,3" />
                <path d="M 804 138 A 34 34 0 0 1 828 148" fill="none" stroke="#0d9488" strokeWidth="2.2" markerEnd="url(#servoArcArrow)" />
                <text x="835" y="138" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fontWeight="700" fill="#0f766e">
                  45° Sweep
                </text>

                {/* Servo Body */}
                <rect x="760" y="196" width="88" height="102" rx="8" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
                <rect x="744" y="216" width="120" height="14" rx="4" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
                <circle cx="752" cy="223" r="3" fill="#ffffff" />
                <circle cx="856" cy="223" r="3" fill="#ffffff" />

                {/* Gear Head & Horn */}
                <rect x="776" y="172" width="56" height="26" rx="5" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1.5" />
                <circle cx="804" cy="172" r="15" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
                <rect x="797" y="144" width="14" height="34" rx="7" fill="#f8fafc" stroke="#475569" strokeWidth="1.4" transform={`rotate(${svgHornAngle} 804 172)`} />
                <circle cx="804" cy="172" r="4" fill="#64748b" />

                <rect x="772" y="248" width="64" height="34" rx="5" fill="#1e40af" />
                <text x="804" y="264" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="10" fontWeight="700" fill="#ffffff">
                  SG90 9g
                </text>
                <text x="804" y="276" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8" fill="#bfdbfe">
                  4.8V - 6.0V
                </text>

                {/* 3 Wide Terminal Connector Blocks Matching the 3 Clean Lanes */}
                {/* Top: RED (+5V) */}
                <line x1="746" y1="192" x2="760" y2="192" stroke="#dc2626" strokeWidth="3" />
                <rect x="636" y="178" width="110" height="28" rx="6" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.6" />
                <text x="691" y="196" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fontWeight="700" fill="#991b1b">
                  RED (+5V VCC)
                </text>
                <circle cx="636" cy="192" r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />

                {/* Middle: ORANGE / YELLOW (PWM) */}
                <line x1="746" y1="236" x2="760" y2="236" stroke="#f59e0b" strokeWidth="3" />
                <rect x="628" y="222" width="118" height="28" rx="6" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.6" />
                <text x="687" y="240" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="9.5" fontWeight="700" fill="#9a3412">
                  ORANGE/YELLOW PWM
                </text>
                <circle cx="628" cy="236" r="5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />

                {/* Bottom: BROWN (GND) */}
                <line x1="746" y1="284" x2="760" y2="284" stroke="#0f172a" strokeWidth="3" />
                <rect x="636" y="270" width="110" height="28" rx="6" fill="#f1f5f9" stroke="#334155" strokeWidth="1.6" />
                <text x="691" y="288" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fontWeight="700" fill="#0f172a">
                  BROWN (GND)
                </text>
                <circle cx="636" cy="284" r="5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />

                {/* Physical 3-pin plug order hint */}
                <text x="691" y="318" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="8.8" fill="#64748b">
                  (On 3-pin plug: Red is center wire)
                </text>
              </g>
            </svg>
          </div>
        )}

        {/* Direct Servo Motor Test Button Right Below Connection Image */}
        <ServoRotationTester compact onHornAngleChange={setSvgHornAngle} />

        {viewMode === '2d' && (
          <>
            {/* Easy-to-Read 4-Wire Connection Cards (Including ESP32 VIN Power!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-orange-200 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Orange / Yellow (Signal)</p>
                <p className="text-[11px] font-mono text-orange-800 mt-0.5">
                  ESP32 D18 → Servo YELLOW / ORANGE
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">7th pin down on right header</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-rose-200 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Red A (Servo +5V)</p>
                <p className="text-[11px] font-mono text-rose-800 mt-0.5">
                  5V Supply (+) → Servo RED
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Powers servo motor</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-300 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-rose-700 text-white text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Red B (ESP32 Power)</p>
                <p className="text-[11px] font-mono text-rose-900 mt-0.5">
                  5V Supply (+) → ESP32 VIN
                </p>
                <p className="text-[10px] text-rose-800 mt-0.5">Starts ESP32 without USB</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-300 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Black / Brown (GND)</p>
                <p className="text-[11px] font-mono text-slate-800 mt-0.5">
                  PSU (-) + ESP32 GND + Servo BROWN
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">All 3 grounds joined together</p>
              </div>
            </div>
          </div>

          {/* Crystal-Clear ESP32 Power Rule */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold">Why didn&apos;t the ESP32 start after unplugging USB?</p>
              <p className="text-[11px] text-amber-900">
                After unplugging the PC USB cable, the ESP32 needs <strong>5V power</strong> in one of two ways:
                <br />
                <strong>Option A (Shown above — Red Wire 3):</strong> Connect your External 5V Supply <strong>(+)</strong> directly to the ESP32 <strong>VIN</strong> pin (bottom-left pin) and Supply <strong>(-)</strong> to ESP32 <strong>GND</strong>. Unplug this VIN wire before connecting your laptop USB again.
                <br />
                <strong>Option B (Easier Phone Charger):</strong> Leave <strong>VIN</strong> empty and plug a normal <strong>5V USB phone charger</strong> into the ESP32 USB port (keep GND connected between the 5V servo supply and ESP32 GND).
              </p>
            </div>
          </div>
          </>
        )}
      </div>

      <Esp32WiringVideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />
    </div>
  );
};
