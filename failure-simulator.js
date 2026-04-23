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
        <div style="margin-bottom: 12px;">
            <h2 style="font-size: 14px; margin: 0 0 4px 0; color: #fff;">${title}</h2>
            <span style="font-size: 11px; color: rgba(255,255,255,0.7); vertical-align: top;">Chance per min: </span>
            <input type="range" value="0" min="0" max="1" step="0.01" id="slide${id}" 
                   onchange="document.getElementById('input${id}').value = this.value; window.damageSystem.chances.${objectPath} = parseFloat(this.value);" 
                   style="vertical-align: bottom; width: 120px;">
            <input disabled id="input${id}" value="0" style="width: 35px; background: rgba(0,0,0,0.3); border: 1px solid rgba(100,200,255,0.3); color: #64c8ff; border-radius: 4px; text-align: center; font-size: 11px; margin-left: 5px;">
            <button class="addonpack-block" style="display:inline-block; width:auto; padding: 2px 10px; margin-left: 5px; height: 20px;" onclick="window.damageSystem.fail('${failId}')">FAIL</button>
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
            menu.style.width = "400px";
            menu.style.left = "20px";
            menu.style.top = "80px";
            menu.style.bottom = "auto";
            
            // Header
            let htmlContent = `
                <div class="addonpack-card-header">
                    <span>Failures & Emergencies</span>
                    <button onclick="document.getElementById('geofs-failure-menu').classList.remove('active')" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
                </div>
                <div class="addonpack-card-content" style="max-height: 65vh; overflow-y: auto; padding-right: 10px;">
                    <p style="font-size: 11px; color: rgba(255,255,255,0.6); margin-top: 0;">Note: Some failures may require a manual refresh of the page.</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button class="addonpack-sub-item" id="enBtn" style="flex: 1; background: rgba(34,197,94,0.2); border-color: #22c55e;" onclick="window.damageSystem.enabled=true; window.damageSystem.tick(); this.style.display='none';">Enable Probability</button>
                        <button class="addonpack-sub-item" style="flex: 1; background: rgba(239,68,68,0.2); border-color: #ef4444;" onclick="window.damageSystem.reset()">RESET ALL</button>
                    </div>
            `;

            const h1Style = "font-size: 16px; color: #64c8ff; margin: 15px 0 10px 0; border-bottom: 1px solid rgba(100,200,255,0.2); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;";

            // Landing Gear
            htmlContent += `<h1 style="${h1Style}">Landing Gear</h1>`;
            htmlContent += buildSliderBlock("Front", "GearF", "gearFront", "landingGear.front");
            htmlContent += buildSliderBlock("Left", "GearL", "gearLeft", "landingGear.left");
            htmlContent += buildSliderBlock("Right", "GearR", "gearRight", "landingGear.right");

            // Fuel
            htmlContent += `<h1 style="${h1Style}">Fuel Leak</h1>`;
            htmlContent += buildSliderBlock("System Status", "Fuel", "fuelLeak", "fuelLeak");

            // Flight Control
            htmlContent += `<h1 style="${h1Style}">Flight Control</h1>`;
            htmlContent += buildSliderBlock("Ailerons", "Ail", "ailerons", "flightCtrl.ailerons");
            htmlContent += buildSliderBlock("Elevators", "Elev", "elevators", "flightCtrl.elevators");
            htmlContent += buildSliderBlock("Rudder", "Rud", "rudder", "flightCtrl.rudder");

            // Electrical
            htmlContent += `<h1 style="${h1Style}">Electrical</h1>`;
            htmlContent += buildSliderBlock("Main Bus", "Elec", "electrical", "electrical");

            // Structural
            htmlContent += `<h1 style="${h1Style}">Structural</h1>`;
            htmlContent += buildSliderBlock("Airframe Stress", "Struct", "structural", "structural");

            // Hydraulic
            htmlContent += `<h1 style="${h1Style}">Hydraulic</h1>`;
            htmlContent += buildSliderBlock("Flaps", "Flap", "flaps", "hydraulic.flaps");
            htmlContent += buildSliderBlock("Brakes", "Brake", "brakes", "hydraulic.brakes");
            htmlContent += buildSliderBlock("Spoilers", "Spoil", "spoilers", "hydraulic.spoilers");

            // Pressurization
            htmlContent += `<h1 style="${h1Style}">Cabin Pressurization</h1>`;
            htmlContent += buildSliderBlock("Seal Integrity", "Press", "pressurization", "pressurization");

            // MCAS
            htmlContent += `<h1 style="${h1Style}">MCAS</h1>`;
            htmlContent += buildSliderBlock("Trim System", "MCAS", "mcas", "mcas");

            // Engines
            htmlContent += `<h1 style="${h1Style}">Engines</h1>`;
            for (let i = 0; i < window.geofs.aircraft.instance.engines.length; i++) {
                htmlContent += buildSliderBlock(`Engine ${i+1}`, `Eng${i}`, `engine${i}`, `engines[${i}]`);
            }

            htmlContent += `</div>`; // Close content div
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
