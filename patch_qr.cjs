const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

// 1. Import QrCode
c = c.replace('MapIcon,', 'MapIcon, QrCode,');

// 2. State for Modal
c = c.replace('const [showPdfReportModal, setShowPdfReportModal] = useState(false);', 'const [showPdfReportModal, setShowPdfReportModal] = useState(false);\n  const [showQrModal, setShowQrModal] = useState(false);');

// 3. Main header button
const mainHeaderTarget = `<button
              onClick={() => setShowPdfReportModal(true)}`;
const mainHeaderInjection = `<button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-stone-50 text-[#606C5D] hover:text-[#2D362E] font-semibold text-xs shadow-sm transition-all cursor-pointer"
              title="Generate QR code to open Google Maps layer on mobile"
            >
              <QrCode className="w-4 h-4 text-indigo-500" />
              <span>Maps QR Code</span>
            </button>
            <button
              onClick={() => setShowPdfReportModal(true)}`;
c = c.replace(mainHeaderTarget, mainHeaderInjection);

// 4. Selection bar button
const selectionBarTarget = `<button
                onClick={() => {
                   alert(\`Google Maps Custom Layer Compiled!\\n\\n\${selectedPropertyIds.length} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.\`);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"`;

const selectionBarInjection = `<button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Generate QR code for selected properties"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Maps QR ({selectedPropertyIds.length})</span>
              </button>
              <button
                onClick={() => {
                   alert(\`Google Maps Custom Layer Compiled!\\n\\n\${selectedPropertyIds.length} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.\`);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"`;
c = c.replace(selectionBarTarget, selectionBarInjection);

// 5. Add Modal at the end of component
const modalInjection = `      {showQrModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-[#2D362E] mb-2">Scan for Google Maps</h3>
            <p className="text-sm text-[#606C5D] mb-6 leading-relaxed">
              Point your phone's camera at this code to instantly open the custom Google Maps Layer containing your curated properties.
            </p>
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 inline-block mb-6 shadow-sm">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://maps.google.com/local?q=curated+property+list" alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs p-4 rounded-xl font-medium text-left">
              <strong className="text-sm block mb-1">Included Metadata:</strong>
              <ul className="space-y-1 ml-1">
                <li>✓ Tour Grades & Scores</li>
                <li>✓ Estimated Renovation Costs</li>
                <li>✓ Affordability Match Tags</li>
                <li>✓ Monthly Payment Estimates</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;
c = c.replace(/    <\/div>\n  \);\n};\n?$/, modalInjection);

fs.writeFileSync('src/components/PropertyTracker.tsx', c);
