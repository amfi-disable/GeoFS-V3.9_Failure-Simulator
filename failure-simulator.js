/**
 * GeoFS-V3.9_Failure-Simulator
 * Advanced mechanical failures and emergency UI.
 * Standardized to match GeoFS-V3.9_Addon-Pack UI structures.
 */

(function() {
    'use strict';

    class DamageSystem {
        constructor() {
            this.ac = geofs.aircraft?.instance;
            this.enabled = true;
            this.intervals = {};
            this.fails = { 
                engines: (geofs.aircraft?.instance?.engines || []).map(() => false),
                ailerons: false,
                rudder: false,
                flaps: false
            };
        }

        fail(id) {
            const ac = geofs.aircraft?.instance;
            if (!ac) return;

            if (id.startsWith('engine')) {
                const idx = parseInt(id.replace('engine', ''));
                if (!this.fails.engines[idx]) {
                    this.fails.engines[idx] = true;
                    if (window.vNotify) vNotify.error({text: `Engine ${idx + 1} Failure!`});
                    ac.engines[idx].thrust = 0;
                    this.intervals[id] = setInterval(() => { 
                        if (geofs.aircraft?.instance?.engines[idx]) {
                            geofs.aircraft.instance.engines[idx].thrust = 0; 
                        }
                    }, 100);
                }
            } else if (id === 'ailerons' || id === 'rudder' || id === 'flaps') {
                this.fails[id] = true;
                if (window.vNotify) vNotify.error({text: `${id.toUpperCase()} Failure!`});
                // Additional physics logic can be added here
            }
            console.log(`GeoFS [Damage]: Component Failed: ${id}`);
        }

        fixAll() {
            Object.keys(this.intervals).forEach(id => clearInterval(this.intervals[id]));
            this.intervals = {};
            if (geofs.aircraft?.instance?.engines) {
                this.fails.engines = geofs.aircraft.instance.engines.map(() => false);
            }
            this.fails.ailerons = false;
            this.fails.rudder = false;
            this.fails.flaps = false;
            if (window.vNotify) vNotify.info({text: "All systems operational."});
        }
    }

    window.createFailureMenu = function() {
        const ac = geofs.aircraft?.instance;
        if (!ac) return;

        let menu = document.getElementById('geofs-failure-menu');
        if (menu) return;

        menu = document.createElement('div');
        menu.id = 'geofs-failure-menu';
        menu.className = 'addonpack-card'; // From Design-System
        
        // Structure: Header -> Places (Dropdowns) -> Lists (Sub-items)
        menu.innerHTML = `
            <div class="addonpack-card-header">
                <span>Emergency Command</span>
                <button onclick="document.getElementById('geofs-failure-menu').classList.remove('active')" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
            </div>
            <div class="addonpack-card-content">
                
                <div class="addonpack-dropdown" onclick="this.nextElementSibling.classList.toggle('open'); this.querySelector('.addonpack-chevron').classList.toggle('open')">
                    <span class="addonpack-chevron">▶</span> Engine Systems
                </div>
                <div class="addonpack-content">
                    <div class="addonpack-block-container">
                        ${ac.engines.map((_, i) => `
                            <button class="addonpack-block" onclick="damageSystem.fail('engine${i}')">ENG ${i + 1}</button>
                        `).join('')}
                    </div>
                </div>

                <div class="addonpack-dropdown" onclick="this.nextElementSibling.classList.toggle('open'); this.querySelector('.addonpack-chevron').classList.toggle('open')">
                    <span class="addonpack-chevron">▶</span> Flight Controls
                </div>
                <div class="addonpack-content">
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('ailerons')">Jammed Ailerons</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('rudder')">Rudder Hard-Over</div>
                    <div class="addonpack-sub-item" onclick="damageSystem.fail('flaps')">Flap Asymmetry</div>
                </div>

                <div style="margin-top:15px; border-top:1px solid rgba(100,200,255,0.1); padding-top:10px;">
                    <button class="addonpack-sub-item" style="width:100%; text-align:center; background:rgba(34,197,94,0.2);" onclick="damageSystem.fixAll()">Reset All Systems</button>
                </div>
            </div>
        `;

        document.body.appendChild(menu);

        // Standardized Draggable logic from Core-Library
        if (window.initAddonDraggable) {
            window.initAddonDraggable(menu);
        }
    };

    window.openDamageMenu = function() {
        if (!window.damageSystem) window.damageSystem = new DamageSystem();
        
        let menu = document.getElementById('geofs-failure-menu');
        if (!menu) {
            window.createFailureMenu();
            menu = document.getElementById('geofs-failure-menu');
        }
        
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
                
                // Fixed positioning: Bottom-right, clearing fullscreen
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
                console.log("GeoFS [Damage]: Standardized UI Button Injected.");
            }
        }, 1000);
    };

    // SafeInit protocol from Core-Library
    if (window.SafeInit) {
        window.SafeInit('Damage System', window.initDamageSystem);
    } else {
        window.initDamageSystem();
    }
})();
