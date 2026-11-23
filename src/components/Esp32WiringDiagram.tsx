import React, { useState } from 'react';
import { Box, Download, FileCode2 } from 'lucide-react';
import { Esp32WiringDiagram3D } from './Esp32WiringDiagram3D';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

const LEFT_PINS = [
  'EN',
  'VP (36)',
  'VN (39)',
  'D34',
  'D35',
  'D32',
  'D33',
  'D25',
  'D26',
  'D27',
  'D14',
  'D12',
  'D13',
  'GND',
  'VIN (5V)'
];

const RIGHT_PINS = [
  'D23',
  'D22',
  'TX0',
  'RX0',
  'D21',
  'D19',
  'D18',
  'D5',
  'TX2 (17)',
  'RX2 (16)',
  'D4',
  'D2',
  'D15',
  'GND',
  '3V3'
];

export const Esp32WiringDiagram: React.FC = () => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

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

  // Pin geometry for ESP32 DevKit V1 (30-Pin) centered around x=395
  const boardX = 335;
  const boardY = 85;
  const boardW = 136;
  const boardH = 310;
  const pinStartY = 148;
  const pinStepY = 15.5;
  const leftPinX = boardX + 8;
  const rightPinX = boardX + boardW - 8;

  const vinY = pinStartY + 14 * pinStepY; // Left row index 14 (y = 365)
  const leftGndY = pinStartY + 13 * pinStepY; // Left row index 13 (y = 349.5)
  const gpio18Y = pinStartY + 6 * pinStepY; // Right row index 6 (y = 241)
  const rightGndY = pinStartY + 13 * pinStepY; // Right row index 13 (y = 349.5)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <div className="px-3.5 py-2 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="font-semibold tracking-wide truncate">
          ESP32 DevKit V1 (30-Pin) + External 5V 2A Power Supply + SG90 Servo
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>{ui.diagramMode3d}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                viewMode === '2d'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FileCode2 className="w-3 h-3" />
              <span>{ui.diagramMode2d}</span>
            </button>
          </div>

          {viewMode === '2d' && (
            <button
              type="button"
              onClick={handleDownloadSvg}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-teal-200 font-medium flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3 h-3" />
              <span>SVG</span>
            </button>
          )}
        </div>
      </div>

      {viewMode === '3d' ? (
        <Esp32WiringDiagram3D />
      ) : (
      <div className="bg-slate-50 p-2 overflow-x-auto">
        <svg
          id="esp32-power-wiring-svg"
          viewBox="0 0 880 510"
          className="w-full h-auto min-w-[640px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.7" />
            </pattern>
            <marker id="arrowTeal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#0d9488" />
            </marker>
          </defs>

          {/* Engineering Blueprint Background */}
          <rect x="0" y="0" width="880" height="510" fill="#ffffff" />
          <rect x="10" y="10" width="860" height="490" fill="url(#gridPattern)" stroke="#cbd5e1" strokeWidth="1.5" rx="8" />

          {/* Header Strip */}
          <text x="28" y="38" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="14" fontWeight="700" fill="#0f172a">
            MEDIMITRA HARDWARE SCHEMATIC — EXTERNAL 5V SUPPLY + COMMON GROUND
          </text>
          <text x="28" y="55" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="10.5" fill="#475569">
            All pin numbers verified for ESP32 DevKit V1 (30-Pin) • Servo powered by 5V 2A Supply to prevent brownout resets
          </text>

          {/* ========================================================= */}
          {/* 1. EXTERNAL 5V POWER SUPPLY MODULE (LEFT)                */}
          {/* ========================================================= */}
          <g>
            {/* Adapter / PSU Enclosure */}
            <rect x="34" y="130" width="185" height="168" rx="12" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
            <rect x="34" y="130" width="185" height="32" rx="12" fill="#0f172a" />
            <rect x="34" y="150" width="185" height="12" fill="#0f172a" />
            <text x="126.5" y="150" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="11" fontWeight="700" fill="#ffffff">
              5V DC POWER SUPPLY
            </text>

            {/* DC Barrel / Adapter Badge */}
            <rect x="52" y="176" width="148" height="44" rx="7" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.2" />
            <text x="126" y="194" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="11" fontWeight="700" fill="#92400e">
              5V 2A Regulated Adapter
            </text>
            <text x="126" y="210" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fill="#b45309">
              (USB 5V 2A / MB102 / Buck Converter)
            </text>

            {/* +5V Positive Terminal */}
            <rect x="150" y="232" width="60" height="22" rx="4" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.3" />
            <text x="176" y="246.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fontWeight="700" fill="#991b1b">
              +5V OUT
            </text>
            <circle cx="219" cy="243" r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />

            {/* GND Negative Terminal */}
            <rect x="150" y="264" width="60" height="22" rx="4" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1.3" />
            <text x="176" y="278.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10.5" fontWeight="700" fill="#0f172a">
              GND (-)
            </text>
            <circle cx="219" cy="275" r="5" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />

            {/* Filter Capacitor Symbol between +5V and GND */}
            <line x1="88" y1="243" x2="150" y2="243" stroke="#dc2626" strokeWidth="2" />
            <line x1="88" y1="275" x2="150" y2="275" stroke="#1e293b" strokeWidth="2" />
            <line x1="88" y1="243" x2="88" y2="254" stroke="#475569" strokeWidth="2" />
            <line x1="78" y1="254" x2="98" y2="254" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="78" y1="262" x2="98" y2="262" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="88" y1="262" x2="88" y2="275" stroke="#475569" strokeWidth="2" />
            <text x="64" y="261" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#475569">
              470µF
            </text>
          </g>

          {/* ========================================================= */}
          {/* 2. ESP32 DEVKIT V1 (30-PIN REAL PINOUT, CENTER)           */}
          {/* ========================================================= */}
          <g>
            {/* Title above board */}
            <text x={boardX + boardW / 2} y="76" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#0f172a">
              ESP32 DEVKIT V1 (30-Pin)
            </text>

            {/* PCB Body */}
            <rect x={boardX} y={boardY} width={boardW} height={boardH} rx="10" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />

            {/* Mounting Holes */}
            <circle cx={boardX + 10} cy={boardY + 10} r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx={boardX + boardW - 10} cy={boardY + 10} r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx={boardX + 10} cy={boardY + boardH - 10} r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
            <circle cx={boardX + boardW - 10} cy={boardY + boardH - 10} r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

            {/* PCB Wi-Fi Antenna Trace */}
            <rect x={boardX + 28} y={boardY + 6} width="80" height="22" rx="3" fill="#0f172a" />
            <path
              d={`M ${boardX + 38} ${boardY + 23} v -11 h 10 v 11 h 10 v -11 h 10 v 11 h 10 v -11 h 10 v 11`}
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
            />

            {/* RF Shield Can */}
            <rect x={boardX + 34} y={boardY + 33} width="68" height="82" rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
            <text x={boardX + 68} y={boardY + 68} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="8.5" fontWeight="700" fill="#1e293b">
              ESP-WROOM-32
            </text>
            <text x={boardX + 68} y={boardY + 80} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7.5" fontWeight="600" fill="#334155">
              Wi-Fi + BLE
            </text>

            {/* Voltage Regulator + CP2102 USB Chip */}
            <rect x={boardX + 54} y={boardY + 145} width="28" height="20" rx="2" fill="#0f172a" stroke="#475569" />
            <text x={boardX + 68} y={boardY + 158} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6.5" fill="#94a3b8">
              AMS1117
            </text>
            <rect x={boardX + 56} y={boardY + 195} width="24" height="24" rx="2" fill="#0f172a" stroke="#475569" />
            <text x={boardX + 68} y={boardY + 210} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6.5" fill="#94a3b8">
              UART
            </text>

            {/* EN & BOOT Buttons */}
            <rect x={boardX + 28} y={boardY + 272} width="14" height="14" rx="2" fill="#475569" />
            <circle cx={boardX + 35} cy={boardY + 279} r="3.5" fill="#e2e8f0" />
            <text x={boardX + 35} y={boardY + 268} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6" fill="#94a3b8">EN</text>

            <rect x={boardX + 94} y={boardY + 272} width="14" height="14" rx="2" fill="#475569" />
            <circle cx={boardX + 101} cy={boardY + 279} r="3.5" fill="#e2e8f0" />
            <text x={boardX + 101} y={boardY + 268} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="6" fill="#94a3b8">BOOT</text>

            {/* Micro-USB / USB-C Port */}
            <rect x={boardX + 49} y={boardY + boardH - 18} width="38" height="22" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            <text x={boardX + 68} y={boardY + boardH + 15} textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fontWeight="600" fill="#475569">
              USB Port (5V Prog/Debug)
            </text>

            {/* Left Header Pins (15) */}
            {LEFT_PINS.map((label, idx) => {
              const py = pinStartY + idx * pinStepY;
              const isVin = label.startsWith('VIN');
              const isGnd = label === 'GND';
              return (
                <g key={`L-${idx}`}>
                  <circle
                    cx={leftPinX}
                    cy={py}
                    r="3.8"
                    fill={isVin ? '#ef4444' : isGnd ? '#0f172a' : '#f59e0b'}
                    stroke="#f8fafc"
                    strokeWidth="1"
                  />
                  <text
                    x={leftPinX + 7}
                    y={py + 3}
                    fontFamily="ui-monospace, monospace"
                    fontSize="7.5"
                    fontWeight={isVin || isGnd ? '700' : '500'}
                    fill={isVin ? '#fca5a5' : isGnd ? '#e2e8f0' : '#94a3b8'}
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Right Header Pins (15) */}
            {RIGHT_PINS.map((label, idx) => {
              const py = pinStartY + idx * pinStepY;
              const isGpio18 = label === 'D18';
              const isGnd = label === 'GND';
              return (
                <g key={`R-${idx}`}>
                  <circle
                    cx={rightPinX}
                    cy={py}
                    r="3.8"
                    fill={isGpio18 ? '#f97316' : isGnd ? '#0f172a' : '#f59e0b'}
                    stroke="#f8fafc"
                    strokeWidth="1"
                  />
                  <text
                    x={rightPinX - 7}
                    y={py + 3}
                    textAnchor="end"
                    fontFamily="ui-monospace, monospace"
                    fontSize="7.5"
                    fontWeight={isGpio18 || isGnd ? '700' : '500'}
                    fill={isGpio18 ? '#fdba74' : isGnd ? '#e2e8f0' : '#94a3b8'}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ========================================================= */}
          {/* 3. SG90 MICRO SERVO MOTOR (RIGHT)                         */}
          {/* ========================================================= */}
          <g>
            <text x="740" y="130" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="#0f172a">
              SG90 MICRO SERVO MOTOR
            </text>

            {/* 0° to 25° Arc Indicator */}
            <line x1="740" y1="162" x2="740" y2="215" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3,3" />
            <line x1="740" y1="215" x2="800" y2="180" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4,3" />
            <path d="M 740 175 A 40 40 0 0 1 765 184" fill="none" stroke="#0d9488" strokeWidth="2" markerEnd="url(#arrowTeal)" />
            <text x="772" y="160" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="10" fontWeight="700" fill="#0f766e">
              25° Dispense Arc
            </text>
            <text x="772" y="172" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9" fill="#475569">
              (0° → 25° hold 300ms → 0°)
            </text>

            {/* Servo Body */}
            <rect x="698" y="232" width="84" height="92" rx="5" fill="#2563eb" stroke="#1e3a8a" strokeWidth="2" />
            {/* Mounting Tabs */}
            <rect x="680" y="250" width="120" height="12" rx="3" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
            <circle cx="688" cy="256" r="2.8" fill="#ffffff" />
            <circle cx="792" cy="256" r="2.8" fill="#ffffff" />
            {/* Gear Housing Top */}
            <rect x="714" y="210" width="52" height="24" rx="4" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="1.5" />
            <circle cx="740" cy="210" r="14" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
            {/* Servo Horn */}
            <rect x="733" y="182" width="14" height="34" rx="7" fill="#f1f5f9" stroke="#475569" strokeWidth="1.4" transform="rotate(25 740 210)" />
            <circle cx="740" cy="210" r="4" fill="#64748b" />

            {/* Servo Label Badge */}
            <rect x="710" y="276" width="60" height="32" rx="4" fill="#1e40af" />
            <text x="740" y="291" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fontWeight="700" fill="#ffffff">
              SG90 9g
            </text>
            <text x="740" y="302" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="7.5" fill="#bfdbfe">
              4.8V - 6.0V
            </text>

            {/* Wire Pin Labels on Servo Side */}
            <rect x="615" y="232" width="83" height="19" rx="4" fill="#fff7ed" stroke="#f97316" strokeWidth="1.2" />
            <text x="656.5" y="244.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#9a3412">
              ORANGE (PWM)
            </text>

            <rect x="615" y="264" width="83" height="19" rx="4" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.2" />
            <text x="656.5" y="276.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#991b1b">
              RED (+5V VCC)
            </text>

            <rect x="615" y="296" width="83" height="19" rx="4" fill="#f1f5f9" stroke="#78350f" strokeWidth="1.2" />
            <text x="656.5" y="308.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#451a03">
              BROWN (GND)
            </text>
          </g>

          {/* ========================================================= */}
          {/* 4. ACCURATE WIRES & JUNCTIONS                             */}
          {/* ========================================================= */}

          {/* ORANGE WIRE: ESP32 GPIO 18 (D18) -> SG90 Orange PWM */}
          <path
            d={`M ${rightPinX} ${gpio18Y} H 615`}
            fill="none"
            stroke="#f97316"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <rect x="498" y="222" width="102" height="15" rx="3" fill="#fff7ed" stroke="#fdba74" strokeWidth="1" />
          <text x="549" y="232.5" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#c2410c">
            GPIO 18 → PWM Signal
          </text>

          {/* RED POWER RAIL: External 5V OUT (219, 243) -> Drops below board -> SG90 RED (615, 273.5) */}
          <path
            d="M 219 243 H 256 V 426 H 576 V 273.5 H 615"
            fill="none"
            stroke="#dc2626"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Junction dot on Red rail for optional standalone ESP32 VIN */}
          <circle cx="256" cy={vinY} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.2" />
          <path
            d={`M 256 ${vinY} H ${leftPinX}`}
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.4"
            strokeDasharray="5,4"
          />
          <rect x="256" y="374" width="76" height="24" rx="3" fill="#fef2f2" stroke="#fca5a5" strokeWidth="1" />
          <text x="294" y="384.5" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="7.2" fontWeight="700" fill="#991b1b">
            VIN (Standalone)
          </text>
          <text x="294" y="394" textAnchor="middle" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="6.8" fill="#b91c1c">
            Unplug if USB in
          </text>

          {/* Label on Red Rail */}
          <rect x="338" y="418" width="145" height="16" rx="3" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
          <text x="410.5" y="429" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#991b1b">
            +5V DC RAIL (2A to Servo)
          </text>

          {/* BLACK / BROWN COMMON GROUND RAIL:
              5V Supply GND (219, 275) -> Common GND Bus (238, 456) -> Up to ESP32 Left GND & Right GND -> SG90 Brown GND (615, 305.5) */}
          <path
            d="M 219 275 H 238 V 456 H 594 V 305.5 H 615"
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Tie ESP32 Left GND pin into Common GND rail */}
          <path
            d={`M 238 ${leftGndY} H ${leftPinX}`}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.8"
          />
          <circle cx="238" cy={leftGndY} r="4.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.2" />

          {/* Tie ESP32 Right GND pin into Common GND rail */}
          <path
            d={`M ${rightPinX} ${rightGndY} H 520 V 456`}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <circle cx="520" cy="456" r="4.5" fill="#0f172a" stroke="#ffffff" strokeWidth="1.2" />

          {/* Label on Common GND Rail */}
          <rect x="315" y="448" width="192" height="16" rx="3" fill="#0f172a" />
          <text x="411" y="459" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fontWeight="700" fill="#ffffff">
            COMMON GROUND BUS (PSU + ESP32 + SERVO)
          </text>

          {/* ========================================================= */}
          {/* 5. LEGEND & SAFETY NOTES FOOTER                           */}
          {/* ========================================================= */}
          <g>
            <rect x="28" y="473" width="824" height="22" rx="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <line x1="42" y1="484" x2="64" y2="484" stroke="#f97316" strokeWidth="3" />
            <text x="70" y="487.5" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fontWeight="600" fill="#0f172a">
              Orange: GPIO 18 (PWM)
            </text>

            <line x1="205" y1="484" x2="227" y2="484" stroke="#dc2626" strokeWidth="3" />
            <text x="233" y="487.5" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fontWeight="600" fill="#0f172a">
              Red: External +5V DC
            </text>

            <line x1="375" y1="484" x2="397" y2="484" stroke="#0f172a" strokeWidth="3" />
            <text x="403" y="487.5" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9.5" fontWeight="600" fill="#0f172a">
              Brown/Black: Common GND
            </text>

            <text x="840" y="487.5" textAnchor="end" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="9" fontWeight="700" fill="#0f766e">
              ★ Always connect Supply GND to ESP32 GND
            </text>
          </g>
        </svg>
      </div>
      )}
    </div>
  );
};
