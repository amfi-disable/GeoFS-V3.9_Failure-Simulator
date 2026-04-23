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

// ... existing DamageSystem class code ...

window.openDamageMenu = function() {
    if (!window.damageSystem) window.damageSystem = new DamageSystem();
    
    // Check if menu already exists, if not, create it using Design System classes
    if (document.getElementById('geofs-failure-menu')) {
        document.getElementById('geofs-failure-menu').classList.toggle('active');
    } else {
        console.log("GeoFS [Damage]: Creating Failure Menu UI...");
        // You would typically build your menu here using the classes found in your Design System CSS
    }
};

window.initDamageSystem = function() {
    if (window.damageSystem) return;
    window.damageSystem = new DamageSystem();

    // INJECTION: Create the button in the bottom UI
    const uiInterval = setInterval(() => {
        const bottomBar = document.querySelector('.geofs-ui-bottom');
        if (bottomBar) {
            clearInterval(uiInterval);

            // Create the button element
            const failBtn = document.createElement('button');
            failBtn.innerHTML = '⚠️ FAIL';
            failBtn.className = 'geofs-button'; // Use native GeoFS style or your custom ones
            failBtn.style.background = 'rgba(255, 107, 107, 0.2)';
            failBtn.style.color = '#ff6b6b';
            failBtn.style.border = '1px solid rgba(255, 107, 107, 0.4)';
            failBtn.style.margin = '0 5px';
            
            // Set action
            failBtn.onclick = window.openDamageMenu;

            // Append to bottom bar
            bottomBar.appendChild(failBtn);
            console.log("GeoFS [Damage]: UI Button Injected.");
        }
    }, 1000);
};

    if (window.SafeInit) {
        window.SafeInit('Damage System', window.initDamageSystem);
    } else {
        window.initDamageSystem();
    }
})();
