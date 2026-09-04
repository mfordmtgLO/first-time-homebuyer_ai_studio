const fs = require('fs');
let code = fs.readFileSync('src/components/BigPurpleDotModal.tsx', 'utf8');

code = code.replace(
  'const [hasVault, setHasVault] = useState(false);\\n  const [isSaving, setIsSaving] = useState(false);',
  'const [hasVault, setHasVault] = useState(false);'
);

code = code.replace(
  'const [activeTab, setActiveTab] = useState<"credentials" | "webhooks" | "mapping" | "golive">("credentials");\\n  const [hasVault, setHasVault] = useState(false);\\n  const [isSaving, setIsSaving] = useState(false);',
  'const [activeTab, setActiveTab] = useState<"credentials" | "webhooks" | "mapping" | "golive">("credentials");\\n  const [hasVault, setHasVault] = useState(false);'
);

code = code.replace(
  'const [isSaving, setIsSaving] = useState(false);\\n  const [hasVault, setHasVault] = useState(false);\\n  const [isSaving, setIsSaving] = useState(false);',
  'const [isSaving, setIsSaving] = useState(false);\\n  const [hasVault, setHasVault] = useState(false);'
);

// Specifically handle the duplicate
const lines = code.split('\\n');
const fixedLines = [];
let foundIsSaving = false;
for (let line of lines) {
  if (line.includes('const [isSaving, setIsSaving] = useState(false);')) {
    if (!foundIsSaving) {
      foundIsSaving = true;
      fixedLines.push(line);
    } else {
      // Skip second declaration
    }
  } else {
    fixedLines.push(line);
  }
}
fs.writeFileSync('src/components/BigPurpleDotModal.tsx', fixedLines.join('\\n'));
