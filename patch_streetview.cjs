const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const newComponent = `
const StreetViewButton = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (map) {
          const sv = map.getStreetView();
          sv.setPosition({ lat, lng });
          sv.setVisible(true);
        }
      }}
      className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-[#606C5D]"
      title="Open Google Street View"
    >
      <PersonStanding className="w-3 h-3" />
    </button>
  );
};

export const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> = ({`;

code = code.replace(`export const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> = ({`, newComponent);

const btnTarget = `{getZillowUrl(activeSelectedProperty) && (`;
const btnReplacement = `<StreetViewButton lat={activeSelectedProperty.lat} lng={activeSelectedProperty.lng} />
                          {getZillowUrl(activeSelectedProperty) && (`

code = code.replace(btnTarget, btnReplacement);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
