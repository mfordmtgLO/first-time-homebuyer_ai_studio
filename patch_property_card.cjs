const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

if (!code.includes('onToggleRateAlert?: (id: string, e: React.MouseEvent) => void;')) {
  code = code.replace(
    '  onTogglePriceAlert: (id: string, e: React.MouseEvent) => void;\n',
    '  onTogglePriceAlert: (id: string, e: React.MouseEvent) => void;\n  onToggleRateAlert?: (id: string, e: React.MouseEvent) => void;\n'
  );
  code = code.replace(
    '  onTogglePriceAlert,\n',
    '  onTogglePriceAlert,\n  onToggleRateAlert,\n'
  );
  
  // Add the button
  const priceAlertButton = `<button
            onClick={(e) => onTogglePriceAlert(property.id, e)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow hover:bg-white flex items-center justify-center transition-colors"
            title="Toggle Price Drop Alert"
          >
            <Bell className={\`w-4 h-4 \${property.priceAlertsEnabled ? 'text-[#C18C5D] fill-[#C18C5D]' : 'text-gray-500'}\`} />
          </button>`;
          
  const rateAlertButton = `<button
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
          
  if (code.includes(priceAlertButton)) {
     code = code.replace(priceAlertButton, priceAlertButton + '\n          ' + rateAlertButton);
  } else {
     // alternative search
     const btnRegex = /<button[^>]*onClick={\(e\) => onTogglePriceAlert\(property.id, e\)}[^>]*>[\s\S]*?<\/button>/;
     const match = code.match(btnRegex);
     if (match) {
        code = code.replace(match[0], match[0] + '\n          ' + rateAlertButton);
     }
  }

  // Ensure TrendingDown is imported from lucide-react
  if (!code.includes('TrendingDown') && code.includes('lucide-react')) {
      code = code.replace(
          'import {',
          'import { TrendingDown,'
      );
  }

  fs.writeFileSync('src/components/PropertyCard.tsx', code);
  console.log("Patched PropertyCard.tsx with Rate Alert toggle");
}
