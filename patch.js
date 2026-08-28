const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [isLeadBotOpen, setIsLeadBotOpen] = useState<boolean>(false);',
  'const [isLeadBotOpen, setIsLeadBotOpen] = useState<boolean>(false);\n  const [leadBotSourceContext, setLeadBotSourceContext] = useState<{ source?: string, intent?: "chat_listings" | "blueprint_download" | "buying_power" } | undefined>(undefined);\n'
);

code = code.replace(
  'onOpenLeadBot={() => setIsLeadBotOpen(true)}',
  'onOpenLeadBot={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(true); }}'
);

code = code.replace(
  'onOpenLeadBot={() => setIsLeadBotOpen(true)}',
  'onOpenLeadBot={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(true); }}'
);

code = code.replace(
  '<LeadIntakeChatbot',
  '<LeadIntakeChatbot\n          initialLeadSource={leadBotSourceContext?.source}\n          initialIntent={leadBotSourceContext?.intent}'
);

code = code.replace(
  'onClose={() => setIsLeadBotOpen(false)}',
  'onClose={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(false); }}'
);

code = code.replace(
  '<Step4AIScenarioSummary',
  '<Step4AIScenarioSummary\n            onRequestBlueprint={() => { setLeadBotSourceContext({ source: "Step 4 - Blueprint Download Request", intent: "blueprint_download" }); setIsLeadBotOpen(true); }}\n            onRequestListings={() => { setLeadBotSourceContext({ source: "Step 4 - Curated Listings Request", intent: "chat_listings" }); setIsLeadBotOpen(true); }}'
);

fs.writeFileSync('src/App.tsx', code);
