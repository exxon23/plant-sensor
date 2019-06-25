#include <ESP8266WebServer.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>

Adafruit_BME280 bme;

float temperature, humidity, pressure, soilHumidity;

const char* ssid = "MKSH_NET";
const char* password = "Bezdomovcibrno1";

const int analogInPin = A0;

ESP8266WebServer server(80);              
 
void setup() {
  Serial.begin(115200);
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

  server.on("/", handle_OnConnect);
  server.onNotFound(handle_NotFound);

  server.begin();
  Serial.println("HTTP server started");

}
void loop() {
  delay(10000);

  server.handleClient();
  
  // measure data
  temperature = bme.readTemperature();
  humidity = bme.readHumidity();
  pressure = bme.readPressure() / 100.0F;
  soilHumidity = analogRead(analogInPin);

  // create POST body
  StaticJsonBuffer<300> JSONbuffer;
  JsonObject& JSONencoder = JSONbuffer.createObject();
//  JSONencoder["sensorType"] = "plant-sensor-v1.0.0"; 
  JSONencoder["temperature"] = temperature;
  JSONencoder["humidity"] = humidity;
  JSONencoder["pressure"] = pressure;
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
  Serial.println(payload);

  http.end();
}

void handle_OnConnect() {
  temperature = bme.readTemperature();
  humidity = bme.readHumidity();
  pressure = bme.readPressure() / 100.0F;
  soilHumidity = analogRead(analogInPin);
  server.send(200, "text/html", SendHTML(temperature,humidity,pressure,soilHumidity)); 
}

void handle_NotFound(){
  server.send(404, "text/plain", "Not found");
}

float calculateSoilHumidity(int minADCVal, int maxADCVal, int ADCValue) {
  float coeficient = ((maxADCVal - minADCVal)/100.0F);
  Serial.println(coeficient);
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

String SendHTML(float temperature,float humidity,float pressure,float soilHumidity){
  String ptr = "<!DOCTYPE html> <html>\n";
  ptr +="<head><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\n";
  ptr +="<title>ESP8266</title>\n";
  ptr +="<style>html { font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}\n";
  ptr +="body{margin-top: 50px;} h1 {color: #444444;margin: 50px auto 30px;}\n";
  ptr +="p {font-size: 24px;color: #444444;margin-bottom: 10px;}\n";
  ptr +="</style>\n";
  ptr +="</head>\n";
  ptr +="<body>\n";
  ptr +="<div id=\"webpage\">\n";
  ptr +="<h1>ESP8266 Weather Station</h1>\n";
  ptr +="<p>Temperature: ";
  ptr +=temperature;
  ptr +="&deg;C</p>";
  ptr +="<p>Humidity: ";
  ptr +=humidity;
  ptr +="%</p>";
  ptr +="<p>Pressure: ";
  ptr +=pressure;
  ptr +="hPa</p>";
  ptr +="<p>Soil humidity: ";
  ptr +=soilHumidity;
  ptr +="[-] and that is ";
  ptr +=calculateSoilHumidity(80,208,soilHumidity);
  ptr +="% ";
  ptr +=soilType(180,208,soilHumidity);
  ptr +="</p>";
  ptr +="</div>\n";
  ptr +="</body>\n";
  ptr +="</html>\n";
  return ptr;
}