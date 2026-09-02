const fs = require('fs');

let content = fs.readFileSync('src/components/RecruitmentPipeline.tsx', 'utf8');

content = content.replace(/\}\s*X\s*\}\s*from "lucide-react";/, ', X } from "lucide-react";');
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/RecruitmentPipeline.tsx', content);
console.log("Syntax fixed.");
