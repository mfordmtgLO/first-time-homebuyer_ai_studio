const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

// 1. Add Search state and Saved Groups state
const stateTarget = `  const [isSavingLayer, setIsSavingLayer] = useState(false);
  const [savedLayerId, setSavedLayerId] = useState<string | null>(null);`;
  
const stateReplacement = `  const [isSavingLayer, setIsSavingLayer] = useState(false);
  const [savedLayerId, setSavedLayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedGroups, setSavedGroups] = useState<{id: string, name: string, propertyIds: string[]}[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string>("all");`;

code = code.replace(stateTarget, stateReplacement);

// 2. Update load effect
const loadEffectTarget = `const layerRef = doc(db, 'user_map_layers', profile.id);
        const layerSnap = await getDoc(layerRef);
        if (layerSnap.exists()) {
          const data = layerSnap.data();
          if (data.propertyIds && Array.isArray(data.propertyIds)) {
            setSelectedPropertyIds(data.propertyIds);
            setSavedLayerId(profile.id);
          }
        }`;
        
const loadEffectReplacement = `const layerRef = doc(db, 'user_map_layers', profile.id);
        const layerSnap = await getDoc(layerRef);
        if (layerSnap.exists()) {
          const data = layerSnap.data();
          if (data.groups && Array.isArray(data.groups)) {
             setSavedGroups(data.groups);
          }
        }`;
code = code.replace(loadEffectTarget, loadEffectReplacement);

