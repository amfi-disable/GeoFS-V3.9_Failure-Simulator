/**
 * GeoFS-V3.9_Failure-Simulator
 * Complete integrated failure suite with advanced physics and standardized UI.
 */

(function() {
    'use strict';

    class DamageSystem {
        constructor() {
            this.ac = geofs.aircraft?.instance;
            this.enabled = false;
            this.intervals = {};
            this.particles = {};
            this.fails = { 
                engines: (geofs.aircraft?.instance?.engines || []).map(() => false),
                gear: { nose: false, left: false, right: false },
                fuelLeak: false,
                flightCtrl: { ailerons: false, elevators: false, rudder: false },
                electrical: false,
                structural: false,
                hydraulic: { flaps: false, brakes: false, spoilers: false },
                pressurization: false,
                mcas: false
            };
            // Probabilities (0 to 1) for the Chaos Factor
            this.chances = JSON.parse(JSON.stringify(this.fails)); 
        }

        fail(id) {
            const ac = geofs.aircraft?.instance;
            if (!ac || this.isFailed(id)) return;

            // --- Engine Logic (With Cesium Particles) ---
            if (id.startsWith('engine')) {
                const idx = parseInt(id.replace('engine', ''));
                this.fails.engines[idx] = true;
                vNotify.error({text: `Engine ${idx + 1} Failure!`});
                ac.engines[idx].thrust = 0;
                this.intervals[id] = setInterval(() => { ac.engines[idx].thrust = 0; }, 100);
                
                // Smoke Particles
                try {
                    this.particles[id] = new geofs.fx.ParticleEmitter({
                        off: 0,
                        anchor: ac.engines[idx].points.contrailAnchor || {worldPosition: ac.engines[idx].object3d.worldPosition},
                        duration: 1E10,
                        rate: .03,
                        life: 1E4,
                        easing: "easeOutQuart",
                        startScale: .01,
                        endScale: .2,
                        startOpacity: 1,
                        texture: "whitesmoke"
                    });
                    this.intervals[id + '_smoke'] = setInterval(() => {
                        geofs.fx.setParticlesColor(new Cesium.Color(0.1, 0.1, 0.1, 1));
                    }, 20);
                } catch(e) { console.warn("Cesium FX failed to init for engine."); }
            }

            // --- System Logic ---
            switch(id) {
                case 'fuelLeak':
                    vNotify.error({text: "Fuel Leak! 2 minutes of fuel remaining."});
                    this.fails.fuelLeak = true;
                    setTimeout(() => {
                        this.intervals.fuelOut = setInterval(() => { ac.stopEngine(); }, 1000);
                    }, 120000);
                    break;

                case 'gearNose': case 'gearLeft': case 'gearRight':
                    this.failGear(id);
                    break;

                case 'ailerons': case 'elevators': case 'rudder':
                    this.failControl(id);
                    break;

                case 'electrical':
                    vNotify.error({text: "Electrical Failure!"});
                    this.fails.electrical = true;
                    this.intervals.elec = setInterval(() => {
                        for (let i = 1; i <= 5; i++) {
                            if (ac.cockpitSetup?.parts[i]) ac.cockpitSetup.parts[i].object3d._scale = [0,0,0];
                        }
                        geofs.autopilot.turnOff();
                        if (window.instruments) instruments.hide();
                    }, 1000);
                    break;

                case 'structural':
                    vNotify.error({text: "Structural Damage!"});
                    this.fails.structural = true;
                    this.intervals.struct = setInterval(() => { weather.definition.turbulences = 3; }, 1000);
                    break;

                case 'flaps':
                    vNotify.error({text: "Hydraulic Failure (Flaps)"});
                    this.fails.hydraulic.flaps = true;
                    this.intervals.flaps = setInterval(() => {
                        controls.flaps.target = Math.floor(0.68 * (geofs.animation.values.flapsSteps * 2));
                        controls.flaps.delta = 20;
                    }, 1000);
                    break;

                case 'brakes':
                    vNotify.error({text: "Brake Pressure Lost!"});
                    this.fails.hydraulic.brakes = true;
                    this.intervals.brakes = setInterval(() => { controls.brakes = 0; }, 500);
                    break;

                case 'pressurization':
                    vNotify.error({text: "Depressurization!"});
                    this.fails.pressurization = true;
                    this.intervals.press = setInterval(() => {
                        weather.definition.turbulences = geofs.animation.values.altitude > 9000 ? 
                            (geofs.animation.values.altitude - 9000) / 5200 : 0;
                    }, 1000);
                    break;

                case 'mcas':
                    this.failMCAS();
                    break;
            }
        }

        failGear(type) {
            vNotify.error({text: `${type.replace('gear','')} Gear Failure!`});
            const keyword = type.replace('gear', '').toLowerCase();
            let gIdx = 0;
            geofs.aircraft.instance.suspensions.forEach((s, i) => {
                if (s.name.includes(keyword) || (keyword === 'nose' && s.name.includes('front'))) gIdx = i;
            });
            this.intervals[type] = setInterval(() => {
                geofs.aircraft.instance.suspensions[gIdx].collisionPoints[0][2] = 30;
            }, 1000);
        }

        failControl(type) {
            vNotify.error({text: `Control Surface Jam: ${type}`});
            this.intervals[type] = setInterval(() => {
                ac.airfoils.forEach(a => {
                    if (a.name.toLowerCase().includes(type.slice(0, -1))) a.object3d._scale = [0,0,0];
                });
            }, 1000);
        }

        failMCAS() {
            this.fails.mcas = true;
            let mcasActive = true;
            let mcasTime = Date.now();
            this.intervals.mcas = setInterval(() => {
                if (!geofs.autopilot.on && controls.flaps.position == 0) {
                    if (mcasActive && (Date.now() <= mcasTime + 8000)) {
                        if (controls.elevatorTrim > -10) controls.elevatorTrim -= controls.elevatorTrimStep/10;
                    } else if (mcasActive) {
                        mcasActive = false; mcasTime = Date.now();
                    } else if (Date.now() >= mcasTime + 5000) {
                        mcasActive = true; mcasTime = Date.now();
                    }
                }
            }, 40);
        }

        isFailed(id) {
            if (id.startsWith('engine')) return this.fails.engines[parseInt(id.replace('engine',''))];
            return this.fails[id];
        }

        tick() {
            if (!this.enabled || geofs.isPaused()) return;
            // Probability-based failures would trigger here
            setTimeout(() => this.tick(), 60000);
        }

        fixAll() {
            Object.values(this.intervals).forEach(clearInterval);
            this.intervals = {};
            this.fails.engines = this.fails.engines.map(() => false);
            Object.keys(this.fails).forEach(k => { if(typeof this.fails[k] === 'boolean') this.fails[k] = false; });
            if (window.instruments) instruments.show();
            weather.definition.turbulences = 0;
            vNotify.info({text: "All systems operational."});
        }
    }

    window.createFailureMenu = function() {
        const ac = geofs.aircraft?.instance;
        if (!ac || document.getElementById('geofs-failure-menu')) return;

        const menu = document.createElement('div');
        menu.id = 'geofs-failure-menu';
        menu.className = 'addonpack-card';
        
        menu.innerHTML = `
            <div class="addonpack-card-header">
                <span>Emergency Command</span>
                <button onclick="document.getElementById('geofs-failure-menu').classList.remove('active')" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
            </div>
            <div class="addonpack-card-content">
                
                <div class="addonpack-dropdown" onclick="this.nextElementSibling.classList.toggle('open'); this.querySelector('.addonpack-chevron').classList.toggle('open')">
                    <span class="addonpack-chevron">▶</span> Propulsion & Fuel
                </div>
                <div class="addonpack-content">
                    <div class="addonpack-block-container">
                        ${ac.engines.map((_, i) => `<button class="addonpack-block" onclick="damageSystem.fail('engine${i}')">ENG ${i + 1}</button>`).join('')}
                    </div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('fuelLeak')">Trigger Fuel Leak</div>
                </div>

                <div class="addonpack-dropdown" onclick="this.nextElementSibling.classList.toggle('open'); this.querySelector('.addonpack-chevron').classList.toggle('open')">
                    <span class="addonpack-chevron">▶</span> Flight Control & MCAS
                </div>
                <div class="addonpack-content">
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('mcas')">MCAS Runaway</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('ailerons')">Jammed Ailerons</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('elevators')">Elevator Failure</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('rudder')">Rudder Jam</div>
                </div>

                <div class="addonpack-dropdown" onclick="this.nextElementSibling.classList.toggle('open'); this.querySelector('.addonpack-chevron').classList.toggle('open')">
                    <span class="addonpack-chevron">▶</span> Landing Gear
                </div>
                <div class="addonpack-content">
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('gearNose')">Nose Gear Failure</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('gearLeft')">Left Gear Failure</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('gearRight')">Right Gear Failure</div>
                </div>

                <div class="addonpack-dropdown" onclick="this.nextElementSibling.classList.toggle('open'); this.querySelector('.addonpack-chevron').classList.toggle('open')">
                    <span class="addonpack-chevron">▶</span> Systems & Hydraulics
                </div>
                <div class="addonpack-content">
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('electrical')">Electrical Blackout</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('structural')">Structural Damage</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('pressurization')">Depressurization</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('flaps')">Flap Jam</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('brakes')">Hydraulic Brake Loss</div>
                </div>

                <div style="margin-top:15px; border-top:1px solid rgba(100,200,255,0.1); padding-top:10px;">
                    <button class="addonpack-sub-item" style="width:100%; text-align:center; background:rgba(34,197,94,0.2);" onclick="damageSystem.fixAll()">Reset All Systems</button>
                </div>
            </div>
        `;

        document.body.appendChild(menu);
        if (window.initAddonDraggable) window.initAddonDraggable(menu);
    };

    window.openDamageMenu = function() {
        if (!window.damageSystem) window.damageSystem = new DamageSystem();
        const menu = document.getElementById('geofs-failure-menu') || window.createFailureMenu() || document.getElementById('geofs-failure-menu');
        if (menu) menu.classList.toggle('active');
    };

    window.initDamageSystem = function() {
        if (window.damageSystem) return;
        window.damageSystem = new DamageSystem();
        const uiInterval = setInterval(() => {
            const bottomBar = document.querySelector('.geofs-ui-bottom');
            if (bottomBar) {
                clearInterval(uiInterval);
                const failBtn = document.createElement('button');
                failBtn.innerHTML = '⚠️ FAIL';
                failBtn.className = 'geofs-button';
                failBtn.style.position = 'fixed';
                failBtn.style.bottom = '10px';
                failBtn.style.right = '65px'; 
                failBtn.style.zIndex = '10001';
                failBtn.style.background = 'rgba(255, 107, 107, 0.2)';
                failBtn.style.color = '#ff6b6b';
                failBtn.style.border = '1px solid rgba(255, 107, 107, 0.4)';
                failBtn.style.padding = '5px 10px';
                failBtn.style.fontWeight = 'bold';
                failBtn.style.borderRadius = '5px';
                failBtn.style.backdropFilter = 'blur(4px)';
                failBtn.onclick = window.openDamageMenu;
                document.body.appendChild(failBtn);
            }
        }, 1000);
    };

    if (window.SafeInit) {
        window.SafeInit('Damage System', window.initDamageSystem);
    } else {
        window.initDamageSystem();
    }
})();
