/**
 * GeoFS-V3.9_Failure-Simulator
 * Advanced mechanical failures and maintenance UI.
 */

(function() {
    'use strict';

    class DamageSystem {
        constructor() {
            this.ac = geofs.aircraft.instance;
            this.enabled = true;
            this.fails = { 
                engines: (this.ac.engines || []).map(() => false),
                landingGear: false,
                flaps: false
            };
            this.intervals = {};
        }

        fail(id) {
            if (id.startsWith('engine')) {
                const idx = parseInt(id.replace('engine', ''));
                if (!this.fails.engines[idx]) {
                    this.fails.engines[idx] = true;
                    if (window.vNotify) vNotify.error({text: `Engine ${idx + 1} Failure!`});
                    geofs.aircraft.instance.engines[idx].thrust = 0;
                    this.intervals[id] = setInterval(() => { geofs.aircraft.instance.engines[idx].thrust = 0; }, 100);
                    this.updateUI();
                }
            }
        }

        fixAll() {
            Object.keys(this.intervals).forEach(id => clearInterval(this.intervals[id]));
            this.intervals = {};
            this.fails.engines = this.fails.engines.map(() => false);
            if (window.vNotify) vNotify.info({text: "All systems operational."});
            this.updateUI();
        }

        updateUI() {
            const menu = document.getElementById('geofs-failure-menu');
            if (menu) {
                // Future: Update button colors based on failure state
            }
        }
    }

    window.createFailureMenu = function() {
        // Build the main container using Design System classes
        const menu = document.createElement('div');
        menu.id = 'geofs-failure-menu';
        menu.className = 'addonpack-card'; // From Design System CSS
        
        menu.innerHTML = `
            <div class="addonpack-card-header">
                <span>Emergency Command</span>
                <button onclick="document.getElementById('geofs-failure-menu').classList.remove('active')" style="background:none; border:none; color:white; cursor:pointer;">✕</button>
            </div>
            <div class="addonpack-card-content">
                <div class="addonpack-category">Engine Systems</div>
                <div class="addonpack-block-container">
                    ${geofs.aircraft.instance.engines.map((_, i) => `
                        <button class="addonpack-block" onclick="damageSystem.fail('engine${i}')">ENG ${i + 1}</button>
                    `).join('')}
                </div>
                <div style="margin-top:15px; border-top:1px solid rgba(100,200,255,0.1); padding-top:10px;">
                    <button class="addonpack-sub-item" style="width:100%; text-align:center; background:rgba(34,197,94,0.2);" onclick="damageSystem.fixAll()">Reset All Systems</button>
                </div>
            </div>
        `;

        document.body.appendChild(menu);

        // Make it draggable using the Core Library utility
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
        
        menu.classList.toggle('active');
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
