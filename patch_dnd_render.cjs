const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const target = `{filtered.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            profile={profile}
            isSelectedForCompare={compareIds.includes(property.id)}
            isSelected={selectedPropertyIds.includes(property.id)}
            onToggleSelect={(id, checked) => {
              if (checked) {
                setSelectedPropertyIds(prev => [...prev, id]);
              } else {
                setSelectedPropertyIds(prev => prev.filter(selectedId => selectedId !== id));
              }
            }}
            onToggleFavorite={toggleFavorite}
            onTogglePriceAlert={togglePriceAlert}
            onDeleteProperty={deleteProperty}
            onOpenScorecard={onOpenScorecard}
            onAskAiAboutProperty={onAskAiAboutProperty}
            onToggleCompare={toggleCompare}
          />
        ))}`;

const injection = `{filtered.map((property) => (
          <div
            key={property.id}
            draggable
            onDragStart={(e) => handleDragStart(e, property.id)}
            onDragOver={(e) => handleDragOver(e, property.id)}
            onDrop={(e) => handleDrop(e, property.id)}
            onDragEnd={handleDragEnd}
            className={\`snap-center shrink-0 w-[85vw] sm:w-[360px] md:w-auto h-full transition-all duration-200 cursor-grab active:cursor-grabbing \${
              dragOverId === property.id ? 'opacity-40 scale-[0.98] ring-4 ring-indigo-500/50 rounded-2xl' : ''
            } \${draggedId === property.id ? 'opacity-30 scale-[0.98]' : ''}\`}
            title="Drag to reorder this property"
          >
            <PropertyCard
              property={property}
              profile={profile}
              isSelectedForCompare={compareIds.includes(property.id)}
              isSelected={selectedPropertyIds.includes(property.id)}
              onToggleSelect={(id, checked) => {
                if (checked) {
                  setSelectedPropertyIds(prev => [...prev, id]);
                } else {
                  setSelectedPropertyIds(prev => prev.filter(selectedId => selectedId !== id));
                }
              }}
              onToggleFavorite={toggleFavorite}
              onTogglePriceAlert={togglePriceAlert}
              onDeleteProperty={deleteProperty}
              onOpenScorecard={onOpenScorecard}
              onAskAiAboutProperty={onAskAiAboutProperty}
              onToggleCompare={toggleCompare}
            />
          </div>
        ))}`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
