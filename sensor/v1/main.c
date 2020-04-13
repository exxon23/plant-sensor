#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <WiFiManager.h>  

#define BATTERY D7
#define ANALOG_SENSOR D6
#define POWER_SENSOR D5
#define MEASURES 3
#define DELAY_BETWEEN_MEASURES 200
#define DEEP_SLEEP_INTERVAL 600e6
#define DEEP_SLEEP_ENABLED 1
#define BATTERY_MEASURE_RATIO 4.25
#define MIN_VOLTAGE_THRESHOLD 3.3

Adafruit_BME280 bme;
BH1750 lightSensor(0x23);

// local variables
float temperature[MEASURES], humidity[MEASURES], soilMoisture[MEASURES], lightIntensity[MEASURES], voltage[MEASURES];
char JSONmessageBuffer[650];

void setup(void) {
    Serial.begin(115200);
    pinMode(BATTERY, OUTPUT);     
    pinMode(ANALOG_SENSOR, OUTPUT);
    pinMode(POWER_SENSOR, OUTPUT); 
    digitalWrite(POWER_SENSOR, HIGH);
    digitalWrite(ANALOG_SENSOR, HIGH);
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
    if (!lightSensor.begin()) {
        Serial.println(F("Error initialising BH1750"));
    }
    lightSensor.readLightLevel();
}

void loop(void) {    
    // Serial.println("Ligh");
    // Serial.println(lightSensor.readLightLevel());
    delay(200);
    Serial.println("Calculating averages and creating request payload ...");
    measureData();
    createPayload();
    Serial.println("Start connecting to WiFi ...");

    // WIFI manager
    WiFiManager wifiManager;
    wifiManager.setConfigPortalTimeout(240);    // number of seconds in access point mode
    // wifiManager.resetSettings();
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

float measureTemperature() {
    Serial.println("measureTemperature");
    Serial.println(bme.readTemperature());
    return bme.readTemperature();
}
float measureHumidity() {
    return bme.readHumidity();
}
float measureSoilMoisture() {
    int adcValue = analogRead(A0);
    Serial.println("measureSoilMoisture");
    Serial.println(adcValue);
    return (-0.0906 + 0.00106*adcValue - 0.0000000176*adcValue*adcValue);
}
float measureLightIntensity() {
    Serial.println("measureLightIntensity");
    Serial.println(lightSensor.readLightLevel());
    return lightSensor.readLightLevel();
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
    digitalWrite(BATTERY, LOW);
    delay(50);
    for (uint8_t i = 0; i < MEASURES; i++) {
        Serial.println("ADC battery value");
        int adcValue = analogRead(A0);
        Serial.println(adcValue);
        // float realAdcValue = -0.0906 + 0.00106*adcValue - 0.0000000176*adcValue*adcValue;
        // Serial.println("Voltage real level");
        // Serial.print(realAdcValue);
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
    http.begin("http://plant-sensor-mach.herokuapp.com/measure");
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(JSONmessageBuffer);  // send the request
    String payload = http.getString();  // get response
    Serial.println(payload);
    Serial.println(httpCode);
    http.end();
}