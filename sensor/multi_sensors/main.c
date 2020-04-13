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
#define MUX_A D1
#define MUX_B D2
#define MUX_C D3
#endif

const char* ssid = STASSID;
const char* password = STAPSK;
Adafruit_BME280 bme;
BH1750 lightMeter(0x23);



// local variables
float field1[MEASURES], field2[MEASURES], field3[MEASURES], field4[MEASURES];
char JSONmessageBuffer[650];

void setup(void) {
    pinMode(MUX_A, OUTPUT);
    pinMode(MUX_B, OUTPUT);     
    pinMode(MUX_C, OUTPUT); 
    Serial.begin(115200);
    // sensors init
    Serial.println("Measuring data ...");
    //
    changeMux(0,0,0);
    delay(500);
    // Serial.println("KY-018");
    // Serial.println(analogRead(A0));
    field1[0] = analogRead(A0);
    delay(500);
    field1[1] = analogRead(A0);
    delay(500);
    field1[2] = analogRead(A0);
    delay(500);

    //
    changeMux(1,0,0);
    delay(500);
    // Serial.println("Crowtail moisture sensor");
    // Serial.println(analogRead(A0));
    field2[0] = analogRead(A0);
    delay(500);
    field2[1] = analogRead(A0);
    delay(500);
    field2[2] = analogRead(A0);
    delay(500);

    //
    changeMux(0,1,0);
    delay(500);
    // Serial.println("Moisture sensor with relay");
    // Serial.println(analogRead(A0));
    field3[0] = analogRead(A0);
    delay(500);
    field3[1] = analogRead(A0);
    delay(500);
    field3[2] = analogRead(A0);
    delay(500);

    //
    changeMux(0,0,1);
    delay(500);
    // Serial.println("Hygrometer detection soil moisture sensor");
    // Serial.println(analogRead(A0));
    field4[0] = analogRead(A0);
    delay(500);
    field4[1] = analogRead(A0);
    delay(500);
    field4[2] = analogRead(A0);
    delay(500);
    delay(5000);
    // Serial.println("Calculating averages and creating request payload ...");
    // Serial.println("Start connecting to WiFi ...");
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
    if(DEEP_SLEEP_ENABLED) {
        Serial.println("Going into deep sleep");
        ESP.deepSleep(DEEP_SLEEP_INTERVAL);
    }
}

void loop(void) {
    
}

void changeMux(int a, int b, int c) {
  digitalWrite(MUX_A, a);
  digitalWrite(MUX_B, b);
  digitalWrite(MUX_C, c);
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

void createPayload() {
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    
    root["api_key"] = "EEVXWCCRL5SX5DMV";
    root["field1"] = calculateAverage(field1);
    root["field2"] = calculateAverage(field2);
    root["field3"] = calculateAverage(field3);
    root["field4"] = calculateAverage(field4);
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