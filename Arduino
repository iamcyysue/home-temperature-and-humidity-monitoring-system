#include <Arduino_HS300x.h>
#include <ArduinoBLE.h>

// 1. Define custom BLE Service and Characteristic UUIDs
// TODO: Replace these with your own generated UUIDs before uploading to your board
const char* serviceUUID = "YOUR-SERVICE-UUID-HERE";
const char* tempUUID    = "YOUR-TEMP-CHARACTERISTIC-UUID-HERE";
const char* humidUUID   = "YOUR-HUMID-CHARACTERISTIC-UUID-HERE"; 

BLEService weatherService(serviceUUID); 

// Use BLEStringCharacteristic to send strings, max length set to 10
BLEStringCharacteristic tempCharacteristic(tempUUID, BLERead | BLENotify, 10); 
BLEStringCharacteristic humidCharacteristic(humidUUID, BLERead | BLENotify, 10); 

long previousMillis = 0;  

void setup() {
  Serial.begin(9600);
  
  // Wait for Serial Monitor to open, but only wait up to 5 seconds.
  // This ensures the program doesn't get stuck forever if powered by an external battery (power bank).
  while (!Serial && millis() < 5000); 

  Serial.println("Initializing temperature and humidity sensor (HS300x)...");
  if (!HS300x.begin()) {
    Serial.println("HS300x sensor not found. Please check the board! (Might be an older Rev 1 requiring HTS221)");
    while (1); // Stop execution if sensor is not found
  }
  Serial.println("Sensor ready!");

  if (!BLE.begin()) {
    Serial.println("Failed to start BLE!");
    while (1); // Stop execution if BLE fails to start
  }

  // TODO: You can change the broadcast device name here
  BLE.setLocalName("YOUR_DEVICE_NAME");
  BLE.setAdvertisedService(weatherService);
  
  // Add temperature and humidity characteristics to the service
  weatherService.addCharacteristic(tempCharacteristic);
  weatherService.addCharacteristic(humidCharacteristic); 
  
  BLE.addService(weatherService);

  // Set initial values to "0.0"
  tempCharacteristic.writeValue("0.0");
  humidCharacteristic.writeValue("0.0"); 

  BLE.advertise();
  Serial.println("BLE ready and broadcasting! Waiting for connection...");
}

void loop() {
  BLEDevice central = BLE.central();

  if (central) {
    Serial.print("Connected to device MAC address: ");
    Serial.println(central.address());

    while (central.connected()) {
      long currentMillis = millis();
      
      // Read and send data every 2 seconds
      if (currentMillis - previousMillis >= 2000) {
        previousMillis = currentMillis;
        
        float temperature = HS300x.readTemperature();
        float humidity    = HS300x.readHumidity();

        if (isnan(temperature) || isnan(humidity)) {
          Serial.println("Failed to read data!");
        } else {
          Serial.print("Temperature: ");
          Serial.print(temperature);
          Serial.print(" °C  |  Humidity: ");
          Serial.print(humidity);
          Serial.println(" %");

          // Convert floats to Strings and send them to the connected device
          tempCharacteristic.writeValue(String(temperature));
          humidCharacteristic.writeValue(String(humidity)); 
        }
      }
    }
    
    Serial.print("Device disconnected: ");
    Serial.println(central.address());
    Serial.println("Waiting for connection...");
  }
}
