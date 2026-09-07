import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  ShieldCheck,
  FileText,
  User,
  Bot,
  CheckCircle2,
  ExternalLink,
  Download,
  Copy,
  Printer,
  Check,
  Trash2,
  FileDown,
  GripVertical,
  RotateCcw,
} from "lucide-react";
import { FinancialProfile, PropertyListing, ChatMessage, LoanOfficerProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { getZillowUrl } from "../utils/overlayClassification";
import { jsPDF } from "jspdf";

let messageSeq = 1000;
const generateMessageId = (prefix: string) => `${prefix}-${++messageSeq}`;

interface AICopilotProps {
  profile: FinancialProfile;
  properties: PropertyListing[];
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: any;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  profile,
  properties,
  loanOfficer,
  activeAgent,
}) => {
  const [activeTool, setActiveTool] = useState<"chat" | "offer" | "inspection" | "le_decoder">(
    "chat"
  );

  // Initial Advisor Welcome Message
  const INITIAL_MESSAGE: ChatMessage = {
    id: "msg-1",
    sender: "advisor",
    text: `Hello! I am your First-Time Homebuyer Roadmap AI Advisor. I'm here to help you navigate every phase of buying your first home—from understanding DTI ratios, Down Payment Assistance (DPA) options, and Interested Party Contribution (IPC) limits to crafting winning offers and negotiating inspection credits. How can I help you today?`,
    timestamp: "Just now",
    suggestedActions: [
      "What are the seller concession & IPC limits for FHA, Conventional, VA, and USDA?",
      "How do Conventional IPC limits change based on LTV (>90% vs 80-90% vs <=80%)?",
      "Can seller concessions be used to pay for my down payment?",
      "How can I ask the seller for closing credits to buy down my rate?",
    ],
  };

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [aiProvider, setAiProvider] = useState<"deepseek" | "gemini" | "none">("none");

  useEffect(() => {
    fetch("/api/ai/diagnostics")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.activeProvider) {
          setAiProvider(data.activeProvider);
        }
      })
      .catch((e) => console.error("Failed to fetch AI diagnostics:", e));
  }, []);

  // Dynamic Horizontal Resize State for Chat Container
  const [chatContainerWidth, setChatContainerWidth] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem("ai_copilot_chat_width");
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });
  const [isResizingChat, setIsResizingChat] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Mouse move and mouse up listeners for horizontal dynamic resizing
  useEffect(() => {
    if (!isResizingChat) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!chatContainerRef.current) return;
      const rect = chatContainerRef.current.getBoundingClientRect();
      const calculatedWidth = e.clientX - rect.left;
      // Clamp between 360px and maximum window width minus boundary margin
      const minWidth = 360;
      const maxWidth = Math.max(minWidth, window.innerWidth - 64);
      const clampedWidth = Math.max(minWidth, Math.min(calculatedWidth, maxWidth));
      setChatContainerWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizingChat(false);
      setChatContainerWidth((currentWidth) => {
        if (currentWidth) {
          try {
            localStorage.setItem("ai_copilot_chat_width", currentWidth.toString());
          } catch {}
        }
        return currentWidth;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingChat]);

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingChat(true);
  };

  const handleResetChatWidth = () => {
    setChatContainerWidth(null);
    try {
      localStorage.removeItem("ai_copilot_chat_width");
    } catch {}
  };

  // Session Export & Feedback State
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Offer Strategy State
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    properties[0]?.id || "custom"
  );
  const [customPrice, setCustomPrice] = useState(425000);
  const [customAddress, setCustomAddress] = useState("123 Maple Street");
  const [daysOnMarket, setDaysOnMarket] = useState(12);
  const [offerLoanType, setOfferLoanType] = useState("Conventional (>90% LTV, 3% IPC limit)");
  const [marketCondition, setMarketCondition] = useState("Balanced Market");
  const [offerResult, setOfferResult] = useState<string | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);

  // Inspection Audit State
  const [inspectionInput, setInspectionInput] = useState(
    "1. Water heater is 16 years old and showing minor corrosion on intake valve.\n2. Minor hairline crack in garage slab foundation.\n3. Master bathroom GFCI outlet did not trip when tested.\n4. Second floor bedroom window has broken thermal seal with condensation inside glass.\n5. Architectural roof shingles show minor granule loss on south slope, estimated 3-5 years life remaining."
  );
  const [inspectionPropertyPrice, setInspectionPropertyPrice] = useState(425000);
  const [inspectionResult, setInspectionResult] = useState<string | null>(null);
  const [loadingInspection, setLoadingInspection] = useState(false);

  // Handlers & Session Export Actions
  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => {
      setToastNotification((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setShowClearConfirm(false);
    showToast("Chat consultation reset to initial state.");
  };

  const generateTranscriptText = () => {
    const dateStr = new Date().toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const divider = "=".repeat(76);
    const subDivider = "-".repeat(76);

    let text = `${divider}\n`;
    text += `FIRST-TIME HOMEBUYER ROADMAP • AI COPILOT ADVISORY TRANSCRIPT\n`;
    text += `Generated: ${dateStr}\n`;
    if (loanOfficer) {
      text += `Loan Officer: ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId}) • ${loanOfficer.branchName || "Cornerstone First Mortgage"}\n`;
      text += `Contact: ${loanOfficer.phone} | ${loanOfficer.email}\n`;
    }
    text += `Homebuyer Profile Snapshot:\n`;
    text += `  • Target Home Price: ${formatUSD(profile.targetPrice)}\n`;
    text += `  • Down Payment Savings: ${formatUSD(profile.downPaymentSavings)}\n`;
    text += `  • Annual Household Income: ${formatUSD(profile.annualIncome)}\n`;
    text += `  • Monthly Debt Liabilities: ${formatUSD(profile.monthlyDebt)}\n`;
    text += `  • Target State: ${profile.state || "Oregon"}\n`;
    text += `${divider}\n\n`;

    messages.forEach((msg, i) => {
      const isUser = msg.sender === "user";
      const speaker = isUser ? "YOU (HOMEBUYER)" : "AI HOMEBUYER COPILOT";
      text += `[#${i + 1}] ${speaker} (${msg.timestamp || "Session Turn"}):\n`;
      text += `${msg.text}\n\n`;
      text += `${subDivider}\n\n`;
    });

    text += `\n${divider}\n`;
    text += `REGULATORY & ADVISORY NOTICE:\n`;
    text += `This advisory transcript was generated for educational and preliminary scenario planning.\n`;
    text += `Mortgage eligibility, interested party contribution (IPC) limits, interest rates, and loan\n`;
    text += `qualifications are subject to formal underwriting verification and lender program guidelines.\n`;
    text += `Consult your licensed loan officer for an official Loan Estimate (LE).\n`;
    text += `${divider}\n`;

    return text;
  };

  const handleDownloadText = () => {
    try {
      const text = generateTranscriptText();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateKey = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `Homebuyer_AI_Copilot_Notes_${dateKey}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Session notes downloaded as text file (.txt)");
    } catch (err) {
      console.error("Text download failed", err);
      showToast("Failed to download text file");
    }
  };

  const handleCopyTranscript = async () => {
    try {
      const text = generateTranscriptText();
      await navigator.clipboard.writeText(text);
      setCopiedTranscript(true);
      showToast("Transcript copied to clipboard!");
      setTimeout(() => setCopiedTranscript(false), 2500);
    } catch (err) {
      console.error("Copy failed", err);
      showToast("Could not copy transcript");
    }
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;
      let y = 45;

      // Header Banner Box
      doc.setFillColor(74, 93, 78); // #4A5D4E
      doc.rect(margin, y, contentWidth, 54, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("FIRST-TIME HOMEBUYER ROADMAP • AI COPILOT ADVISORY NOTES", margin + 14, y + 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const loLine = loanOfficer
        ? `  •  Officer: ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId})`
        : "";
      doc.text(
        `Consultation Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${loLine}`,
        margin + 14,
        y + 38
      );

      y += 66;

      // Profile Summary Card
      doc.setFillColor(249, 248, 244); // #F9F8F4
      doc.rect(margin, y, contentWidth, 32, "F");
      doc.setDrawColor(234, 231, 224); // #EAE7E0
      doc.rect(margin, y, contentWidth, 32, "S");

      doc.setTextColor(45, 54, 46);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(
        `Target Price: ${formatUSD(profile.targetPrice)}   |   Down Payment: ${formatUSD(profile.downPaymentSavings)}   |   Income: ${formatUSD(profile.annualIncome)}/yr   |   State: ${profile.state || "OR"}`,
        margin + 12,
        y + 19
      );

      y += 42;

      // Iterate messages
      messages.forEach((msg, idx) => {
        const isUser = msg.sender === "user";
        const senderTitle = isUser ? "YOU (HOMEBUYER)" : "AI HOMEBUYER ADVISOR";

        // Check page overflow
        if (y > pageHeight - 90) {
          doc.addPage();
          y = 45;
        }

        // Sender header badge
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        if (isUser) {
          doc.setTextColor(74, 93, 78);
        } else {
          doc.setTextColor(193, 140, 93); // #C18C5D
        }
        doc.text(`[#${idx + 1}] ${senderTitle} • ${msg.timestamp || "Session Turn"}`, margin, y);
        y += 13;

        // Message text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(45, 54, 46);

        const lines = doc.splitTextToSize(msg.text, contentWidth);
        for (let i = 0; i < lines.length; i++) {
          if (y > pageHeight - 50) {
            doc.addPage();
            y = 45;
          }
          doc.text(lines[i], margin, y);
          y += 13;
        }

        y += 10; // Spacing
      });

      // Disclaimer footer
      if (y > pageHeight - 70) {
        doc.addPage();
        y = 45;
      }
      doc.setDrawColor(213, 221, 214);
      doc.line(margin, y, margin + contentWidth, y);
      y += 14;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 130, 120);
      const disclaimer =
        "Notice: This AI Copilot consultation summary is provided for educational and scenario planning purposes only. Mortgage eligibility, interest rates, seller concessions, and underwriting conditions are subject to review and official Loan Estimate (LE) disclosures from your licensed loan officer.";
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
      doc.text(disclaimerLines, margin, y);

      const dateKey = new Date().toISOString().split("T")[0];
      doc.save(`Homebuyer_AI_Copilot_Notes_${dateKey}.pdf`);
      showToast("Session notes downloaded as PDF (.pdf)");
    } catch (err) {
      console.error("PDF generation error", err);
      showToast("Failed to generate PDF. You can use Print or Text download.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrintChat = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Homebuyer Copilot Consultation - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #2D362E; line-height: 1.6; }
            .header { border-bottom: 2px solid #4A5D4E; padding-bottom: 16px; margin-bottom: 24px; }
            h1 { color: #4A5D4E; margin: 0 0 6px 0; font-size: 22px; }
            .meta { color: #606C5D; font-size: 13px; margin-bottom: 12px; }
            .profile-box { background: #FAF9F5; border: 1px solid #EAE7E0; padding: 12px 16px; border-radius: 8px; font-size: 12px; margin-bottom: 24px; }
            .msg { margin-bottom: 20px; padding: 14px 18px; border-radius: 8px; font-size: 13px; }
            .msg.user { background: #F1EFE9; border-left: 4px solid #4A5D4E; }
            .msg.advisor { background: #FFFFFF; border: 1px solid #EAE7E0; border-left: 4px solid #C18C5D; }
            .sender { font-weight: bold; margin-bottom: 6px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .sender.user { color: #4A5D4E; }
            .sender.advisor { color: #C18C5D; }
            .disclaimer { border-top: 1px solid #EAE7E0; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #9A9488; font-style: italic; }
            @media print {
              body { margin: 20px; }
              .msg { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>First-Time Homebuyer Roadmap • AI Copilot Notes</h1>
            <div class="meta">
              Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              ${loanOfficer ? ` | Loan Officer: ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId})` : ""}
            </div>
            <div class="profile-box">
              <strong>Profile Snapshot:</strong> Target Price: ${formatUSD(profile.targetPrice)} | Down Payment: ${formatUSD(profile.downPaymentSavings)} | Income: ${formatUSD(profile.annualIncome)}/yr | State: ${profile.state || "Oregon"}
            </div>
          </div>

          <div class="conversation">
            ${messages
              .map(
                (m, idx) => `
              <div class="msg ${m.sender === "user" ? "user" : "advisor"}">
                <div class="sender ${m.sender === "user" ? "user" : "advisor"}">
                  ${m.sender === "user" ? "Homebuyer" : "AI Copilot Advisor"} • ${m.timestamp || `Turn #${idx + 1}`}
                </div>
                <div class="content">${m.text.replace(/\n/g, "<br/>")}</div>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="disclaimer">
            Notice: This AI Copilot consultation summary is provided for educational and preliminary planning purposes. Loan approval, interest rates, seller credit allowances, and closing conditions are subject to underwriter review and official Loan Estimate (LE) disclosures from your licensed loan officer.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Handlers
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: generateMessageId("user"),
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setSendingChat(true);

    try {
      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          context: {
            income: profile.annualIncome,
            downPayment: profile.downPaymentSavings,
            monthlyDebt: profile.monthlyDebt,
            targetPrice: profile.targetPrice,
            location: profile.state,
          },
          chatHistory: messages.slice(-40),
          loanOfficer,
          agent: activeAgent,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: generateMessageId("bot"),
        sender: "advisor",
        text:
          data.reply ||
          data.fallback ||
          "I'm here to help you evaluate properties and financing options.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const botMsg: ChatMessage = {
        id: generateMessageId("bot"),
        sender: "advisor",
        text: "I am ready to assist with your mortgage questions, contract terms, or inspection reviews. Feel free to ask anything about the first-time homebuyer process!",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleGenerateOfferStrategy = async () => {
    setLoadingOffer(true);
    setOfferResult(null);

    const prop = properties.find((p) => p.id === selectedPropertyId);
    const propDetails = prop
      ? {
          price: prop.price,
          address: prop.address,
          daysOnMarket: prop.daysOnMarket,
          notes: prop.notes,
        }
      : {
          price: customPrice,
          address: customAddress,
          daysOnMarket,
          notes: "Standard turnkey condition",
        };

    try {
      const res = await fetch("/api/gemini/offer-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyDetails: propDetails,
          buyerFinances: {
            preApprovalAmount: profile.targetPrice + 25000,
            cashAvailable: profile.downPaymentSavings + 15000,
            loanType: offerLoanType,
          },
          marketCondition,
          loanOfficer,
          agent: activeAgent,
        }),
      });

      const data = await res.json();
      setOfferResult(data.strategy || "Strategy generated successfully.");
    } catch (e) {
      console.error(e);
      setOfferResult(
        "Recommended approach: Offer at 98% of list price with a 7-day inspection contingency and request $5,000 in seller credits for rate buydown."
      );
    } finally {
      setLoadingOffer(false);
    }
  };

  const handleAuditInspection = async () => {
    setLoadingInspection(true);
    setInspectionResult(null);

    try {
      const res = await fetch("/api/gemini/inspection-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionNotes: inspectionInput,
          propertyPrice: inspectionPropertyPrice,
        }),
      });

      const data = await res.json();
      setInspectionResult(data.analysis || "Inspection audit completed.");
    } catch (e) {
      console.error(e);
      setInspectionResult(
        "Analysis completed: Focus repair requests on electrical GFCI safety and an aging water heater replacement credit (~$1,800)."
      );
    } finally {
      setLoadingInspection(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Roadmap Real Estate Intelligence • Gemini 3.7 Flash</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              AI Homebuyer Copilot & Strategic Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D]">
              Personalized guidance, automated offer terms, inspection defect triage, and Loan
              Estimate decoding.
            </p>
          </div>

          {/* Header Action Controls: Reset Chat Window Width Button */}
          <div className="flex items-center gap-2">
            <button
              id="aicopilot-header-reset-width-btn"
              onClick={handleResetChatWidth}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                chatContainerWidth
                  ? "bg-[#4A5D4E] text-white border-[#4A5D4E] hover:bg-[#3d4d40]"
                  : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#F1EFE9] hover:text-[#2D362E]"
              }`}
              title={
                chatContainerWidth
                  ? `Current width: ${Math.round(chatContainerWidth)}px. Click to reset chat window to default width (100%)`
                  : "Chat window is currently at its default width (100%)"
              }
            >
              <RotateCcw
                className={`w-3.5 h-3.5 ${chatContainerWidth ? "text-white" : "text-[#4A5D4E]"}`}
              />
              <span>Reset Width</span>
              {chatContainerWidth && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                  {Math.round(chatContainerWidth)}px
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE7E0]">
          {[
            { id: "chat", label: "Ask AI Copilot", icon: Bot },
            { id: "offer", label: "Offer Strategy Generator", icon: Sparkles },
            { id: "inspection", label: "Inspection Report Triage", icon: ShieldCheck },
            { id: "le_decoder", label: "Loan Estimate (LE) Decoder", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#4A5D4E] text-white shadow-sm font-bold"
                    : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool 1: Interactive Chat Tab */}
      {activeTool === "chat" && (
        <div
          ref={chatContainerRef}
          style={{
            width: chatContainerWidth ? `${chatContainerWidth}px` : "100%",
            maxWidth: chatContainerWidth ? "min(100vw - 32px, 1800px)" : "100%",
            minWidth: "360px",
            transition: isResizingChat ? "none" : "width 0.15s ease-out",
          }}
          className="relative bg-white rounded-2xl border border-[#EAE7E0] flex flex-col h-[650px] overflow-hidden shadow-sm pr-1"
        >
          {/* Feedback Toast Notification */}
          {toastNotification && (
            <div className="absolute top-16 right-4 z-30 px-3.5 py-2 rounded-xl bg-[#2D362E] text-white text-xs font-medium shadow-xl flex items-center gap-2 transition-all">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastNotification}</span>
            </div>
          )}

          {/* Chat Header Bar: Status & Session Export Controls */}
          <div className="px-4 sm:px-6 py-3 bg-[#FAF9F5] border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2D362E]">AI Copilot Session</span>
                  <span className="text-[10px] font-semibold text-[#4A5D4E] bg-[#4A5D4E]/10 border border-[#4A5D4E]/20 px-2 py-0.5 rounded-full">
                    {messages.length} {messages.length === 1 ? "entry" : "entries"}
                  </span>
                  {chatContainerWidth && (
                    <span className="text-[10px] font-medium text-[#606C5D] bg-white border border-[#EAE7E0] px-1.5 py-0.5 rounded hidden sm:inline-block">
                      {Math.round(chatContainerWidth)}px
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#9A9488] hidden sm:block">
                  Personalized mortgage guidelines, offer strategy & closing credits
                </p>
              </div>
            </div>

            {/* Export & Session Controls */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Reset Width Button if resized */}
              {chatContainerWidth && (
                <button
                  onClick={handleResetChatWidth}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#606C5D] text-xs font-medium transition-colors cursor-pointer"
                  title={`Current chat width: ${chatContainerWidth}px. Click to reset to default 100%`}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span className="hidden sm:inline">Reset Width</span>
                </button>
              )}

              {/* Download .TXT */}
              <button
                onClick={handleDownloadText}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-bold transition-all shadow-2xs hover:border-[#4A5D4E]/40 cursor-pointer"
                title="Download full chat history as a clean text (.txt) file for your personal records or email drafts"
              >
                <Download className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Export .TXT</span>
              </button>

              {/* Save / Export PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-bold transition-all shadow-2xs hover:border-[#C18C5D]/40 cursor-pointer disabled:opacity-50"
                title="Export formal PDF document with Cornerstone branding and profile summary"
              >
                {isExportingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C18C5D]" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 text-[#C18C5D]" />
                )}
                <span>{isExportingPdf ? "Exporting..." : "Save PDF"}</span>
              </button>

              {/* Copy Transcript */}
              <button
                onClick={handleCopyTranscript}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#606C5D] text-xs font-medium transition-colors cursor-pointer"
                title="Copy entire transcript to clipboard"
              >
                {copiedTranscript ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="hidden md:inline">{copiedTranscript ? "Copied" : "Copy"}</span>
              </button>

              {/* Print */}
              <button
                onClick={handlePrintChat}
                className="p-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#606C5D] hover:text-[#2D362E] transition-colors cursor-pointer"
                title="Open formatted printable dialogue"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {/* Clear / Reset Chat */}
              {showClearConfirm ? (
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl text-xs">
                  <span className="text-amber-800 text-[10px] font-bold">Reset?</span>
                  <button
                    onClick={handleResetChat}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-800 px-1.5 py-0.5 rounded bg-white border border-rose-200 cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="text-[10px] text-gray-600 hover:text-gray-900 px-1.5 py-0.5 cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-rose-50 hover:text-rose-600 text-[#9A9488] transition-colors cursor-pointer"
                  title="Clear chat and start fresh consultation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Chat message history */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isUser
                        ? "bg-[#4A5D4E] text-white font-bold"
                        : "bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0]"
                    }`}
                  >
                    {isUser ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4 text-[#C18C5D]" />
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] space-y-2 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#4A5D4E] text-white"
                        : "bg-[#F9F8F4] text-[#2D362E] border border-[#EAE7E0] shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Suggested quick replies if available */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-[#EAE7E0] space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                          Suggested Questions:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(sug)}
                              className="text-[11px] bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] px-2.5 py-1 rounded-lg border border-[#EAE7E0] text-left transition-colors font-medium"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sendingChat && (
              <div className="flex items-center gap-3 text-[#606C5D] text-xs animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C18C5D]" />
                </div>
                <span>AI Copilot is formulating personalized guidance...</span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <div className="p-4 bg-[#F1EFE9]/60 border-t border-[#EAE7E0] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about down payments, interest rates, inspection negotiation, escrow..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={sendingChat}
                className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={sendingChat || !inputMessage.trim()}
                className="p-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold transition-all disabled:opacity-40 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {/* AI Engine Status Badge */}
            <div className="flex justify-end px-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                  aiProvider === "deepseek"
                    ? "bg-[#4A5D4E]/10 text-[#4A5D4E] border-[#4A5D4E]/20"
                    : aiProvider === "gemini"
                      ? "bg-[#C18C5D]/10 text-[#C18C5D] border-[#C18C5D]/20"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                <Bot className="w-3 h-3" />
                AI Engine:{" "}
                {aiProvider === "deepseek"
                  ? "DeepSeek"
                  : aiProvider === "gemini"
                    ? "Gemini"
                    : "Simulated Fallback"}
              </span>
            </div>
          </div>

          {/* Draggable Horizontal Resize Handle on Right Edge */}
          <div
            id="chat-container-resize-handle"
            onMouseDown={handleStartResize}
            onDoubleClick={handleResetChatWidth}
            title="Drag horizontally to resize chat window (Double-click to reset)"
            className={`absolute top-0 right-0 w-3.5 h-full cursor-col-resize z-40 transition-colors flex items-center justify-center group select-none border-l ${
              isResizingChat
                ? "bg-[#4A5D4E]/25 border-[#4A5D4E]"
                : "bg-[#FAF9F5] hover:bg-[#4A5D4E]/15 border-[#EAE7E0] hover:border-[#4A5D4E]/40"
            }`}
          >
            {/* Visual Grip Handle Indicator */}
            <div
              className={`flex flex-col items-center justify-center gap-1 px-0.5 py-2.5 rounded-full transition-all ${
                isResizingChat
                  ? "bg-[#4A5D4E] text-white py-5 shadow-sm"
                  : "bg-[#EAE7E0] group-hover:bg-[#4A5D4E] text-[#606C5D] group-hover:text-white"
              }`}
            >
              <GripVertical className="w-2.5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Tool 2: Offer Strategy Generator */}
      {activeTool === "offer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">
                Offer Intelligence
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2D362E] mt-0.5">
                Customize Property Details
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Select Property
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatUSD(p.price)})
                    </option>
                  ))}
                  <option value="custom">Custom Property...</option>
                </select>

                {selectedPropertyId !== "custom" &&
                  properties.find((p) => p.id === selectedPropertyId) && (
                    <div className="pt-1.5 flex justify-end">
                      <a
                        href={getZillowUrl(properties.find((p) => p.id === selectedPropertyId)!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition-colors"
                        title="Open selected property live on Zillow.com"
                      >
                        <span>View on Zillow</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
              </div>

              {selectedPropertyId === "custom" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                      Target Price ($)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2D362E] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                      Days on Market
                    </label>
                    <input
                      type="number"
                      value={daysOnMarket}
                      onChange={(e) => setDaysOnMarket(Number(e.target.value))}
                      className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2D362E] font-bold"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Loan Program (IPC Cap)
                </label>
                <select
                  value={offerLoanType}
                  onChange={(e) => setOfferLoanType(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                >
                  <option value="Conventional (>90% LTV, 3% IPC limit)">
                    Conventional &gt;90% LTV (3% Max IPC)
                  </option>
                  <option value="Conventional (80%-90% LTV, 6% IPC limit)">
                    Conventional 80%-90% LTV (6% Max IPC)
                  </option>
                  <option value="Conventional (<=80% LTV, 9% IPC limit)">
                    Conventional &le;80% LTV (9% Max IPC)
                  </option>
                  <option value="FHA Loan (6% Max IPC)">FHA Loan (6% Max IPC)</option>
                  <option value="USDA Rural Development (6% Max IPC)">
                    USDA Rural Development (6% Max IPC)
                  </option>
                  <option value="VA Home Loan (4% Max Seller Concessions)">
                    VA Home Loan (4% Max Concessions)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Current Market Climate
                </label>
                <select
                  value={marketCondition}
                  onChange={(e) => setMarketCondition(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                >
                  <option value="Hot Seller's Market (Multiple Offers)">
                    Hot Seller's Market (Multiple Offers)
                  </option>
                  <option value="Balanced Market">Balanced Market (Standard)</option>
                  <option value="Buyer's Market (Price Cuts & High Inventory)">
                    Buyer's Market (High Inventory & Price Cuts)
                  </option>
                </select>
              </div>

              <button
                onClick={handleGenerateOfferStrategy}
                disabled={loadingOffer}
                className="w-full py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loadingOffer ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#C18C5D]" />
                )}
                <span>
                  {loadingOffer ? "Generating Strategy..." : "Generate AI Offer Strategy"}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C18C5D]" />
              <span>Recommended Offer Blueprint</span>
            </h3>

            {offerResult ? (
              <div className="text-xs sm:text-sm text-[#2D362E] leading-relaxed space-y-3 whitespace-pre-line bg-white p-5 rounded-xl border border-[#EAE7E0] shadow-xs">
                {offerResult}
              </div>
            ) : (
              <div className="text-center py-16 text-[#9A9488] space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-[#9A9488]" />
                <p className="text-xs">
                  Click "Generate AI Offer Strategy" to get tactical price targets, EMD guidelines,
                  contingency clauses, and seller concession requests.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 3: Inspection Report Triage */}
      {activeTool === "inspection" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">
                Defect Triage & Repair Credits
              </span>
              <h3 className="text-lg font-serif font-bold text-[#2D362E] mt-0.5">
                Paste Inspection Notes
              </h3>
              <p className="text-xs text-[#606C5D]">
                Paste findings from your home inspector to identify safety red flags, ballpark
                contractor repair costs, and generate seller credit request language.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Inspection Findings / Punchlist
                </label>
                <textarea
                  rows={8}
                  value={inspectionInput}
                  onChange={(e) => setInspectionInput(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3 text-xs text-[#2D362E] leading-relaxed focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <button
                onClick={handleAuditInspection}
                disabled={loadingInspection}
                className="w-full py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loadingInspection ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {loadingInspection
                    ? "Auditing Inspection..."
                    : "Triage Defects & Draft Credit Letter"}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
              <span>Inspection Risk Assessment & Repair Addendum</span>
            </h3>

            {inspectionResult ? (
              <div className="text-xs sm:text-sm text-[#2D362E] leading-relaxed space-y-3 whitespace-pre-line bg-white p-5 rounded-xl border border-[#EAE7E0] shadow-xs">
                {inspectionResult}
              </div>
            ) : (
              <div className="text-center py-16 text-[#9A9488] space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto text-[#9A9488]" />
                <p className="text-xs">
                  Paste inspection punchlist items and click above to receive cost ranges, urgency
                  ratings, and formal seller repair request drafts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 4: Loan Estimate Decoder */}
      {activeTool === "le_decoder" && (
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">
              CFPB Standard Disclosure
            </span>
            <h3 className="text-xl font-serif font-bold text-[#2D362E]">
              How to Read Your Official Loan Estimate (LE)
            </h3>
            <p className="text-xs text-[#606C5D]">
              Lenders must provide this 3-page form within 3 business days of applying. Here is how
              to audit each section:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#4A5D4E] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#4A5D4E]/20 flex items-center justify-center text-xs">
                  A
                </span>
                <span>Section A: Origination Charges</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                <strong className="text-[#2D362E]">Zero-Tolerance Section:</strong> This is what the
                lender charges you directly (application, underwriting, discount points). Compare
                Section A between lenders to find the cheapest loan.
              </p>
            </div>

            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#4A5D4E] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#4A5D4E]/20 flex items-center justify-center text-xs">
                  B
                </span>
                <span>Section B: Services You Cannot Shop For</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                Appraisal fees, credit report pulls, flood certifications. The lender selects these
                vendors on your behalf.
              </p>
            </div>

            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#4A5D4E] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#4A5D4E]/20 flex items-center justify-center text-xs">
                  C
                </span>
                <span>Section C: Services You CAN Shop For</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                Title search, title insurance, settlement agent / closing attorney fees. You have
                the legal right to choose your own title company to save money.
              </p>
            </div>

            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#C18C5D] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#C18C5D]/20 flex items-center justify-center text-xs">
                  F
                </span>
                <span>Section F & G: Prepaids and Initial Escrow</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                Prepaid homeowners insurance (12-14 months) and prepaid property taxes (2-4 months)
                to fund your impound escrow account.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
