#include <ESP8266WebServer.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <math.h>
#include <EEPROM.h>


uint8_t debug = 0;
uint8_t bme280Enabled = 1;
uint8_t bh1750Enabled = 1;
uint8_t moistureSensorEnabled = 1;


/* SENSORS SETUP */
// BME280
#include <Adafruit_BME280.h>
Adafruit_BME280 bme;


// BH1750
#include <BH1750FVI.h>
uint8_t ADDRESSPIN = 13;
BH1750FVI::eDeviceAddress_t DEVICEADDRESS = BH1750FVI::k_DevAddress_L;
BH1750FVI::eDeviceMode_t DEVICEMODE = BH1750FVI::k_DevModeContHighRes;
BH1750FVI LightSensor(ADDRESSPIN, DEVICEADDRESS, DEVICEMODE);  


/* WIFI SETUP */
const char* ssid = "MKSH_NET";
const char* password = "Bezdomovcibrno1";
float temperature[3], humidity[3], soilHumidity[3];
uint16_t lux[3];
float temperatureResult = 0, humidityResult = 0, soilHumidityResult = 0;
uint16_t luxResult = 0;
// create buffer
char JSONmessageBuffer[650];
//ADC_MODE(ADC_VCC);

void setup() {
  Serial.begin(115200);
  Serial.println("Connecting to ");
  Serial.println(ssid);
  if(bme280Enabled) {
    bme.begin(0x76); 
  }
  if(bh1750Enabled) {
    LightSensor.begin();  
  }

  
  WiFi.begin(ssid, password);

  //check wi-fi is connected to wi-fi network
  while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected..!");
  Serial.print("Got IP: ");  
  Serial.println(WiFi.localIP());

   Serial.println("Measuring data ...");
  measureData();
  Serial.println("Calculating result ...");
  calculateAverage();
  Serial.println("Creating payload ...");
  createPayload();
  Serial.println("Sending data ...");
  sendData();

 
 Serial.println("Going into deep sleep for 30 minutes");
 ESP.deepSleep(1800e6);

}
void loop() {
//   delay(5000);
// //  Serial.print("BATTERY: "); 
// //  Serial.print(ESP.getVcc());
// //  delay(5000);
// //
// //  Serial.println("");
// //  Serial.print("Moisture: "); 
// //  Serial.print(analogRead(A0)); 
// //  Serial.println("");
//   Serial.println("Measuring data ...");
//   measureData();
//   Serial.println("Calculating result ...");
//   calculateAverage();
//   Serial.println("Creating payload ...");
//   createPayload();
//   Serial.println("Sending data ...");
//   sendData();
  
}

float bme280MeasureTemp() {
    return roundf(bme.readTemperature() * 100) / 100;
}
float bme280MeasureHumidity() {
    return roundf(bme.readHumidity() * 100) / 100;
}
float moistureSensorMeasureMoisture() {
    return roundf(analogRead(A0) * 100) / 100;
}
uint16_t bh1750MeasureLightIntensity() {
    return LightSensor.GetLightIntensity();
}



void measureData() {
    for (uint8_t i = 0; i < 3; i++) {
        if(bme280Enabled) {
            temperature[i] = bme280MeasureTemp();
            humidity[i] = bme280MeasureHumidity();
        }
        if(bh1750Enabled) {
            lux[i] = bh1750MeasureLightIntensity();
        }
        if(moistureSensorEnabled) {
            soilHumidity[i] =  moistureSensorMeasureMoisture();
        }
        delay(333);
    }
}

void calculateAverage() {
    if(bme280Enabled) {
            temperatureResult = (temperature[0] + temperature[1] + temperature[2])/3;          
            humidityResult = (humidity[0] + humidity[1] + humidity[2])/3;          
    }
    if(bh1750Enabled) {
        luxResult = (lux[0] + lux[1] + lux[2])/3;          
    }
    if(moistureSensorEnabled) {
        soilHumidityResult = (soilHumidity[0] + soilHumidity[1] + soilHumidity[2])/3;          
    }
}

void createPayload() {
    DynamicJsonBuffer jsonBuffer;
    JsonObject& root = jsonBuffer.createObject();
    root["device"] = "5d545c4a9c51723b449f1c6c";
    if(bme280Enabled) {
        JsonObject& temperatureObj = root.createNestedObject("temperature");
        temperatureObj["value"] = temperature;
        temperatureObj["sensor"] = "5d545c439c51723b449f1c67";
        JsonObject& humidityObj = root.createNestedObject("humidity");
        humidityObj["value"] = humidity;
        humidityObj["sensor"] = "5d545c439c51723b449f1c67";
    }
    if(bh1750Enabled) {
        JsonObject& lightIntensityObj = root.createNestedObject("lightIntensity");
        lightIntensityObj["value"] = lux;
        lightIntensityObj["sensor"] = "5d545c499c51723b449f1c69";   
    }
    if(moistureSensorEnabled) {
        JsonObject& moistureObj = root.createNestedObject("moisture");
        moistureObj["value"] = soilHumidity;
        moistureObj["sensor"] = "5d545c499c51723b449f1c68";  
    }
    
    root.prettyPrintTo(JSONmessageBuffer, sizeof(JSONmessageBuffer));
}

void sendData() {
  if(debug) {
    Serial.print("Temp: ");
    Serial.print(temperature[0]);
    Serial.print(",");
    Serial.print(temperature[1]);
    Serial.print(",");
    Serial.print(temperature[2]);
    Serial.print(", priemer: ");
    Serial.print(temperatureResult);
    Serial.println("");  
    Serial.print("Humidity: ");
    Serial.print(humidity[0]);
    Serial.print(",");
    Serial.print(humidity[1]);
    Serial.print(",");
    Serial.print(humidity[2]);
    Serial.print(",");
    Serial.print(", priemer: ");
    Serial.print(humidityResult);
    Serial.println("");  
    Serial.print("Soil humidity: ");
    Serial.print(soilHumidity[0]);
    Serial.print(",");
    Serial.print(soilHumidity[1]);
    Serial.print(",");
    Serial.print(soilHumidity[2]);
    Serial.print(", priemer: ");
    Serial.print(soilHumidityResult);
    Serial.println("");  
    Serial.print("Light: ");
    Serial.print(lux[0]);
    Serial.print(",");
    Serial.print(lux[1]);
    Serial.print(",");
    Serial.print(lux[2]);
    Serial.print(", priemer: ");
    Serial.print(luxResult);
    Serial.println("");  
  }


  // initialize http client
  HTTPClient http;
  http.begin("http://plant-sensor-mach.herokuapp.com/measure");
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.POST(JSONmessageBuffer);  // send the request
  String payload = http.getString();  // get response
  Serial.println(payload);
  http.end();
}