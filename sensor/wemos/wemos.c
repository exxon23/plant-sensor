#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <Adafruit_BME280.h>
#include <BH1750.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>


#ifndef STASSID
#define STASSID "MKSH_NET"
#define STAPSK  "Bezdomovcibrno1"
#define MEASURES 3
#define DELAY_BETWEEN_MEASURES 100
#define CONNECT_WIFI 1
#define DEEP_SLEEP_ENABLED 1
#define DEEP_SLEEP_INTERVAL 30e6
#endif

const char* ssid = STASSID;
const char* password = STAPSK;
Adafruit_BME280 bme;
BH1750 lightMeter(0x23);



// local variables
float temperature[MEASURES], humidity[MEASURES], soilHumidity[MEASURES], lux[MEASURES], voltage[MEASURES];
char JSONmessageBuffer[650];

void setup(void) {
    Serial.begin(115200);
    // sensors init
    bme.begin(0x76);
    if (!lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
        Serial.println(F("Error initialising BH1750"));
    }
    Serial.println("Measuring data ...");
    measureData();
    Serial.println("Calculating averages and creating request payload ...");
    if(CONNECT_WIFI) {
        Serial.println("Start connecting to WiFi ...");
        WiFi.mode(WIFI_STA);
        WiFi.begin(ssid, password);
        while (WiFi.status() != WL_CONNECTED) {
            delay(1000);
            Serial.print(".");
            Serial.println("");
        }
        Serial.println("Connected to WiFi");
        Serial.println("Sending data ...");
        createPayload();
        sendData();
    } else {
        WiFi.mode(WIFI_OFF);
        Serial.println("WiFi disabled");
    }
    if(DEEP_SLEEP_ENABLED) {
        Serial.println("Going into deep sleep");
        ESP.deepSleep(DEEP_SLEEP_INTERVAL);
    }
}

void loop(void) {
    
}

float bme280MeasureTemp() {
    return bme.readTemperature();
}
float bme280MeasureHumidity() {
    return bme.readHumidity();
}
float moistureSensorMeasureMoisture() {
    return analogRead(A0);
}
float bh1750MeasureLightIntensity() {
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
void measureData() {
    for (uint8_t i = 0; i < MEASURES; i++) {
        temperature[i] = bme280MeasureTemp();
        humidity[i] = bme280MeasureHumidity();
        lux[i] = bh1750MeasureLightIntensity(); 
        soilHumidity[i] = moistureSensorMeasureMoisture();  
        delay(DELAY_BETWEEN_MEASURES);
    }
}
void createPayload() {
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    
    root["api_key"] = "ID74WIXT55XTGPOK";
    root["field1"] = calculateAverage(temperature);
    root["field2"] = calculateAverage(humidity);
    root["field3"] = calculateAverage(soilHumidity);
    root["field4"] = calculateAverage(lux);
    root.prettyPrintTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
}
void sendData() {
    HTTPClient http;
    http.begin("http://api.thingspeak.com/update.json");
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(JSONmessageBuffer);  // send the request
    String payload = http.getString();  // get response
    Serial.println(payload);
    Serial.println(httpCode);
    http.end();
}