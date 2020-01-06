#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>  

#ifndef STASSID
#define STASSID "MKSH_NET"
#define STAPSK  "Bezdomovcibrno1"
#define BATTERY D7
#define ANALOG_SENSOR D6
#define POWER_SENSOR D5
#define MEASURES 3
#define DELAY_BETWEEN_MEASURES 100
#define DEEP_SLEEP_INTERVAL 30e6
#define DEEP_SLEEP_ENABLED 1
#define BATTERY_MEASURE_RATIO 4.25
#define ADC_ERROR 0
#define MIN_VOLTAGE_THRESHOLD 3.3
#endif

const char* ssid = STASSID;
const char* password = STAPSK;
Adafruit_BME280 bme;
BH1750 lightMeter(0x23);



// local variables
float temperature[MEASURES], humidity[MEASURES], soilMoisture[MEASURES], lightIntensity[MEASURES], voltage[MEASURES];
char JSONmessageBuffer[650];

void setup(void) {
    Serial.begin(115200);
    pinMode(BATTERY, OUTPUT);     
    pinMode(ANALOG_SENSOR, OUTPUT);
    pinMode(POWER_SENSOR, OUTPUT); 
    getBatteryVoltage();

    if(calculateAverage(voltage) < MIN_VOLTAGE_THRESHOLD) {
        Serial.println("Battery voltage low! Stop measure cycle and go back to deep sleep");
        if(DEEP_SLEEP_ENABLED) {
            Serial.println("Going into deep sleep");
            ESP.deepSleep(DEEP_SLEEP_INTERVAL);
        }
    }

    // sensors init
    digitalWrite(POWER_SENSOR, LOW);
    digitalWrite(ANALOG_SENSOR, LOW);
    delay(50);
    bme.begin(0x76);
    if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
        Serial.println(F("Error initialising BH1750"));
    }
    
    Serial.println("Calculating averages and creating request payload ...");
    measureData();
    createPayload();
    Serial.println("Start connecting to WiFi ...");

    // WIFI manager
    WiFiManager wifiManager;
    wifiManager.setConfigPortalTimeout(240);
    wifiManager.resetSettings();
    if(!wifiManager.autoConnect("plant sensor")) {
        Serial.println("Wi-Fi setup unsuccessful in interval");
        Serial.println("Going into deep sleep");
        ESP.deepSleep(DEEP_SLEEP_INTERVAL);
    } 

    Serial.println("Connected to WiFi");
    Serial.println("Sending data ...");
    sendData();
    if(DEEP_SLEEP_ENABLED) {
        Serial.println("Going into deep sleep");
        ESP.deepSleep(DEEP_SLEEP_INTERVAL);
    }
}

void loop(void) {
}

float measureTemperature() {
    return bme.readTemperature();
}
float measureHumidity() {
    return bme.readHumidity();
}
float measureSoilMoisture() {
    return analogRead(A0);
}
float measureLightIntensity() {
    return lightMeter.readLightLevel();
}
float calculateAverage(float data[]) {
    int i = 0;
    float sum = 0, avg = 0;
    for(i = 0; i < sizeof(data)/sizeof(data[0]) + 1; i++) {
        sum += data[i];
    }
    avg = (float)sum / i;
    return avg;
}
float getBatteryVoltage() {
    // Serial.println("getBatteryVoltage");
    digitalWrite(BATTERY, LOW);
    delay(50);
    for (uint8_t i = 0; i < MEASURES; i++) {
        // Serial.println("ADC battery value");
        int adcValue = analogRead(A0) - ADC_ERROR;
        // Serial.println(adcValue);
        // Serial.println((float)adcValue/1024 * BATTERY_MEASURE_RATIO);
        voltage[i] = (float)adcValue/1024 * BATTERY_MEASURE_RATIO;
        delay(DELAY_BETWEEN_MEASURES);
    }
    digitalWrite(BATTERY, HIGH);
}
void measureData() {
    for (uint8_t i = 0; i < MEASURES; i++) {
        temperature[i] = measureTemperature();
        humidity[i] = measureHumidity();
        lightIntensity[i] = measureLightIntensity(); 
        soilMoisture[i] = measureSoilMoisture();  
        delay(DELAY_BETWEEN_MEASURES);
    }
}
void createPayload() {
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    root["device"] = "5d545c4a9c51723b449f1c6c";
    JsonArray& data = root.createNestedArray("data");
    JsonObject& temperatureObj = data.createNestedObject();
    temperatureObj["measure"] = "temperature";
    temperatureObj["value"] = calculateAverage(temperature);
    JsonObject& humidityObj = data.createNestedObject();
    humidityObj["measure"] = "humidity";
    humidityObj["value"] = calculateAverage(humidity);
    JsonObject& lightIntensityObj = data.createNestedObject();
    lightIntensityObj["measure"] = "lightIntensity";
    lightIntensityObj["value"] = calculateAverage(lightIntensity);
    JsonObject& soilMoistureObj = data.createNestedObject();
    soilMoistureObj["measure"] = "soilMoisture";
    soilMoistureObj["value"] = calculateAverage(soilMoisture);
    JsonObject& voltageObj = data.createNestedObject();
    voltageObj["measure"] = "voltage";
    voltageObj["value"] = calculateAverage(voltage);
    root.prettyPrintTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
    root.prettyPrintTo(Serial);
}

void sendData() {
    HTTPClient http;
    http.begin("http://23df12bd.ngrok.io/measure");
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(JSONmessageBuffer);  // send the request
    String payload = http.getString();  // get response
    Serial.println(payload);
    Serial.println(httpCode);
    http.end();
}