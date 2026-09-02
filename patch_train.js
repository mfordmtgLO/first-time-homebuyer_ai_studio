const fs = require('fs');
const file = 'src/components/AILoanOfficer2ndBrain.tsx';
let content = fs.readFileSync(file, 'utf8');

const trainInputRef = "  const trainInputRef = useRef<HTMLInputElement>(null);\n";
content = content.replace("  const fileInputRef = useRef<HTMLInputElement>(null);", "  const fileInputRef = useRef<HTMLInputElement>(null);\n" + trainInputRef);

const handleTrainUpload = `
  const handleTrainUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || loading) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
      const userMsg: BrainMessage = {
        id: \`user-train-\${Date.now()}\`,
        sender: "user",
        text: \`🧠 Uploading to Knowledge Base: \${file.name}\`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await fetch("/api/knowledge/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text,
            fileName: file.name
          })
        });
        const data = await res.json();
        
        const botMsg: BrainMessage = {
          id: \`copilot-train-\${Date.now()}\`,
          sender: "copilot",
          text: data.success 
            ? \`**Successfully memorized!**\\n\\nI have added \\\`\${file.name}\\\` to my Vector Database memory. I will now reference this case study and underwriting logic in future responses to ensure 100% accuracy tailored to your Oregon market.\` 
            : \`**Error:** Failed to ingest knowledge.\`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: "guidelines"
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (error) {
        console.error("Training error:", error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    if (trainInputRef.current) trainInputRef.current.value = '';
  };
`;
content = content.replace("  const handleFileUpload", handleTrainUpload + "\n  const handleFileUpload");

fs.writeFileSync(file, content);
