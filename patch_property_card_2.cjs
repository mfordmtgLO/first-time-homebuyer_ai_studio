const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

const targetBtn = `<button
              type="button"
              onClick={(e) => onTogglePriceAlert(property.id, e)}
              className={\`p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xs \${
                property.priceAlertEnabled
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500"
                  : "bg-white dark:bg-slate-900/90 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
              }\`}
              title={property.priceAlertEnabled ? "Price alerts active" : "Enable price alerts"}
              aria-label="Toggle price alert"
            >
              {property.priceAlertEnabled ? (
                <BellRing className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </button>`;
            
const rateAlertBtn = `
            {onToggleRateAlert && (
              <button
                type="button"
                onClick={(e) => onToggleRateAlert(property.id, e)}
                className={\`p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xs \${
                  property.rateAlertEnabled
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-500"
                    : "bg-white dark:bg-slate-900/90 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
                }\`}
                title={property.rateAlertEnabled ? "Mortgage rate shift alerts active" : "Alert me if mortgage rates drop"}
                aria-label="Toggle rate alert"
              >
                {property.rateAlertEnabled ? (
                  <TrendingDown className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </button>
            )}`;

if (code.includes(targetBtn)) {
  code = code.replace(targetBtn, targetBtn + rateAlertBtn);
  fs.writeFileSync('src/components/PropertyCard.tsx', code);
  console.log("Successfully patched rate alert button in PropertyCard.tsx");
} else {
  console.log("Could not find the target button in PropertyCard.tsx");
}

