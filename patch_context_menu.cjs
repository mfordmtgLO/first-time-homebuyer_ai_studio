const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const target1 = `  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const map = useMap();`;

const replacement1 = `  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, property: any } | null>(null);
  const map = useMap();

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);`;

code = code.replace(target1, replacement1);

const target2 = `              onMouseEnter={() => setHoveredPropertyId(property.id)}
              onMouseLeave={() => setHoveredPropertyId(null)}
              className=\`flex flex-col items-center cursor-pointer transition-all transform \${`;

const replacement2 = `              onMouseEnter={() => setHoveredPropertyId(property.id)}
              onMouseLeave={() => setHoveredPropertyId(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.clientX, y: e.clientY, property });
              }}
              className=\`flex flex-col items-center cursor-pointer transition-all transform \${`;

code = code.replace(target2, replacement2);

const target3 = `    </>
  );
};`;

const replacement3 = `      
      {/* Custom Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 min-w-[180px] overflow-hidden"
          style={{ 
            top: Math.min(contextMenu.y, window.innerHeight - 100), 
            left: Math.min(contextMenu.x, window.innerWidth - 200) 
          }}
          onClick={(e) => e.stopPropagation()}
        >
           <button
             className="w-full text-left px-4 py-2 hover:bg-stone-50 text-[#2D362E] text-xs font-semibold flex items-center gap-2"
             onClick={(e) => {
               e.stopPropagation();
               if (map) {
                 const sv = map.getStreetView();
                 sv.setPosition({ lat: contextMenu.property.lat, lng: contextMenu.property.lng });
                 sv.setVisible(true);
               }
               setContextMenu(null);
             }}
           >
             <PersonStanding className="w-3.5 h-3.5 text-blue-600"/>
             View Street Level
           </button>
           <button
             className="w-full text-left px-4 py-2 hover:bg-stone-50 text-[#2D362E] text-xs font-semibold flex items-center gap-2"
             onClick={(e) => {
               e.stopPropagation();
               setSelectedPropertyId(contextMenu.property.id);
               setContextMenu(null);
             }}
           >
             <Eye className="w-3.5 h-3.5 text-[#4A5D4E]"/>
             View Details
           </button>
        </div>
      )}
    </>
  );
};`;

code = code.replace(target3, replacement3);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
