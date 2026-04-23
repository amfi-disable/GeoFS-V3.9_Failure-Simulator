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
                    if (window.vNotify) vNotify.error({text: `Engine ${idx + 1} Failure!`});
                    ac.engines[idx].thrust = 0;
                    this.intervals[id] = setInterval(() => { ac.engines[idx].thrust = 0; }, 100);
                }
            }
            console.log(`GeoFS [Damage]: Component Failed: ${id}`);
        }

        fix(id) {
            if (this.intervals[id]) { 
                clearInterval(this.intervals[id]); 
                delete this.intervals[id]; 
            }
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
        
        // Check if menu already exists, if not, create it using Design System classes
        if (document.getElementById('geofs-failure-menu')) {
            document.getElementById('geofs-failure-menu').classList.toggle('active');
        } else {
            console.log("GeoFS [Damage]: Creating Failure Menu UI...");
            // UI logic for the failures menu (extracted from openFailuresMenu)
        }
    };

    window.initDamageSystem = function() {
        if (window.damageSystem) return;
        window.damageSystem = new DamageSystem();

        // INJECTION: Create the button in the bottom-right UI
        const uiInterval = setInterval(() => {
            const bottomBar = document.querySelector('.geofs-ui-bottom');
            if (bottomBar) {
                clearInterval(uiInterval);

                const failBtn = document.createElement('button');
                failBtn.innerHTML = '⚠️ FAIL';
                failBtn.className = 'geofs-button';
                
                // Positioning: Fixed to bottom-right, clearing the fullscreen button
                failBtn.style.position = 'fixed';
                failBtn.style.bottom = '10px';
                failBtn.style.right = '65px'; 
                failBtn.style.zIndex = '10001';
                
                // Design System Styling
                failBtn.style.background = 'rgba(255, 107, 107, 0.2)';
                failBtn.style.color = '#ff6b6b';
                failBtn.style.border = '1px solid rgba(255, 107, 107, 0.4)';
                failBtn.style.padding = '5px 10px';
                failBtn.style.fontWeight = 'bold';
                failBtn.style.cursor = 'pointer';
                failBtn.style.borderRadius = '5px';
                failBtn.style.backdropFilter = 'blur(4px)';

                failBtn.onclick = window.openDamageMenu;

                // Append to body to ensure fixed positioning works screen-wide
                document.body.appendChild(failBtn);
                console.log("GeoFS [Damage]: UI Button Injected in bottom-right corner.");
            }
        }, 1000);
    };

    // Initialize via Core Library SafeInit protocol
    if (window.SafeInit) {
        window.SafeInit('Damage System', window.initDamageSystem);
    } else {
        window.initDamageSystem();
    }
})();
