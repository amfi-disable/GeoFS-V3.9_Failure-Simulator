# GeoFS Failure Simulator v3.9

The **Failure Simulator v3.9** is a high-fidelity emergency simulation framework for [GeoFS](https://www.geo-fs.com/). It combines the robust mechanical logic of the classic "GeoFS Failures" script with the premium design and expanded capabilities of the **[GeoFS v3.9 Addon-Pack](https://github.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Addon-Pack)**.

---

## ✨ Features

### 🛠️ Core Failure Mechanics
- **Engine Failures**: Realistic thrust loss and black smoke particle effects.
- **Timed Fuel Leaks**: Experience a critical 2-minute "limp" window before total engine shutdown.
- **Advanced Gear Systems**: Intelligent multi-bogie detection for complex aircraft (A380, 747, etc.), ensuring all relevant suspension points collapse.
- **Flight Control Jams**: Physically frozen ailerons, elevators, and rudders that accurately affect flight dynamics.
- **Avionics & Hydraulics**: Complete simulation of electrical bus failures (dark cockpit), brake loss, spoiler jams, and flap actuator failures.
- **Environmental Hazards**: Cabin depressurization and significant structural fatigue affecting turbulence.
- **MCAS Simulation**: Realistic uncommanded nose-down trim cycles for applicable aircraft.

### 🎮 Advanced Control Interface
- **Granular Fix System**: Every individual system can be manually failed or fixed using dedicated buttons.
- **Global Toggles**: Instant "FAIL ALL" and "FIX ALL" buttons for rapid scenario deployment.
- **Category Rapid-Fail**: Micro-buttons `[X]` and `[✓]` to manage entire categories (Engines, Landing Gear, etc.) with one click.
- **Probability Simulator**: A background simulation engine that triggers random failures based on your configured chances.
- **Safety Locking**: When "Enable Probability" is active, probability sliders are **automatically locked** to prevent input conflicts and ensure simulation stability.

---

## 🔧 Installation Tutorial

To use this simulator in GeoFS, you will need the **Tampermonkey** browser extension.

### 1. Install Tampermonkey
- **Chrome/Edge**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Safari**: [App Store](https://apps.apple.com/us/app/tampermonkey/id1459806926)

### 2. Install the Script
1. Click on the following link to view the standalone script: [failure-simulator_standalone.user.js](./failure-simulator_standalone.user.js)
2. Copy the entire contents of the file.
3. Open the **Tampermonkey Dashboard** in your browser.
4. Click the **"+" (Plus)** icon to create a new script.
5. Delete the default template and paste the copied code.
6. Press `Ctrl+S` (or `Cmd+S`) to save.

### 3. Start Flying
Refresh GeoFS. A red **"FAILURES"** button will appear in the bottom-right corner of your screen.

---

## 📦 Part of a Larger Ecosystem
This standalone simulator is an integrated component of the **[GeoFS v3.9 Addon-Pack](https://github.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Addon-Pack)**. For the full experience, including modernized weather, graphics, and UI enhancements, check out the main repository.

---
*Maintained by the GeoFS-V3.9 Development Team.*
