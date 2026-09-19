import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, ShieldCheck, CheckCircle2, DollarSign, TrendingUp, CreditCard, ChevronRight, Loader2, Award, Zap } from 'lucide-react';
import { FinancialProfile, LoanOfficerProfile } from '../types';
import { HeadshotAvatar } from './HeadshotAvatar';
import { auth } from '../firebase';

interface AIPrequalWizardProps {
  loanOfficer: LoanOfficerProfile;
  currentProfile: FinancialProfile;
  onUpdateProfile: (updates: Partial<FinancialProfile>) => void;
  onComplete: () => void;
}

export const AIPrequalWizard: React.FC<AIPrequalWizardProps> = ({
  loanOfficer,
  currentProfile,
  onUpdateProfile,
  onComplete
}) => {
  const [messages, setMessages] = useState<{sender: 'user' | 'bot', text: string}[]>([
    { sender: 'bot', text: `Hi! I'm ${loanOfficer.name}'s AI Underwriting Assistant powered by Vantage Intelligence Assist (VIA). I can help you build your Pre-Qualification Profile in about 60 seconds. To start, what is your approximate total annual household income before taxes?` }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");
    
    const newHistory = [...messages, { sender: 'user' as const, text: userText }];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/gemini/advanced-prequal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify({
          message: userText,
          chatHistory: messages,
          financialProfile: currentProfile,
          loanOfficer: loanOfficer
        })
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      
      // Update UI with AI reply
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      
      // Update Global Profile state based on extracted JSON data
      if (data.extractedData) {
        const updates: Partial<FinancialProfile> = {};
        if (data.extractedData.annualIncome !== null && data.extractedData.annualIncome !== undefined) updates.annualIncome = data.extractedData.annualIncome;
        if (data.extractedData.monthlyDebt !== null && data.extractedData.monthlyDebt !== undefined) updates.monthlyDebt = data.extractedData.monthlyDebt;
        if (data.extractedData.downPaymentSavings !== null && data.extractedData.downPaymentSavings !== undefined) updates.downPaymentSavings = data.extractedData.downPaymentSavings;
        if (data.extractedData.creditScore !== null && data.extractedData.creditScore !== undefined) updates.creditScore = data.extractedData.creditScore;
        
        if (Object.keys(updates).length > 0) {
          onUpdateProfile(updates);
        }
        
        if (data.extractedData.isComplete) {
          setIsComplete(true);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'bot', text: "I'm sorry, I encountered a temporary network issue. Could you please repeat that?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to calculate completion percentage
  const calcProgress = () => {
    let score = 0;
    if (currentProfile.annualIncome > 0) score += 25;
    if (currentProfile.monthlyDebt > 0 || currentProfile.monthlyDebt === 0) score += 25; // allow 0
    if (currentProfile.downPaymentSavings > 0 || currentProfile.downPaymentSavings === 0) score += 25;
    if (currentProfile.creditScore > 0) score += 25;
    return score;
  };
  
  const progress = calcProgress();

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row gap-6 p-4 animate-fade-in">
      
      {/* LEFT: AI Chat Interface */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-[#EAE7E0] shadow-sm overflow-hidden relative">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-[#EAE7E0] bg-[#FAF9F5] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
             <HeadshotAvatar src={loanOfficer.headshotUrl} name={loanOfficer.name} className="w-10 h-10 rounded-full" />
             <div>
               <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-1.5">
                 {loanOfficer.name}'s AI Assistant
                 <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
               </h3>
               <p className="text-[11px] text-[#606C5D]">Powered by Vantage Intelligence Assist (VIA)</p>
             </div>
          </div>
          <div className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
             <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
             <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Bank-Level Privacy</span>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAF9F5]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className="shrink-0 mt-1">
                  {msg.sender === 'bot' ? (
                    <div className="w-8 h-8 rounded-full bg-[#4A5D4E] flex items-center justify-center text-white shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C18C5D] flex items-center justify-center text-white shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                  msg.sender === 'user' 
                    ? 'bg-[#4A5D4E] text-white rounded-tr-none' 
                    : 'bg-white border border-[#EAE7E0] text-[#2D362E] rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="flex gap-3 max-w-[85%] flex-row">
                 <div className="w-8 h-8 rounded-full bg-[#4A5D4E] flex items-center justify-center text-white shrink-0 mt-1">
                   <Bot className="w-4 h-4" />
                 </div>
                 <div className="p-4 rounded-2xl bg-white border border-[#EAE7E0] rounded-tl-none flex items-center gap-2">
                   <Loader2 className="w-4 h-4 animate-spin text-[#9A9488]" />
                   <span className="text-xs text-[#9A9488]">Analyzing financial data...</span>
                 </div>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#EAE7E0]">
          {isComplete ? (
            <button 
              onClick={onComplete}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all transform hover:scale-[1.02]"
            >
              <Award className="w-5 h-5 text-emerald-200" />
              <span>View My Pre-Approval Scenario</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your response here... (e.g. 'I make about 90k a year')"
                className="w-full bg-[#FAF9F5] border-2 border-[#EAE7E0] focus:border-[#4A5D4E] rounded-2xl pl-5 pr-14 py-4 text-sm text-[#2D362E] focus:outline-none transition-colors"
                disabled={isTyping}
              />
              <button 
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="absolute right-2 top-2 bottom-2 aspect-square bg-[#4A5D4E] hover:bg-[#38463B] disabled:opacity-50 disabled:bg-[#9A9488] text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
          <div className="mt-2 text-center">
            <span className="text-[10px] text-[#9A9488] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> No Credit Check or SSN Required.
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Dynamic Prequal Dashboard */}
      <div className="w-full md:w-[350px] lg:w-[400px] shrink-0 flex flex-col gap-4">
        
        <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-sm flex-1">
          <h3 className="font-serif font-bold text-[#2D362E] text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C18C5D]" />
            Your Live Profile
          </h3>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#606C5D]">Readiness Score</span>
                <span className={progress === 100 ? "text-emerald-600" : "text-[#4A5D4E]"}>{progress}%</span>
              </div>
              <div className="h-2 w-full bg-[#F1EFE9] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#4A5D4E] to-emerald-500 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Extracted Data Visuals */}
            <div className="space-y-3">
              <DataCard 
                icon={<DollarSign className="w-4 h-4" />} 
                label="Annual Income" 
                value={currentProfile.annualIncome > 0 ? `$${currentProfile.annualIncome.toLocaleString()}` : "Pending..."} 
                isSet={currentProfile.annualIncome > 0} 
              />
              <DataCard 
                icon={<CreditCard className="w-4 h-4" />} 
                label="Monthly Debt" 
                value={currentProfile.monthlyDebt > 0 || currentProfile.monthlyDebt === 0 ? `$${currentProfile.monthlyDebt.toLocaleString()}` : "Pending..."} 
                isSet={currentProfile.monthlyDebt >= 0 && progress > 0 /* hacky but functional for visual */} 
              />
              <DataCard 
                icon={<ShieldCheck className="w-4 h-4" />} 
                label="Est. Credit Score" 
                value={currentProfile.creditScore > 0 ? currentProfile.creditScore.toString() : "Pending..."} 
                isSet={currentProfile.creditScore > 0} 
              />
              <DataCard 
                icon={<Award className="w-4 h-4" />} 
                label="Down Payment" 
                value={currentProfile.downPaymentSavings > 0 || currentProfile.downPaymentSavings === 0 ? `$${currentProfile.downPaymentSavings.toLocaleString()}` : "Pending..."} 
                isSet={currentProfile.downPaymentSavings >= 0 && progress > 50} 
              />
            </div>
            
            {progress === 100 && (
              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Profile Complete!</h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-snug">
                      We have enough data to generate your custom loan scenario, calculate your max purchase price, and check DPA eligibility.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* LO Branding Card */}
        <div className="bg-[#2D362E] rounded-3xl p-5 text-white flex items-center gap-4">
           <HeadshotAvatar src={loanOfficer.headshotUrl} name={loanOfficer.name} className="w-12 h-12 rounded-full border-2 border-white/20" />
           <div>
             <div className="font-bold text-sm">Reviewed by {loanOfficer.name}</div>
             <div className="text-[10px] text-stone-400">NMLS #{loanOfficer.nmlsId} • Secure & Encrypted</div>
           </div>
        </div>
        
      </div>
    </div>
  );
};

const DataCard = ({ icon, label, value, isSet }: { icon: React.ReactNode, label: string, value: string, isSet: boolean }) => (
  <div className={`p-3 rounded-2xl border flex items-center justify-between transition-all duration-500 ${isSet ? 'bg-white border-[#EAE7E0] shadow-xs' : 'bg-[#F1EFE9] border-transparent opacity-60'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSet ? 'bg-[#4A5D4E]/10 text-[#4A5D4E]' : 'bg-stone-200 text-[#9A9488]'}`}>
        {icon}
      </div>
      <span className={`text-xs font-semibold ${isSet ? 'text-[#2D362E]' : 'text-[#9A9488]'}`}>{label}</span>
    </div>
    <span className={`text-sm font-bold ${isSet ? 'text-[#4A5D4E]' : 'text-[#9A9488]'}`}>{value}</span>
  </div>
);
