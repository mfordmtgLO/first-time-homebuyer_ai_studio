const fs = require('fs');
let code = fs.readFileSync('src/components/LeadIntakeChatbot.tsx', 'utf8');

// Insert the useEffect
const useEffectStr = `
  // Fast-track contact form for contextual intents
  useEffect(() => {
    if (isOpen && initialIntent) {
      if (initialIntent === "chat_listings") {
        setLeadState(prev => ({ ...prev, sendSampleHomesOption: "YES - Please send available homes with low/no down payment options" }));
      }
      setCurrentStepIndex(INTAKE_STEPS.length);
    }
  }, [isOpen, initialIntent]);

  // Handle setting messages for initial intent
  useEffect(() => {
    if (isOpen && initialIntent) {
      let msgText = "";
      if (initialIntent === "blueprint_download") {
        msgText = "Great! Let's get your personalized Homebuyer Journey Blueprint sent over immediately. Where should we send it?";
      } else if (initialIntent === "chat_listings") {
        msgText = "Awesome! We will compile a curated list of low and no down payment homes in your target area. Who should we send it to?";
      } else if (initialIntent === "buying_power") {
        msgText = "Great! I have your Buying Power results ready to send. What is the best Name and Email to send your customized report to?";
      }
      
      setMessages([{
        id: \`msg-initial-\${Date.now()}\`,
        sender: "advisor",
        text: msgText,
        timestamp: new Date().toISOString()
      }]);
    } else if (isOpen && currentStepIndex === 0 && messages.length === 0) {
      // Original initial greeting
      setMessages([{
        id: "msg-initial",
        sender: "advisor",
        text: \`Hi there! I'm \${loanOfficer.name}'s AI assistant. Ready to build your customized First-Time Homebuyer Blueprint?\`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [isOpen, initialIntent]);
`;

// Insert after state declarations, around line 430
code = code.replace(
  '// Detect scroll to expand or make compact\n  useEffect(() => {',
  useEffectStr + '\n  // Detect scroll to expand or make compact\n  useEffect(() => {'
);

fs.writeFileSync('src/components/LeadIntakeChatbot.tsx', code);
