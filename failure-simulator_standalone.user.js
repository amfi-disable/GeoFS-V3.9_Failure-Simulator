// ==UserScript==
// @name         GeoFS-V3.9_Failure-Simulator
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Advanced emergency simulation framework for GeoFS v3.9.
// @author       AwesomeOddEven-NightKeys-LunarBlink
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Design-System/main/design-system_standalone.user.js
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Core-Library/main/core-library_standalone.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const failureSimulatorUrl = 'https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Failure-Simulator/main/failure-simulator.js';

    function loadFailureSimulatorPro() {
        if (window.failureSimulatorPro) return;
        const script = document.createElement('script');
        script.src = failureSimulatorUrl;
        document.head.appendChild(script);
        console.log('[GeoFS-V3.9_Failure-Simulator] Main logic script injected.');
    }

    console.log('[GeoFS-V3.9_Failure-Simulator] Waiting for Core and Design foundations...');

    const checker = setInterval(() => {
        // Ensure both dependencies are active before launching
        const coreReady = !!window.SafeInit;
        const designReady = !!document.getElementById('geofs-addon-design-system');

        if (coreReady && designReady) {
            clearInterval(checker);
            console.log('[GeoFS-V3.9_Failure-Simulator] Foundations confirmed. Booting Pro Simulator...');
            loadFailureSimulatorPro();
        }
    }, 1000);
})();
