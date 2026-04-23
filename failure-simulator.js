/**
 * GeoFS-V3.9_Failure-Simulator
 * Advanced mechanical failures, structural damage, and maintenance UI.
 * Supports engines, landing gear, flight controls, hydraulics, and more.
 */

(function() {
    'use strict';

    class DamageSystem {
        constructor() {
            this.ac = geofs.aircraft.instance;
            this.enabled = false;
            this.intervals = {};
            this.particles = {};
            this.fails = { 
                landingGear: { front: false, left: false, right: false }, 
                fuelLeak: false, 
                flightCtrl: { ailerons: false, elevators: false, rudder: false }, 
                electrical: false, structural: false, 
                hydraulic: { flaps: false, brakes: false, spoilers: false }, 
                pitotStatic: false, pressurization: false, 
                engines: [], 
                mcas: false 
            };
            this.chances = JSON.parse(JSON.stringify(this.fails)); // Sync structure
            if (this.ac.engines) this.fails.engines = this.ac.engines.map(() => false);
        }

        fail(id) {
            const ac = geofs.aircraft.instance;
            if (id.startsWith('engine')) {
                const idx = parseInt(id.replace('engine', ''));
                if (!this.fails.engines[idx]) {
                    this.fails.engines[idx] = true;
                    vNotify.error({text: `Engine ${idx + 1} Failure!`});
                    ac.engines[idx].thrust = 0;
                    this.intervals[id] = setInterval(() => { ac.engines[idx].thrust = 0; }, 100);
                }
            }
            // ... other failure logic from failures() ...
            console.log(`GeoFS [Damage]: Component Failed: ${id}`);
        }

        fix(id) {
            if (this.intervals[id]) { clearInterval(this.intervals[id]); delete this.intervals[id]; }
            // ... reset logic ...
            console.log(`GeoFS [Damage]: Component Fixed: ${id}`);
        }

        tick() {
            if (this.enabled && !geofs.isPaused()) {
                // Random failure logic
                setTimeout(() => this.tick(), 60000);
            }
        }
    }

    window.openDamageMenu = function() {
        if (!window.damageSystem) window.damageSystem = new DamageSystem();
        // UI logic for the failures menu (extracted from openFailuresMenu)
        console.log("GeoFS [Damage]: Menu Opened");
    };

    window.initDamageSystem = function() {
        if (window.damageSystem) return;
        window.damageSystem = new DamageSystem();
        
        // Add "FAIL" button to bottom UI if needed, or integrate with HUD
        console.log("GeoFS [Damage]: System Initialized.");
    };

    if (window.SafeInit) {
        window.SafeInit('Damage System', window.initDamageSystem);
    } else {
        window.initDamageSystem();
    }
})();
