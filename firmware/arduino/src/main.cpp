#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// EEPROM configuration
#define EEPROM_SIZE 512

struct DeviceConfig {
  char wifi_ssid[32];
  char wifi_pass[64];
  char activation_key[32];
  char device_id[24];
  bool configured;
};

// Backend server details
const char* SERVER_URL = "https://peluprice.com/api/v1/device/register";

// Global objects
ESP8266WebServer server(80);
DeviceConfig config;

void startSoftAP();
void handleConfigPage();
void handleFormSubmit();
void connectToWiFi();
void sendDeviceRegistration();
void readConfig();
void writeConfig();

void setup() {
  Serial.begin(115200);
  EEPROM.begin(EEPROM_SIZE);
  delay(10);
  Serial.println("Booting device...");

  readConfig();

  // Generate and store UUID on first boot
  if (strlen(config.device_id) == 0) {
      String mac = WiFi.macAddress();
      mac.replace(":", "");
      strcpy(config.device_id, mac.c_str());
      writeConfig();
      Serial.printf("Generated and stored new device ID: %s\n", config.device_id);
  }

  if (config.configured) {
    Serial.println("Found stored Wi-Fi credentials.");
    connectToWiFi();
  } else {
    Serial.println("No Wi-Fi credentials found. Starting SoftAP.");
    startSoftAP();
  }
}

void loop() {
  if (WiFi.getMode() == WIFI_AP) {
    server.handleClient();
  } else if (WiFi.status() == WL_CONNECTED) {
    // Add your main device logic here
  }
}

void readConfig() {
  EEPROM.get(0, config);
}

void writeConfig() {
  EEPROM.put(0, config);
  EEPROM.commit();
}

void startSoftAP() {
  String apSsid = "MyDevice-" + String(config.device_id).substring(6);
  Serial.printf("Starting SoftAP with SSID: %s\n", apSsid.c_str());

  WiFi.softAP(apSsid.c_str());
  IPAddress apIP = WiFi.softAPIP();
  Serial.printf("AP IP address: %s\n", apIP.toString().c_str());

  server.on("/", HTTP_GET, handleConfigPage);
  server.on("/submit", HTTP_POST, handleFormSubmit);
  server.begin();

  Serial.println("HTTP server started for configuration.");
}

void handleConfigPage() {
  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <title>Device Configuration</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        form { display: flex; flex-direction: column; max-width: 300px; }
        input { margin-bottom: 10px; padding: 8px; }
        button { padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h2>Configure your device</h2>
    <form action="/submit" method="POST">
        <label for="ssid">Wi-Fi SSID:</label>
        <input type="text" id="ssid" name="ssid" required>
        <label for="password">Wi-Fi Password:</label>
        <input type="password" id="password" name="password">
        <label for="activation_key">Activation Key:</label>
        <input type="text" id="activation_key" name="activation_key" required>
        <button type="submit">Save and Reboot</button>
    </form>
</body>
</html>
)rawliteral";
  server.send(200, "text/html", html);
}

void handleFormSubmit() {
  if (server.hasArg("ssid") && server.hasArg("activation_key")) {
    strcpy(config.wifi_ssid, server.arg("ssid").c_str());
    strcpy(config.wifi_pass, server.arg("password").c_str());
    strcpy(config.activation_key, server.arg("activation_key").c_str());
    config.configured = true;

    Serial.println("Received configuration data. Saving...");
    writeConfig();

    server.send(200, "text/plain", "Configuration saved. The device will now reboot.");
    delay(1000);
    ESP.restart();
  } else {
    server.send(400, "text/plain", "Invalid form submission.");
  }
}

void connectToWiFi() {
  WiFi.begin(config.wifi_ssid, config.wifi_pass);
  Serial.printf("Attempting to connect to SSID: %s\n", config.wifi_ssid);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    sendDeviceRegistration();
  } else {
    Serial.println("\nFailed to connect to Wi-Fi. Reverting to SoftAP mode.");
    config.configured = false;
    writeConfig();
    startSoftAP();
  }
}

void sendDeviceRegistration() {
  if (strlen(config.activation_key) == 0) {
    Serial.println("Activation key not found. Cannot register device.");
    return;
  }

  HTTPClient http;
  WiFiClient client;
  http.begin(client, SERVER_URL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["device_id"] = config.device_id;
  doc["activation_key"] = config.activation_key;

  String requestBody;
  serializeJson(doc, requestBody);

  Serial.println("Sending device registration request...");
  int httpResponseCode = http.POST(requestBody);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.printf("HTTP Response code: %d\n", httpResponseCode);
    Serial.printf("Response: %s\n", response.c_str());
  } else {
    Serial.printf("Error on sending POST: %s\n", http.errorToString(httpResponseCode).c_str());
    Serial.println("Retrying in 10 seconds...");
    delay(10000);
    sendDeviceRegistration(); // Recursive retry
  }

  http.end();
}