// ==UserScript==
// @name         GeoFS-V3.9_Failure-Simulator
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Advanced emergency simulation framework for GeoFS v3.9.
// @author       AwesomeOddEven-NightKeys-LunarBlink
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Design-System/main/design-system_standalone.user.js
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Core-Library/main/core-library_standalone.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    const damageUrl = 'https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Failure-Simulator/main/failure-simulator.js';

    function loadDamageSystem() {
        if (window.damageSystem) return;
        const script = document.createElement('script');
        script.src = damageUrl;
        document.head.appendChild(script);
        console.log('GeoFS [Damage]: Main logic fetched from CDN.');
    }

    console.log('GeoFS [Damage]: Waiting for Core and Design systems...');

    const checker = setInterval(() => {
        // Ensure both dependencies are active before launching
        const coreReady = !!window.SafeInit;
        const designReady = !!document.getElementById('geofs-addon-design-system');

        if (coreReady && designReady) {
            clearInterval(checker);
            console.log('GeoFS [Damage]: Foundations confirmed. Loading Simulator...');
            loadDamageSystem();
        }
    }, 1000);
})();
