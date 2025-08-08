#include <WiFi.h>
#include <WebServer.h>
#include <Preferences.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include "esp_system.h"
#include "esp_log.h"

// NVS keys
const char* WIFI_SSID_KEY = "wifi_ssid";
const char* WIFI_PASS_KEY = "wifi_pass";
const char* ACTIVATION_KEY = "activation_key";
const char* DEVICE_ID_KEY = "device_id";
const char* DEVICE_ACTIVATED_KEY = "activated";

// PeluPrice server details
const char* SERVER_URL = "https://peluprice.com/api/v1/device/register";
const char* HEARTBEAT_URL = "https://peluprice.com/api/v1/devices/%s/heartbeat";
const char* MQTT_SERVER = "peluprice.com";
const int MQTT_PORT = 1883;

// Device states
enum DeviceState {
    STATE_BOOTING,
    STATE_CONFIG_MODE,
    STATE_ACTIVATING,  
    STATE_WORKING,
    STATE_ERROR
};

// Global objects
Preferences preferences;
WebServer server(80);
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
String deviceId;
String mqttTopic;
DeviceState currentState = STATE_BOOTING;
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Hardware pins
const int ALARM_PIN = 2;
const int LED_PIN = 5;
const int STATUS_LED_PIN = 25;

void startSoftAP();
void handleConfigPage();
void handleFormSubmit();
void connectToWiFi();
void sendDeviceRegistration();
void connectMQTT();
void mqttCallback(char* topic, byte* message, unsigned int length);
void sendHeartbeat();
void executeCommand(String command, String payload);
void updateStatusLED();

void setup() {
    Serial.begin(115200);
    Serial.println("PeluPrice Device Booting...");

    // Initialize hardware pins
    pinMode(ALARM_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);
    pinMode(STATUS_LED_PIN, OUTPUT);
    
    // Status LED: Red during boot
    digitalWrite(STATUS_LED_PIN, HIGH);
    
    preferences.begin("peluprice", false);

    // Generate and store UUID on first boot
    if (!preferences.isKey(DEVICE_ID_KEY)) {
        uint8_t mac[6];
        esp_read_mac(mac, ESP_MAC_WIFI_STA);
        char uuid[32];
        snprintf(uuid, sizeof(uuid), "PLP-%02X%02X%02X%02X%02X%02X", 
                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
        preferences.putString(DEVICE_ID_KEY, uuid);
        Serial.printf("Generated device ID: %s\n", uuid);
    }
    deviceId = preferences.getString(DEVICE_ID_KEY, "");
    mqttTopic = "peluprice/devices/" + deviceId;

    // Setup MQTT
    mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);

    if (preferences.isKey(WIFI_SSID_KEY)) {
        Serial.println("Found stored Wi-Fi credentials.");
        currentState = STATE_ACTIVATING;
        connectToWiFi();
    } else {
        Serial.println("No Wi-Fi credentials found. Starting configuration mode.");
        currentState = STATE_CONFIG_MODE;
        startSoftAP();
    }
}

void loop() {
    updateStatusLED();
    
    switch (currentState) {
        case STATE_CONFIG_MODE:
            server.handleClient();
            break;
            
        case STATE_WORKING:
            if (WiFi.status() == WL_CONNECTED) {
                if (!mqttClient.connected()) {
                    connectMQTT();
                }
                mqttClient.loop();
                
                // Send heartbeat periodically
                if (millis() - lastHeartbeat > HEARTBEAT_INTERVAL) {
                    sendHeartbeat();
                    lastHeartbeat = millis();
                }
            } else {
                Serial.println("WiFi disconnected. Attempting reconnect...");
                currentState = STATE_ACTIVATING;
                connectToWiFi();
            }
            break;
            
        case STATE_ERROR:
            // Blink red LED in error state
            digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
            delay(500);
            break;
            
        default:
            delay(100);
            break;
    }
    
    delay(100);
}

void updateStatusLED() {
    switch (currentState) {
        case STATE_BOOTING:
            digitalWrite(STATUS_LED_PIN, HIGH); // Red steady
            break;
        case STATE_CONFIG_MODE:
            // Slow blink - blue
            digitalWrite(STATUS_LED_PIN, (millis() / 1000) % 2);
            break;
        case STATE_ACTIVATING:
            // Fast blink - orange  
            digitalWrite(STATUS_LED_PIN, (millis() / 250) % 2);
            break;
        case STATE_WORKING:
            digitalWrite(STATUS_LED_PIN, LOW); // Green steady (inverted logic)
            break;
        case STATE_ERROR:
            // Very fast blink - red
            digitalWrite(STATUS_LED_PIN, (millis() / 100) % 2);
            break;
    }
}

