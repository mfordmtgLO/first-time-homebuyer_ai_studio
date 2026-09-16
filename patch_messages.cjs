const fs = require('fs');
let code = fs.readFileSync('src/components/AILoanOfficer2ndBrain.tsx', 'utf8');

const target = `  const [messages, setMessages] = useState<BrainMessage[]>([
    {
      id: "init-1",
      sender: "copilot",
      text: \`👋 Welcome to your **AI 2nd Brain & Underwriting Copilot**, \${currentLo.name.split(" ")[0]}!

I am calibrated specifically to Fannie Mae (DU), Freddie Mac (LPA), FHA 4000.1, VA Pamphlet 26-7, USDA RD, Interested Party Contributions (IPC), 2-1 Rate Buydowns, and Schedule C Self-Employed cash flow math.

How can I assist your pipeline today? You can select any active borrower from your CRM to test file structure, or ask any complex underwriting question.\`,
      timestamp: "Just now",
      category: "guidelines",
      suggestedFollowups: [
        "How do Conventional IPC limits differ between 95% LTV, 85% LTV, and 80% LTV?",
        "Borrower has 48.5% DTI. What are the best strategies to pass Desktop Underwriter (DU)?",
        "Explain how to structure a 2-1 Buydown using a 2% seller concession to save $350+/mo in Year 1.",
        "Calculate Fannie Mae Form 1084 Depreciation & Home Office add-backs for Schedule C self-employed."
      ],
      referenceLinks: [
        { title: "Fannie Mae B3-4.1-02 (IPC Caps)", doc: "Conventional IPC 3%/6%/9%" },
        { title: "HUD Handbook 4000.1", doc: "FHA 6% Seller Concession Limit" },
        { title: "Form 1084 Cash Flow", doc: "Schedule C Add-back Guidelines" }
      ]
    }
  ]);`;

const replacement = `  const defaultWelcomeMessage: BrainMessage = {
    id: "init-1",
    sender: "copilot",
    text: \`👋 Welcome to your **AI 2nd Brain & Underwriting Copilot**, \${currentLo.name.split(" ")[0]}!

I am calibrated specifically to Fannie Mae (DU), Freddie Mac (LPA), FHA 4000.1, VA Pamphlet 26-7, USDA RD, Interested Party Contributions (IPC), 2-1 Rate Buydowns, and Schedule C Self-Employed cash flow math.

How can I assist your pipeline today? You can select any active borrower from your CRM to test file structure, or ask any complex underwriting question.\`,
    timestamp: "Just now",
    category: "guidelines",
    suggestedFollowups: [
      "How do Conventional IPC limits differ between 95% LTV, 85% LTV, and 80% LTV?",
      "Borrower has 48.5% DTI. What are the best strategies to pass Desktop Underwriter (DU)?",
      "Explain how to structure a 2-1 Buydown using a 2% seller concession to save $350+/mo in Year 1.",
      "Calculate Fannie Mae Form 1084 Depreciation & Home Office add-backs for Schedule C self-employed."
    ],
    referenceLinks: [
      { title: "Fannie Mae B3-4.1-02 (IPC Caps)", doc: "Conventional IPC 3%/6%/9%" },
      { title: "HUD Handbook 4000.1", doc: "FHA 6% Seller Concession Limit" },
      { title: "Form 1084 Cash Flow", doc: "Schedule C Add-back Guidelines" }
    ]
  };

  const [messages, setMessages] = useState<BrainMessage[]>(() => {
    const saved = localStorage.getItem(\`copilot_chat_history_\${currentLo.id}\`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [defaultWelcomeMessage];
      }
    }
    return [defaultWelcomeMessage];
  });

  useEffect(() => {
    localStorage.setItem(\`copilot_chat_history_\${currentLo.id}\`, JSON.stringify(messages));
  }, [messages, currentLo.id]);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/AILoanOfficer2ndBrain.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Target not found");
}
