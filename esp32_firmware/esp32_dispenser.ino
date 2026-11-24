/*
 * =========================================================================================
 * MediMitra Smart IoT Medicine Dispenser - ESP32 Dev Module Firmware (Stable Hotspot + TLS)
 * Hardware: ESP32 DevKit V1 / ESP32 Dev Module + External 5V 2A Supply + SG90 / MG90S Servo
 *
 * WIRING (4 WIRES, NO BREADBOARD):
 *   - Yellow or Orange Wire (Signal) -> ESP32 GPIO 18 (D18, 7th pin from top-right)
 *   - Red Wire A (+5V Servo)         -> External 5V 2A Supply (+)
 *   - Red Wire B (+5V ESP32)         -> External 5V 2A Supply (+) -> ESP32 VIN (unplug when USB plugged!)
 *   - Brown / Black Wire (GND)       -> Common GND (5V Supply - + ESP32 GND + Servo Brown)
 *
 * LED STATUS GUIDE:
 *   - Red Power LED OFF               -> ESP32 has no 5V power (check VIN / USB / GND)
 *   - Blue LED Blinking Fast (0.25s)  -> Connecting to Wi-Fi / Mobile Hotspot or MediMitra Cloud...
 *   - Blue LED Blinking Med (0.45s)   -> Setup Portal ON: Join Wi-Fi "MediMitra-ESP32" -> 192.168.4.1
 *   - Blue LED SOLID OFF              -> Connected to Wi-Fi AND Linked with MediMitra App (Online!)
 *   - 1 Slow 1.2s Blue Blink          -> Medicine Dispensed! (0° -> 45° -> 0°), then OFF
 *
 * REQUIRED LIBRARY (Arduino IDE Library Manager):
 *   - ArduinoJson by Benoit Blanchon (v6 or v7)
 * =========================================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <DNSServer.h>
#include <Preferences.h>
#include <ArduinoJson.h>

// -----------------------------------------------------------------------------------------
// 1. CODE INPUTS FOR YOUR WI-FI OR 2.4 GHz MOBILE HOTSPOT (EDIT THESE TWO LINES!)
// -----------------------------------------------------------------------------------------
const char* WIFI_SSID        = "YOUR_HOTSPOT_NAME";       // Exact 2.4 GHz Mobile Hotspot or Wi-Fi name
const char* WIFI_PASSWORD    = "YOUR_HOTSPOT_PASSWORD";   // Wi-Fi / Hotspot password (min 8 chars)

// -----------------------------------------------------------------------------------------
// 2. DIRECT FIREBASE CLOUD CONFIG (PRE-LINKED WITH YOUR MEDIMITRA WEB APP)
// -----------------------------------------------------------------------------------------
const char* FIREBASE_PROJECT_ID = "medimitra-3be2c";
const char* FIRESTORE_DB_ID     = "ai-studio-curahealthaimedi-3da36085-2b1d-4e47-a414-215a5a6f8743";
const char* FIREBASE_API_KEY    = "AIzaSyArDAf5opYldc_-yFDwvheTKoJNRE5WTf4";
const char* DEVICE_ID           = "ESP32_MEDIMITRA_01";

// -----------------------------------------------------------------------------------------
// 3. SERVO HARDWARE & CALIBRATION SETTINGS
// -----------------------------------------------------------------------------------------
const int SERVO_PIN          = 18;      // GPIO 18 (D18) -> Servo Yellow or Orange Wire
const int LED_STATUS_PIN     = 2;       // Built-in blue LED on ESP32 Dev Module
const int PWM_FREQ_HZ        = 50;      // Standard SG90 50Hz PWM
const int PWM_RESOLUTION     = 14;      // 14-bit resolution (0..16383)
const int LEDC_CHANNEL       = 0;       // Used on ESP32 Arduino Core 2.x

int initialAngle             = 0;       // Home / normal original angle (0 deg)
int dispenseAngle            = 45;      // Dispense rotation angle (45 deg)
int returnAngle              = 0;       // Return back to normal original angle (0 deg)
int holdDurationMs           = 300;     // Hold time at 45° (300 ms)
int stepDelayMs              = 15;      // Smooth movement delay per degree

// Active Wi-Fi state & NVS saved credentials
Preferences prefs;
String activeSsid = "";
String activePass = "";
bool cloudAppLinked = false;

// -----------------------------------------------------------------------------------------
// 4. TIMING INTERVALS
// -----------------------------------------------------------------------------------------
unsigned long lastPollTime             = 0;
const unsigned long POLL_INTERVAL_MS        = 2500;   // Check Dispense clicks every 2.5s
unsigned long lastHeartbeatTime        = 0;
const unsigned long HEARTBEAT_INTERVAL_MS   = 10000;  // Refresh "Online" status in app every 10s
unsigned long lastReconnectTryTime     = 0;
const unsigned long RECONNECT_INTERVAL_MS   = 6000;   // Auto-retry Wi-Fi every 6s if dropped
unsigned long lastReconnectBlinkTime   = 0;
bool reconnectLedState                 = false;

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
  digitalWrite(SERVO_PIN, LOW); // Hold 0V so motor stays completely still on boot/idle
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

void setBlueLedOff() {
  digitalWrite(LED_STATUS_PIN, LOW);
}

void slowBlinkBlueLedOnce() {
  digitalWrite(LED_STATUS_PIN, HIGH);
  delay(1200);
  digitalWrite(LED_STATUS_PIN, LOW);
}

bool executePhysicalDispense(int cycles, int targetAngle, int holdTime) {
  setBlueLedOff();
  attachServoAtAngle(initialAngle);
  delay(200); // Ensure servo starts squarely at normal 0° home position

  for (int c = 1; c <= cycles; c++) {
    Serial.printf(">>> Cycle %d/%d: Turning 0° -> %d°...\n", c, cycles, targetAngle);
    for (int pos = initialAngle; pos <= targetAngle; pos++) {
      writeServoAngle(pos);
      delay(stepDelayMs);
    }
    delay(holdTime);

    Serial.printf("<<< Returning %d° -> %d° (back to normal place)...\n", targetAngle, returnAngle);
    for (int pos = targetAngle; pos >= returnAngle; pos--) {
      writeServoAngle(pos);
      delay(stepDelayMs);
    }
    writeServoAngle(returnAngle);
    delay(350); // Allow physical horn to settle completely back at 0° original place before PWM idle
    if (c < cycles) delay(400);
  }

  idleServoPinLow();
  slowBlinkBlueLedOnce(); // 1 slow blue blink confirms dispense, then turns OFF
  Serial.println("✓ Dispense done! Returned to normal 0° position, blue LED slowly blinked once, now OFF.\n");
  return true;
}

void loadCredentials() {
  prefs.begin("medimitra", false);
  String savedSsid   = prefs.getString("ssid", "");
  String savedPass   = prefs.getString("pass", "");
  String lastCodeSig = prefs.getString("codeSig", "");

  String compiledSsid = String(WIFI_SSID);
  String compiledPass = String(WIFI_PASSWORD);
  String currentSig   = compiledSsid + "|" + compiledPass;

  bool codeWasCustomized = compiledSsid.length() > 0 &&
                           compiledSsid != "YOUR_HOTSPOT_NAME" &&
                           compiledSsid != "YOUR_WIFI_SSID";

  // Refresh NVS whenever either SSID or Password was edited in Arduino IDE
  if (codeWasCustomized && currentSig != lastCodeSig) {
    activeSsid = compiledSsid;
    activePass = compiledPass;
    prefs.putString("ssid", activeSsid);
    prefs.putString("pass", activePass);
    prefs.putString("codeSig", currentSig);
    Serial.println("✓ Loaded updated Wi-Fi credentials from Arduino code.");
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
  Serial.println("CAPTIVE WIFI SETUP PORTAL ACTIVE (3 MINUTES):");
  Serial.println("  1. On phone Wi-Fi settings, connect to: MediMitra-ESP32");
  Serial.println("  2. Setup page pops up automatically (or open http://192.168.4.1)");
  Serial.println("--------------------------------------------------------");

  WiFi.mode(WIFI_AP_STA);
  WiFi.softAP("MediMitra-ESP32");
  delay(250);

  DNSServer dnsServer;
  dnsServer.start(53, "*", WiFi.softAPIP());

  int found = WiFi.scanNetworks();
  String optionsHtml = "";
  bool targetSeen = false;
  Serial.printf("Detected %d nearby 2.4GHz networks:\n", found);
  for (int i = 0; i < found; i++) {
    String s = WiFi.SSID(i);
    Serial.printf("  - %s (%d dBm)\n", s.c_str(), WiFi.RSSI(i));
    if (s == activeSsid) targetSeen = true;
    if (s.length() > 0) {
      optionsHtml += "<option value='" + s + "'>" + s + " (" + String(WiFi.RSSI(i)) + " dBm)</option>";
    }
  }
  if (!targetSeen && activeSsid.length() > 0 && activeSsid != "YOUR_HOTSPOT_NAME") {
    Serial.println("! NOTE: '" + activeSsid + "' not visible on 2.4GHz scan. Switch Hotspot AP Band to 2.4 GHz.");
  }

  WebServer server(80);
  bool credentialsSaved = false;

  auto sendPortalPage = [&]() {
    String html = "<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'><title>MediMitra Wi-Fi Setup</title>";
    html += "<style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:20px;max-width:420px;margin:auto}input,select,button{width:100%;padding:12px;margin:8px 0;border-radius:8px;border:1px solid #334155;box-sizing:border-box;font-size:15px;background:#1e293b;color:#fff}button{background:#0d9488;font-weight:bold;border:none;cursor:pointer}.tip{background:#1e293b;padding:12px;border-radius:8px;font-size:13px;color:#cbd5e1;margin-bottom:14px;border:1px solid #334155}</style></head><body>";
    html += "<h2>MediMitra ESP32 Wi-Fi Setup</h2>";
    html += "<div class='tip'><b>Checklist:</b> Android Hotspot -> <b>2.4 GHz Band</b> | iPhone -> <b>Maximize Compatibility ON</b> | Keep Mobile Data ON.</div>";
    html += "<form method='POST' action='/save'>";
    if (optionsHtml.length() > 0) {
      html += "<label>Detected 2.4GHz Networks:</label><select onchange=\"if(this.value)document.getElementById('s').value=this.value\"><option value=''>-- Select Wi-Fi / Hotspot --</option>" + optionsHtml + "</select>";
    }
    html += "<label>Wi-Fi / Hotspot Name (SSID):</label><input id='s' name='ssid' value='" + (activeSsid == "YOUR_HOTSPOT_NAME" ? "" : activeSsid) + "' placeholder='Exact 2.4 GHz Wi-Fi name' required>";
    html += "<label>Password:</label><input name='pass' type='password' placeholder='Enter Wi-Fi password'>";
    html += "<button type='submit'>Save & Connect to MediMitra</button></form></body></html>";
    server.send(200, "text/html", html);
  };

  server.on("/", HTTP_GET, sendPortalPage);
  server.onNotFound(sendPortalPage); // Captive portal redirect for Android/iPhone

  server.on("/save", HTTP_POST, [&]() {
    String newSsid = server.arg("ssid");
    String newPass = server.arg("pass");
    prefs.begin("medimitra", false);
    prefs.putString("ssid", newSsid);
    prefs.putString("pass", newPass);
    prefs.end();
    activeSsid = newSsid;
    activePass = newPass;
    server.send(200, "text/html", "<html><body style='font-family:sans-serif;background:#0f172a;color:#fff;padding:24px'><h2>Saved!</h2><p>ESP32 is connecting to <b>" + newSsid + "</b>. Once linked with MediMitra, the blue LED stops blinking and the app shows Online.</p></body></html>");
    delay(600);
    credentialsSaved = true;
  });

  server.begin();
  unsigned long portalStart = millis();
  unsigned long lastBlink = 0;
  bool ledOn = false;

  while (!credentialsSaved && (millis() - portalStart < 180000)) {
    dnsServer.processNextRequest();
    server.handleClient();
    if (millis() - lastBlink > 450) {
      lastBlink = millis();
      ledOn = !ledOn;
      digitalWrite(LED_STATUS_PIN, ledOn ? HIGH : LOW);
    }
    delay(2);
  }

  dnsServer.stop();
  server.stop();
  WiFi.softAPdisconnect(true);
  setBlueLedOff();
}

bool sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClientSecure secureClient;
  secureClient.setInsecure();
  secureClient.setTimeout(15); // 15s TLS timeout for cellular mobile hotspots
  HTTPClient http;
  http.setConnectTimeout(12000);
  http.setTimeout(15000);
  http.setReuse(false);

  String url = firestoreCommitUrl();
  if (!http.begin(secureClient, url)) {
    Serial.println("✗ HTTP begin() failed for Firestore.");
    return false;
  }
  http.addHeader("Content-Type", "application/json");

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
  if (httpCode != 200) {
    String errResp = http.getString();
    Serial.printf("✗ Cloud sync error (HTTP %d): %s\n", httpCode, errResp.c_str());
  }
  http.end();

  if (httpCode == 200) {
    if (!cloudAppLinked) {
      Serial.println("✓ Synced with MediMitra Web App (Online)! Stopping blue LED blink.");
    }
    cloudAppLinked = true;
    setBlueLedOff(); // Ensure blue LED stops blinking once connected with Web App
    return true;
  }

  return false;
}

bool attemptStaConnect() {
  if (activeSsid.length() == 0 || activeSsid == "YOUR_HOTSPOT_NAME" || activeSsid == "YOUR_WIFI_SSID") {
    Serial.println("! No Wi-Fi SSID configured yet. Opening MediMitra-ESP32 Setup Portal...");
    return false;
  }

  Serial.print("Connecting ESP32 to Wi-Fi: ");
  Serial.println(activeSsid);

  WiFi.persistent(false);
  WiFi.disconnect(true, true);
  delay(150);
  WiFi.mode(WIFI_STA);
  delay(100);
  WiFi.setHostname("MediMitra-ESP32");
  WiFi.setSleep(false); // Keep Wi-Fi radio awake on mobile hotspots
  WiFi.setAutoReconnect(true);
  WiFi.begin(activeSsid.c_str(), activePass.c_str());

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 36) {
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
    Serial.print("✓ Signal (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");

    for (int retry = 0; retry < 3; retry++) {
      if (sendHeartbeat()) {
        setBlueLedOff();
        return true;
      }
      digitalWrite(LED_STATUS_PIN, HIGH);
      delay(200);
      digitalWrite(LED_STATUS_PIN, LOW);
      delay(600);
    }

    cloudAppLinked = false;
    return true;
  }

  Serial.printf("\n✗ Wi-Fi timed out (status=%d). Check 2.4 GHz band & password.\n", (int)WiFi.status());
  cloudAppLinked = false;
  return false;
}

void connectWiFi() {
  loadCredentials();
  while (!attemptStaConnect()) {
    startHotspotSetupPortal();
  }
}

void maintainWiFiAndAppLink(unsigned long now) {
  if (WiFi.status() != WL_CONNECTED || !cloudAppLinked) {
    if (now - lastReconnectBlinkTime >= 250) {
      lastReconnectBlinkTime = now;
      reconnectLedState = !reconnectLedState;
      digitalWrite(LED_STATUS_PIN, reconnectLedState ? HIGH : LOW);
    }

    if (WiFi.status() != WL_CONNECTED && now - lastReconnectTryTime >= RECONNECT_INTERVAL_MS) {
      lastReconnectTryTime = now;
      cloudAppLinked = false;
      Serial.println("Reconnecting to Wi-Fi: " + activeSsid + "...");
      WiFi.disconnect();
      WiFi.begin(activeSsid.c_str(), activePass.c_str());
    } else if (WiFi.status() == WL_CONNECTED && !cloudAppLinked && now - lastHeartbeatTime >= 4000) {
      lastHeartbeatTime = now;
      sendHeartbeat();
    }
    return;
  }

  setBlueLedOff();
}

bool updateCommandStatusInFirestore(const String& commandId, const String& status, const String& resultMsg) {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClientSecure secureClient;
  secureClient.setInsecure();
  secureClient.setTimeout(15);
  HTTPClient http;
  http.setConnectTimeout(12000);
  http.setTimeout(15000);
  http.setReuse(false);

  String url = firestorePatchUrl(
    "dispensing_commands",
    commandId,
    "updateMask.fieldPaths=status&updateMask.fieldPaths=executionResult"
  );

  http.begin(secureClient, url);
  http.addHeader("Content-Type", "application/json");

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
  secureClient.setTimeout(15);
  HTTPClient http;
  http.setConnectTimeout(12000);
  http.setTimeout(15000);
  http.setReuse(false);

  String url = firestoreRunQueryUrl();
  http.begin(secureClient, url);
  http.addHeader("Content-Type", "application/json");

  String queryBody = "{\"structuredQuery\":{\"from\":[{\"collectionId\":\"dispensing_commands\"}],\"where\":{\"fieldFilter\":{\"field\":{\"fieldPath\":\"status\"},\"op\":\"EQUAL\",\"value\":{\"stringValue\":\"PENDING\"}}},\"limit\":10}}";
  int httpCode = http.POST(queryBody);

  if (httpCode == 200) {
    String payload = http.getString();
    http.end();

    #if ARDUINOJSON_VERSION_MAJOR >= 7
      JsonDocument doc;
    #else
      DynamicJsonDocument doc(8192);
    #endif
    DeserializationError error = deserializeJson(doc, payload);
    if (error) {
      Serial.print("JSON Parse error: ");
      Serial.println(error.c_str());
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
  } else {
    Serial.printf("Poll error %d\n", httpCode);
  }
  http.end();
}

void setup() {
  pinMode(SERVO_PIN, OUTPUT);
  digitalWrite(SERVO_PIN, LOW);

  pinMode(LED_STATUS_PIN, OUTPUT);
  setBlueLedOff();

  Serial.begin(115200);
  delay(800);
  Serial.println("\n========================================================");
  Serial.println("   MediMitra ESP32 Dev Module (Stable Wi-Fi + TLS Sync) ");
  Serial.println("========================================================");
  Serial.println("✓ GPIO 18 locked at 0V — Servo stays still on power up.");

  connectWiFi();
  lastHeartbeatTime = millis();
  Serial.println("✓ Connected & Ready! Web App now shows Online (Blue LED OFF).\n");
}

void loop() {
  unsigned long currentMillis = millis();
  maintainWiFiAndAppLink(currentMillis);

  if (WiFi.status() == WL_CONNECTED) {
    if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
      lastHeartbeatTime = currentMillis;
      sendHeartbeat();
    }

    if (currentMillis - lastPollTime >= POLL_INTERVAL_MS) {
      lastPollTime = currentMillis;
      pollForDispenseCommand();
    }
  }
}
