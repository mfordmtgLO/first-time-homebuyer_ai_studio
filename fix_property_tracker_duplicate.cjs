const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const regex = /onToggleRateAlert={toggleRateAlert}\n\s*onToggleRateAlert={toggleRateAlert}/g;
if (regex.test(code)) {
    code = code.replace(regex, 'onToggleRateAlert={toggleRateAlert}');
    fs.writeFileSync('src/components/PropertyTracker.tsx', code);
    console.log("Fixed duplicate onToggleRateAlert attribute");
} else {
    // try replacing it manually
    const target = '                onToggleRateAlert={toggleRateAlert}\n                onToggleRateAlert={toggleRateAlert}';
    if (code.includes(target)) {
        code = code.replace(target, '                onToggleRateAlert={toggleRateAlert}');
        fs.writeFileSync('src/components/PropertyTracker.tsx', code);
        console.log("Fixed duplicate exactly");
    } else {
        console.log("Could not find duplicate to replace");
    }
}