void startSoftAP() {
    String apSsid = "PeluPrice-" + deviceId.substring(deviceId.length() - 6);
    Serial.printf("Starting SoftAP: %s\n", apSsid.c_str());

    WiFi.softAP(apSsid.c_str());
    IPAddress apIP = WiFi.softAPIP();
    Serial.printf("AP IP: %s\n", apIP.toString().c_str());

    server.on("/", HTTP_GET, handleConfigPage);
    server.on("/submit", HTTP_POST, handleFormSubmit);
    server.begin();

    Serial.println("Configuration server started.");
}

void handleConfigPage() {
    String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
    <title>PeluPrice Device Setup</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 400px;
            margin: 0 auto;
            padding: 30px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h2 { text-align: center; margin-bottom: 30px; }
        .device-info {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            text-align: center;
        }
        form { display: flex; flex-direction: column; }
        input { 
            margin-bottom: 15px; 
            padding: 12px; 
            border: none;
            border-radius: 5px;
            background: rgba(255,255,255,0.9);
            color: #333;
        }
        button { 
            padding: 12px; 
            background: #4CAF50; 
            color: white; 
            border: none; 
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #45a049; }
        .logo { text-align: center; margin-bottom: 20px; font-size: 24px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">PeluPrice</div>
        <h2>Device Configuration</h2>
        <div class="device-info">
            <strong>Device ID:</strong><br>
            )rawliteral" + deviceId + R"rawliteral(
        </div>
        <form action="/submit" method="POST">
            <input type="text" name="ssid" placeholder="Wi-Fi Network Name" required>
            <input type="password" name="password" placeholder="Wi-Fi Password">
            <input type="text" name="activation_key" placeholder="Activation Key from Card" required>
            <button type="submit">Connect & Activate</button>
        </form>
    </div>
</body>
</html>
)rawliteral";
    server.send(200, "text/html", html);
}

void handleFormSubmit() {
    if (server.hasArg("ssid") && server.hasArg("activation_key")) {
        String ssid = server.arg("ssid");
        String password = server.arg("password");
        String activationKey = server.arg("activation_key");

        Serial.println("Configuration received:");
        Serial.printf("SSID: %s\n", ssid.c_str());
        Serial.printf("Activation Key: %s\n", activationKey.c_str());

        preferences.putString(WIFI_SSID_KEY, ssid);
        preferences.putString(WIFI_PASS_KEY, password);
        preferences.putString(ACTIVATION_KEY, activationKey);

        server.send(200, "text/html", 
            "<html><body style='font-family:Arial;text-align:center;padding:50px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;'>"
            "<h2>Configuration Saved!</h2>"
            "<p>Device will now connect and activate...</p>"
            "<p>You can close this page.</p>"
            "</body></html>");
        
        delay(2000);
        ESP.restart();
    } else {
        server.send(400, "text/plain", "Invalid form data");
    }
}

void connectToWiFi() {
    String ssid = preferences.getString(WIFI_SSID_KEY, "");
    String password = preferences.getString(WIFI_PASS_KEY, "");

    Serial.printf("Connecting to: %s\n", ssid.c_str());
    WiFi.begin(ssid.c_str(), password.c_str());

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connected!");
        Serial.printf("IP: %s\n", WiFi.localIP().toString().c_str());
        
        currentState = STATE_WORKING;
        sendDeviceRegistration();
        connectMQTT();
    } else {
        Serial.println("\nWiFi connection failed. Clearing credentials...");
        preferences.remove(WIFI_SSID_KEY);
        preferences.remove(WIFI_PASS_KEY);
        preferences.remove(ACTIVATION_KEY);
        currentState = STATE_CONFIG_MODE;
        startSoftAP();
    }
}

