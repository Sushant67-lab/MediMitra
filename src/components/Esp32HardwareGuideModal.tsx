import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Cpu, 
  Copy, 
  Check, 
  AlertCircle, 
  Activity
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';

interface Esp32HardwareGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Esp32HardwareGuideModal: React.FC<Esp32HardwareGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const ui = getAppStrings(language);

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
                {ui.hwBlueprintBadge}
              </span>
              <h2 className="text-base font-semibold leading-tight">{ui.hwSetupTitle}</h2>
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('wiring')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'wiring'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {ui.tabWiring}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sketch')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'sketch'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {ui.tabSketch}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calibration')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'calibration'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {ui.tabCalibration}
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === 'wiring' && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                <img
                  src="./assets/esp32_servo_wiring_diagram.jpg"
                  alt="ESP32 SG90 Wiring"
                  className="w-full object-contain max-h-64 mx-auto"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{ui.servoWireCol}</th>
                      <th className="p-3">{ui.esp32PinCol}</th>
                      <th className="p-3">{ui.functionVoltageCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="p-3 font-medium text-amber-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        {ui.wireOrange}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">GPIO 18</td>
                      <td className="p-3">{ui.wireOrangeFunc}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-rose-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        {ui.wireRed}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">VIN / 5V</td>
                      <td className="p-3">{ui.wireRedFunc}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                        {ui.wireBrown}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">GND</td>
                      <td className="p-3">{ui.wireBrownFunc}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">{ui.powerSupplyTitle}:</span>
                  <span className="text-[11px] text-amber-900 block leading-relaxed">
                    {ui.powerSupplyDesc}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sketch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {ui.arduinoFirmwareTitle}
                  </h3>
                  <span className="text-[11px] text-slate-400">esp32_firmware/esp32_dispenser.ino</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySketch}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? ui.copiedClipboard : ui.copySketchBtn}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-72 border border-slate-800">
                <pre>{sketchSnippet}</pre>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
                <span className="font-semibold text-slate-900 block">{ui.flashingStepsTitle}:</span>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
                  <li>{ui.flashStep1}</li>
                  <li>{ui.flashStep2}</li>
                  <li>{ui.flashStep3}</li>
                  <li>{ui.flashStep4}</li>
                  <li>{ui.flashStep5}</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'calibration' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
                <h3 className="font-bold text-teal-950 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-700" />
                  <span>{ui.motionCalibTitle}</span>
                </h3>
                <p className="text-[11px] leading-relaxed text-teal-900">
                  {ui.motionCalibDesc}
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-teal-900">
                  <li>{ui.calibRule1}</li>
                  <li>{ui.calibRule2}</li>
                  <li>{ui.calibRule3}</li>
                  <li>{ui.calibRule4}</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-semibold text-slate-900 block">{ui.whySmallArcTitle}</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {ui.whySmallArcDesc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
          >
            {ui.closeGuideBtn}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
