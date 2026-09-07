const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

c = c.replace(
    '{ id: "alerts", label: `Price Alerts (${properties.filter(p => p.priceAlertEnabled).length})` },',
    '{ id: "alerts", label: `Price Drops / Alerts (${properties.filter(p => p.priceAlertEnabled || p.priceDropAmount).length})` },'
);

c = c.replace(
    'if (filterStatus === "alerts") return p.priceAlertEnabled;',
    'if (filterStatus === "alerts") return p.priceAlertEnabled || p.priceDropAmount;'
);

fs.writeFileSync('src/components/PropertyTracker.tsx', c);
