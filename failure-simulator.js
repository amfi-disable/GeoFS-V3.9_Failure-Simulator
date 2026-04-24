/**
 * GeoFS-V3.9_Failure-Simulator
 * Complete integration of advanced failure mechanics and probability sliders.
 * Upgraded to the GeoFS-V3.9 Design System glassmorphic UI.
 */

(function() {
    'use strict';

    class DamageSystem {
        constructor() {
            this.ac = window.geofs.aircraft.instance;
            this.aId = this.ac.id;
            this.failures = new Map(); // Map to hold intervals by system ID
            this.mcasTime = 0;
            
            this.fails = {
                landingGear: { front: false, left: false, right: false },
                fuelLeak: false,
                flightCtrl: { ailerons: false, elevators: false, rudder: false },
                electrical: false,
                structural: false,
                hydraulic: { flaps: false, brakes: false, spoilers: false },
                pitotStatic: false,
                pressurization: false,
                engines: [],
                mcas: false
            };
            
            this.chances = {
                landingGear: { front: 0, left: 0, right: 0 },
                fuelLeak: 0,
                flightCtrl: { ailerons: 0, elevators: 0, rudder: 0 },
                electrical: 0,
                structural: 0,
                hydraulic: { flaps: 0, brakes: 0, spoilers: 0 },
                pitotStatic: 0,
                pressurization: 0,
                engines: [],
                mcas: 0
            };

            for (let i = 0; i < this.ac.engines.length; i++) {
                this.fails.engines.push(false);
                this.chances.engines.push(0);
            }
        }

        fail(system) {
            const ac = window.geofs.aircraft.instance;
            const ngin_l = ac.engines.length;
            
            if (this.fails[system] === true) return; // Already failed

            // Engine Failures
            for (let i = 0; i < ngin_l; i++) {
                if (system === ("engine" + i) && !this.fails.engines[i]) {
                    if (window.vNotify) vNotify.error({text: `Engine ${i+1} failed!`});
                    else alert(`Engine ${i+1} failed!`);
                    
                    this.fails.engines[i] = true;
                    ac.engines[i].thrust = 0;
                    
                    try {
                        new window.geofs.fx.ParticleEmitter({
                            off: 0,
                            anchor: ac.engines[0].points.contrailAnchor || {worldPosition: ac.engines[0].object3d.worldPosition},
                            duration: 1E10, rate: .03, life: 1E4, easing: "easeOutQuart",
                            startScale: .01, endScale: .2, randomizeStartScale: .01, randomizeEndScale: .15,
                            startOpacity: 1, endOpacity: .2, startRotation: "random", texture: "whitesmoke"
                        });
                        this.failures.push(setInterval(() => {
                            window.geofs.fx.setParticlesColor(new window.Cesium.Color(0.1, 0.1, 0.1, 1));
                            ac.engines[i].thrust = 0; 
                        }, 20));
                    } catch(e) {}
                }
            }

            // System Failures
            if (!system.includes("engine")) {
                switch(system) {
                    case "fuelLeak":
                        if (!this.fails.fuelLeak) {
                            if (window.vNotify) vNotify.error({text: "Fuel leak! 2 minutes of fuel remaining"});
                            else alert("Fuel leak! 2 minutes of fuel remaining");
                            this.fails.fuelLeak = true;
                            let leakTimeout = setTimeout(() => {
                                this.failures.set("fuelLeak_engineKill", setInterval(() => { ac.stopEngine(); }, 1000));
                            }, 120000);
                            this.failures.set("fuelLeak", leakTimeout);
                        }
                        break;

                    case "gearFront":
                        if (!this.fails.landingGear.front) {
                            if (window.vNotify) vNotify.error({text: "Nose/Tail Gear Failure"});
                            this.fails.landingGear.front = true;
                            let fGs = [];
                            for (let i = 0; i < ac.suspensions.length; i++) {
                                let s = ac.suspensions[i];
                                if (s.name.toLowerCase().includes("front") || s.name.toLowerCase().includes("nose") || (s.localCollisionPoint[0] > 1.5 && Math.abs(s.localCollisionPoint[1]) < 0.8)) fGs.push(i);
                            }
                            if (fGs.length > 0) {
                                this.failures.set("gearFront", setInterval(() => { fGs.forEach(idx => { ac.suspensions[idx].collisionPoints[0][2] = 30; }); }, 50));
                            }
                        }
                        break;

                    case "gearLeft":
                        if (!this.fails.landingGear.left) {
                            if (window.vNotify) vNotify.error({text: "Left Main Gear Failure"});
                            this.fails.landingGear.left = true;
                            let lGs = [];
                            for (let i = 0; i < ac.suspensions.length; i++) {
                                let s = ac.suspensions[i];
                                if (s.name.toLowerCase().includes("left") || (s.localCollisionPoint[1] > 0.8 && s.localCollisionPoint[0] < 1.5)) lGs.push(i);
                            }
                            if (lGs.length > 0) {
                                this.failures.set("gearLeft", setInterval(() => { lGs.forEach(idx => { ac.suspensions[idx].collisionPoints[0][2] = 30; }); }, 50));
                            }
                        }
                        break;

                    case "gearRight":
                        if (!this.fails.landingGear.right) {
                            if (window.vNotify) vNotify.error({text: "Right Main Gear Failure"});
                            this.fails.landingGear.right = true;
                            let rGs = [];
                            for (let i = 0; i < ac.suspensions.length; i++) {
                                let s = ac.suspensions[i];
                                if (s.name.toLowerCase().includes("right") || (s.localCollisionPoint[1] < -0.8 && s.localCollisionPoint[0] < 1.5)) rGs.push(i);
                            }
                            if (rGs.length > 0) {
                                this.failures.set("gearRight", setInterval(() => { rGs.forEach(idx => { ac.suspensions[idx].collisionPoints[0][2] = 30; }); }, 50));
                            }
                        }
                        break;

                    case "ailerons":
                        if (!this.fails.flightCtrl.ailerons) {
                            if (window.vNotify) vNotify.error({text: "Flight control failure (ailerons)"});
                            this.fails.flightCtrl.ailerons = true;
                            this.failures.set("ailerons", setInterval(() => {
                                for (let t in ac.airfoils) {
                                    if (ac.airfoils[t].name.toLowerCase().includes("aileron")) ac.airfoils[t].object3d._scale = [0,0,0];
                                }
                            }, 1000));
                        }
                        break;

                    case "elevators":
                        if (!this.fails.flightCtrl.elevators) {
                            if (window.vNotify) vNotify.error({text: "Flight control failure (elevators)"});
                            this.fails.flightCtrl.elevators = true;
                            this.failures.set("elevators", setInterval(() => {
                                for (let t in ac.airfoils) {
                                    if (ac.airfoils[t].name.toLowerCase().includes("elevator")) ac.airfoils[t].object3d._scale = [0,0,0];
                                }
                            }, 1000));
                        }
                        break;

                    case "rudder":
                        if (!this.fails.flightCtrl.rudder) {
                            if (window.vNotify) vNotify.error({text: "Flight control failure (rudder)"});
                            this.fails.flightCtrl.rudder = true;
                            this.failures.set("rudder", setInterval(() => {
                                for (let t in ac.airfoils) {
                                    if (ac.airfoils[t].name.toLowerCase().includes("rudder")) ac.airfoils[t].object3d._scale = [0,0,0];
                                }
                            }, 1000));
                        }
                        break;

                    case "electrical":
                        if (!this.fails.electrical) {
                            if (window.vNotify) vNotify.error({text: "Electrical failure"});
                            this.fails.electrical = true;
                            this.failures.set("electrical", setInterval(() => {
                                for (let i = 1; i <= 5; i++) {
                                    if (ac.cockpitSetup && ac.cockpitSetup.parts[i]) ac.cockpitSetup.parts[i].object3d._scale = [0,0,0];
                                }
                                window.geofs.autopilot.turnOff();
                                if (window.instruments) window.instruments.hide();
                            }, 1000));
                        }
                        break;

                    case "structural":
                        if (!this.fails.structural) {
                            if (window.vNotify) vNotify.error({text: "Significant structural damage detected"});
                            this.fails.structural = true;
                            this.failures.set("structural", setInterval(() => { window.weather.definition.turbulences = 3; }, 1000));
                        }
                        break;

                    case "flaps":
                        if (!this.fails.hydraulic.flaps) {
                            if (window.vNotify) vNotify.error({text: "Hydraulic failure (flaps)"});
                            this.fails.hydraulic.flaps = true;
                            this.failures.set("flaps", setInterval(() => {
                                window.controls.flaps.target = Math.floor(0.6822525 * (window.geofs.animation.values.flapsSteps * 2));
                                window.controls.flaps.delta = 20;
                            }, 1000));
                        }
                        break;

                    case "brakes":
                        if (!this.fails.hydraulic.brakes) {
                            if (window.vNotify) vNotify.error({text: "Hydraulic failure (brakes)"});
                            this.fails.hydraulic.brakes = true;
                            this.failures.set("brakes", setInterval(() => { window.controls.brakes = 0; }, 500));
                        }
                        break;

                    case "spoilers":
                        if (!this.fails.hydraulic.spoilers) {
                            if (window.vNotify) vNotify.error({text: "Hydraulic failure (spoilers)"});
                            this.fails.hydraulic.spoilers = true;
                            this.failures.set("spoilers", setInterval(() => {
                                window.controls.airbrakes.target = 0.2;
                                window.controls.airbrakes.delta = 20;
                            }, 1000));
                        }
                        break;

                    case "pressurization":
                        if (!this.fails.pressurization) {
                            if (window.vNotify) vNotify.error({text: "Cabin depressurization! Get at or below 9,000 ft MSL!"});
                            this.fails.pressurization = true;
                            this.failures.set("pressurization", setInterval(() => {
                                if (window.geofs.animation.values.altitude > 9000) {
                                    window.weather.definition.turbulences = (window.geofs.animation.values.altitude - 9000) / 5200;
                                } else {
                                    window.weather.definition.turbulences = 0;
                                }
                            }, 1000));
                        }
                        break;

                    case "mcas":
                        if (!this.fails.mcas) {
                            if (window.vNotify) vNotify.error({text: "MCAS failure! Uncommanded nose-down trim."});
                            this.fails.mcas = true;
                            this.mcasTime = Date.now();
                            this.mcasRandT = Math.floor(Math.random()*10000);
                            this.mcasActive = true;
                            window.controls.elevatorTrimMin = -10;
                            this.failures.set("mcas", setInterval(() => {
                                if (!window.geofs.autopilot.on && window.controls.flaps.position === 0 && this.fails.mcas) {
                                    if (this.mcasActive && (Date.now() <= this.mcasTime + this.mcasRandT)) {
                                        if (window.controls.elevatorTrim > window.controls.elevatorTrimMin) window.controls.elevatorTrim -= window.controls.elevatorTrimStep/10;
                                    } else if (this.mcasActive) {
                                        this.mcasActive = false;
                                        this.mcasTime += this.mcasRandT;
                                        this.mcasRandT = Math.floor(Math.random()*10000);
                                    } else if (!this.mcasActive && (Date.now() >= this.mcasTime + 5000)) {
                                        this.mcasActive = true;
                                        this.mcasTime += 5000;
                                        if (window.controls.elevatorTrim > window.controls.elevatorTrimMin) window.controls.elevatorTrim -= window.controls.elevatorTrimStep/10;
                                    }
                                }
                            }, 40));
                        }
                        break;
                }
            }
        }

        fix(system) {
            const ac = window.geofs.aircraft.instance;
            if (this.failures.has(system)) {
                clearInterval(this.failures.get(system));
                this.failures.delete(system);
            }
            
            // System-specific recovery logic
            if (system.includes("engine")) {
                let idx = parseInt(system.replace("engine", ""));
                this.fails.engines[idx] = false;
                ac.engines[idx].thrust = ac.engines[idx].p_thrust || 50000; 
                if (window.vNotify) vNotify.success({text: `Engine ${idx+1} Restored.`});
            } else {
                switch(system) {
                    case "gearFront": 
                        this.fails.landingGear.front = false; 
                        ac.suspensions.forEach(s => { if(s.name.toLowerCase().includes("front") || s.name.toLowerCase().includes("nose") || (s.localCollisionPoint[0] > 1.5 && Math.abs(s.localCollisionPoint[1]) < 0.8)) s.collisionPoints[0][2] = 0; });
                        break;
                    case "gearLeft": 
                        this.fails.landingGear.left = false; 
                        ac.suspensions.forEach(s => { if(s.name.toLowerCase().includes("left") || (s.localCollisionPoint[1] > 0.8 && s.localCollisionPoint[0] < 1.5)) s.collisionPoints[0][2] = 0; });
                        break;
                    case "gearRight": 
                        this.fails.landingGear.right = false; 
                        ac.suspensions.forEach(s => { if(s.name.toLowerCase().includes("right") || (s.localCollisionPoint[1] < -0.8 && s.localCollisionPoint[0] < 1.5)) s.collisionPoints[0][2] = 0; });
                        break;
                    case "fuelLeak": this.fails.fuelLeak = false; break;
                    case "ailerons": 
                        this.fails.flightCtrl.ailerons = false; 
                        ac.airfoils.forEach(a => { if(a.name.toLowerCase().includes("aileron")) a.object3d._scale = [1,1,1]; });
                        break;
                    case "elevators": 
                        this.fails.flightCtrl.elevators = false; 
                        ac.airfoils.forEach(a => { if(a.name.toLowerCase().includes("elevator")) a.object3d._scale = [1,1,1]; });
                        break;
                    case "rudder": 
                        this.fails.flightCtrl.rudder = false; 
                        ac.airfoils.forEach(a => { if(a.name.toLowerCase().includes("rudder")) a.object3d._scale = [1,1,1]; });
                        break;
                    case "electrical": 
                        this.fails.electrical = false; 
                        if (ac.cockpitSetup) ac.cockpitSetup.parts.forEach(p => { if(p && p.object3d) p.object3d._scale = [1,1,1]; });
                        if (window.instruments) window.instruments.show();
                        break;
                    case "structural": 
                        this.fails.structural = false; 
                        window.weather.definition.turbulences = 0;
                        break;
                    case "flaps": this.fails.hydraulic.flaps = false; break;
                    case "brakes": this.fails.hydraulic.brakes = false; break;
                    case "spoilers": this.fails.hydraulic.spoilers = false; break;
                    case "pressurization": 
                        this.fails.pressurization = false; 
                        window.weather.definition.turbulences = 0;
                        break;
                    case "mcas": 
                        this.fails.mcas = false; 
                        window.controls.elevatorTrimMin = -1;
                        break;
                }
                if (window.vNotify) vNotify.success({text: `${system} restored.`});
            }
        }

        tick() {
            if (this.enabled) {
                // General Systems
                for (let q in this.chances) {
                    if (typeof this.chances[q] === "number") {
                        if (Math.random() < this.chances[q]) this.fail(q);
                    } else if (q !== "landingGear" && q !== "engines" && q !== "flightCtrl" && q !== "hydraulic") {
                        for (let j in this.chances[q]) {
                            if (Math.random() < this.chances[q][j]) this.fail(j);
                        }
                    }
                }
                // Landing Gear
                for (let i in this.chances.landingGear) {
                    if (Math.random() < this.chances.landingGear[i]) this.fail("gear" + (i[0].toUpperCase() + i.substr(1)));
                }
                // Flight Control
                for (let f in this.chances.flightCtrl) {
                    if (Math.random() < this.chances.flightCtrl[f]) this.fail(f);
                }
                // Hydraulic
                for (let h in this.chances.hydraulic) {
                    if (Math.random() < this.chances.hydraulic[h]) this.fail(h);
                }
                // Engines
                for (let e = 0; e < this.chances.engines.length; e++) {
                    if (Math.random() < this.chances.engines[e]) this.fail("engine" + e);
                }
                this.tickInterval = setTimeout(() => { this.tick(); }, 60000);
            }
        }

        toggleProbability() {
            this.enabled = !this.enabled;
            const btn = document.getElementById('enBtn');
            const sliders = document.querySelectorAll('.addonpack-range');
            
            if (this.enabled) {
                if (btn) {
                    btn.innerText = "DISABLE SIM";
                    btn.classList.remove('success');
                    btn.classList.add('danger');
                }
                sliders.forEach(s => s.disabled = true);
                this.tick();
                if (window.vNotify) vNotify.info({text: "Probability Simulation Active. Sliders locked."});
            } else {
                if (btn) {
                    btn.innerText = "ENABLE SIM";
                    btn.classList.remove('danger');
                    btn.classList.add('success');
                }
                sliders.forEach(s => s.disabled = false);
                clearTimeout(this.tickInterval);
                if (window.vNotify) vNotify.info({text: "Probability Simulation Disabled."});
            }
        }

        failAll() {
            const ac = window.geofs.aircraft.instance;
            // Landing Gear
            this.fail("gearFront"); this.fail("gearLeft"); this.fail("gearRight");
            // Systems
            this.fail("fuelLeak"); this.fail("ailerons"); this.fail("elevators"); this.fail("rudder");
            this.fail("electrical"); this.fail("structural"); this.fail("flaps"); this.fail("brakes");
            this.fail("spoilers"); this.fail("pressurization"); this.fail("mcas");
            // Engines
            for (let i = 0; i < ac.engines.length; i++) this.fail("engine" + i);
            if (window.vNotify) vNotify.warning({text: "EVERYTHING HAS FAILED."});
        }

        reset() {
            this.failures.forEach((val, key) => this.fix(key));
            if (this.enabled) this.toggleProbability();
            if (window.instruments) window.instruments.show();
            window.weather.definition.turbulences = 0;
            if (window.vNotify) vNotify.success({text: "All systems restored to 100%."});
        }
    }

    // Helper function to build the stylized glass UI blocks
    function buildSliderBlock(title, id, failId, objectPath) {
        return `
        <div style="margin-bottom: 16px; padding: 12px; background: rgba(100,200,255,0.03); border-radius: 12px; border: 1px solid rgba(100,200,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="font-size: 13px; font-weight: 700; margin: 0; color: #fff; letter-spacing: 0.3px;">${title}</h2>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 500;">CHANCE:</span>
                    <input disabled id="input${id}" value="0%" class="addonpack-input" style="width: 45px;">
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <input type="range" value="0" min="0" max="1" step="0.001" class="addonpack-range" id="slide${id}" 
                       oninput="let val = (parseFloat(this.value)*100).toFixed(1); document.getElementById('input${id}').value = val + '%'; window.damageSystem.chances.${objectPath} = parseFloat(this.value);">
                <div style="display: flex; gap: 8px;">
                    <button class="addonpack-btn danger" style="flex: 1; padding: 4px; font-size: 10px; height: 24px;" onclick="window.damageSystem.fail('${failId}')">FAIL</button>
                    <button class="addonpack-btn success" style="flex: 1; padding: 4px; font-size: 10px; height: 24px;" onclick="window.damageSystem.fix('${failId}')">FIX</button>
                </div>
            </div>
        </div>`;
    }

    window.openDamageMenu = function() {
        if (!window.damageSystem || geofs.aircraft.instance.id !== window.damageSystem.aId) {
            if (window.damageSystem) window.damageSystem.reset();
            window.damageSystem = new DamageSystem();
            if (document.getElementById('geofs-failure-menu')) document.getElementById('geofs-failure-menu').remove();
        }

        let menu = document.getElementById('geofs-failure-menu');
        
        if (!menu) {
            menu = document.createElement("div");
            menu.id = "geofs-failure-menu";
            menu.className = "addonpack-card";
            menu.style.width = "440px";
            menu.style.left = "20px";
            menu.style.top = "80px";
            menu.style.bottom = "auto";
            
            // Header
            let htmlContent = `
                <div class="addonpack-card-header">
                    <span>⚠️ Failure Simulator v3.9</span>
                    <button onclick="document.getElementById('geofs-failure-menu').classList.remove('active')" style="background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; font-size:16px; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">✕</button>
                </div>
                <div class="addonpack-card-content" style="max-height: 75vh; overflow-y: auto; padding: 20px; scrollbar-width: thin; scrollbar-color: rgba(100,200,255,0.2) transparent;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; position: sticky; top: -20px; background: rgba(15, 25, 45, 0.95); padding: 10px 0 15px 0; z-index: 10; border-bottom: 1px solid rgba(100,200,255,0.1); backdrop-filter: blur(12px);">
                        <button class="addonpack-btn success" id="enBtn" style="grid-column: 1 / -1;" onclick="window.damageSystem.toggleProbability()">ENABLE SIMULATION</button>
                        <button class="addonpack-btn danger" onclick="window.damageSystem.failAll()">FAIL ALL</button>
                        <button class="addonpack-btn success" onclick="window.damageSystem.reset()">FIX ALL</button>
                    </div>
            `;

            const h1Style = "font-size: 11px; font-weight: 800; color: #64c8ff; margin: 30px 0 15px 0; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; gap: 10px;";
            const catBtnStyle = "padding: 2px 6px; font-size: 9px; font-weight: 900; border-radius: 4px; cursor: pointer; border: 1px solid;";
            const h1Span = "<span style='flex: 1; height: 1px; background: linear-gradient(to right, rgba(100,200,255,0.2), transparent);'></span>";

            const buildCatCtrl = (fails, fixes) => {
                return `
                <div style="display: flex; gap: 5px;">
                    <button class="addonpack-btn danger" style="${catBtnStyle} background: rgba(239,68,68,0.1);" onclick="${fails.map(f => `window.damageSystem.fail('${f}')`).join(';')}">X</button>
                    <button class="addonpack-btn success" style="${catBtnStyle} background: rgba(34,197,94,0.1);" onclick="${fixes.map(f => `window.damageSystem.fix('${f}')`).join(';')}">✓</button>
                </div>`;
            };

            // Sections
            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1Style}">Landing Gear ${h1Span}</h1> ${buildCatCtrl(['gearFront', 'gearLeft', 'gearRight'], ['gearFront', 'gearLeft', 'gearRight'])}</div>`;
            htmlContent += buildSliderBlock("Nose/Tail Gear", "GearF", "gearFront", "landingGear.front");
            htmlContent += buildSliderBlock("Main Gear (Left)", "GearL", "gearLeft", "landingGear.left");
            htmlContent += buildSliderBlock("Main Gear (Right)", "GearR", "gearRight", "landingGear.right");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1Style}">Fuel Systems ${h1Span}</h1> ${buildCatCtrl(['fuelLeak'], ['fuelLeak'])}</div>`;
            htmlContent += buildSliderBlock("Fuel Tank Leak", "Fuel", "fuelLeak", "fuelLeak");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1Style}">Flight Control Surfaces ${h1Span}</h1> ${buildCatCtrl(['ailerons', 'elevators', 'rudder'], ['ailerons', 'elevators', 'rudder'])}</div>`;
            htmlContent += buildSliderBlock("Aileron Jam", "Ail", "ailerons", "flightCtrl.ailerons");
            htmlContent += buildSliderBlock("Elevator Jam", "Elev", "elevators", "flightCtrl.elevators");
            htmlContent += buildSliderBlock("Rudder Jam", "Rud", "rudder", "flightCtrl.rudder");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1Style}">Avionics & Power ${h1Span}</h1> ${buildCatCtrl(['electrical'], ['electrical'])}</div>`;
            htmlContent += buildSliderBlock("Main Electrical Bus", "Elec", "electrical", "electrical");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1Style}">Airframe & Hyd ${h1Span}</h1> ${buildCatCtrl(['structural', 'flaps', 'brakes', 'spoilers'], ['structural', 'flaps', 'brakes', 'spoilers'])}</div>`;
            htmlContent += buildSliderBlock("Structural Fatigue", "Struct", "structural", "structural");
            htmlContent += buildSliderBlock("Flaps Actuator", "Flap", "flaps", "hydraulic.flaps");
            htmlContent += buildSliderBlock("Wheel Brakes", "Brake", "brakes", "hydraulic.brakes");
            htmlContent += buildSliderBlock("Ground Spoilers", "Spoil", "spoilers", "hydraulic.spoilers");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1Style}">Environment ${h1Span}</h1> ${buildCatCtrl(['pressurization', 'mcas'], ['pressurization', 'mcas'])}</div>`;
            htmlContent += buildSliderBlock("Cabin Pressurization", "Press", "pressurization", "pressurization");
            htmlContent += buildSliderBlock("MCAS Error", "MCAS", "mcas", "mcas");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1Style}">Engine Powerplants ${h1Span}</h1> ${buildCatCtrl(Array.from({length: window.geofs.aircraft.instance.engines.length}, (_, i) => `engine${i}`), Array.from({length: window.geofs.aircraft.instance.engines.length}, (_, i) => `engine${i}`))}</div>`;
            for (let i = 0; i < window.geofs.aircraft.instance.engines.length; i++) {
                htmlContent += buildSliderBlock(`Engine ${i+1} Failure`, `Eng${i}`, `engine${i}`, `engines[${i}]`);
            }

            htmlContent += `</div>`;
            menu.innerHTML = htmlContent;
            document.body.appendChild(menu);

            if (window.initAddonDraggable) {
                window.initAddonDraggable(menu);
            }
        }
        
        menu.classList.toggle('active');
    };

    window.initDamageSystem = function() {
        if (window.damageSystemInitDone) return;
        window.damageSystemInitDone = true;

        const uiInterval = setInterval(() => {
            if (document.querySelector('.geofs-ui-bottom') && !geofs.cautiousWithTerrain) {
                clearInterval(uiInterval);

                const failBtn = document.createElement('button');
                failBtn.innerHTML = '⚠️ FAIL';
                failBtn.className = 'geofs-button';
                
                // Position exactly 5px lower than the previous iteration
                failBtn.style.position = 'fixed';
                failBtn.style.bottom = '5px'; 
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
                console.log("GeoFS [Damage]: UI Injected and Loaded.");
            }
        }, 1000);
    };

    if (window.SafeInit) {
        window.SafeInit('Damage System', window.initDamageSystem);
    } else {
        window.initDamageSystem();
    }
})();
