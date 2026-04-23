# ✈️ GeoFS-V3.9_Failure-Simulator

**GeoFS-V3.9_Failure-Simulator** is a professional-grade emergency injection framework for the GeoFS flight simulator. This isn't just a script; it’s a stress test for your piloting skills. It introduces randomized, logic-based mechanical failures that turn a routine flight into a high-stakes "learning opportunity."

---

## 🚀 Key Features
* **Dynamic Engine Failures:** Spontaneous flameouts, bird strikes, and oil pressure drops.
* **Systemic Anomalies:** Total electrical blackouts, HUD failures, and landing gear jams.
* **Control Surface Glitches:** Jammed flaps and unresponsive ailerons to test your manual trim skills.
* **V3.9 Physics Integration:** Optimized for the latest GeoFS flight models for realistic stalls and drag.

---

## 🛠️ Installation

This tool is designed to run via **Tampermonkey**. No terminal commands or cloning required for end-users.

1.  **Install Tampermonkey:** Ensure you have the [Tampermonkey extension](https://www.tampermonkey.net/) installed in your browser.
2.  **Add Script:** * Navigate to `failure-simulator_standalone.user.js` in this repository and view the "Raw" code.
    * Open the Tampermonkey Dashboard -> "Create a new script".
    * Paste the code and hit `Ctrl + S` to save.
3.  **Launch:** Open [GeoFS](https://www.geo-fs.com/geofs.php) and the simulator will initialize automatically alongside the Core Library.

---

## ⚙️ Operating Procedures

Once you're in the cockpit, the simulator runs silently until disaster strikes.

* **Failure Dashboard:** Press **`[Shift + F]`** to view your current system status or manually trigger a "training" emergency.
* **Chaos Factor:** Adjust the failure probability in the settings menu. Lower for realism, higher if you’re feeling particularly brave.

> **Pilot's Note:** If you hear the master caution alarm, remain calm. Check your instruments, follow your checklists, and remember: **Aviate, Navigate, Communicate.**

---

## 🤝 Contributing

Found a bug that *isn't* a simulated engine fire? Or perhaps you've designed a new way for a turbine to explode? Open an issue or submit a Pull Request. Let's make "smooth landings" a thing of the past.

---

## ⚖️ License

Distributed under the **MIT License**. 

---

### 📦 Repository Specs
* **Name:** `GeoFS-V3.9_Failure-Simulator`
* **.gitignore:** Node 
* **Target:** GeoFS v3.9+
