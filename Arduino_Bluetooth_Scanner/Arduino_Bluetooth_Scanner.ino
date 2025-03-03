#include "BluetoothSerial.h"
#include "esp_bt_device.h"
#include "esp_bt_main.h"
#include "esp_gap_bt_api.h"

BluetoothSerial SerialBT;
char pinCode[] = "1234";

void setBluetoothDeviceType(uint32_t cod) {
    esp_bt_cod_t class_of_device;
    class_of_device.minor = (cod & 0x3F);
    class_of_device.major = ((cod >> 8) & 0x1F);
    class_of_device.service = ((cod >> 13) & 0x7FF);

    esp_bt_gap_set_cod(class_of_device, ESP_BT_INIT_COD);
}

// Function to delete all paired devices
void clearPairedDevices() {
    int count = esp_bt_gap_get_bond_device_num();
    if (count == 0) {
        Serial.println("No paired devices to delete.");
        return;
    }

    esp_bd_addr_t pairedDevices[count];
    if (esp_bt_gap_get_bond_device_list(&count, pairedDevices) == ESP_OK) {
        for (int i = 0; i < count; i++) {
            esp_bt_gap_remove_bond_device(pairedDevices[i]);  // Delete each paired device
            Serial.print("Removed device with bluetooth address: ");
            for (int j = 0; j < 6; j++) {
                Serial.printf("%02X", pairedDevices[i][j]);
                if (j < 5) Serial.print(":");
            }
            Serial.println();
        }
        Serial.println("All paired devices deleted.");
    } else {
        Serial.println("Failed to get paired devices list.");
    }
}

// Function to reset the Bluetooth stack
void resetBluetooth() {
    Serial.println("Resetting Bluetooth...");
    clearPairedDevices();  // Clear the bonded devices
    delay(3000);  // Small delay before rescanning
}

// Function to rescan for paired devices
void listBondedDevices() {
    int count = esp_bt_gap_get_bond_device_num();
    if (count == 0) {
        Serial.println("No paired devices found.");
        return;
    }

    esp_bd_addr_t pairedDevices[count];
    if (esp_bt_gap_get_bond_device_list(&count, pairedDevices) == ESP_OK) {
        Serial.println("List of Paired Devices:");
        for (int i = 0; i < count; i++) {
            Serial.print(" Device ");
            Serial.print(i + 1);
            Serial.print(" MAC: ");
            for (int j = 0; j < 6; j++) {
                Serial.printf("%02X", pairedDevices[i][j]);
                if (j < 5) Serial.print(":");
            }
            Serial.println();
        }
    } else {
        Serial.println("Failed to get paired devices list.");
    }
}

void setup() {
    Serial.begin(115200);
    SerialBT.begin("ESP32_BT_Device", true); // Secure mode
    Serial.println("Bluetooth Ready. Waiting for pairing...");

    esp_bt_dev_set_device_name("ESP32_BT_Device");
    esp_bt_gap_set_scan_mode(ESP_BT_CONNECTABLE, ESP_BT_GENERAL_DISCOVERABLE);
    
    setBluetoothDeviceType(0x5A020C);
    Serial.println("Bluetooth device type updated to Smartphone.");

    if (SerialBT.setPin(pinCode, strlen(pinCode))) {
        Serial.println("Pairing Enabled. Use PIN: " + String(pinCode));
    } else {
        Serial.println("Failed to set PIN!");
    }

    listBondedDevices();  // List paired devices on startup
    Serial.println("Bonded Devices Listed!");
    resetBluetooth();
}

void loop() {
  if (SerialBT.available()) {
      Serial.println("SerialBT is available. Awaiting response.....");
      String received = SerialBT.readStringUntil('\n');
      received.trim();
        
      if (received == "RESET") {
          Serial.println("Received RESET command. Clearing paired devices...");
          resetBluetooth();  // Clear paired devices on RESET command
          delay(1000); // Small delay before rescanning
          listBondedDevices();  // List devices after reboot
      } else 
      {
        Serial.print("Received: ");
        Serial.println(received);
      }
  }
}
