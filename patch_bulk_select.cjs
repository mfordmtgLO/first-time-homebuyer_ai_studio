const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add state
const stateToAdd = `  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);`;

content = content.replace(
  '  const [showCompareModal, setShowCompareModal] = useState(false);\n  const [showEmailModal, setShowEmailModal] = useState(false);',
  stateToAdd
);

// Add Email button badge
content = content.replace(
  '<span>Email Agents</span>',
  '<span>Email Agents {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>'
);

// Bulk Select UI
const bulkSelectUI = `      {/* Bulk Selection Controls */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between py-2 border-b border-[#EAE7E0]/60 mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#2D362E] cursor-pointer">
            <input 
              type="checkbox"
              className="w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]/20"
              checked={selectedPropertyIds.length === filtered.length && filtered.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedPropertyIds(filtered.map(p => p.id));
                } else {
                  setSelectedPropertyIds([]);
                }
              }}
            />
            Select All ({filtered.length})
          </label>
          {selectedPropertyIds.length > 0 && (
            <span className="text-xs font-semibold text-[#4A5D4E] bg-[#4A5D4E]/10 px-2.5 py-1 rounded-md">
              {selectedPropertyIds.length} Selected
            </span>
          )}
        </div>
      )}

      {/* Property Cards Grid */}`;

content = content.replace(
  '      {/* Property Cards Grid */}',
  bulkSelectUI
);

// Checkbox for branch 1 (hasPhoto)
const photoActionButtons = `                    {/* Top Right Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]/20 bg-white/80 border-white/60 cursor-pointer backdrop-blur-md shadow-sm"
                        checked={selectedPropertyIds.includes(property.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedPropertyIds(prev => [...prev, property.id]);
                          } else {
                            setSelectedPropertyIds(prev => prev.filter(id => id !== property.id));
                          }
                        }}
                      />
                      <button`;

content = content.replace(
  `                    {/* Top Right Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button`,
  photoActionButtons
);

// Checkbox for branch 2 (!hasPhoto)
const noPhotoActionButtons = `                      {/* Top Right Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]/20 bg-white border-[#EAE7E0] cursor-pointer shadow-sm"
                          checked={selectedPropertyIds.includes(property.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedPropertyIds(prev => [...prev, property.id]);
                            } else {
                              setSelectedPropertyIds(prev => prev.filter(id => id !== property.id));
                            }
                          }}
                        />
                        <button`;

content = content.replace(
  `                      {/* Top Right Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button`,
  noPhotoActionButtons
);

// Modal properties prop update
content = content.replace(
  '        properties={filtered}',
  '        properties={selectedPropertyIds.length > 0 ? filtered.filter(p => selectedPropertyIds.includes(p.id)) : filtered}'
);

fs.writeFileSync(file, content);
