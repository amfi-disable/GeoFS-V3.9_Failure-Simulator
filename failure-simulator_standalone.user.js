// ==UserScript==
// @name         GeoFS-V3.9_Failure-Simulator
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Advanced engine and system failures for GeoFS v3.9.
// @author       AwesomeOddEven-NightKeys-LunarBlink
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Design-System/main/design-system_standalone.user.js
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Core-Library/main/core-library_standalone.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // UPDATED: Points to the new repo name and the core logic file
    const damageUrl = 'https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-V3.9_Failure-Simulator/main/failure-simulator.js';

    function loadDamageSystem() {
        if (window.damageSystem) return;
        const script = document.createElement('script');
        script.src = damageUrl;
        document.head.appendChild(script);
        console.log('GeoFS [Damage]: Standalone module loaded.');
    }

    // Wait for foundations then load
    const checker = setInterval(() => {
        if (window.SafeInit && document.getElementById('geofs-addon-design-system')) {
            clearInterval(checker);
            loadDamageSystem();
        }
    }, 500);
})();
