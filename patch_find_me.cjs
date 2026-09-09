const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

// add handleFindMe function
const anchorChangeFn = `  // Synchronize search center when city anchor changes
  const handleCityAnchorChange = (cityKey: string) => {`;

const findMeFn = `  // Handle Find Me using geolocation
  const handleFindMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCityAnchor("custom");
          setSearchCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not get your location. Please check browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  // Synchronize search center when city anchor changes
  const handleCityAnchorChange = (cityKey: string) => {`;

code = code.replace(anchorChangeFn, findMeFn);

// add custom option to select
const targetSelect = `<option value="portland">Portland Metro (Division / SE)</option>`;
const replacementSelect = `<option value="custom" className="font-bold text-[#4A5D4E] hidden">📍 My Current Location</option>
              <option value="portland">Portland Metro (Division / SE)</option>`;
code = code.replace(targetSelect, replacementSelect);

// add Find Me button next to the label
const targetLabel = `<label className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Search Center Origin</span>
            </label>`;
const replacementLabel = `<div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>Search Center Origin</span>
              </label>
              <button 
                onClick={handleFindMe}
                className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] hover:bg-[#4A5D4E]/20 transition-colors font-bold cursor-pointer"
                title="Center map on my current location"
              >
                Find Me
              </button>
            </div>`;
code = code.replace(targetLabel, replacementLabel);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
