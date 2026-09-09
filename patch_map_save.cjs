const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const target1 = `  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);`;
const replacement1 = `  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);`; // just locating, actually I need to modify PropertyTracker.tsx

// Let's modify PropertyTracker.tsx
code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const importTarget = `import { useState, useRef, useEffect } from "react";`;
const importReplacement = `import { useState, useRef, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";`;

if (!code.includes('import { doc, setDoc, getDoc } from "firebase/firestore";')) {
  code = code.replace(importTarget, importReplacement);
}

const stateTarget = `  const [calculatorProperty, setCalculatorProperty] = useState<PropertyListing | null>(null);`;
const stateReplacement = `  const [calculatorProperty, setCalculatorProperty] = useState<PropertyListing | null>(null);
  const [isSavingLayer, setIsSavingLayer] = useState(false);
  const [savedLayerId, setSavedLayerId] = useState<string | null>(null);
  
  // Load saved layer on mount
  useEffect(() => {
    const loadSavedLayer = async () => {
      if (!profile?.id) return;
      try {
        const layerRef = doc(db, 'user_map_layers', profile.id);
        const layerSnap = await getDoc(layerRef);
        if (layerSnap.exists()) {
          const data = layerSnap.data();
          if (data.propertyIds && Array.isArray(data.propertyIds)) {
            setSelectedPropertyIds(data.propertyIds);
            setSavedLayerId(profile.id);
          }
        }
      } catch (err) {
        console.error("Failed to load map layer:", err);
      }
    };
    loadSavedLayer();
  }, [profile?.id]);
  
  const handleSaveMapLayer = async () => {
    if (!profile?.id) {
      alert("You must be logged in to save a custom map layer.");
      return;
    }
    
    if (selectedPropertyIds.length === 0) {
      alert("Please select at least one property to save to your custom layer.");
      return;
    }

    setIsSavingLayer(true);
    try {
      const layerRef = doc(db, 'user_map_layers', profile.id);
      await setDoc(layerRef, {
        propertyIds: selectedPropertyIds,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSavedLayerId(profile.id);
      alert(\`Success! Your custom map layer (\${selectedPropertyIds.length} properties) has been saved to your profile.\\n\\nWhenever you log in from any device, this exact map layer will be restored.\`);
    } catch (err) {
      console.error("Failed to save map layer:", err);
      alert("An error occurred while saving your map layer. Please try again.");
    } finally {
      setIsSavingLayer(false);
    }
  };`;

code = code.replace(stateTarget, stateReplacement);

const btnTarget = `<button
              onClick={() => {
                 const listToSync = properties.filter(p => selectedPropertyIds.includes(p.id));`;

const btnReplacement = `<button
              onClick={handleSaveMapLayer}
              disabled={isSavingLayer}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              title="Save this exact selection of properties to your profile to restore on any device"
            >
              <Map className="w-4 h-4 text-amber-200" />
              <span>{isSavingLayer ? "Saving..." : "Save Custom Layer"} {selectedPropertyIds.length > 0 ? \`(\${selectedPropertyIds.length})\` : ""}</span>
            </button>
            <button
              onClick={() => {
                 const listToSync = properties.filter(p => selectedPropertyIds.includes(p.id));`;

code = code.replace(btnTarget, btnReplacement);

fs.writeFileSync('src/components/PropertyTracker.tsx', code);
