const fs = require("fs");
let html = fs.readFileSync("/tmp/geosphere_index.html", "utf8");

// Ensure </script> exists before <!-- ====
if (html.includes("    }\n<!-- =================================================================")) {
  html = html.replace(
    "    }\n<!-- =================================================================",
    "    }\n    </script>\n\n<!-- ================================================================="
  );
}

const captureHelper = `
    // --- UNIFIED LOCATION CAPTURE FOR MAP & SHADED POLYGONS ---
    async function captureLocationToForm(lat, lng, tractId = null, label = null, meta = {}) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        
        // 1. Update form coordinates field
        const coordsField = document.getElementById('formCoords');
        if (coordsField) {
            coordsField.value = numLat.toFixed(4) + ', ' + numLng.toFixed(4);
        }

        // 2. Clear & place map marker
        if (typeof markerGroup !== 'undefined' && markerGroup) {
            markerGroup.clearLayers();
            const popupLabel = label ? '📍 ' + label + '<br>' + numLat.toFixed(4) + ', ' + numLng.toFixed(4) : '📍 Selected: ' + numLat.toFixed(4) + ', ' + numLng.toFixed(4);
            L.marker([numLat, numLng]).addTo(markerGroup)
                .bindPopup('<span class="text-xs font-mono text-slate-900">' + popupLabel + '</span>')
                .openPopup();
        }

        // 3. Resolve & update Census Tract field
        const tractField = document.getElementById('formTract');
        let resolvedTract = tractId;
        if (resolvedTract) {
            if (tractField) tractField.value = resolvedTract;
        } else if (typeof fetchCensusTractDataApi === 'function') {
            resolvedTract = await fetchCensusTractDataApi(numLat, numLng);
        }

        // 4. Notify GeoSphere Lead Bridge if active
        if (window.GeoSphereLeadBridge && window.GeoSphereLeadBridge.captureTouch) {
            window.GeoSphereLeadBridge.captureTouch(numLat, numLng, resolvedTract, label, meta);
        }

        return { lat: numLat, lng: numLng, tract: resolvedTract };
    }
`;

html = html.replace("    // --- 5. GEOGRAPHIC COMPUTATION & RENDER ---", captureHelper + "\n    // --- 5. GEOGRAPHIC COMPUTATION & RENDER ---");

// Also ensure LMI and USDA layer clicks call captureLocationToForm
const lmiTarget = "        renderLMITracts(oregonTractGeoJSON, oregonLMITracts);";
console.log("Has renderLMITracts call:", html.includes(lmiTarget));

fs.writeFileSync("/tmp/geosphere_test.html", html);
console.log("Wrote /tmp/geosphere_test.html successfully.");