void sendDeviceRegistration() {
    String activationKey = preferences.getString(ACTIVATION_KEY, "");
    if (activationKey.length() == 0) {
        Serial.println("No activation key found");
        return;
    }

    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<300> doc;
    doc["device_id"] = deviceId;
    doc["activation_key"] = activationKey;
    doc["firmware_version"] = "1.0.0";
    doc["hardware_version"] = "ESP32-v1";

    String requestBody;
    serializeJson(doc, requestBody);

    Serial.println("Registering device...");
    int httpResponseCode = http.POST(requestBody);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("Registration response (%d): %s\n", httpResponseCode, response.c_str());
        
        if (httpResponseCode == 200) {
            Serial.println("Device registered successfully!");
        }
    } else {
        Serial.printf("Registration failed: %s\n", http.errorToString(httpResponseCode).c_str());
        currentState = STATE_ERROR;
    }

    http.end();
}

void connectMQTT() {
    if (mqttClient.connected()) return;

    Serial.print("Connecting to MQTT...");
    String clientId = "PeluPrice-" + deviceId;
    
    if (mqttClient.connect(clientId.c_str())) {
        Serial.println(" connected!");
        
        // Subscribe to device commands
        String commandTopic = mqttTopic + "/commands";
        mqttClient.subscribe(commandTopic.c_str());
        Serial.printf("Subscribed to: %s\n", commandTopic.c_str());
        
        // Publish device status
        String statusTopic = mqttTopic + "/status";
        StaticJsonDocument<200> statusDoc;
        statusDoc["device_id"] = deviceId;
        statusDoc["status"] = "online";
        statusDoc["ip_address"] = WiFi.localIP().toString();
        statusDoc["rssi"] = WiFi.RSSI();
        
        String statusPayload;
        serializeJson(statusDoc, statusPayload);
        mqttClient.publish(statusTopic.c_str(), statusPayload.c_str());
        
    } else {
        Serial.printf(" failed, rc=%d\n", mqttClient.state());
    }
}

void mqttCallback(char* topic, byte* message, unsigned int length) {
    String topicStr = String(topic);
    String messageStr = "";
    
    for (int i = 0; i < length; i++) {
        messageStr += (char)message[i];
    }
    
    Serial.printf("MQTT message [%s]: %s\n", topic, messageStr.c_str());
    
    // Parse command
    StaticJsonDocument<200> doc;
    deserializeJson(doc, messageStr);
    
    String command = doc["type"];
    String payload = doc["payload"];
    
    executeCommand(command, payload);
}

void executeCommand(String command, String payload) {
    Serial.printf("Executing command: %s with payload: %s\n", command.c_str(), payload.c_str());
    
    if (command == "alarm") {
        // Trigger alarm buzzer
        for (int i = 0; i < 10; i++) {
            digitalWrite(ALARM_PIN, HIGH);
            delay(200);
            digitalWrite(ALARM_PIN, LOW);
            delay(200);
        }
        Serial.println("Alarm triggered");
        
    } else if (command == "led") {
        // Control LED
        if (payload == "on") {
            digitalWrite(LED_PIN, HIGH);
            Serial.println("LED turned on");
        } else if (payload == "off") {
            digitalWrite(LED_PIN, LOW);
            Serial.println("LED turned off");
        } else if (payload == "blink") {
            for (int i = 0; i < 6; i++) {
                digitalWrite(LED_PIN, HIGH);
                delay(250);
                digitalWrite(LED_PIN, LOW);
                delay(250);
            }
            Serial.println("LED blink completed");
        }
        
    } else if (command == "speak") {
        // TODO: Implement speaker functionality if hardware available
        Serial.printf("Speak command: %s\n", payload.c_str());
        
    } else if (command == "status") {
        // Send device status
        sendHeartbeat();
        
    } else {
        Serial.printf("Unknown command: %s\n", command.c_str());
    }
}

void sendHeartbeat() {
    if (!mqttClient.connected()) return;
    
    String heartbeatTopic = mqttTopic + "/heartbeat";
    StaticJsonDocument<300> doc;
    
    doc["device_id"] = deviceId;
    doc["timestamp"] = millis();
    doc["ip_address"] = WiFi.localIP().toString();
    doc["signal_strength"] = WiFi.RSSI();
    doc["free_heap"] = ESP.getFreeHeap();
    doc["uptime"] = millis() / 1000;
    doc["firmware_version"] = "1.0.0";
    
    String payload;
    serializeJson(doc, payload);
    
    mqttClient.publish(heartbeatTopic.c_str(), payload.c_str());
    Serial.println("Heartbeat sent");
}