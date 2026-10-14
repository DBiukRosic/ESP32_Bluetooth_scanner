# ESP32 Bluetooth Attendance System

A prototype attendance-tracking project developed for the **Embedded Computer Systems** course at FESB. It combines an **ESP32**, a **Python serial-data logger**, and a **React web interface** to record and display attendance information associated with Bluetooth device addresses.

## Overview

The project consists of three components:

1. **ESP32 firmware** (`Arduino_Bluetooth_Scanner/`) uses Bluetooth Classic APIs to configure the ESP32 device, manage bonded devices, and print their MAC addresses over the serial connection.
2. **Python logger** (`data_import/esp_data.py`) listens to the ESP32's serial output, extracts MAC addresses, matches them against a local student CSV file, and appends timestamped records.
3. **React frontend** (`attendance-app/`) reads CSV files from its `public/` directory and displays attendance entries and presence summaries.

> **Prototype limitation:** The firmware lists **paired/bonded Bluetooth devices**, not every nearby device. It also clears the paired-device list during initialization and when receiving a `RESET` command. Consequently, the project should not be interpreted as a reliable automatic scanner for all devices in range or as a production-ready attendance solution.

## Tech stack

- **Embedded:** ESP32, Arduino C++, Bluetooth Classic (`BluetoothSerial`, ESP-IDF GAP APIs)
- **Data processing:** Python, PySerial, CSV, regular expressions
- **Frontend:** React, JavaScript, Papa Parse, CSS
- **Data storage:** Local CSV files (no database or backend API)

## Repository structure

```text
.
├── Arduino_Bluetooth_Scanner/
│   └── Arduino_Bluetooth_Scanner.ino   # ESP32 firmware
├── data_import/
│   ├── esp_data.py                     # Serial listener and CSV logger
│   ├── studenti.csv                    # template; see privacy note
│   ├── connected_devices.csv           # template
│   └── presence_log.csv                # template
├── attendance-app/
│   ├── public/
│   │   ├── studenti.csv                # template
│   │   ├── attendance.csv              # template
│   │   └── presence.csv                # template
│   ├── src/                             # React components and styles
│   ├── package.json
│   └── package-lock.json
└── README.md
```

## Setup and usage

### 1. ESP32 firmware

- Install the Arduino IDE and the ESP32 board support package.
- Open `Arduino_Bluetooth_Scanner/Arduino_Bluetooth_Scanner.ino`.
- Select a compatible ESP32 board and serial port, then upload the sketch.
- Open Serial Monitor at **115200 baud** to inspect the output.

The sketch configures the Bluetooth device name as `ESP32_BT_Device` and includes a demonstration pairing PIN. **Change the hard-coded PIN before using the project outside a controlled test environment.**

### 2. Python logger

Install the required library:

```bash
pip install pyserial
```

Edit `data_import/esp_data.py` to set `esp_port` to your ESP32 serial port (the current code uses Windows `COM3`). The script uses **relative file paths**, so run it from the `data_import` directory:

```bash
cd data_import
python esp_data.py
```

Before running it, populate `attendance-app/public/studenti.csv` with your **own test data** in the format:

```csv
Ime_studenta, MAC_ADDRESS
Test Student,AA:BB:CC:DD:EE:FF
```

The logger parses serial lines containing `MAC:` and appends entries to `attendance-app/public/attendance.csv` and `data_import/connected_devices.csv`. The firmware and logger must be tested together with the intended Bluetooth pairing workflow; serial output is not guaranteed to contain device entries after the sketch clears bonded devices.

### 3. React dashboard

Requires Node.js and npm:

```bash
cd attendance-app
npm install
npm start
```

Open **http://localhost:3000**. The main React component reads `public/attendance.csv`, and the additional `Presence.js` component reads `public/presence.csv`. These are **static CSV assets** loaded by the browser; the application does not automatically stream new serial events or persist data through an API. Refresh the page after the CSV files change.

## Data format

The repository includes empty CSV templates instead of real attendance records:

| File | Purpose |
| --- | --- |
| `attendance-app/public/studenti.csv` | Student name to MAC address mapping |
| `attendance-app/public/attendance.csv` | Timestamped attendance entries |
| `attendance-app/public/presence.csv` | Name and presence-count summary |
| `data_import/connected_devices.csv` | Timestamped device detections |
| `data_import/presence_log.csv` | Historical/local attendance log template |

**Privacy:** Student names, device MAC addresses, and attendance timestamps can be personal data. Use fictional records for public demonstrations and obtain appropriate permission before collecting or publishing real data. The React app serves files in `public/` directly to the browser.

## Current limitations

- The Bluetooth firmware handles **bonded devices** and resets pairing information; it does not continuously discover all nearby phones.
- The serial port (`COM3`) and file paths are hard-coded in the Python script.
- The dashboard reads static CSV files rather than a live backend.
- `Presence.js` exists in the source but is not mounted by the main `App.js` component.
- The repository is an academic prototype, not a validated attendance or identity-verification system.

## Academic context

Course project for **Embedded Computer Systems**, Faculty of Electrical Engineering, Mechanical Engineering and Naval Architecture (FESB), University of Split.

