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
            this.enabled = false;
            this.failures = []; // Holds intervals
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
                            setTimeout(() => {
                                this.failures.push(setInterval(() => { ac.stopEngine(); }, 1000));
                            }, 120000);
                        }
                        break;

                    case "gearFront":
                        if (!this.fails.landingGear.front) {
                            if (window.vNotify) vNotify.error({text: "Nose gear failure"});
                            this.fails.landingGear.front = true;
                            let fG = 2;
                            for (let i = 0; i < ac.suspensions.length; i++) {
                                if (ac.suspensions[i].name.includes("front") || ac.suspensions[i].name.includes("nose") || ac.suspensions[i].name.includes("tail")) fG = i;
                            }
                            this.failures.push(setInterval(() => { ac.suspensions[fG].collisionPoints[0][2] = 30; }, 1000));
                        }
                        break;

                    case "gearLeft":
                        if (!this.fails.landingGear.left) {
                            if (window.vNotify) vNotify.error({text: "Left gear failure"});
                            this.fails.landingGear.left = true;
                            let lG = 0;
                            for (let i = 0; i < ac.suspensions.length; i++) {
                                if (ac.suspensions[i].name.includes("left") || ac.suspensions[i].name.includes("l")) lG = i;
                            }
                            this.failures.push(setInterval(() => { ac.suspensions[lG].collisionPoints[0][2] = 30; }, 1000));
                        }
                        break;

                    case "gearRight":
                        if (!this.fails.landingGear.right) {
                            if (window.vNotify) vNotify.error({text: "Right gear failure"});
                            this.fails.landingGear.right = true;
                            let rG = 1;
                            for (let i = 0; i < ac.suspensions.length; i++) {
                                if (ac.suspensions[i].name.includes("right") || ac.suspensions[i].name.includes("r_g")) rG = i;
                            }
                            this.failures.push(setInterval(() => { ac.suspensions[rG].collisionPoints[0][2] = 30; }, 1000));
                        }
                        break;

                    case "ailerons":
                        if (!this.fails.flightCtrl.ailerons) {
                            if (window.vNotify) vNotify.error({text: "Flight control failure (ailerons)"});
                            this.fails.flightCtrl.ailerons = true;
                            this.failures.push(setInterval(() => {
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
                            this.failures.push(setInterval(() => {
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
                            this.failures.push(setInterval(() => {
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
                            this.failures.push(setInterval(() => {
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
                            this.failures.push(setInterval(() => { window.weather.definition.turbulences = 3; }, 1000));
                        }
                        break;

                    case "flaps":
                        if (!this.fails.hydraulic.flaps) {
                            if (window.vNotify) vNotify.error({text: "Hydraulic failure (flaps)"});
                            this.fails.hydraulic.flaps = true;
                            this.failures.push(setInterval(() => {
                                window.controls.flaps.target = Math.floor(0.6822525 * (window.geofs.animation.values.flapsSteps * 2));
                                window.controls.flaps.delta = 20;
                            }, 1000));
                        }
                        break;

                    case "brakes":
                        if (!this.fails.hydraulic.brakes) {
                            if (window.vNotify) vNotify.error({text: "Hydraulic failure (brakes)"});
                            this.fails.hydraulic.brakes = true;
                            this.failures.push(setInterval(() => { window.controls.brakes = 0; }, 500));
                        }
                        break;

                    case "spoilers":
                        if (!this.fails.hydraulic.spoilers) {
                            if (window.vNotify) vNotify.error({text: "Hydraulic failure (spoilers)"});
                            this.fails.hydraulic.spoilers = true;
                            this.failures.push(setInterval(() => {
                                window.controls.airbrakes.target = 0.2;
                                window.controls.airbrakes.delta = 20;
                            }, 1000));
                        }
                        break;

                    case "pressurization":
                        if (!this.fails.pressurization) {
                            if (window.vNotify) vNotify.error({text: "Cabin depressurization! Get at or below 9,000 ft MSL!"});
                            this.fails.pressurization = true;
                            this.failures.push(setInterval(() => {
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
                            this.fails.mcas = true;
                            this.mcasTime = Date.now();
                            this.mcasRandT = Math.floor(Math.random()*10000);
                            this.mcasActive = true;
                            window.controls.elevatorTrimMin = -10;
                            this.failures.push(setInterval(() => {
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

        tick() {
            if (this.enabled) {
                // Landing Gear
                for (let i in this.chances.landingGear) {
                    if (Math.random() < this.chances.landingGear[i]) {
                        this.fail("gear" + (i[0].toUpperCase() + i.substr(1)));
                    }
                }
                // General Systems
                for (let q in this.chances) {
                    if (typeof this.chances[q] === "number") {
                        if (Math.random() < this.chances[q]) this.fail(q);
                    } else if (q !== "landingGear" && q !== "engines") {
                        for (let j in this.chances[q]) {
                            if (Math.random() < this.chances[q][j]) this.fail(j);
                        }
                    }
                }
                // Engines
                for (let e = 0; e < this.chances.engines.length; e++) {
                    if (Math.random() < this.chances.engines[e]) this.fail("engine" + e);
                }
                setTimeout(() => { this.tick(); }, 60000);
            }
        }

        reset() {
            for (let i in this.failures) clearInterval(this.failures[i]);
            this.failures = [];
            this.enabled = false;
            if (document.getElementById('enBtn')) {
                document.getElementById('enBtn').style.display = 'inline-block';
            }
            if (window.instruments) window.instruments.show();
            window.weather.definition.turbulences = 0;
            if (window.vNotify) vNotify.success({text: "All systems reset."});
        }
    }

    // Helper function to build the stylized glass UI blocks
    function buildSliderBlock(title, id, failId, objectPath) {
        return `
        <div style="margin-bottom: 16px; padding: 10px; background: rgba(100,200,255,0.03); border-radius: 10px; border: 1px solid rgba(100,200,255,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <h2 style="font-size: 13px; font-weight: 700; margin: 0; color: #fff; letter-spacing: 0.3px;">${title}</h2>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 500;">CHANCE/MIN:</span>
                    <input disabled id="input${id}" value="0%" class="addonpack-input" style="width: 45px;">
                </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
                <input type="range" value="0" min="0" max="1" step="0.001" class="addonpack-range" id="slide${id}" 
                       oninput="let val = (parseFloat(this.value)*100).toFixed(1); document.getElementById('input${id}').value = val + '%'; window.damageSystem.chances.${objectPath} = parseFloat(this.value);">
                <button class="addonpack-btn danger" style="padding: 4px 12px; font-size: 10px; height: 26px;" onclick="window.damageSystem.fail('${failId}')">FORCE FAIL</button>
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
            menu.style.width = "420px";
            menu.style.left = "20px";
            menu.style.top = "80px";
            menu.style.bottom = "auto";
            
            // Header
            let htmlContent = `
                <div class="addonpack-card-header">
                    <span>⚠️ Failure Simulator v3.9</span>
                    <button onclick="document.getElementById('geofs-failure-menu').classList.remove('active')" style="background:none; border:none; color:rgba(255,255,255,0.5); cursor:pointer; font-size:16px; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">✕</button>
                </div>
                <div class="addonpack-card-content" style="max-height: 70vh; overflow-y: auto; padding: 20px; scrollbar-width: thin; scrollbar-color: rgba(100,200,255,0.2) transparent;">
                    <div style="display: flex; gap: 12px; margin-bottom: 24px; position: sticky; top: 0; background: rgba(15, 25, 45, 0.95); padding-bottom: 15px; z-index: 10; border-bottom: 1px solid rgba(100,200,255,0.1); backdrop-filter: blur(8px);">
                        <button class="addonpack-btn success" id="enBtn" style="flex: 1;" onclick="window.damageSystem.enabled=true; window.damageSystem.tick(); this.style.display='none';">ENABLE SIM</button>
                        <button class="addonpack-btn danger" style="flex: 1;" onclick="window.damageSystem.reset()">RESET ALL</button>
                    </div>
            `;

            const h1Style = "font-size: 11px; font-weight: 800; color: #64c8ff; margin: 25px 0 12px 0; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; gap: 10px;";
            const h1Span = "<span style='flex: 1; height: 1px; background: linear-gradient(to right, rgba(100,200,255,0.3), transparent);'></span>";

            // Sections
            htmlContent += `<h1 style="${h1Style}">Landing Gear ${h1Span}</h1>`;
            htmlContent += buildSliderBlock("Nose/Tail Gear", "GearF", "gearFront", "landingGear.front");
            htmlContent += buildSliderBlock("Main Gear (Left)", "GearL", "gearLeft", "landingGear.left");
            htmlContent += buildSliderBlock("Main Gear (Right)", "GearR", "gearRight", "landingGear.right");

            htmlContent += `<h1 style="${h1Style}">Fuel Systems ${h1Span}</h1>`;
            htmlContent += buildSliderBlock("Fuel Tank Leak", "Fuel", "fuelLeak", "fuelLeak");

            htmlContent += `<h1 style="${h1Style}">Flight Control Surfaces ${h1Span}</h1>`;
            htmlContent += buildSliderBlock("Aileron Jam", "Ail", "ailerons", "flightCtrl.ailerons");
            htmlContent += buildSliderBlock("Elevator Jam", "Elev", "elevators", "flightCtrl.elevators");
            htmlContent += buildSliderBlock("Rudder Jam", "Rud", "rudder", "flightCtrl.rudder");

            htmlContent += `<h1 style="${h1Style}">Avionics & Power ${h1Span}</h1>`;
            htmlContent += buildSliderBlock("Main Electrical Bus", "Elec", "electrical", "electrical");

            htmlContent += `<h1 style="${h1Style}">Airframe & Hyd ${h1Span}</h1>`;
            htmlContent += buildSliderBlock("Structural Fatigue", "Struct", "structural", "structural");
            htmlContent += buildSliderBlock("Flaps Actuator", "Flap", "flaps", "hydraulic.flaps");
            htmlContent += buildSliderBlock("Wheel Brakes", "Brake", "brakes", "hydraulic.brakes");
            htmlContent += buildSliderBlock("Ground Spoilers", "Spoil", "spoilers", "hydraulic.spoilers");

            htmlContent += `<h1 style="${h1Style}">Environment ${h1Span}</h1>`;
            htmlContent += buildSliderBlock("Cabin Pressurization", "Press", "pressurization", "pressurization");
            htmlContent += buildSliderBlock("MCAS Error", "MCAS", "mcas", "mcas");

            htmlContent += `<h1 style="${h1Style}">Engine Powerplants ${h1Span}</h1>`;
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
