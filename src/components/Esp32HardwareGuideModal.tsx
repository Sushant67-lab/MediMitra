import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Cpu, 
  Copy, 
  Check, 
  AlertCircle, 
  Activity,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getAppStrings } from '../data/appTranslations';
import { Esp32WiringDiagram } from './Esp32WiringDiagram';
import {
  subscribeToDeviceStatus,
  isDeviceOnlineNow,
  DEFAULT_DEVICE_ID
} from '../services/dispensingService';
import { DispenserDevice } from '../types/dispensing';

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
  const [deviceInfo, setDeviceInfo] = useState<DispenserDevice | null>(null);
  const [, setTick] = useState(0);
  const [hotspotSsid, setHotspotSsid] = useState('');
  const [hotspotPass, setHotspotPass] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeToDeviceStatus(DEFAULT_DEVICE_ID, (info) => {
      setDeviceInfo(info);
    });
    const timer = setInterval(() => setTick((t) => t + 1), 10000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [isOpen]);

  const isOnline = isDeviceOnlineNow(deviceInfo);

  const escapeCpp = (val: string) => val.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const resolvedSsid = escapeCpp(hotspotSsid.trim() || 'YOUR_HOTSPOT_NAME');
  const resolvedPass = escapeCpp(hotspotPass || 'YOUR_HOTSPOT_PASSWORD');

  const sketchSnippet = `/*
 * =========================================================================================
 * MediMitra Smart IoT Medicine Dispenser - ESP32 Firmware (Hotspot + Direct Cloud Sync)
 * Hardware: ESP32 DevKit V1 (30-Pin) + External 5V 2A Supply + SG90 / MG90S Servo
 *
 * WIRING:
 *   - Orange Wire (Signal) -> ESP32 GPIO 18 (D18)
 *   - Red Wire (+5V)       -> External 5V 2A Power Supply (+)
 *   - Brown Wire (GND)     -> Common GND (5V Supply GND + ESP32 GND + Servo Brown)
 *
 * MOBILE HOTSPOT CHECKLIST:
 *   - Android AP Band -> 2.4 GHz (NOT 5 GHz!) | iPhone -> Maximize Compatibility ON
 *   - Keep Mobile Data ON | If hardcoded Wi-Fi fails, connect phone to "MediMitra-ESP32"
 *     and open http://192.168.4.1 to pick your 2.4GHz hotspot visually!
 *
 * BLUE LED (GPIO 2) STATUS SIGNALS:
 *   - Fast Blink (0.25s)         -> Connecting to Wi-Fi / Hotspot...
 *   - 3 Flashes + 1.5s Glow      -> Connected! Ready for Dispense!
 *   - Tiny 60ms blip every 5s    -> Alive & Online on Wi-Fi / Hotspot
 *   - Medium Blink (0.45s)       -> Setup Portal Active ("MediMitra-ESP32" @ 192.168.4.1)
 *   - 1 Slow 1.2s Blue Blink     -> Medicine Dispensed (0° -> 25° -> 0°)
 * =========================================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include <ArduinoJson.h>

// 1. ONLY EDIT THESE TWO LINES FOR YOUR 2.4GHz MOBILE HOTSPOT OR WI-FI:
const char* WIFI_SSID        = "${resolvedSsid}";
const char* WIFI_PASSWORD    = "${resolvedPass}";

// 2. DIRECT FIREBASE CLOUD CONFIG (ALREADY CONFIGURED)
const char* FIREBASE_PROJECT_ID = "medimitra-3be2c";
const char* FIRESTORE_DB_ID     = "ai-studio-curahealthaimedi-3da36085-2b1d-4e47-a414-215a5a6f8743";
const char* FIREBASE_API_KEY    = "AIzaSyArDAf5opYldc_-yFDwvheTKoJNRE5WTf4";
const char* DEVICE_ID           = "ESP32_MEDIMITRA_01";

const int SERVO_PIN          = 18;
const int LED_STATUS_PIN     = 2;
const int PWM_FREQ_HZ        = 50;
const int PWM_RESOLUTION     = 14;
const int LEDC_CHANNEL       = 0;

int initialAngle             = 0;
int dispenseAngle            = 25;
int returnAngle              = 0;
int holdDurationMs           = 300;
int stepDelayMs              = 15;

Preferences prefs;
String activeSsid = "";
String activePass = "";

unsigned long lastPollTime          = 0;
const unsigned long POLL_INTERVAL_MS      = 2500;
unsigned long lastHeartbeatTime     = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 10000;
unsigned long lastWifiBlipTime      = 0;
const unsigned long WIFI_BLIP_INTERVAL_MS = 5000;

String firestoreDocPath(const String& collection, const String& docId) {
  return "projects/" + String(FIREBASE_PROJECT_ID) + "/databases/" + String(FIRESTORE_DB_ID) + "/documents/" + collection + "/" + docId;
}
String firestoreRunQueryUrl() {
  return "https://firestore.googleapis.com/v1/projects/" + String(FIREBASE_PROJECT_ID) + "/databases/" + String(FIRESTORE_DB_ID) + "/documents:runQuery?key=" + String(FIREBASE_API_KEY);
}
String firestoreCommitUrl() {
  return "https://firestore.googleapis.com/v1/projects/" + String(FIREBASE_PROJECT_ID) + "/databases/" + String(FIRESTORE_DB_ID) + "/documents:commit?key=" + String(FIREBASE_API_KEY);
}
String firestorePatchUrl(const String& collection, const String& docId, const String& masks) {
  return "https://firestore.googleapis.com/v1/" + firestoreDocPath(collection, docId) + "?" + masks + "&key=" + String(FIREBASE_API_KEY);
}

uint32_t angleToDuty(int angle) {
  int clamped = constrain(angle, 0, 180);
  long pulseUs = map(clamped, 0, 180, 500, 2400);
  return (uint32_t)((pulseUs * 16383L) / 20000L);
}

void idleServoPinLow() {
  #if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcDetach(SERVO_PIN);
  #else
    ledcDetachPin(SERVO_PIN);
  #endif
  pinMode(SERVO_PIN, OUTPUT);
  digitalWrite(SERVO_PIN, LOW);
}

void attachServoAtAngle(int startAngle) {
  #if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcAttach(SERVO_PIN, PWM_FREQ_HZ, PWM_RESOLUTION);
    ledcWrite(SERVO_PIN, angleToDuty(startAngle));
  #else
    ledcSetup(LEDC_CHANNEL, PWM_FREQ_HZ, PWM_RESOLUTION);
    ledcAttachPin(SERVO_PIN, LEDC_CHANNEL);
    ledcWrite(LEDC_CHANNEL, angleToDuty(startAngle));
  #endif
}

void writeServoAngle(int angle) {
  #if defined(ESP_ARDUINO_VERSION_MAJOR) && ESP_ARDUINO_VERSION_MAJOR >= 3
    ledcWrite(SERVO_PIN, angleToDuty(angle));
  #else
    ledcWrite(LEDC_CHANNEL, angleToDuty(angle));
  #endif
}

void slowBlinkBlueLedOnce() {
  digitalWrite(LED_STATUS_PIN, HIGH);
  delay(1200);
  digitalWrite(LED_STATUS_PIN, LOW);
}

void blinkWifiErrorPattern() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(LED_STATUS_PIN, HIGH); delay(120);
    digitalWrite(LED_STATUS_PIN, LOW);  delay(120);
  }
  delay(800);
}

void blinkWifiConnectedSuccess() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_STATUS_PIN, HIGH); delay(120);
    digitalWrite(LED_STATUS_PIN, LOW);  delay(120);
  }
  digitalWrite(LED_STATUS_PIN, HIGH); delay(1500);
  digitalWrite(LED_STATUS_PIN, LOW);
}

bool executePhysicalDispense(int cycles, int targetAngle, int holdTime) {
  digitalWrite(LED_STATUS_PIN, LOW);
  attachServoAtAngle(initialAngle);
  delay(150);
  for (int c = 1; c <= cycles; c++) {
    for (int pos = initialAngle; pos <= targetAngle; pos++) { writeServoAngle(pos); delay(stepDelayMs); }
    delay(holdTime);
    for (int pos = targetAngle; pos >= returnAngle; pos--) { writeServoAngle(pos); delay(stepDelayMs); }
    writeServoAngle(returnAngle);
    delay(250);
    if (c < cycles) delay(400);
  }
  idleServoPinLow();
  slowBlinkBlueLedOnce();
  return true;
}

void loadCredentials() {
  prefs.begin("medimitra", false);
  String savedSsid = prefs.getString("ssid", "");
  String savedPass = prefs.getString("pass", "");
  String lastCodeSsid = prefs.getString("codeSsid", "");
  String compiledSsid = String(WIFI_SSID);
  String compiledPass = String(WIFI_PASSWORD);
  bool codeWasCustomized = compiledSsid.length() > 0 && compiledSsid != "YOUR_HOTSPOT_NAME" && compiledSsid != "YOUR_WIFI_SSID";
  if (codeWasCustomized && compiledSsid != lastCodeSsid) {
    activeSsid = compiledSsid; activePass = compiledPass;
    prefs.putString("ssid", activeSsid); prefs.putString("pass", activePass); prefs.putString("codeSsid", compiledSsid);
  } else if (savedSsid.length() > 0) {
    activeSsid = savedSsid; activePass = savedPass;
  } else {
    activeSsid = compiledSsid; activePass = compiledPass;
  }
  prefs.end();
}

void startHotspotSetupPortal() {
  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP("MediMitra-ESP32");
  delay(200);
  int found = WiFi.scanNetworks();
  String optionsHtml = "";
  for (int i = 0; i < found; i++) {
    String s = WiFi.SSID(i);
    if (s.length() > 0) optionsHtml += "<option value='" + s + "'>" + s + " (" + String(WiFi.RSSI(i)) + " dBm)</option>";
  }
  WebServer server(80);
  bool credentialsSaved = false;
  server.on("/", HTTP_GET, [&]() {
    String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><title>MediMitra Wi-Fi</title>";
    html += "<style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:20px;max-width:420px;margin:auto}input,select,button{width:100%;padding:12px;margin:8px 0;border-radius:8px;border:1px solid #334155;box-sizing:border-box;font-size:15px;background:#1e293b;color:#fff}button{background:#0d9488;font-weight:bold;border:none;cursor:pointer}.tip{background:#1e293b;padding:12px;border-radius:8px;font-size:13px;color:#cbd5e1;margin-bottom:14px}</style></head><body>";
    html += "<h2>MediMitra ESP32 Setup</h2><div class='tip'><b>Hotspot Tip:</b> Use <b>2.4 GHz Band</b> (Android) or <b>Maximize Compatibility</b> (iPhone).</div><form method='POST' action='/save'>";
    if (optionsHtml.length() > 0) html += "<label>Detected 2.4GHz Networks:</label><select onchange=\\"if(this.value)document.getElementById('s').value=this.value\\"><option value=''>-- Select Hotspot --</option>" + optionsHtml + "</select>";
    html += "<label>Hotspot / Wi-Fi Name (SSID):</label><input id='s' name='ssid' value='" + activeSsid + "' required>";
    html += "<label>Password:</label><input name='pass' type='password' placeholder='Hotspot password'><button type='submit'>Save & Connect</button></form></body></html>";
    server.send(200, "text/html", html);
  });
  server.on("/save", HTTP_POST, [&]() {
    activeSsid = server.arg("ssid"); activePass = server.arg("pass");
    prefs.begin("medimitra", false); prefs.putString("ssid", activeSsid); prefs.putString("pass", activePass); prefs.end();
    server.send(200, "text/html", "<html><body style='font-family:sans-serif;background:#0f172a;color:#fff;padding:24px'><h2>Saved!</h2><p>Connecting to <b>" + activeSsid + "</b>...</p></body></html>");
    delay(600); credentialsSaved = true;
  });
  server.begin();
  unsigned long t0 = millis(), lastBlink = 0; bool led = false;
  while (!credentialsSaved && (millis() - t0 < 90000)) {
    server.handleClient();
    if (millis() - lastBlink > 450) { lastBlink = millis(); led = !led; digitalWrite(LED_STATUS_PIN, led ? HIGH : LOW); }
    delay(2);
  }
  server.stop(); WiFi.softAPdisconnect(true); digitalWrite(LED_STATUS_PIN, LOW);
}

bool attemptStaConnect() {
  WiFi.persistent(false);
  WiFi.disconnect(true, true);
  delay(200);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.setAutoReconnect(true);
  WiFi.begin(activeSsid.c_str(), activePass.c_str());
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    digitalWrite(LED_STATUS_PIN, HIGH); delay(250);
    digitalWrite(LED_STATUS_PIN, LOW);  delay(250);
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\\n✓ Wi-Fi Connected! IP: " + WiFi.localIP().toString());
    blinkWifiConnectedSuccess();
    return true;
  }
  return false;
}

void connectWiFi() {
  loadCredentials();
  while (!attemptStaConnect()) {
    blinkWifiErrorPattern();
    startHotspotSetupPortal();
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    blinkWifiErrorPattern();
    WiFi.disconnect();
    WiFi.begin(activeSsid.c_str(), activePass.c_str());
    delay(1500);
    if (WiFi.status() == WL_CONNECTED) {
      sendHeartbeat();
      lastHeartbeatTime = millis();
    }
  }
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;
  WiFiClientSecure secureClient; secureClient.setInsecure();
  HTTPClient http;
  http.begin(secureClient, firestoreCommitUrl());
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(6000);
  #if ARDUINOJSON_VERSION_MAJOR >= 7
    JsonDocument doc;
    JsonArray writes = doc["writes"].to<JsonArray>();
    JsonObject w1 = writes.add<JsonObject>();
    JsonObject upd = w1["update"].to<JsonObject>();
    upd["name"] = firestoreDocPath("devices", DEVICE_ID);
    JsonObject f = upd["fields"].to<JsonObject>();
    f["deviceId"]["stringValue"] = DEVICE_ID;
    f["deviceName"]["stringValue"] = "MediMitra Smart Dispenser Unit 1";
    f["status"]["stringValue"] = "ONLINE";
    f["ipAddress"]["stringValue"] = WiFi.localIP().toString();
    f["wifiSsid"]["stringValue"] = activeSsid;
    f["wifiRssi"]["integerValue"] = String(WiFi.RSSI());
    JsonArray masks = w1["updateMask"]["fieldPaths"].to<JsonArray>();
    masks.add("deviceId"); masks.add("deviceName"); masks.add("status");
    masks.add("ipAddress"); masks.add("wifiSsid"); masks.add("wifiRssi");
    JsonObject w2 = writes.add<JsonObject>();
    w2["transform"]["document"] = firestoreDocPath("devices", DEVICE_ID);
    JsonObject t1 = w2["transform"]["fieldTransforms"].to<JsonArray>().add<JsonObject>();
    t1["fieldPath"] = "lastHeartbeat";
    t1["setToServerValue"] = "REQUEST_TIME";
  #else
    StaticJsonDocument<1024> doc;
    JsonArray writes = doc.createNestedArray("writes");
    JsonObject w1 = writes.createNestedObject();
    JsonObject upd = w1.createNestedObject("update");
    upd["name"] = firestoreDocPath("devices", DEVICE_ID);
    JsonObject f = upd.createNestedObject("fields");
    f["deviceId"]["stringValue"] = DEVICE_ID;
    f["deviceName"]["stringValue"] = "MediMitra Smart Dispenser Unit 1";
    f["status"]["stringValue"] = "ONLINE";
    f["ipAddress"]["stringValue"] = WiFi.localIP().toString();
    f["wifiSsid"]["stringValue"] = activeSsid;
    f["wifiRssi"]["integerValue"] = String(WiFi.RSSI());
    JsonArray masks = w1.createNestedObject("updateMask").createNestedArray("fieldPaths");
    masks.add("deviceId"); masks.add("deviceName"); masks.add("status");
    masks.add("ipAddress"); masks.add("wifiSsid"); masks.add("wifiRssi");
    JsonObject w2 = writes.createNestedObject();
    JsonObject tr = w2.createNestedObject("transform");
    tr["document"] = firestoreDocPath("devices", DEVICE_ID);
    JsonObject t1 = tr.createNestedArray("fieldTransforms").createNestedObject();
    t1["fieldPath"] = "lastHeartbeat";
    t1["setToServerValue"] = "REQUEST_TIME";
  #endif
  String body; serializeJson(doc, body);
  http.POST(body);
  http.end();
}

bool updateCommandStatusInFirestore(const String& commandId, const String& status, const String& resultMsg) {
  if (WiFi.status() != WL_CONNECTED) return false;
  WiFiClientSecure secureClient; secureClient.setInsecure();
  HTTPClient http;
  http.begin(secureClient, firestorePatchUrl("dispensing_commands", commandId, "updateMask.fieldPaths=status&updateMask.fieldPaths=executionResult"));
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(6000);
  #if ARDUINOJSON_VERSION_MAJOR >= 7
    JsonDocument doc;
  #else
    StaticJsonDocument<512> doc;
  #endif
  doc["fields"]["status"]["stringValue"] = status;
  doc["fields"]["executionResult"]["stringValue"] = resultMsg;
  String body; serializeJson(doc, body);
  int code = http.PATCH(body);
  http.end();
  return code == 200;
}

void pollForDispenseCommand() {
  if (WiFi.status() != WL_CONNECTED) return;
  WiFiClientSecure secureClient; secureClient.setInsecure();
  HTTPClient http;
  http.begin(secureClient, firestoreRunQueryUrl());
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(6000);
  String queryBody = "{\\"structuredQuery\\":{\\"from\\":[{\\"collectionId\\":\\"dispensing_commands\\"}],\\"where\\":{\\"fieldFilter\\":{\\"field\\":{\\"fieldPath\\":\\"status\\"},\\"op\\":\\"EQUAL\\",\\"value\\":{\\"stringValue\\":\\"PENDING\\"}}},\\"limit\\":10}}";
  if (http.POST(queryBody) == 200) {
    String payload = http.getString();
    http.end();
    #if ARDUINOJSON_VERSION_MAJOR >= 7
      JsonDocument doc;
    #else
      DynamicJsonDocument doc(8192);
    #endif
    if (deserializeJson(doc, payload)) return;
    String cmdId = "", newest = ""; int cycles = 1, angle = dispenseAngle, hold = holdDurationMs;
    for (JsonObject row : doc.as<JsonArray>()) {
      if (row["document"].isNull()) continue;
      JsonObject f = row["document"]["fields"];
      if (f["deviceId"]["stringValue"].as<String>() != DEVICE_ID) continue;
      String created = f["createdAt"]["stringValue"].as<String>();
      if (cmdId == "" || created > newest) {
        newest = created;
        cmdId = f["commandId"]["stringValue"].as<String>();
        String qStr = f["requestedQuantity"]["integerValue"].as<String>();
        String cStr = f["cycles"]["integerValue"].as<String>();
        cycles = cStr.length() > 0 ? cStr.toInt() : (qStr.length() > 0 ? qStr.toInt() : 1);
        if (!f["servoConfig"]["mapValue"]["fields"].isNull()) {
          JsonObject sf = f["servoConfig"]["mapValue"]["fields"];
          if (sf["dispenseAngle"]["integerValue"].as<String>().length() > 0) angle = sf["dispenseAngle"]["integerValue"].as<String>().toInt();
          if (sf["holdTimeMs"]["integerValue"].as<String>().length() > 0) hold = sf["holdTimeMs"]["integerValue"].as<String>().toInt();
        }
      }
    }
    if (cmdId.length() > 0) {
      updateCommandStatusInFirestore(cmdId, "PROCESSING", "Claimed by ESP32. Turning servo...");
      executePhysicalDispense(cycles, angle, hold);
      updateCommandStatusInFirestore(cmdId, "COMPLETED", "SUCCESS: Servo rotated 0° -> " + String(angle) + "° -> 0°. Blue LED blinked once.");
    }
    return;
  }
  http.end();
}

void setup() {
  pinMode(SERVO_PIN, OUTPUT); digitalWrite(SERVO_PIN, LOW);
  pinMode(LED_STATUS_PIN, OUTPUT); digitalWrite(LED_STATUS_PIN, LOW);
  Serial.begin(115200); delay(800);
  connectWiFi();
  sendHeartbeat();
}

void loop() {
  checkWiFiConnection();
  unsigned long now = millis();
  if (WiFi.status() == WL_CONNECTED && now - lastWifiBlipTime >= WIFI_BLIP_INTERVAL_MS) {
    lastWifiBlipTime = now;
    digitalWrite(LED_STATUS_PIN, HIGH); delay(60); digitalWrite(LED_STATUS_PIN, LOW);
  }
  if (now - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) { lastHeartbeatTime = now; sendHeartbeat(); }
  if (now - lastPollTime >= POLL_INTERVAL_MS) { lastPollTime = now; pollForDispenseCommand(); }
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
        className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6"
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

        {/* Live Wi-Fi Connection Strip */}
        <div className={`px-6 py-2.5 border-b flex items-center justify-between text-xs ${
          isOnline
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>{ui.esp32OnlineStatus}</span>
                {deviceInfo?.ipAddress && (
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-800">
                    {deviceInfo.ipAddress}
                  </span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-slate-400" />
                <span>{ui.esp32OfflineStatus}</span>
              </>
            )}
          </div>
          <span className="font-mono text-[11px] text-slate-500">{DEFAULT_DEVICE_ID}</span>
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
              <Esp32WiringDiagram />

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
                      <td className="p-3 font-mono font-semibold text-slate-900">GPIO 18 (D18)</td>
                      <td className="p-3">{ui.wireOrangeFunc}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-rose-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                        {ui.wireRed}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">5V PSU (+5V) / VIN</td>
                      <td className="p-3">{ui.wireRedFunc}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                        {ui.wireBrown}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-900">Common GND (PSU + ESP32)</td>
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
              {/* Mobile Hotspot / Wi-Fi Quick Fill Helper */}
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Smartphone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-teal-950">{ui.hotspotSetupTitle}</h4>
                    <p className="text-[11px] text-teal-900">{ui.hotspotSetupDesc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                      {ui.ssidInputLabel}
                    </label>
                    <input
                      type="text"
                      value={hotspotSsid}
                      onChange={(e) => setHotspotSsid(e.target.value)}
                      placeholder="e.g. MediMitraHotspot"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-teal-900 mb-1">
                      {ui.passwordInputLabel}
                    </label>
                    <input
                      type="text"
                      value={hotspotPass}
                      onChange={(e) => setHotspotPass(e.target.value)}
                      placeholder="Hotspot password"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-xs text-slate-900 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  {ui.band24GhzTip}
                </p>
              </div>

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
