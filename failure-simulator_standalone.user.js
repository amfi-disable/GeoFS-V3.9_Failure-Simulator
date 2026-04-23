// ==UserScript==
// @name         GeoFS Damage & Failures System (Standalone)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Advanced engine and system failures for GeoFS.
// @author       AwesomeOddEven-NightKeys-LunarBlink
// @match        https://www.geo-fs.com/geofs.php*
// @match        https://*.geo-fs.com/geofs.php*
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-Design-System/main/standalone.user.js
// @require      https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-Core-Library/main/standalone.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const damageUrl = 'https://raw.githack.com/AwesomeOddEven-NightKeys-LunarBlink/GeoFS-Damage-System/main/src/damage-logic.js';

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
