/*
 * =========================================================================================
 * MediMitra Smart IoT Medicine Dispenser - ESP32 Firmware (Hotspot + Direct Cloud Sync)
 * Hardware: ESP32 DevKit V1 (30-Pin) + External 5V 2A Supply + SG90 / MG90S Servo
 *
 * WIRING:
 *   - Orange Wire (Signal) -> ESP32 GPIO 18 (D18)  [Optional 10k resistor GPIO 18 to GND]
 *   - Red Wire (+5V)       -> External 5V 2A Power Supply (+)
 *   - Brown Wire (GND)     -> Common GND (5V Supply GND + ESP32 GND + Servo Brown)
 *
 * CONNECTING WITH MOBILE HOTSPOT (IMPORTANT CHECKLIST):
 *   1. Android Hotspot -> Set AP Band to "2.4 GHz" (ESP32 does NOT support 5 GHz!).
 *   2. iPhone Hotspot  -> Turn ON "Maximize Compatibility" in Settings > Personal Hotspot.
 *   3. Security        -> Use "WPA2-Personal" (avoid WPA3-only) & keep Mobile Data ON.
 *   4. Fallback Portal -> If hardcoded Wi-Fi fails, ESP32 opens "MediMitra-ESP32" Wi-Fi;
 *                         connect to it and open http://192.168.4.1 to pick your hotspot!
 *
 * BLUE LED (GPIO 2) WI-FI & DISPENSE STATUS (EVEN WITH USB UNPLUGGED):
 *   1. Fast Blink (0.25s ON/OFF)       -> Connecting to Wi-Fi / Hotspot...
 *   2. 3 Quick Flashes + 1.5s Glow     -> Connected! Ready for Dispense!
 *   3. Tiny 60ms Blip every 5 seconds  -> Connected & Online (listening to MediMitra App)
 *   4. Medium Blink (0.45s ON/OFF)     -> Setup Portal Active ("MediMitra-ESP32" @ 192.168.4.1)
 *   5. 1 Slow 1.2s Blue Blink          -> Medicine Dispensed! (0° -> 25° -> 0° complete)
 *
 * REQUIRED LIBRARY (Arduino IDE Library Manager):
 *   - ArduinoJson by Benoit Blanchon (v6 or v7)
 * =========================================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include <ArduinoJson.h>

// -----------------------------------------------------------------------------------------
// 1. CODE INPUTS FOR YOUR MOBILE HOTSPOT OR HOME WI-FI (EDIT ONLY THESE TWO LINES!)
// -----------------------------------------------------------------------------------------
const char* WIFI_SSID        = "YOUR_HOTSPOT_NAME";       // Exact 2.4 GHz Mobile Hotspot or Wi-Fi name
const char* WIFI_PASSWORD    = "YOUR_HOTSPOT_PASSWORD";   // Hotspot password (min 8 chars for WPA2)

// -----------------------------------------------------------------------------------------
// 2. DIRECT FIREBASE CLOUD CONFIG (ALREADY CONFIGURED — DO NOT CHANGE)
// -----------------------------------------------------------------------------------------
const char* FIREBASE_PROJECT_ID = "medimitra-3be2c";
const char* FIRESTORE_DB_ID     = "ai-studio-curahealthaimedi-3da36085-2b1d-4e47-a414-215a5a6f8743";
const char* FIREBASE_API_KEY    = "AIzaSyArDAf5opYldc_-yFDwvheTKoJNRE5WTf4";
const char* DEVICE_ID           = "ESP32_MEDIMITRA_01";

// -----------------------------------------------------------------------------------------
// 3. SERVO HARDWARE & CALIBRATION SETTINGS
// -----------------------------------------------------------------------------------------
const int SERVO_PIN          = 18;      // GPIO 18 (D18) -> Servo Orange Wire
const int LED_STATUS_PIN     = 2;       // Built-in blue LED on ESP32 DevKit V1
const int PWM_FREQ_HZ        = 50;      // Standard SG90 50Hz frequency (20ms period)
const int PWM_RESOLUTION     = 14;      // 14-bit resolution (0..16383)
const int LEDC_CHANNEL       = 0;       // Used only if ESP32 Core 2.x

int initialAngle             = 0;       // Home / closed angle (0 deg)
int dispenseAngle            = 25;      // Dispense rotation angle (25 deg)
int returnAngle              = 0;       // Return home angle (0 deg)
int holdDurationMs           = 300;     // Hold time at 25° (300 ms)
int stepDelayMs              = 15;      // Smooth step delay between degrees

// Active runtime credentials (supports NVS saved Portal credentials + code credentials)
Preferences prefs;
String activeSsid = "";
String activePass = "";

// -----------------------------------------------------------------------------------------
// 4. TIMING VARIABLES
// -----------------------------------------------------------------------------------------
unsigned long lastPollTime           = 0;
const unsigned long POLL_INTERVAL_MS       = 2500;   // Check Web App clicks every 2.5s
unsigned long lastHeartbeatTime      = 0;
const unsigned long HEARTBEAT_INTERVAL_MS  = 10000;  // Update live Online badge every 10s
unsigned long lastWifiBlipTime       = 0;
const unsigned long WIFI_BLIP_INTERVAL_MS  = 5000;   // Tiny 60ms Wi-Fi-alive blip every 5s

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
  digitalWrite(SERVO_PIN, LOW); // Hold 0V so motor NEVER moves or twitches when idle/booting
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
    digitalWrite(LED_STATUS_PIN, HIGH);
    delay(120);
    digitalWrite(LED_STATUS_PIN, LOW);
    delay(120);
  }
  delay(800);
}

void blinkWifiConnectedSuccess() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_STATUS_PIN, HIGH);
    delay(120);
    digitalWrite(LED_STATUS_PIN, LOW);
    delay(120);
  }
  digitalWrite(LED_STATUS_PIN, HIGH);
  delay(1500);
  digitalWrite(LED_STATUS_PIN, LOW);
}

bool executePhysicalDispense(int cycles, int targetAngle, int holdTime) {
  digitalWrite(LED_STATUS_PIN, LOW);
  attachServoAtAngle(initialAngle);
  delay(150);

  for (int c = 1; c <= cycles; c++) {
    Serial.printf(">>> Cycle %d/%d: Turning 0° -> %d°...\n", c, cycles, targetAngle);
    for (int pos = initialAngle; pos <= targetAngle; pos++) {
      writeServoAngle(pos);
      delay(stepDelayMs);
    }
    delay(holdTime);

    Serial.printf("<<< Returning %d° -> %d°...\n", targetAngle, returnAngle);
    for (int pos = targetAngle; pos >= returnAngle; pos--) {
      writeServoAngle(pos);
      delay(stepDelayMs);
    }
    writeServoAngle(returnAngle);
    delay(250);
    if (c < cycles) delay(400);
  }

  idleServoPinLow();
  slowBlinkBlueLedOnce();
  Serial.println("✓ Returned to 0°, blue LED slowly blinked once, and locked idle.\n");
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
    activeSsid = compiledSsid;
    activePass = compiledPass;
    prefs.putString("ssid", activeSsid);
    prefs.putString("pass", activePass);
    prefs.putString("codeSsid", compiledSsid);
  } else if (savedSsid.length() > 0) {
    activeSsid = savedSsid;
    activePass = savedPass;
  } else {
    activeSsid = compiledSsid;
    activePass = compiledPass;
  }
  prefs.end();
}

void startHotspotSetupPortal() {
  Serial.println("\n--------------------------------------------------------");
  Serial.println("WIFI PORTAL ACTIVE: Connect your phone to Wi-Fi 'MediMitra-ESP32'");
  Serial.println("Then open http://192.168.4.1 in browser to select your hotspot.");
  Serial.println("--------------------------------------------------------");

  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP("MediMitra-ESP32");
  delay(200);

  int found = WiFi.scanNetworks();
  String optionsHtml = "";
  bool targetSeen = false;
  Serial.printf("Scanned %d nearby 2.4GHz networks:\n", found);
  for (int i = 0; i < found; i++) {
    String s = WiFi.SSID(i);
    Serial.printf("  - %s (%d dBm)\n", s.c_str(), WiFi.RSSI(i));
    if (s == activeSsid) targetSeen = true;
    if (s.length() > 0) {
      optionsHtml += "<option value='" + s + "'>" + s + " (" + String(WiFi.RSSI(i)) + " dBm)</option>";
    }
  }
  if (!targetSeen && activeSsid.length() > 0) {
    Serial.println("! NOTE: '" + activeSsid + "' was NOT seen in 2.4GHz scan. Switch your phone hotspot AP Band to 2.4 GHz (or iPhone Maximize Compatibility ON).");
  }

  WebServer server(80);
  bool credentialsSaved = false;

  server.on("/", HTTP_GET, [&]() {
    String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><title>MediMitra Wi-Fi Setup</title>";
    html += "<style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:20px;max-width:420px;margin:auto}input,select,button{width:100%;padding:12px;margin:8px 0;border-radius:8px;border:1px solid #334155;box-sizing:border-box;font-size:15px;background:#1e293b;color:#fff}button{background:#0d9488;font-weight:bold;border:none;cursor:pointer}.tip{background:#1e293b;padding:12px;border-radius:8px;font-size:13px;color:#cbd5e1;margin-bottom:14px;border:1px solid #334155}</style></head><body>";
    html += "<h2>MediMitra ESP32 Wi-Fi Setup</h2>";
    html += "<div class='tip'><b>Mobile Hotspot Tip:</b> Turn ON <b>2.4 GHz Band</b> (Android) or <b>Maximize Compatibility</b> (iPhone), and keep Mobile Data ON.</div>";
    html += "<form method='POST' action='/save'>";
    if (optionsHtml.length() > 0) {
      html += "<label>Detected 2.4GHz Hotspots:</label><select onchange=\"if(this.value)document.getElementById('s').value=this.value\"><option value=''>-- Select Hotspot or Type Below --</option>" + optionsHtml + "</select>";
    }
    html += "<label>Hotspot / Wi-Fi Name (SSID):</label><input id='s' name='ssid' value='" + activeSsid + "' required>";
    html += "<label>Password:</label><input name='pass' type='password' placeholder='Enter hotspot password'>";
    html += "<button type='submit'>Save & Connect ESP32</button></form></body></html>";
    server.send(200, "text/html", html);
  });

  server.on("/save", HTTP_POST, [&]() {
    String newSsid = server.arg("ssid");
    String newPass = server.arg("pass");
    prefs.begin("medimitra", false);
    prefs.putString("ssid", newSsid);
    prefs.putString("pass", newPass);
    prefs.end();
    activeSsid = newSsid;
    activePass = newPass;
    server.send(200, "text/html", "<html><body style='font-family:sans-serif;background:#0f172a;color:#fff;padding:24px'><h2>Saved!</h2><p>ESP32 is connecting to <b>" + newSsid + "</b> now...</p></body></html>");
    delay(600);
    credentialsSaved = true;
  });

  server.begin();
  unsigned long portalStart = millis();
  unsigned long lastBlink = 0;
  bool ledOn = false;

  while (!credentialsSaved && (millis() - portalStart < 90000)) {
    server.handleClient();
    if (millis() - lastBlink > 450) {
      lastBlink = millis();
      ledOn = !ledOn;
      digitalWrite(LED_STATUS_PIN, ledOn ? HIGH : LOW);
    }
    delay(2);
  }

  server.stop();
  WiFi.softAPdisconnect(true);
  digitalWrite(LED_STATUS_PIN, LOW);
}

bool attemptStaConnect() {
  Serial.print("Connecting to 2.4GHz Wi-Fi / Hotspot: ");
  Serial.println(activeSsid);

  WiFi.persistent(false);
  WiFi.disconnect(true, true);
  delay(200);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false); // Prevents mobile hotspots from sleeping/dropping the ESP32
  WiFi.setAutoReconnect(true);
  WiFi.begin(activeSsid.c_str(), activePass.c_str());

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    digitalWrite(LED_STATUS_PIN, HIGH);
    delay(250);
    digitalWrite(LED_STATUS_PIN, LOW);
    delay(250);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ Wi-Fi Connected!");
    Serial.print("✓ IP Address: ");
    Serial.println(WiFi.localIP());
    blinkWifiConnectedSuccess();
    return true;
  }

  Serial.println("\n✗ Could not connect with current hotspot credentials.");
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

  WiFiClientSecure secureClient;
  secureClient.setInsecure();
  HTTPClient http;
  String url = firestoreCommitUrl();

  http.begin(secureClient, url);
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
    JsonArray ft = w2["transform"]["fieldTransforms"].to<JsonArray>();
    JsonObject t1 = ft.add<JsonObject>();
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
    JsonArray ft = tr.createNestedArray("fieldTransforms");
    JsonObject t1 = ft.createNestedObject();
    t1["fieldPath"] = "lastHeartbeat";
    t1["setToServerValue"] = "REQUEST_TIME";
  #endif

  String requestBody;
  serializeJson(doc, requestBody);
  int httpCode = http.POST(requestBody);
  if (httpCode == 200) {
    Serial.println("✓ Heartbeat synced to MediMitra Cloud.");
  } else {
    Serial.printf("Heartbeat HTTP %d\n", httpCode);
  }
  http.end();
}

bool updateCommandStatusInFirestore(const String& commandId, const String& status, const String& resultMsg) {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClientSecure secureClient;
  secureClient.setInsecure();
  HTTPClient http;
  String url = firestorePatchUrl(
    "dispensing_commands",
    commandId,
    "updateMask.fieldPaths=status&updateMask.fieldPaths=executionResult"
  );

  http.begin(secureClient, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(6000);

  #if ARDUINOJSON_VERSION_MAJOR >= 7
    JsonDocument doc;
  #else
    StaticJsonDocument<512> doc;
  #endif
  doc["fields"]["status"]["stringValue"] = status;
  doc["fields"]["executionResult"]["stringValue"] = resultMsg;

  String body;
  serializeJson(doc, body);
  int httpCode = http.PATCH(body);
  http.end();
  return httpCode == 200;
}

void pollForDispenseCommand() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure secureClient;
  secureClient.setInsecure();
  HTTPClient http;
  String url = firestoreRunQueryUrl();

  http.begin(secureClient, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(6000);

  String queryBody = "{\"structuredQuery\":{\"from\":[{\"collectionId\":\"dispensing_commands\"}],\"where\":{\"fieldFilter\":{\"field\":{\"fieldPath\":\"status\"},\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"PENDING\"}}},\"limit\":10}}";
  int httpCode = http.POST(queryBody);

  if (httpCode == 200) {
    String payload = http.getString();

    #if ARDUINOJSON_VERSION_MAJOR >= 7
      JsonDocument doc;
    #else
      DynamicJsonDocument doc(8192);
    #endif
    DeserializationError error = deserializeJson(doc, payload);
    if (error) {
      Serial.print("JSON Parse error: ");
      Serial.println(error.c_str());
      http.end();
      return;
    }

    JsonArray rows = doc.as<JsonArray>();
    String targetCommandId = "";
    String targetMedicine = "";
    int targetQty = 1;
    int targetCycles = 1;
    int targetAngle = dispenseAngle;
    int targetHold = holdDurationMs;
    String newestCreated = "";

    for (JsonObject row : rows) {
      if (row["document"].isNull()) continue;
      JsonObject fields = row["document"]["fields"];
      String rowDevice = fields["deviceId"]["stringValue"].as<String>();
      if (rowDevice != DEVICE_ID) continue;

      String created = fields["createdAt"]["stringValue"].as<String>();
      if (targetCommandId == "" || created > newestCreated) {
        newestCreated = created;
        targetCommandId = fields["commandId"]["stringValue"].as<String>();
        targetMedicine = fields["medicineName"]["stringValue"].as<String>();

        String qStr = fields["requestedQuantity"]["integerValue"].as<String>();
        targetQty = qStr.length() > 0 ? qStr.toInt() : 1;

        String cStr = fields["cycles"]["integerValue"].as<String>();
        targetCycles = cStr.length() > 0 ? cStr.toInt() : targetQty;

        if (!fields["servoConfig"]["mapValue"]["fields"].isNull()) {
          JsonObject sFields = fields["servoConfig"]["mapValue"]["fields"];
          String aStr = sFields["dispenseAngle"]["integerValue"].as<String>();
          String hStr = sFields["holdTimeMs"]["integerValue"].as<String>();
          if (aStr.length() > 0) targetAngle = aStr.toInt();
          if (hStr.length() > 0) targetHold = hStr.toInt();
        }
      }
    }

    http.end();

    if (targetCommandId.length() > 0) {
      Serial.println("\n--------------------------------------------------------");
      Serial.println("DISPENSE ACTIVATED FROM MEDIMITRA WEB APP!");
      Serial.print("  • Command ID: "); Serial.println(targetCommandId);
      Serial.print("  • Product:    "); Serial.println(targetMedicine);
      Serial.print("  • Cycles:     "); Serial.println(targetCycles);
      Serial.print("  • Angle:      "); Serial.print(targetAngle); Serial.println(" deg");
      Serial.println("--------------------------------------------------------");

      updateCommandStatusInFirestore(
        targetCommandId,
        "PROCESSING",
        "Claimed by ESP32. Turning servo 0° -> " + String(targetAngle) + "°..."
      );

      bool ok = executePhysicalDispense(targetCycles, targetAngle, targetHold);

      if (ok) {
        String msg = "SUCCESS: Servo rotated 0° -> " + String(targetAngle) + "° -> 0° (" + String(targetCycles) + " cycle). Blue LED blinked once.";
        if (updateCommandStatusInFirestore(targetCommandId, "COMPLETED", msg)) {
          Serial.println("✓ Web App updated: Product Dispensed!\n");
        }
      } else {
        updateCommandStatusInFirestore(targetCommandId, "FAILED", "Hardware servo execution failed.");
      }
    }
    return;
  } else if (httpCode > 0) {
    Serial.printf("Poll HTTP %d\n", httpCode);
  }
  http.end();
}

void setup() {
  pinMode(SERVO_PIN, OUTPUT);
  digitalWrite(SERVO_PIN, LOW);

  pinMode(LED_STATUS_PIN, OUTPUT);
  digitalWrite(LED_STATUS_PIN, LOW);

  Serial.begin(115200);
  delay(800);
  Serial.println("\n========================================================");
  Serial.println("   MediMitra ESP32 Dispenser (Hotspot + Direct Sync)    ");
  Serial.println("========================================================");
  Serial.println("✓ GPIO 18 held LOW (0V) — Servo stays still on boot.");

  connectWiFi();
  sendHeartbeat();
  Serial.println("✓ Ready! Click 'DISPENSE' in the MediMitra web app to trigger.\n");
}

void loop() {
  checkWiFiConnection();
  unsigned long currentMillis = millis();

  if (WiFi.status() == WL_CONNECTED && currentMillis - lastWifiBlipTime >= WIFI_BLIP_INTERVAL_MS) {
    lastWifiBlipTime = currentMillis;
    digitalWrite(LED_STATUS_PIN, HIGH);
    delay(60);
    digitalWrite(LED_STATUS_PIN, LOW);
  }

  if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatTime = currentMillis;
    sendHeartbeat();
  }

  if (currentMillis - lastPollTime >= POLL_INTERVAL_MS) {
    lastPollTime = currentMillis;
    pollForDispenseCommand();
  }
}
