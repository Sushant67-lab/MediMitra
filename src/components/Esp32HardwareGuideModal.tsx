import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Cpu, 
  Copy, 
  Check, 
  AlertCircle, 
  Download, 
  Sliders, 
  ExternalLink,
  Zap,
  Activity
} from 'lucide-react';

interface Esp32HardwareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Esp32HardwareGuideModal: React.FC<Esp32HardwareGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'wiring' | 'sketch' | 'calibration'>('wiring');

  const sketchSnippet = `/*
 * MediMitra ESP32 Automatic Medicine Dispenser Firmware
 * Servo: SG90 / MG90S connected to GPIO 18
 * Motion: 0° -> 25° (Hold 300ms) -> 0°
 */
#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

const char* WIFI_SSID       = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD   = "YOUR_WIFI_PASSWORD";
const char* BACKEND_BASE_URL = "http://YOUR_SERVER_IP:3000";
const char* DEVICE_ID       = "ESP32_MEDIMITRA_01";
const char* DEVICE_TOKEN    = "mm_esp32_sec_key_2025";

const int SERVO_PIN         = 18;
Servo dispenserServo;

void setup() {
  Serial.begin(115200);
  ESP32PWM::allocateTimer(0);
  dispenserServo.setPeriodHertz(50);
  dispenserServo.attach(SERVO_PIN, 500, 2400);
  dispenserServo.write(0); // CRITICAL: Rest at 0° home position
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
}

void loop() {
  // Poll /api/device/poll?deviceId=ESP32_MEDIMITRA_01
  // On command: 0° -> 25° -> hold 300ms -> return 0°
  // Send ACK to /api/device/ack
  delay(2500);
}`;

  const handleCopySketch = () => {
    navigator.clipboard.writeText(sketchSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-teal-300">
                Hardware Engineering Blueprint
              </span>
              <h2 className="text-base font-semibold leading-tight">ESP32 & Servo Dispenser Setup</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('wiring')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'wiring'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Wiring Schematic & Pinout
          </button>
          <button
            onClick={() => setActiveTab('sketch')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sketch'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Arduino IDE Firmware (.ino)
          </button>
          <button
            onClick={() => setActiveTab('calibration')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'calibration'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Motion Calibration Rules
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === 'wiring' && (
            <div className="space-y-4">
              {/* Wiring Graphic Illustration */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                <img
                  src="./assets/esp32_servo_wiring_diagram.jpg"
                  alt="ESP32 to SG90 Servo Wiring Diagram"
                  className="w-full object-contain max-h-64 mx-auto"
                />
              </div>

              {/* Pinout Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">SG90 Servo Wire</th>
                      <th className="p-3">ESP32 DevKit Pin</th>
                      <th className="p-3">Function / Voltage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-medium text-amber-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        Orange / Yellow
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">GPIO 18</td>
                      <td className="p-3">PWM Signal (50Hz Duty Cycle)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-rose-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        Red
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">VIN or 5V (Ext)</td>
                      <td className="p-3">Power (+5V DC, min 500mA)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                        Brown / Black
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">GND</td>
                      <td className="p-3">Common Ground</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Safety hardware note */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Power Supply Recommendation:</span>
                  <span className="text-[11px] text-amber-900 block leading-relaxed">
                    While testing, the SG90 micro-servo can be powered from the ESP32 VIN pin over USB. For permanent deployment, use an external 5V 1A power adapter and tie the external power GND to the ESP32 GND.
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sketch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    ESP32 Arduino Firmware Code
                  </h3>
                  <span className="text-[11px] text-slate-400">File: esp32_firmware/esp32_dispenser.ino</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySketch}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Sketch'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800">
                <pre>{sketchSnippet}</pre>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
                <span className="font-semibold text-slate-900 block">Flashing Steps in Arduino IDE:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>Install <strong>ESP32 by Espressif</strong> in Boards Manager.</li>
                  <li>Install <strong>ESP32Servo</strong> and <strong>ArduinoJson</strong> via Library Manager.</li>
                  <li>Select Board: <strong>ESP32 Dev Module</strong>.</li>
                  <li>Update your Wi-Fi SSID, Password, and Server IP.</li>
                  <li>Click Upload and open Serial Monitor at <strong>115200 baud</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                <h3 className="font-bold text-teal-950 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span>Strict Mechanical Motion Calibration</span>
                </h3>
                <p className="text-[11px] leading-relaxed text-teal-900">
                  Per the hardware design specification, the servo motor will <strong>NEVER rotate continuously</strong> and will <strong>NEVER execute 180° sweeps</strong>.
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-teal-900">
                  <li><strong>Home Position:</strong> 0 degrees (servo rests completely still).</li>
                  <li><strong>Dispensing Arc:</strong> 25 degrees (small flick to dislodge 1 pill/blister).</li>
                  <li><strong>Hold Duration:</strong> 300 milliseconds at 25 degrees.</li>
                  <li><strong>Return Position:</strong> 0 degrees immediately after hold.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-semibold text-slate-900 block">Why Small Arc (25°)?</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  A small 25° rotational displacement operates a rack-and-pinion or rotary pill divider without crushing pills or rotating past the gate. You can adjust this to 20° or 30° in the web settings before dispensing if needed for your specific 3D-printed enclosure.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </motion.div>
    </div>
  );
};
