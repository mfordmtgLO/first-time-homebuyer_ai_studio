const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const target1 = `const StreetViewButton = ({ lat, lng }: { lat: number; lng: number }) => {`;
const replacement1 = `const SmsShareButton = ({ property }: { property: any }) => {
  const shareViaSMS = () => {
    const propertyLink = \`\${window.location.origin}\${window.location.pathname}\`;
    const message = \`Check out this property: \${property.address}, \${property.city}.\\n\\nView here: \${propertyLink}?property=\${property.id}\`;
    window.location.href = \`sms:?body=\${encodeURIComponent(message)}\`;
  };

  return (
    <button
      onClick={shareViaSMS}
      className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-[#606C5D]"
      title="Share via SMS"
    >
      <MessageSquare className="w-3 h-3" />
    </button>
  );
};

const StreetViewButton = ({ lat, lng }: { lat: number; lng: number }) => {`;

code = code.replace(target1, replacement1);

const target2 = `<StreetViewButton lat={activeSelectedProperty.lat} lng={activeSelectedProperty.lng} />`;
const replacement2 = `<StreetViewButton lat={activeSelectedProperty.lat} lng={activeSelectedProperty.lng} />
                          <SmsShareButton property={activeSelectedProperty} />`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
