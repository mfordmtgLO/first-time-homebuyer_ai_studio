const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

const badBtn = `<button
            onClick={(e) => {
              if (onToggleRateAlert) {
                onToggleRateAlert(property.id, e);
              }
            }}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white flex items-center justify-center transition-colors"
            title="Toggle Mortgage Rate Shift Alert"
          >
            <TrendingDown className={\`w-4 h-4 \${property.rateAlertEnabled ? 'text-emerald-600' : 'text-gray-500'}\`} />
          </button>`;
          
if (code.includes(badBtn)) {
  code = code.replace(badBtn, '');
  fs.writeFileSync('src/components/PropertyCard.tsx', code);
  console.log("Cleaned up duplicate rate alert button in PropertyCard.tsx");
}

