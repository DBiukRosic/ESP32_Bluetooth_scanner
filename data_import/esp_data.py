import serial
import csv
from datetime import datetime
import re
import time

esp_port = "COM3"  # port na kojem je ESP32 povezan
baud_rate = 115200  # ESP32 baud rate
all_devices = "connected_devices.csv"


mac_list_file = "../attendance-app/public/studenti.csv"  # Imena i MAC adrese korisnika
log_file = "../attendance-app/public/attendance.csv" # Log file za prisustvo korisnika

mac_to_name = {}
with open(mac_list_file, "r") as file:
    reader = csv.reader(file)
    headers = next(reader)  # Skip header row
    for row in reader:
        if len(row) >= 2:
            mac_to_name[row[1].strip().upper()] = row[0].strip()
            #print("📚 Loaded:", row[1].strip().upper(), row[0].strip())

ser = serial.Serial(esp_port, baud_rate, timeout=1)

# Simulacija EN
ser.setDTR(False) # Pull DTR low (forces boot mode)
time.sleep(3)
ser.setDTR(True)  # Release DTR (ESP32 should reset)
time.sleep(3)  # Wait for ESP32 to boot

print("🔄 ESP32 Reset Done! Listening for connected devices...")

with open(log_file, "a", newline="") as file:
    writer = csv.writer(file)
    if file.tell() == 0:  # If file is empty, add headers
        writer.writerow(["Timestamp"] + ["Ime_studenta"])

    print("📡 Listening for connected devices... (Press Ctrl+C to stop)")

    try:
        while True:
            data = ser.readline().decode(errors="ignore").strip()  # Read Serial data
            if "MAC:" in data:  # Check if the line contains a MAC address
                match = re.search(r"([0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2}:[0-9A-F]{2})", data)
                if match:
                    detected_mac = match.group(1).upper()
                    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                    # Append to presence_log.csv
                    with open(log_file, "a", newline="") as file:
                        writer = csv.writer(file)
                        writer.writerow([timestamp, mac_to_name.get(detected_mac)])

                    # Append to connected_devices.csv for backup
                    with open(all_devices, "a", newline="") as file:
                        writer = csv.writer(file)
                        writer.writerow([timestamp, detected_mac, mac_to_name.get(detected_mac, "Unknown Device")])

                    print("📩 Logged:", detected_mac, mac_to_name.get(detected_mac, "Unknown Device"))

    except KeyboardInterrupt:
        print("\n🛑 Stopping script. Data saved to", log_file, "and", all_devices)
        ser.close()

