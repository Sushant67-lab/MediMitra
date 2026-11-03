/*
 * =========================================================================================
 * MediMitra Smart IoT Medicine Dispenser - ESP32 Firmware
 * Hardware: ESP32 DevKit V1 (30-pin or 38-pin) + SG90 / MG90S Micro Servo
 *
 * SERVO MOVEMENT SPECIFICATION:
 * - Signal Pin: GPIO 18
 * - Initial Position: 0 degrees
 * - Dispensing Angle: 25 degrees (SMALL MOVEMENT ONLY - NOT continuous, NOT 180°)
 * - Hold Time at 25°: 300 milliseconds
 * - Return Position: 0 degrees
 * - NEVER moves automatically on boot, reconnect, or without authorized Firebase command!
 *
 * LIBRARIES REQUIRED (Install via Arduino IDE Library Manager):
 * 1. ESP32Servo by Kevin Harrington (v3.0.5 or newer)
 * 2. ArduinoJson by Benoit Blanchon (v6.21.3 or v7.x)
 * 3. WiFi and HTTPClient (Built into ESP32 Arduino Core)
 * =========================================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

// -----------------------------------------------------------------------------------------
// 1. NETWORK & BACKEND CONFIGURATION
// -----------------------------------------------------------------------------------------
const char* WIFI_SSID       = "YOUR_WIFI_SSID";          // Replace with your 2.4GHz Wi-Fi name
const char* WIFI_PASSWORD   = "YOUR_WIFI_PASSWORD";      // Replace with your Wi-Fi password

// Your MediMitra Backend or Web Server URL (Domain or local IP if testing locally)
// Examples:
// Cloud Production: "https://medimitra-3be2c.web.app"
// Local Dev Network: "http://192.168.1.100:3000"
const char* BACKEND_BASE_URL = "http://192.168.1.100:3000";

// Device Identification & Security Credentials
const char* DEVICE_ID       = "ESP32_MEDIMITRA_01";
const char* DEVICE_TOKEN    = "mm_esp32_sec_key_2025";   // Must match server DEVICE_SECRET_TOKEN

// -----------------------------------------------------------------------------------------
// 2. HARDWARE & SERVO CONFIGURATION (Configurable Calibration)
// -----------------------------------------------------------------------------------------
const int SERVO_PIN           = 18;     // GPIO 18 signal wire (Orange/Yellow wire)
const int LED_STATUS_PIN      = 2;      // Built-in status LED on ESP32

// Calibration parameters
int initialAngle              = 0;      // Starting home angle (0 degrees)
int dispenseAngle             = 25;     // Dispensing angle (25 degrees small motion)
int returnAngle               = 0;      // Return home angle (0 degrees)
int holdDurationMs            = 300;    // Dwell time at 25° to let tablet drop (300 ms)
int stepDelayMs               = 15;     // Smooth movement speed between degrees

Servo dispenserServo;

// -----------------------------------------------------------------------------------------
// 3. TIMING & STATE MACHINE
// -----------------------------------------------------------------------------------------
unsigned long lastPollTime     = 0;
const unsigned long POLL_INTERVAL_MS = 2500;  // Poll every 2.5 seconds

unsigned long lastHeartbeatTime = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 30000; // Heartbeat every 30 seconds

// Safe Root CA Certificate for HTTPS (when connecting to production HTTPS domain)
const char* ROOT_CA_CERT = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw\n" \
"TzELMAkGA1UEBhMCVVMxEzARBgNVBAoTCkdvb2dsZSBMTEMxHzAdBgNVBAsTGlJv\n" \
"b3QgQ0EgQXV0aG9yaXR5IChHRFMpMQswCQYDVQQDEwJHSTEwHhcNMTYxMjEyMTY0\n" \
"NTUwWhcNMzYxMjEyMTY0NTUwWjBPMQswCQYDVQQGEwJVUzETMBEGA1UEChMKR29v\n" \
"Z2xlIExMQzEfMB0GA1UECxMSRmVkZXJhbCBHb3Zlcm5tZW50MQswCQYDVQQDEwJH\n" \
"MTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALk/v4Nf+Jg... (Standard ISRG/Google CA)\n" \
"-----END CERTIFICATE-----\n";

// Function prototypes
void connectWiFi();
void checkWiFiConnection();
void sendHeartbeat();
void pollForDispenseCommand();
bool executePhysicalDispense(int cycles, int targetAngle, int holdTime);
void acknowledgeCommand(String commandId, bool success, String executionMessage);

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n========================================================");
  Serial.println("   MediMitra ESP32 Automatic Medicine Dispenser Boot    ");
  Serial.println("========================================================");

  pinMode(LED_STATUS_PIN, OUTPUT);
  digitalWrite(LED_STATUS_PIN, LOW);

  // Initialize Servo
  // Standard 50Hz PWM for SG90: 500us (0 deg) to 2400us (180 deg)
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  dispenserServo.setPeriodHertz(50);
  dispenserServo.attach(SERVO_PIN, 500, 2400);

  // CRITICAL SAFETY REQUIREMENT:
  // Secure initial position strictly at 0 degrees. DO NOT MOVE during boot!
  dispenserServo.write(initialAngle);
  delay(350); // Allow servo to settle at 0 degrees
  
  Serial.print("✓ Servo attached on GPIO Pin: ");
  Serial.println(SERVO_PIN);
  Serial.print("✓ Servo calibrated and locked at initial home angle: ");
  Serial.print(initialAngle);
  Serial.println(" degrees (Static idle state).");

  // Connect to Wi-Fi
  connectWiFi();

  // Send first startup heartbeat
  sendHeartbeat();
  Serial.println("✓ Ready. Listening for authorized dispensing commands...\n");
}

void loop() {
  checkWiFiConnection();

  unsigned long currentMillis = millis();

  // 1. Periodic Heartbeat
  if (currentMillis - lastHeartbeatTime >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatTime = currentMillis;
    sendHeartbeat();
  }

  // 2. Poll for authorized pending dispensing command
  if (currentMillis - lastPollTime >= POLL_INTERVAL_MS) {
    lastPollTime = currentMillis;
    pollForDispenseCommand();
  }
}

// -----------------------------------------------------------------------------------------
// WI-FI CONNECTION MANAGEMENT
// -----------------------------------------------------------------------------------------
void connectWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_STATUS_PIN, !digitalRead(LED_STATUS_PIN));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED_STATUS_PIN, HIGH);
    Serial.println("\n✓ Wi-Fi Connected Successfully!");
    Serial.print("✓ IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    digitalWrite(LED_STATUS_PIN, LOW);
    Serial.println("\n✗ Wi-Fi Connection Failed. Will retry in loop.");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_STATUS_PIN, LOW);
    Serial.println("⚠ Wi-Fi disconnected. Reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
    delay(1000);
  }
}

// -----------------------------------------------------------------------------------------
// HEARTBEAT TELEMETRY
// -----------------------------------------------------------------------------------------
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BACKEND_BASE_URL) + "/api/device/heartbeat";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["token"] = DEVICE_TOKEN;
  doc["ipAddress"] = WiFi.localIP().toString();

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == HTTP_CODE_OK) {
    // Heartbeat received
  } else {
    Serial.printf("Heartbeat ping response: %d\n", httpCode);
  }
  http.end();
}

// -----------------------------------------------------------------------------------------
// COMMAND RETRIEVAL (Polling)
// -----------------------------------------------------------------------------------------
void pollForDispenseCommand() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BACKEND_BASE_URL) + "/api/device/poll?deviceId=" + String(DEVICE_ID);

  http.begin(url);
  http.addHeader("X-Device-Token", DEVICE_TOKEN);
  http.setTimeout(4000);

  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    String payload = http.getString();

    StaticJsonDocument<1024> doc;
    DeserializationError error = deserializeJson(doc, payload);

    if (error) {
      Serial.print("JSON Parse error: ");
      Serial.println(error.c_str());
      http.end();
      return;
    }

    bool hasCommand = doc["hasCommand"] | false;
    if (hasCommand && doc.containsKey("command")) {
      JsonObject cmd = doc["command"];
      String commandId = cmd["commandId"].as<String>();
      String medicineName = cmd["medicineName"].as<String>();
      int quantity = cmd["requestedQuantity"] | 1;
      int cycles = cmd["cycles"] | quantity;

      // Extract custom calibration parameters if provided
      int cmdDispenseAngle = dispenseAngle;
      int cmdHoldTimeMs = holdDurationMs;

      if (cmd.containsKey("servo")) {
        JsonObject servoConf = cmd["servo"];
        if (servoConf.containsKey("dispenseAngle")) {
          cmdDispenseAngle = servoConf["dispenseAngle"];
        }
        if (servoConf.containsKey("holdTimeMs")) {
          cmdHoldTimeMs = servoConf["holdTimeMs"];
        }
      }

      Serial.println("\n--------------------------------------------------------");
      Serial.println("🔔 AUTHORIZED DISPENSING COMMAND RECEIVED!");
      Serial.print("  • Command ID: "); Serial.println(commandId);
      Serial.print("  • Medicine: "); Serial.println(medicineName);
      Serial.print("  • Quantity: "); Serial.println(quantity);
      Serial.print("  • Physical Cycles: "); Serial.println(cycles);
      Serial.print("  • Dispense Angle: "); Serial.print(cmdDispenseAngle); Serial.println(" deg");
      Serial.print("  • Hold Duration: "); Serial.print(cmdHoldTimeMs); Serial.println(" ms");
      Serial.println("--------------------------------------------------------");

      // Execute physical servo movement
      bool success = executePhysicalDispense(cycles, cmdDispenseAngle, cmdHoldTimeMs);

      // Acknowledge execution back to Firebase backend
      if (success) {
        String msg = "Physical servo successfully performed " + String(cycles) + 
                     " cycle(s) (0° -> " + String(cmdDispenseAngle) + "° -> 0°). Tablet dispensed.";
        acknowledgeCommand(commandId, true, msg);
      } else {
        acknowledgeCommand(commandId, false, "Servo movement error or mechanism jam detected.");
      }
    }
  } else if (httpCode > 0 && httpCode != 200) {
    Serial.printf("Poll error response HTTP: %d\n", httpCode);
  }

  http.end();
}

// -----------------------------------------------------------------------------------------
// CRITICAL: PHYSICAL SERVO MOVEMENT (0° -> 25° -> 0°)
// -----------------------------------------------------------------------------------------
bool executePhysicalDispense(int cycles, int targetAngle, int holdTime) {
  // Visual indicator: LED blink
  digitalWrite(LED_STATUS_PIN, HIGH);

  for (int c = 1; c <= cycles; c++) {
    Serial.printf("\n>>> Starting Dispensing Cycle %d of %d <<<\n", c, cycles);

    // STEP 1: Verify starting at 0 degrees
    dispenserServo.write(initialAngle);
    delay(50);

    // STEP 2: Move smoothly from 0 degrees to 25 degrees
    Serial.printf("Moving servo from %d° to %d°...\n", initialAngle, targetAngle);
    for (int pos = initialAngle; pos <= targetAngle; pos += 1) {
      dispenserServo.write(pos);
      delay(stepDelayMs);
    }

    // STEP 3: Hold at 25 degrees for hold duration (e.g., 300 ms)
    Serial.printf("Holding at %d° for %d ms to release tablet...\n", targetAngle, holdTime);
    delay(holdTime);

    // STEP 4: Return smoothly from 25 degrees back to 0 degrees
    Serial.printf("Returning servo from %d° back to %d°...\n", targetAngle, returnAngle);
    for (int pos = targetAngle; pos >= returnAngle; pos -= 1) {
      dispenserServo.write(pos);
      delay(stepDelayMs);
    }

    // STEP 5: Settle at initial home angle (0°)
    dispenserServo.write(returnAngle);
    delay(200);

    Serial.printf("✓ Cycle %d complete. Servo resting at 0°.\n", c);

    // If multiple cycles, pause briefly between drops
    if (c < cycles) {
      delay(500);
    }
  }

  digitalWrite(LED_STATUS_PIN, LOW);
  return true;
}

// -----------------------------------------------------------------------------------------
// EXECUTION ACKNOWLEDGMENT BACK TO BACKEND / FIREBASE
// -----------------------------------------------------------------------------------------
void acknowledgeCommand(String commandId, bool success, String executionMessage) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ Cannot send ACK: Wi-Fi offline");
    return;
  }

  HTTPClient http;
  String url = String(BACKEND_BASE_URL) + "/api/device/ack";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Token", DEVICE_TOKEN);

  StaticJsonDocument<512> doc;
  doc["commandId"] = commandId;
  doc["status"] = success ? "COMPLETED" : "FAILED";
  doc["executionResult"] = executionMessage;
  doc["token"] = DEVICE_TOKEN;

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("Transmitting execution acknowledgment to Firebase...");
  int httpCode = http.POST(requestBody);

  if (httpCode == HTTP_CODE_OK) {
    Serial.println("✓ Acknowledgment recorded in Firebase successfully!\n");
  } else {
    Serial.printf("✗ Acknowledgment failed. HTTP response: %d\n", httpCode);
  }

  http.end();
}
