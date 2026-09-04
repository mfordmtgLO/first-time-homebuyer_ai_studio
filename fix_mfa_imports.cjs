const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

if (!code.includes('ShieldAlert')) {
  code = code.replace(
    'import { ShieldCheck } from "lucide-react";',
    'import { ShieldCheck, ShieldAlert } from "lucide-react";'
  );
  fs.writeFileSync('src/components/LoginScreen.tsx', code);
}
