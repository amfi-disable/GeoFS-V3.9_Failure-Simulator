/**
 * GeoFS-V3.9_Failure-Simulator
 * Advanced mechanical failures, structural damage, and maintenance UI.
 */

(function() {
    'use strict';

    class DamageSystem {
        constructor() {
            this.ac = geofs.aircraft.instance;
            this.enabled = false;
            this.intervals = {};
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
                // Future: Logic for random failures goes here
                setTimeout(() => this.tick(), 60000);
            }
        }
    }

    window.openDamageMenu = function() {
        if (!window.damageSystem) window.damageSystem = new DamageSystem();
        
        if (document.getElementById('geofs-failure-menu')) {
            document.getElementById('geofs-failure-menu').classList.toggle('active');
        } else {
            console.log("GeoFS [Damage]: Menu logic initialized.");
            // Add UI modal creation here using Design System classes
        }
    };

    window.initDamageSystem = function() {
        if (window.damageSystem) return;
        window.damageSystem = new DamageSystem();

        // UI INJECTION: Wait for the bottom bar then add the button
        const uiInterval = setInterval(() => {
            const bottomBar = document.querySelector('.geofs-ui-bottom');
            if (bottomBar) {
                clearInterval(uiInterval);

                const failBtn = document.createElement('button');
                failBtn.innerHTML = '⚠️ FAIL';
                failBtn.className = 'geofs-button';
                failBtn.style.background = 'rgba(255, 107, 107, 0.2)';
                failBtn.style.color = '#ff6b6b';
                failBtn.style.border = '1px solid rgba(255, 107, 107, 0.4)';
                failBtn.style.margin = '0 5px';
                
                failBtn.onclick = window.openDamageMenu;

                bottomBar.appendChild(failBtn);
                console.log("GeoFS [Damage]: UI Button Injected.");
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
