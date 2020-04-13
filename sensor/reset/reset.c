#include <DoubleResetDetector.h>

#define DRD_TIMEOUT 10
#define DRD_ADDRESS 0

DoubleResetDetector drd(DRD_TIMEOUT, DRD_ADDRESS);

void setup()
{ 
    Serial.begin(115200);
    Serial.println();
    Serial.println("Wakeup from sleep");

    if (drd.detectDoubleReset()) {
        Serial.println("Double Reset Detected");
    } else {
        Serial.println("No Double Reset Detected");
    }

    Serial.println("Going into deep sleep");
    ESP.deepSleep(30e6);
  
}

void loop() {}