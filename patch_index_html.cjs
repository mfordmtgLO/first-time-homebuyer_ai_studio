const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const target = `<meta name="theme-color" content="#E2DFD2" />`;
const replacement = `<meta name="theme-color" content="#E2DFD2" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Homebuyer" />`;

code = code.replace(target, replacement);
fs.writeFileSync('index.html', code);
