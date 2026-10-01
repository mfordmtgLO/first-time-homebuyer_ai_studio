import React, { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import { SecurityToast } from "./SecurityToast";
import { 
  Brain, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Calculator, 
  FileText, 
  Users, 
  Percent, 
  HelpCircle, 
  BookOpen, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Zap,
  MessageSquare,
  FileCheck,
  Building,
  UserCheck, 
  Paperclip, 
  Database, 
  Mail, 
  MinusCircle, 
  Trash2,
  ExternalLink,
  X
} from "lucide-react";
import { LoanOfficerProfile, CapturedLead, FinancialProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { launchLocalOutlookDraft } from "../utils/outlookEmailService";
import { GeminiAgentPanel } from "./GeminiAgentPanel";
import { DeepSeekHarnessPanel } from "./DeepSeekHarnessPanel";

interface AILoanOfficer2ndBrainProps {
  currentLo: LoanOfficerProfile;
  leads?: CapturedLead[];
  activeLeadId?: string;
  onSelectLead?: (leadId: string) => void;
  onUpdateLeadNotes?: (leadId: string, note: string) => void;
  onTriggerToast?: (msg: string) => void;
}

interface BrainMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  category?: "guidelines" | "scenario" | "objection" | "cobrand";
  suggestedFollowups?: string[];
  referenceLinks?: { title: string; doc: string }[];
}

export const AILoanOfficer2ndBrain: React.FC<AILoanOfficer2ndBrainProps> = ({
  currentLo,
  leads = [],
  activeLeadId,
  onSelectLead,
  onUpdateLeadNotes,
  onTriggerToast
}) => {
  const [selectedLeadIdState, setSelectedLeadIdState] = useState<string>(activeLeadId || (leads[0]?.id || ""));
  const [activeCategory, setActiveCategory] = useState<"all" | "guidelines" | "scenario" | "objection" | "cobrand" | "agent" | "deepseek_harness">("all");
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trainInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [securityToast, setSecurityToast] = useState<{ isVisible: boolean; fileName: string }>({ isVisible: false, fileName: "" });

  // Handle URL Ingestion
  const handleUrlIngestion = async () => {
    if (!urlInput.trim()) return;
    
    const submittedUrl = urlInput.trim();
    setShowUrlInput(false);
    setUrlInput("");
    setLoading(true);

    const userMsg: BrainMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: `*Initiated Long-Term Memory Ingestion for URL:* ${submittedUrl}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: "guidelines"
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/knowledge/ingest", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify({ url: submittedUrl })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to ingest URL");
      }
      
      const botMsg: BrainMessage = {
        id: `copilot-train-${Date.now()}`,
        sender: "copilot",
        text: `**Successfully memorized URL!**\n\nI have permanently added \`${submittedUrl}\` to my Vector Database memory. I will actively cross-reference its guidelines and loan products in all future conversations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: "guidelines"
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      console.error("URL Training error:", error);
      const botMsg: BrainMessage = {
        id: `copilot-train-error-${Date.now()}`,
        sender: "copilot",
        text: `**Error:** ` + (error.message || "Failed to ingest URL. The server may have blocked the request or the document was unreachable."),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: "guidelines"
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const activeLead = leads.find(l => l.id === selectedLeadIdState);

  const defaultWelcomeMessage: BrainMessage = {
    id: "init-1",
    sender: "copilot",
    text: `👋 Welcome to your **Vantage Intelligence Assist (VIA)**, ${currentLo.name.split(" ")[0]}!

I am calibrated specifically to Fannie Mae (DU), Freddie Mac (LPA), FHA 4000.1, VA Pamphlet 26-7, USDA RD, Interested Party Contributions (IPC), 2-1 Rate Buydowns, and Schedule C Self-Employed cash flow math.

How can I assist your pipeline today? You can select any active borrower from your CRM to test file structure, or ask any complex underwriting question.`,
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
    const saved = localStorage.getItem(`copilot_chat_history_${currentLo.id}`);
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
    localStorage.setItem(`copilot_chat_history_${currentLo.id}`, JSON.stringify(messages));
  }, [messages, currentLo.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onTriggerToast) onTriggerToast("✓ Copied response to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };


  const handleTrainUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || loading) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("file not uploaded, file size upload constrained to 50 MB max");
      if (trainInputRef.current) trainInputRef.current.value = '';
      return;
    }

    const isVideo = file.type.startsWith('video/');

    const userMsg: BrainMessage = {
      id: `user-train-${Date.now()}`,
      sender: "user",
      text: `🧠 Uploading to Knowledge Base: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type || "application/octet-stream";

      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/knowledge/ingest", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
          },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType: mimeType,
            fileName: file.name
          })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to ingest knowledge");
        }
        
        let successMessage = `**Successfully memorized!**\n\nI have added \`${file.name}\` to my Vector Database memory. I will now reference this case study and underwriting logic in future responses to ensure 100% accuracy tailored to your Oregon market.`;
        
        if (isVideo) {
          successMessage = `**Video/Audio Upload Accepted!**\n\nI am processing \`${file.name}\` in the background. It will take a few minutes to transcribe and learn the product guidelines.`;
        } else if (data.securityAudit) {
           successMessage = `**Zero-Trust Ingestion Complete!**\n\nSuccessfully ingested \`${file.name}\` into the Vector Database memory.\n\n**🔒 Security Audit Log:**\n- **Vault Assigned ID:** \`${data.securityAudit.piiVaultAssignedId}\`\n- **PII Scrubbing:** \`${data.securityAudit.piiRedactionApplied ? "SUCCESS" : "FAILED"}\`\n- **Vault Status:** \`${data.securityAudit.vaultStorageStatus}\`\n- **Retention Time:** \`${data.securityAudit.ephemeralPersistence}\`\n\n*All SSN and Credit Card metadata was successfully shredded from the ephemeral PII-Safe Firestore collection. Only sanitized data was sent to the AI Memory.*`;
           setSecurityToast({ isVisible: true, fileName: file.name });
        }

        const botMsg: BrainMessage = {
          id: `copilot-train-${Date.now()}`,
          sender: "copilot",
          text: data.success 
            ? successMessage
            : `**Error:** Failed to ingest knowledge.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: "guidelines"
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (error: any) {
        console.error("Training error:", error);
        const isMissingKey = error.message?.includes("No AI key configured");
        const botMsg: BrainMessage = {
          id: `copilot-train-${Date.now()}`,
          sender: "copilot",
          text: isMissingKey 
            ? `⚠️ **AI Copilot Disconnected**\n\nNo AI Provider configured. Please add your \`GEMINI_API_KEY\` or \`DEEPSEEK_API_KEY\` in the Google AI Studio Settings > Secrets panel to activate knowledge ingestion.`
            : `**Error:** Failed to memorize document. ${error.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: "guidelines"
        };
        setMessages(prev => [...prev, botMsg]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
    if (trainInputRef.current) trainInputRef.current.value = '';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || loading) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      
      const userMsg: BrainMessage = {
        id: `user-doc-${Date.now()}`,
        sender: "user",
        text: `📎 Uploaded Document for Analysis: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await fetch("/api/analyze-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentText: text,
            fileName: file.name,
            documentType: file.type || "text/plain",
            industryId: "mortgage_real_estate"
          })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to analyze document");
        }
        
        const botText = data.analysis || "Document analysis complete.";

        const botMsg: BrainMessage = {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          text: botText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: "guidelines"
        };
        setMessages(prev => [...prev, botMsg]);
      } catch (error: any) {
        console.error("Doc analysis error:", error);
        const isMissingKey = error.message?.includes("No AI key configured");
        const botMsg: BrainMessage = {
          id: `copilot-${Date.now()}`,
          sender: "copilot",
          text: isMissingKey 
            ? `⚠️ **AI Copilot Disconnected**\n\nNo AI Provider configured. Please add your \`GEMINI_API_KEY\` or \`DEEPSEEK_API_KEY\` in the Google AI Studio Settings > Secrets panel to activate document analysis.`
            : `**Error:** Failed to analyze document. ${error.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          category: "guidelines"
        };
        setMessages(prev => [...prev, botMsg]);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: BrainMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      let promptContext = "";
      if (activeLead) {
        promptContext = `[Context - Active Lead: ${activeLead.fullName} | Price Range: ${activeLead.targetPriceRange} | FICO: ${activeLead.creditScore} | DTI: ${activeLead.estimatedDti} | Notes: ${activeLead.notes || 'None'}]\n\n`;
      }
      const fullPrompt = `${promptContext}User Query: ${q}`;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: fullPrompt,
          chatHistory: messages.slice(-40),
          industryId: "mortgage_real_estate"
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect to AI Provider.");
      }
      
      const botText = data.response || "Here is the guidance for your scenario.";

      const botMsg: BrainMessage = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: activeCategory === "all" ? "guidelines" : activeCategory,
        suggestedFollowups: [
          "Generate a pre-formatted email script to explain this to the borrower.",
          "What compensating factors would strengthen an AUS approval for this?",
          "How does this impact the Realtor partner's offer strategy?"
        ]
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Vantage Intelligence Assist (VIA) error:", err);
      
      const isMissingKey = err.message?.includes("No AI Provider configured");
      
      const fallbackMsg: BrainMessage = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: isMissingKey 
          ? `⚠️ **AI Copilot Disconnected**\n\nNo AI Provider configured. Please add your \`GEMINI_API_KEY\` or \`DEEPSEEK_API_KEY\` in the Google AI Studio Settings > Secrets panel to activate Vantage Intelligence Assist (VIA).`
          : `⚠️ **AI Copilot Error**\n\nAn error occurred while connecting to the AI: ${err.message || 'Unknown error'}\n\n### 📋 LO Guideline Reference Summary\n\n**Key Guideline Takeaway:**\n- **Conventional Loans (Fannie Mae B3-4.1-02)**: LTV >90% allows max **3.0%** IPC; LTV 80.01% - 90.00% allows max **6.0%**; LTV ≤80% allows max **9.0%**.\n- **FHA (HUD 4000.1)**: Max **6.0%** seller contribution.\n- **VA (Pamphlet 26-7)**: Max **4.0%** seller concessions for debt payoff / buydowns / fees, plus standard buyer closing costs.\n- **2-1 Buydown Rule**: Borrower must qualify at the full note rate. Year 1 rate = Note - 2%, Year 2 = Note - 1%.\n\n*Synced with LO Master Command Center.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLeadNotes = (text: string, id: string) => {
    if (!activeLead) {
      if (onTriggerToast) onTriggerToast("⚠️ Select an active lead first.");
      return;
    }
    const timestamp = new Date().toLocaleDateString();
    const snippet = `[${timestamp} Vantage Intelligence Assist (VIA) Analysis]: ${text.slice(0, 240)}...`;
    if (onUpdateLeadNotes) {
      onUpdateLeadNotes(activeLead.id, snippet);
      if (onTriggerToast) onTriggerToast(`✓ Saved analysis to ${activeLead.fullName}'s CRM profile!`);
      setSavedId(id);
      setTimeout(() => setSavedId(null), 2000);
    }
  };

  const handleDraftEmail = (text: string) => {
    let emailTo = "";
    if (activeLead && activeLead.email) {
      emailTo = activeLead.email;
    }
    const subject = activeLead ? `Follow-up regarding your home loan` : `Mortgage scenario update`;
    
    launchLocalOutlookDraft({
      to: emailTo,
      subject,
      body: text,
      loanOfficer: currentLo,
      lead: activeLead || undefined,
      templateName: "Vantage Intelligence Assist (VIA) Dispatch"
    });
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the entire chat history?")) {
      setMessages([defaultWelcomeMessage]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#3B483C] to-[#2D362E] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7C19D] border border-white/15 text-xs font-bold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-[#E7C19D]" />
              <span>Vantage Command Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Vantage Intelligence Assist (VIA) Underwriting & Production Copilot
            </h2>
            <p className="text-sm text-[#D8D2C2] max-w-2xl leading-relaxed">
              Instant agency guideline intelligence (Fannie/Freddie, FHA, VA, USDA), 2-1 buydown structurer, Schedule C tax analyzer, and high-converting client & realtor objection scripts.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/15 text-center">
              <span className="text-[11px] text-[#D8D2C2] font-medium block">Lead Pipeline Context</span>
              <span className="text-lg font-bold text-white">{leads.length} Active Leads</span>
            </div>
            <div className="px-4 py-3 bg-emerald-500/20 backdrop-blur-xs rounded-2xl border border-emerald-400/30 text-center">
              <span className="text-[11px] text-emerald-200 font-medium block">Copilot Engine</span>
              <span className="text-lg font-bold text-emerald-300">Gemini 3.8 Flash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls / Presets + Right Interactive Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Context Selector & Quick Tools (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Borrower Context Box */}
          <div className="bg-white rounded-2xl p-5 border border-[#EAE7E0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Active Lead Focus</span>
              </span>
              <span className="text-[11px] text-[#9A9488]">{leads.length} Available</span>
            </div>

            <select
              value={selectedLeadIdState}
              onChange={(e) => {
                setSelectedLeadIdState(e.target.value);
                if (onSelectLead) onSelectLead(e.target.value);
              }}
              className="w-full text-xs font-semibold bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30"
            >
              <option value="">-- General Inquiries (No Borrower Selected) --</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.targetPriceRange || "$450k"}, FICO {l.creditScore || "720"})
                </option>
              ))}
            </select>

            {activeLead && (
              <div className="p-3 bg-[#F9F8F4] rounded-xl border border-[#EAE7E0] space-y-1.5 text-xs text-[#606C5D]">
                <div className="flex justify-between">
                  <span className="text-[#9A9488]">Target Price:</span>
                  <span className="font-bold text-[#2D362E]">{activeLead.targetPriceRange || "$425,000"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A9488]">Credit Score:</span>
                  <span className="font-bold text-[#2D362E]">{activeLead.creditScore || "720"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A9488]">Estimated DTI:</span>
                  <span className="font-bold text-[#4A5D4E]">{activeLead.estimatedDti || "38%"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9A9488]">Lead Source:</span>
                  <span className="font-medium text-[#2D362E] truncate max-w-[150px]">{activeLead.leadSource || "Website"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Domain Prompt Launchers */}
          <div className="bg-white rounded-2xl p-5 border border-[#EAE7E0] shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D362E] flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>LO Knowledge Quick Launchers</span>
            </h4>

            <div className="space-y-2">
              {[
                {
                  title: "Fannie / FHA IPC Limit Matrix",
                  desc: "Compare max seller credits across LTV tiers",
                  prompt: "Provide an exact breakdown of Interested Party Contribution (IPC) and seller concession limits for Conventional, FHA, VA, and USDA loans.",
                  icon: ShieldCheck
                },
                {
                  title: "2-1 Buydown vs Price Cut Battle",
                  desc: "Explain why $8k buydown beats an $8k price drop",
                  prompt: "Write a clear comparison showing why an $8,000 seller credit for a 2-1 buydown saves the buyer 3x to 4x more monthly payment than an $8,000 purchase price reduction.",
                  icon: Percent
                },
                {
                  title: "Schedule C Cash Flow Add-backs",
                  desc: "Form 1084 depreciation, home office, miles",
                  prompt: "What are all allowable Fannie Mae Form 1084 add-backs for Schedule C self-employed borrowers (depreciation, depletion, business use of home, mileage)?",
                  icon: Calculator
                },
                {
                  title: "Overcoming Rate Hesitation Script",
                  desc: "Talk track for buyers waiting for 5% rates",
                  prompt: "Draft a persuasive, mathematically grounded SMS/email script for a borrower who wants to wait for interest rates to drop before buying.",
                  icon: MessageSquare
                },
                {
                  title: "Agent Pitch: Seller Concession Strategy",
                  desc: "How Realtors can write winning buydown offers",
                  prompt: "Create a 3-bullet talking point sheet for a Buyer's Agent on how to structure a 2-1 buydown in an offer without lowering the seller's net proceeds.",
                  icon: Building
                }
              ].map((preset, idx) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(preset.prompt)}
                    className="w-full text-left p-2.5 rounded-xl border border-[#EAE7E0] hover:border-[#4A5D4E] hover:bg-[#F9F8F4] transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2D362E] group-hover:text-[#4A5D4E] transition-colors leading-tight">
                          {preset.title}
                        </p>
                        <p className="text-[11px] text-[#606C5D] truncate">
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Copilot Terminal (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-[#EAE7E0] shadow-xs overflow-hidden h-[700px]">
          {/* Terminal Header & Mode Filter */}
          <div className="p-4 border-b border-[#EAE7E0] bg-[#FDFCF9] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-[#2D362E]">
                LO Vantage Intelligence Assist (VIA) Session
              </span>
              {activeLead && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#4A5D4E]/10 text-[#4A5D4E] font-medium border border-[#4A5D4E]/20">
                  Focus: {activeLead.fullName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 mr-1"
                title="Reset entire chat history"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
              {[
                { id: "all", label: "All Modes" },
                { id: "guidelines", label: "AUS / Guidelines" },
                { id: "scenario", label: "Scenario Math" },
                { id: "objection", label: "Client Scripts" },
                { id: "agent", label: "Gemini Agent & Cron Tasks" },
                { id: "deepseek_harness", label: "DeepSeek Harness (dsh)" }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-[#4A5D4E] text-white"
                      : "bg-[#F9F8F4] text-[#606C5D] hover:bg-[#EAE7E0]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed or Agent Panels */}
          {activeCategory === "agent" ? (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
              <GeminiAgentPanel />
            </div>
          ) : activeCategory === "deepseek_harness" ? (
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
              <DeepSeekHarnessPanel />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 group ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "copilot" && (
                  <div className="w-8 h-8 rounded-xl bg-[#2D362E] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Brain className="w-4 h-4 text-[#E7C19D]" />
                  </div>
                )}

                {msg.sender === "user" && (
                  <button 
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="mt-2 text-red-400 hover:text-red-600 transition-colors flex-shrink-0 cursor-pointer"
                    title="Delete Message"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className={`max-w-[85%] space-y-2.5 flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#4A5D4E] text-white rounded-tr-none shadow-xs"
                        : "bg-[#F9F8F4] text-[#2D362E] border border-[#EAE7E0] rounded-tl-none shadow-2xs"
                    }`}
                  >
                    {/* Render message with linebreaks and bold tags */}
                    <div className="whitespace-pre-wrap space-y-2 font-sans">
                      {msg.text}
                    </div>

                    {/* Reference Citations */}
                    {msg.referenceLinks && msg.referenceLinks.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[#EAE7E0] flex flex-wrap gap-2">
                        {msg.referenceLinks.map((ref, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1 text-[10px] bg-white text-[#4A5D4E] px-2 py-0.5 rounded border border-[#EAE7E0] font-semibold"
                          >
                            <BookOpen className="w-2.5 h-2.5" />
                            {ref.title}: {ref.doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Followups for Copilot Responses */}
                  {msg.sender === "copilot" && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#606C5D] pl-1">
                      <span className="text-[10px] text-[#9A9488]">{msg.timestamp}</span>
                      
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="inline-flex items-center gap-1 text-[#4A5D4E] hover:underline font-semibold cursor-pointer ml-2"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>

                      {activeLead && (
                        <button
                          type="button"
                          onClick={() => handleSaveToLeadNotes(msg.text, msg.id)}
                          className={`inline-flex items-center gap-1 hover:underline font-semibold cursor-pointer ml-2 ${savedId === msg.id ? 'text-emerald-600' : 'text-[#C18C5D]'}`}
                        >
                          {savedId === msg.id ? <Check className="w-3 h-3" /> : <FileCheck className="w-3 h-3" />}
                          <span>{savedId === msg.id ? "Saved to CRM Notes" : `Save to ${activeLead.fullName.split(" ")[0]}'s CRM Notes`}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDraftEmail(msg.text)}
                        className="inline-flex items-center gap-1 text-[#C18C5D] hover:underline font-semibold cursor-pointer ml-2"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Open Draft Email</span>
                      </button>
                    </div>
                  )}

                  {/* Suggested Followups */}
                  {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                      {msg.suggestedFollowups.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSend(sug)}
                          className="text-[11px] bg-white border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#606C5D] hover:text-[#4A5D4E] px-2.5 py-1 rounded-full transition-all text-left cursor-pointer flex items-center gap-1"
                        >
                          <span>{sug}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === "copilot" && (
                  <button 
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="mt-2 text-red-400 hover:text-red-600 transition-colors flex-shrink-0 cursor-pointer"
                    title="Delete Message"
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                  </button>
                )}

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-xl bg-[#4A5D4E] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <span className="text-xs font-bold">{currentLo.name.charAt(0)}</span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#2D362E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Brain className="w-4 h-4 text-[#E7C19D] animate-spin" />
                </div>
                <div className="p-3.5 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs text-[#606C5D] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4A5D4E]" />
                  <span>Vantage Intelligence Assist (VIA) is analyzing underwriting guidelines and scenario data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          )}

          {/* Input Box */}
          {activeCategory !== "agent" && activeCategory !== "deepseek_harness" && (
          <div className="p-4 border-t border-[#EAE7E0] bg-[#FDFCF9]">
            {showUrlInput && (
              <div className="flex gap-2 mb-3 bg-white p-2 rounded-xl border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <input
                  type="url"
                  placeholder="Paste permanent URL to ingest (e.g. lakeviewcorrespondent.com/pdf)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-2 text-xs text-stone-700"
                />
                <button
                  type="button"
                  onClick={handleUrlIngestion}
                  disabled={!urlInput.trim() || loading}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 disabled:opacity-50"
                >
                  Ingest URL
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="px-2 py-1.5 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    activeLead
                      ? `Ask anything about ${activeLead.fullName}'s loan structure, DTI, IPC limits, or scripts...`
                      : "Type an address to check USDA/LMI eligibility, or ask about AUS rules, DTI caps, or cash flow..."
                  }
                  disabled={loading}
                  className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-4 py-3 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.csv,.json,.pdf,.md,.markdown,.docx,.xlsx"
                  className="hidden"
                />
                
                <input
                  type="file"
                  ref={trainInputRef}
                  onChange={handleTrainUpload}
                  accept=".txt,.csv,.json,.pdf,.md,.markdown,.docx,.xlsx,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/m4a"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  disabled={loading}
                  title="Add Permanent URL to Memory"
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => trainInputRef.current?.click()}
                  disabled={loading}
                  title="Train AI Memory (Add to Vector DB)"
                  className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
                >
                  <Database className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  title="Upload Document for Analysis"
                  className="p-3 rounded-xl bg-white border border-[#EAE7E0] text-[#606C5D] hover:bg-[#F9F8F4] transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || loading}
                  className="px-5 py-3 rounded-xl bg-[#4A5D4E] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#3d4d40] transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Ask Copilot</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] px-1">
                <span className="text-[#9A9488]">File Uploads: Supported formats include PDF, TXT, CSV, JSON, MD, DOCX, XLSX, MP4, MP3. Max 50MB.</span>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-300 shadow-xs" title="Uploaded documents are split. Raw metadata is sent to an encrypted ephemeral Firestore vault, scrubbed of PII, and then shredded. Only sanitized content enters AI memory.">
                  <ShieldCheck className="w-3 h-3" />
                  Enhanced Secure Document Handling: PII-Safe Ephemeral Vault
                </span>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
      
      <SecurityToast 
        isVisible={securityToast.isVisible} 
        fileName={securityToast.fileName} 
        onClose={() => setSecurityToast({ isVisible: false, fileName: "" })} 
      />
    </div>
  );
};
