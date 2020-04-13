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
#define ADC_ERROR 10
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
    
    // sensors init
    digitalWrite(BATTERY, HIGH);
    digitalWrite(POWER_SENSOR, LOW);
    digitalWrite(ANALOG_SENSOR, LOW);

    delay(50);
}

void loop(void) {
    digitalWrite(BATTERY, LOW);
    digitalWrite(POWER_SENSOR, HIGH);
    digitalWrite(ANALOG_SENSOR, HIGH);
    Serial.println("BATTERY");
    Serial.println(analogRead(A0));
    delay(10000);

    digitalWrite(BATTERY, HIGH);
    digitalWrite(POWER_SENSOR, LOW);
    digitalWrite(ANALOG_SENSOR, LOW);
    Serial.println("ADC");
    Serial.println(analogRead(A0));
    delay(10000);
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
