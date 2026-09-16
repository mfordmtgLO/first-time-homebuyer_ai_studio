const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

if (!code.includes('const toggleRateAlert')) {
  const replacement = `
  const togglePriceAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isEnabled = !p.priceAlertEnabled;
          return { ...p, priceAlertEnabled: isEnabled, previousPrice: p.price };
        }
        return p;
      })
    );
  };

  const toggleRateAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isEnabled = !p.rateAlertEnabled;
          if (isEnabled && onTriggerToast) {
            onTriggerToast("Mortgage Rate Shift alerts enabled for " + p.address + "!");
          }
          return { ...p, rateAlertEnabled: isEnabled };
        }
        return p;
      })
    );
  };
  `;

  // Regex to match togglePriceAlert function block
  const togglePriceRegex = /const togglePriceAlert = \([\s\S]*?};\n/m;
  if (togglePriceRegex.test(code)) {
    code = code.replace(togglePriceRegex, replacement);
  }

  code = code.replace(
    'onTogglePriceAlert={togglePriceAlert}',
    'onTogglePriceAlert={togglePriceAlert}\n                onToggleRateAlert={toggleRateAlert}'
  );
  
  // Replace it for list view as well, which might be another property card instance
  code = code.replaceAll(
    'onTogglePriceAlert={togglePriceAlert}',
    'onTogglePriceAlert={togglePriceAlert}\n                onToggleRateAlert={toggleRateAlert}'
  );

  fs.writeFileSync('src/components/PropertyTracker.tsx', code);
  console.log("Patched PropertyTracker.tsx with toggleRateAlert");
}
