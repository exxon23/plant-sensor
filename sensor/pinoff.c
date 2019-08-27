#include <ESP8266WebServer.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
Adafruit_BME280 bme;
#define CH_PD_PIN 4

float temperature, humidity, soilHumidity;

const char* ssid = "MKSH_NET";
const char* password = "Bezdomovcibrno1";

const int analogInPin = A0;

 
void setup() {
  Serial.begin(115200);

  while (!Serial) { }
  delay(100);
  
  bme.begin(0x76);   

  Serial.println("Connecting to ");
  Serial.println(ssid);

  //connect to your local wi-fi network
  WiFi.begin(ssid, password);

  //check wi-fi is connected to wi-fi network
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected..!");
  Serial.print("Got IP: ");  Serial.println(WiFi.localIP());

  delay(10000);
  
  // measure data
  Serial.println("Measuring data...");
  temperature = bme.readTemperature();
  humidity = bme.readHumidity();
  soilHumidity = analogRead(analogInPin);

  // create POST body
  StaticJsonBuffer<300> JSONbuffer;
  JsonObject& JSONencoder = JSONbuffer.createObject();
//  JSONencoder["sensorType"] = "plant-sensor-v1.0.0"; 
  JSONencoder["temperature"] = temperature;
  JSONencoder["humidity"] = humidity;
  JSONencoder["soilHumidityAnalogValue"] = soilHumidity;  
  JSONencoder["soilHumidity"] = calculateSoilHumidity(80,208,soilHumidity);
 
  
  // create buffer
  char JSONmessageBuffer[300];
  JSONencoder.prettyPrintTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
  
  // initialize http client
  HTTPClient http;
  http.begin("http://plant-sensor-mach.herokuapp.com/measure");
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(JSONmessageBuffer);  // send the request
  String payload = http.getString();  // get response
  http.end();
  
//  Serial.println("Going into deep sleep for 20 seconds");
//  ESP.deepSleep(30e6); // 20e6 is 20 microseconds
  
  
}
void loop() {
  pinMode(CH_PD_PIN, OUTPUT);
  Serial.println("loop ...");
  Serial.print("on: ");
  Serial.print(bme.readTemperature()); 
  digitalWrite(CH_PD_PIN, 0);  // activate PD power-down pin of ESP8266 
  delay(10000);

  Serial.print("off:");
  Serial.print(bme.readTemperature()); 
  
  digitalWrite(CH_PD_PIN, 1); // bring up ESP8266 from power-down mode. It resets.
  delay(10000);

}

float calculateSoilHumidity(int minADCVal, int maxADCVal, int ADCValue) {
  float coeficient = ((maxADCVal - minADCVal)/100.0F);
  float result = 100 - (ADCValue - minADCVal)/coeficient;
  if(result > 100) {
    return 100;
  } else if(result < 0) {
    return 0;
  } else {
    return result;
  }
}

const char * soilType(int minADCVal, int maxADCVal, int ADCValue) {
  float interval = (maxADCVal - minADCVal)/3;
  if (ADCValue <= (minADCVal+interval)) {
    return "water";
  } else if (ADCValue >= (maxADCVal - interval)) {
    return "dry";
  } else {
    return "wet";
  }
}