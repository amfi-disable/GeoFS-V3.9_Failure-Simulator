(function() {
    'use strict';

    class DamageSystem {
        constructor() {
            const ac = window.geofs.aircraft.instance;
            this.aId = ac.id;
            this.enabled = false;
            this.failures = new Map(); // SystemID -> {id: interval/timeout, type: 'int'|'time'|'fx'}
            this.mcasTime = 0;
            
            this.fails = {
                landingGear: { front: false, left: false, right: false },
                fuelLeak: false,
                flightCtrl: { ailerons: false, elevators: false, rudder: false },
                electrical: false,
                structural: false,
                hydraulic: { flaps: false, brakes: false, spoilers: false },
                pressurization: false,
                mcas: false,
                engines: []
            };

            this.chances = {
                landingGear: { gearFront: 0, left: 0, right: 0 },
                fuelLeak: 0,
                flightCtrl: { ailerons: 0, elevators: 0, rudder: 0 },
                electrical: 0,
                structural: 0,
                hydraulic: { flaps: 0, brakes: 0, spoilers: 0 },
                pressurization: 0,
                mcas: 0,
                engines: []
            };

            const numEngines = (ac.engines && ac.engines.length) ? ac.engines.length : 0;
            for (let i = 0; i < numEngines; i++) {
                this.fails.engines.push({i: false});
                this.chances.engines.push(0);
            }
        }

        notify(text, type = "error") {
            if (window.vNotify && typeof window.vNotify[type] === 'function') {
                window.vNotify[type]({text: text});
            } else if (window.ui && window.ui.notification) {
                window.ui.notification.show(text);
            } else {
                console.log("[Failure Simulator] " + text);
                try { alert(text); } catch(e) {}
            }
        }

        fail(system) {
            const ac = window.geofs.aircraft.instance;
            
            // Engines
            const numEngines = (ac.engines && ac.engines.length) ? ac.engines.length : 0;
            for (let i = 0; i < numEngines; i++) {
                if (system === ("engine" + i) && !this.fails.engines[i].i) {
                    this.notify(`Engine ${i+1} failed!`);
                    this.fails.engines[i].i = true;
                    ac.engines[i]._p_thrust = ac.engines[i].thrust; // Save original
                    ac.engines[i].thrust = 0;
                    
                    const emitter = new window.geofs.fx.ParticleEmitter({
                        off: 0,
                        anchor: ac.engines[i].points.contrailAnchor || {worldPosition: ac.engines[i].object3d.worldPosition},
                        duration: 1E10, rate: .03, life: 1E4, easing: "easeOutQuart",
                        startScale: .01, endScale: .2, randomizeStartScale: .01, randomizeEndScale: .15,
                        startOpacity: 1, endOpacity: .2, startRotation: "random", texture: "whitesmoke"
                    });
                    
                    const colorInt = setInterval(() => {
                        window.geofs.fx.setParticlesColor(new window.Cesium.Color(0.1, 0.1, 0.1, 1));
                    }, 20);
                    
                    this.failures.set(`engine${i}_emitter`, emitter);
                    this.failures.set(`engine${i}_color`, colorInt);
                }
            }

            if (!system.includes("engine")) {
                switch(system) {
                    case "fuelLeak":
                        if (!this.fails.fuelLeak) {
                            this.notify("Fuel leak! 2 minutes of fuel remaining.");
                            this.fails.fuelLeak = true;
                            const leakTimer = setTimeout(() => {
                                const killInt = setInterval(() => { ac.stopEngine(); }, 1000);
                                this.failures.set("fuelLeak_kill", killInt);
                            }, 120000);
                            this.failures.set("fuelLeak", leakTimer);
                        }
                        break;

                    case "gearFront":
                        if (!this.fails.landingGear.front) {
                            this.notify("Nose gear failure.");
                            this.fails.landingGear.front = true;
                            const indices = [];
                            ac.suspensions.forEach((s, i) => {
                                if (s.name.toLowerCase().includes("front") || s.name.toLowerCase().includes("nose") || s.name.toLowerCase().includes("tail") || (s.localCollisionPoint[0] > 1.5 && Math.abs(s.localCollisionPoint[1]) < 0.8)) indices.push(i);
                            });
                            if (indices.length === 0 && ac.suspensions[2]) indices.push(2);
                            this.failures.set("gearFront", setInterval(() => {
                                indices.forEach(idx => { if (ac.suspensions[idx]) ac.suspensions[idx].collisionPoints[0][2] = 30; });
                            }, 1000));
                        }
                        break;

                    case "gearLeft":
                        if (!this.fails.landingGear.left) {
                            this.notify("Left gear failure.");
                            this.fails.landingGear.left = true;
                            const indices = [];
                            ac.suspensions.forEach((s, i) => {
                                if (s.name.toLowerCase().includes("left") || s.name.toLowerCase().includes("l") || (s.localCollisionPoint[1] > 0.8 && s.localCollisionPoint[0] < 1.5)) indices.push(i);
                            });
                            if (indices.length === 0 && ac.suspensions[0]) indices.push(0);
                            this.failures.set("gearLeft", setInterval(() => {
                                indices.forEach(idx => { if (ac.suspensions[idx]) ac.suspensions[idx].collisionPoints[0][2] = 30; });
                            }, 1000));
                        }
                        break;

                    case "gearRight":
                        if (!this.fails.landingGear.right) {
                            this.notify("Right gear failure.");
                            this.fails.landingGear.right = true;
                            const indices = [];
                            ac.suspensions.forEach((s, i) => {
                                if (s.name.toLowerCase().includes("right") || s.name.toLowerCase().includes("r_g") || (s.localCollisionPoint[1] < -0.8 && s.localCollisionPoint[0] < 1.5)) indices.push(i);
                            });
                            if (indices.length === 0 && ac.suspensions[1]) indices.push(1);
                            this.failures.set("gearRight", setInterval(() => {
                                indices.forEach(idx => { if (ac.suspensions[idx]) ac.suspensions[idx].collisionPoints[0][2] = 30; });
                            }, 1000));
                        }
                        break;

                    case "ailerons":
                        if (!this.fails.flightCtrl.ailerons) {
                            this.notify("Flight control failure (ailerons).");
                            this.fails.flightCtrl.ailerons = true;
                            this.failures.set("ailerons", setInterval(() => {
                                ac.airfoils.forEach(a => { if (a.name.toLowerCase().includes("aileron")) a.object3d._scale = [0,0,0]; });
                            }, 1000));
                        }
                        break;

                    case "elevators":
                        if (!this.fails.flightCtrl.elevators) {
                            this.notify("Flight control failure (elevators).");
                            this.fails.flightCtrl.elevators = true;
                            this.failures.set("elevators", setInterval(() => {
                                ac.airfoils.forEach(a => { if (a.name.toLowerCase().includes("elevator")) a.object3d._scale = [0,0,0]; });
                            }, 1000));
                        }
                        break;

                    case "rudder":
                        if (!this.fails.flightCtrl.rudder) {
                            this.notify("Flight control failure (rudder).");
                            this.fails.flightCtrl.rudder = true;
                            this.failures.set("rudder", setInterval(() => {
                                ac.airfoils.forEach(a => { if (a.name.toLowerCase().includes("rudder")) a.object3d._scale = [0,0,0]; });
                            }, 1000));
                        }
                        break;

                    case "electrical":
                        if (!this.fails.electrical) {
                            this.notify("Electrical failure.");
                            this.fails.electrical = true;
                            this.failures.set("electrical", setInterval(() => {
                                if (ac.cockpitSetup) ac.cockpitSetup.parts.forEach((p, idx) => { if(idx >= 1 && idx <= 5 && p.object3d) p.object3d._scale = [0,0,0]; });
                                window.geofs.autopilot.turnOff();
                                if (window.instruments) window.instruments.hide();
                            }, 1000));
                        }
                        break;

                    case "structural":
                        if (!this.fails.structural) {
                            this.notify("Significant structural damage detected.");
                            this.fails.structural = true;
                            this.failures.set("structural", setInterval(() => { window.weather.definition.turbulences = 3; }, 1000));
                        }
                        break;

                    case "flaps":
                        if (!this.fails.hydraulic.flaps) {
                            this.notify("Hydraulic failure (flaps).");
                            this.fails.hydraulic.flaps = true;
                            this.failures.set("flaps", setInterval(() => {
                                window.controls.flaps.target = Math.floor(0.6822525 * (window.geofs.animation.values.flapsSteps * 2));
                                window.controls.flaps.delta = 20;
                            }, 1000));
                        }
                        break;

                    case "brakes":
                        if (!this.fails.hydraulic.brakes) {
                            this.notify("Hydraulic failure (brakes).");
                            this.fails.hydraulic.brakes = true;
                            this.failures.set("brakes", setInterval(() => { window.controls.brakes = 0; }, 500));
                        }
                        break;

                    case "spoilers":
                        if (!this.fails.hydraulic.spoilers) {
                            this.notify("Hydraulic failure (spoilers).");
                            this.fails.hydraulic.spoilers = true;
                            this.failures.set("spoilers", setInterval(() => {
                                window.controls.airbrakes.target = 0.2;
                                window.controls.airbrakes.delta = 20;
                            }, 1000));
                        }
                        break;

                    case "pressurization":
                        if (!this.fails.pressurization) {
                            this.notify("Cabin depressurization! Get at or below 9,000 ft MSL!");
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
                            this.notify("MCAS failure! Uncommanded nose-down trim detected.");
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
                let item = this.failures.get(system);
                if (typeof item === "number") clearInterval(item);
                else if (item && typeof item.destroy === "function") item.destroy();
                this.failures.delete(system);
            }
            if (this.failures.has(`${system}_kill`)) { clearInterval(this.failures.get(`${system}_kill`)); this.failures.delete(`${system}_kill`); }

            if (system.includes("engine")) {
                let idx = parseInt(system.replace("engine", ""));
                this.fails.engines[idx].i = false;
                ac.engines[idx].thrust = ac.engines[idx]._p_thrust || 50000;
                if (this.failures.has(`engine${idx}_emitter`)) { this.failures.get(`engine${idx}_emitter`).destroy(); this.failures.delete(`engine${idx}_emitter`); }
                if (this.failures.has(`engine${idx}_color`)) { clearInterval(this.failures.get(`engine${idx}_color`)); this.failures.delete(`engine${idx}_color`); }
                this.notify(`Engine ${idx+1} restored.`, "success");
            } else {
                switch(system) {
                    case "gearFront": 
                        this.fails.landingGear.front = false; 
                        ac.suspensions.forEach(s => { if(s.name.includes("front") || s.name.includes("nose") || s.name.includes("tail") || (s.localCollisionPoint[0] > 1.5 && Math.abs(s.localCollisionPoint[1]) < 0.8)) s.collisionPoints[0][2] = 0; });
                        break;
                    case "gearLeft": 
                        this.fails.landingGear.left = false; 
                        ac.suspensions.forEach(s => { if(s.name.includes("left") || s.name.includes("l") || (s.localCollisionPoint[1] > 0.8 && s.localCollisionPoint[0] < 1.5)) s.collisionPoints[0][2] = 0; });
                        break;
                    case "gearRight": 
                        this.fails.landingGear.right = false; 
                        ac.suspensions.forEach(s => { if(s.name.includes("right") || s.name.includes("r_g") || (s.localCollisionPoint[1] < -0.8 && s.localCollisionPoint[0] < 1.5)) s.collisionPoints[0][2] = 0; });
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
                    case "structural": this.fails.structural = false; window.weather.definition.turbulences = 0; break;
                    case "flaps": this.fails.hydraulic.flaps = false; break;
                    case "brakes": this.fails.hydraulic.brakes = false; break;
                    case "spoilers": this.fails.hydraulic.spoilers = false; break;
                    case "pressurization": this.fails.pressurization = false; window.weather.definition.turbulences = 0; break;
                    case "mcas": this.fails.mcas = false; window.controls.elevatorTrimMin = -1; break;
                }
                this.notify(`${system} restored.`, "success");
            }
        }

        tick() {
            if (this.enabled) {
                // Probabilities
                for (let i in this.chances.landingGear) {
                    if (Math.random() < this.chances.landingGear[i]) this.fail(i === "gearFront" ? "gearFront" : (i === "left" ? "gearLeft" : "gearRight"));
                }
                for (let q in this.chances) {
                    if (typeof this.chances[q] === "number") {
                        if (Math.random() < this.chances[q]) this.fail(q);
                    } else if (q !== "landingGear" && q !== "engines") {
                        for (let j in this.chances[q]) { if (Math.random() < this.chances[q][j]) this.fail(j); }
                    }
                }
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
                if (btn) { btn.innerText = "DISABLE PROBABILITY"; btn.classList.replace('success', 'danger'); }
                sliders.forEach(s => s.disabled = true);
                this.tick();
                this.notify("Probability Enabled.", "info");
            } else {
                if (btn) { btn.innerText = "ENABLE PROBABILITY"; btn.classList.replace('danger', 'success'); }
                sliders.forEach(s => s.disabled = false);
                clearTimeout(this.tickInterval);
                this.notify("Probability Disabled.", "info");
            }
        }

        failAll() {
            const ac = window.geofs.aircraft.instance;
            ["gearFront", "gearLeft", "gearRight", "fuelLeak", "ailerons", "elevators", "rudder", "electrical", "structural", "flaps", "brakes", "spoilers", "pressurization", "mcas"].forEach(s => this.fail(s));
            const numEngines = (ac.engines && ac.engines.length) ? ac.engines.length : 0;
            for (let i = 0; i < numEngines; i++) this.fail("engine" + i);
        }

        reset() {
            this.failures.forEach((val, key) => this.fix(key));
            if (this.enabled) this.toggleProbability();
            window.weather.definition.turbulences = 0;
            if (window.instruments) window.instruments.show();
        }
    }

    function buildSliderBlock(title, id, failId, objectPath) {
        return `
        <div style="margin-bottom: 16px; padding: 12px; background: rgba(100,200,255,0.03); border-radius: 12px; border: 1px solid rgba(100,200,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h2 style="font-size: 13px; font-weight: 700; margin: 0; color: #fff;">${title}</h2>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 10px; color: rgba(255,255,255,0.5);">CHANCE:</span>
                    <input disabled id="input${id}" value="0%" class="addonpack-input" style="width: 45px;">
                </div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <input type="range" value="0" min="0" max="1" step="0.001" class="addonpack-range" id="slide${id}" 
                       oninput="let v = (parseFloat(this.value)*100).toFixed(1); document.getElementById('input${id}').value = v + '%'; window.damageSystem.chances.${objectPath} = parseFloat(this.value);">
                <div style="display: flex; gap: 8px;">
                    <button class="addonpack-btn danger" style="flex: 1; height: 24px; font-size: 10px;" onclick="window.damageSystem.fail('${failId}')">FAIL</button>
                    <button class="addonpack-btn success" style="flex: 1; height: 24px; font-size: 10px;" onclick="window.damageSystem.fix('${failId}')">FIX</button>
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
            menu.style.width = "440px"; menu.style.left = "20px"; menu.style.top = "80px";
            
            let htmlContent = `
                <div class="addonpack-card-header">
                    <span>⚠️ Failure Simulator v3.9</span>
                    <button onclick="document.getElementById('geofs-failure-menu').classList.remove('active')" style="background:none; border:none; color:rgba(255,255,255,0.5); font-size:16px;">✕</button>
                </div>
                <div class="addonpack-card-content" style="max-height: 75vh; overflow-y: auto; padding: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; position: sticky; top: -20px; background: rgba(15, 25, 45, 0.95); padding: 10px 0 15px 0; z-index: 10; border-bottom: 1px solid rgba(100,200,255,0.1); backdrop-filter: blur(12px);">
                        <button class="addonpack-btn success" id="enBtn" style="grid-column: 1 / -1;" onclick="window.damageSystem.toggleProbability()">ENABLE PROBABILITY</button>
                        <button class="addonpack-btn danger" onclick="window.damageSystem.failAll()">FAIL ALL</button>
                        <button class="addonpack-btn success" onclick="window.damageSystem.reset()">FIX ALL</button>
                    </div>
            `;

            const h1 = "font-size: 11px; font-weight: 800; color: #64c8ff; margin: 30px 0 15px 0; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; gap: 10px;";
            const span = "<span style='flex: 1; height: 1px; background: linear-gradient(to right, rgba(100,200,255,0.2), transparent);'></span>";
            const buildCat = (fails, fixes) => `<div style="display: flex; gap: 5px;"><button class="addonpack-btn danger" style="padding: 2px 6px; font-size: 9px; background: rgba(239,68,68,0.1);" onclick="${fails.map(f => `window.damageSystem.fail('${f}')`).join(';')}">X</button><button class="addonpack-btn success" style="padding: 2px 6px; font-size: 9px; background: rgba(34,197,94,0.1);" onclick="${fixes.map(f => `window.damageSystem.fix('${f}')`).join(';')}">✓</button></div>`;

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1}">Landing Gear ${span}</h1> ${buildCat(['gearFront', 'gearLeft', 'gearRight'], ['gearFront', 'gearLeft', 'gearRight'])}</div>`;
            htmlContent += buildSliderBlock("Nose/Tail Gear", "GearF", "gearFront", "landingGear.gearFront");
            htmlContent += buildSliderBlock("Main Gear (Left)", "GearL", "gearLeft", "landingGear.left");
            htmlContent += buildSliderBlock("Main Gear (Right)", "GearR", "gearRight", "landingGear.right");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1}">Fuel & Systems ${span}</h1> ${buildCat(['fuelLeak'], ['fuelLeak'])}</div>`;
            htmlContent += buildSliderBlock("Fuel Tank Leak", "Fuel", "fuelLeak", "fuelLeak");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1}">Flight Controls ${span}</h1> ${buildCat(['ailerons', 'elevators', 'rudder'], ['ailerons', 'elevators', 'rudder'])}</div>`;
            htmlContent += buildSliderBlock("Aileron Jam", "Ail", "ailerons", "flightCtrl.ailerons");
            htmlContent += buildSliderBlock("Elevator Jam", "Elev", "elevators", "flightCtrl.elevators");
            htmlContent += buildSliderBlock("Rudder Jam", "Rud", "rudder", "flightCtrl.rudder");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1}">Avionics ${span}</h1> ${buildCat(['electrical'], ['electrical'])}</div>`;
            htmlContent += buildSliderBlock("Main Electrical Bus", "Elec", "electrical", "electrical");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1}">Hydraulics ${span}</h1> ${buildCat(['flaps', 'brakes', 'spoilers'], ['flaps', 'brakes', 'spoilers'])}</div>`;
            htmlContent += buildSliderBlock("Flaps Actuator", "Flaps", "flaps", "hydraulic.flaps");
            htmlContent += buildSliderBlock("Wheel Brakes", "Brakes", "brakes", "hydraulic.brakes");
            htmlContent += buildSliderBlock("Ground Spoilers", "Spoil", "spoilers", "hydraulic.spoilers");

            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1}">Environment ${span}</h1> ${buildCat(['structural', 'pressurization', 'mcas'], ['structural', 'pressurization', 'mcas'])}</div>`;
            htmlContent += buildSliderBlock("Structural Fatigue", "Struct", "structural", "structural");
            htmlContent += buildSliderBlock("Cabin Pressurization", "Press", "pressurization", "pressurization");
            htmlContent += buildSliderBlock("MCAS Error", "MCAS", "mcas", "mcas");

            const numEngines = (geofs.aircraft.instance.engines && geofs.aircraft.instance.engines.length) ? geofs.aircraft.instance.engines.length : 0;
            htmlContent += `<div style="display:flex; align-items:center; justify-content:space-between;"><h1 style="${h1}">Engines ${span}</h1> ${buildCat(Array.from({length: numEngines}, (_, i) => `engine${i}`), Array.from({length: numEngines}, (_, i) => `engine${i}`))}</div>`;
            for (let i = 0; i < numEngines; i++) htmlContent += buildSliderBlock(`Engine ${i+1}`, `Eng${i}`, `engine${i}`, `engines[${i}]`);

            htmlContent += `</div>`;
            menu.innerHTML = htmlContent;
            document.body.appendChild(menu);
            if (window.initAddonDraggable) window.initAddonDraggable(menu);
        }
        menu.classList.toggle('active');
    };

    window.initDamageSystem = function() {
        if (document.getElementById('geofs-fail-btn')) return;
        const btn = document.createElement('div');
        btn.id = 'geofs-fail-btn';
        btn.innerHTML = `<button class="addonpack-btn danger" style="position:fixed; right:20px; bottom:20px; z-index:10000;" onclick="window.openDamageMenu()">FAILURES</button>`;
        document.body.appendChild(btn);
    };

    if (window.SafeInit) SafeInit("Failure Simulator", window.initDamageSystem);
    else window.initDamageSystem();
})();