// 3. Update Save logic
const saveLayerTarget = `const handleSaveMapLayer = async () => {
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
  
const saveLayerReplacement = `const handleSaveMapLayer = async () => {
    if (!profile?.id) return alert("You must be logged in.");
    if (selectedPropertyIds.length === 0) return alert("Select properties to save.");
    if (!newGroupName.trim()) return alert("Please provide a name for this group.");

    setIsSavingLayer(true);
    try {
      const newGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        propertyIds: selectedPropertyIds,
        createdAt: new Date().toISOString()
      };
      
      const updatedGroups = [...savedGroups, newGroup];
      
      const layerRef = doc(db, 'user_map_layers', profile.id);
      await setDoc(layerRef, {
        groups: updatedGroups,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSavedGroups(updatedGroups);
      setActiveGroupId(newGroup.id);
      setNewGroupName("");
      setShowGroupNameInput(false);
      
      alert(\`Success! "\${newGroup.name}" (\${selectedPropertyIds.length} properties) has been saved to your profile.\`);
    } catch (err) {
      console.error("Failed to save map layer:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSavingLayer(false);
    }
  };
  
  const handleLoadGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    if (groupId === "all") {
       // Just keep current selections or clear? Let's leave selections alone or clear them
    } else {
       const group = savedGroups.find(g => g.id === groupId);
       if (group) setSelectedPropertyIds(group.propertyIds);
    }
  };`;
code = code.replace(saveLayerTarget, saveLayerReplacement);

// 4. Update filtering logic for Search Query
const filterTarget = `let filtered = properties.filter((p) => {
    if (filterStatus !== "all") {
      if (filterStatus === "consideration" && p.status !== "saved" && p.status !== "touring") return false;
      if (filterStatus !== "consideration" && p.status !== filterStatus) return false;
    }`;
    
const filterReplacement = `let filtered = properties.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      // Basic text match
      const textMatch = p.address.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || (p.notes || "").toLowerCase().includes(q);
      
      // Feature parsing: "3 bed"
      const bedMatch = q.includes("bed") && p.beds >= parseInt(q.match(/(\\d+)\\s*bed/i)?.[1] || "0");
      const bathMatch = q.includes("bath") && p.baths >= parseFloat(q.match(/(\\d+(\\.\\d+)?)\\s*bath/i)?.[1] || "0");
      const sqftMatch = q.includes("sqft") && p.sqft >= parseInt(q.match(/(\\d+)\\s*sqft/i)?.[1] || "0");
      const domMatch = (q.includes("days") || q.includes("dom")) && (p.daysOnMarket || 0) <= parseInt(q.match(/(\\d+)\\s*(?:days|dom)/i)?.[1] || "999");
      
      if (!textMatch && !bedMatch && !bathMatch && !sqftMatch && !domMatch) return false;
    }

    if (filterStatus !== "all") {
      if (filterStatus === "consideration" && p.status !== "saved" && p.status !== "touring") return false;
      if (filterStatus !== "consideration" && p.status !== filterStatus) return false;
    }`;
code = code.replace(filterTarget, filterReplacement);

// 5. Update Search UI
const searchUITarget = `<form className="mt-4 flex flex-col sm:flex-row gap-2 max-w-3xl" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="e.g., Show me 3 bed homes under $450k near St. Johns that qualify for the DevNW 0% down grant..." className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm" />
              <button 
                type="button" 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={() => {
                  alert("GeoSphere AI Search Active.\\n\\nParsing intent: \\n- Price: <$450k\\n- Location: St. Johns (Multnomah County)\\n- Financial Trigger: DevNW 0% down grant eligibility\\n\\nCross-referencing live active listings with LMI Census Tract shapefiles...");
                  // Example simulation effect
                  setTimeout(() => {
                    alert("Found 6 matches! These properties have been pinned to your map and synced with your loan officer.");
                  }, 1500);
                }}
              >
                <Search className="w-4 h-4" /> Search Map
              </button>
            </form>`;
            
const searchUIReplacement = `<form className="mt-4 flex flex-col sm:flex-row gap-2 max-w-3xl" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Portland, 3 bed, 2 bath, 2000 sqft, 10 DOM..." 
                className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm" 
              />
              <button 
                type="button" 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={() => {
                  if(!searchQuery) return;
                  if(searchQuery.toLowerCase().includes("grant") || searchQuery.toLowerCase().includes("down")) {
                      alert("GeoSphere AI Search Active.\\n\\nParsing intent: " + searchQuery + "\\n\\nCross-referencing live active listings with LMI Census Tract shapefiles...");
                  }
                }}
              >
                <Search className="w-4 h-4" /> Search Map
              </button>
            </form>`;
code = code.replace(searchUITarget, searchUIReplacement);

// 6. Update Save Button UI in the controls row
const btnGroupTarget = `<button
              onClick={handleSaveMapLayer}
              disabled={isSavingLayer}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              title="Save this exact selection of properties to your profile to restore on any device"
            >
              <Map className="w-4 h-4 text-amber-200" />
              <span>{isSavingLayer ? "Saving..." : "Save Custom Layer"} {selectedPropertyIds.length > 0 ? \`(\${selectedPropertyIds.length})\` : ""}</span>
            </button>`;
            
const btnGroupReplacement = `
            {savedGroups.length > 0 && (
               <select 
                 className="px-3 py-2.5 rounded-xl border border-[#EAE7E0] bg-white text-xs font-semibold text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20"
                 value={activeGroupId}
                 onChange={(e) => handleLoadGroup(e.target.value)}
                 title="Load a saved comparable group"
               >
                 <option value="all">Saved Groups...</option>
                 {savedGroups.map(g => (
                   <option key={g.id} value={g.id}>{g.name} ({g.propertyIds.length})</option>
                 ))}
               </select>
            )}
            
            {!showGroupNameInput ? (
              <button
                onClick={() => setShowGroupNameInput(true)}
                disabled={selectedPropertyIds.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Save this exact selection as a named group"
              >
                <Layers className="w-4 h-4 text-amber-200" />
                <span>Save Group {selectedPropertyIds.length > 0 ? \`(\${selectedPropertyIds.length})\` : ""}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 p-1 rounded-xl border border-amber-200">
                 <input 
                   type="text" 
                   value={newGroupName}
                   onChange={e => setNewGroupName(e.target.value)}
                   placeholder="Group Name..."
                   className="px-3 py-1.5 rounded-lg text-xs border border-amber-300 w-32 focus:outline-none"
                   autoFocus
                 />
                 <button onClick={handleSaveMapLayer} disabled={isSavingLayer || !newGroupName} className="px-3 py-1.5 bg-amber-600 text-white text-xs rounded-lg font-bold">Save</button>
                 <button onClick={() => setShowGroupNameInput(false)} className="px-2 py-1.5 text-amber-800 hover:bg-amber-200 rounded-lg"><X className="w-4 h-4"/></button>
              </div>
            )}`;
code = code.replace(btnGroupTarget, btnGroupReplacement);

fs.writeFileSync('src/components/PropertyTracker.tsx', code);
