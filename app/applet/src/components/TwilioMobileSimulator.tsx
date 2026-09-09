import React, { useState, useEffect, useRef } from "react";
import { Smartphone, Send, MessageCircle, X, CheckCircle2 } from "lucide-react";
import { PropertyActionItem } from "../types";
import { subscribeToAllPropertyActionItems } from "../services/propertyConversationService";

export const TwilioMobileSimulator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [actionItems, setActionItems] = useState<PropertyActionItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const unsub = subscribeToAllPropertyActionItems(setActionItems);
    return () => unsub();
  }, []);

  const pendingItems = actionItems.filter(i => i.status === 'pending');
  const activeItem = pendingItems[0]; // Show the most recent one on the simulated phone
  
  useEffect(() => {
    if (pendingItems.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [pendingItems.length, isOpen]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeItem, replyText, isOpen]);

  const handleSimulateReply = async () => {
    if (!replyText.trim() || !activeItem) return;
    
    // Simulate hitting the webhook via API to prove it works backend-to-backend
    try {
      await fetch('/api/twilio/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          From: "+15550000000", 
          To: "+15551111111", 
          Body: replyText
        })
      });
      setReplyText("");
    } catch (e) {
      console.error("Simulator failed", e);
    }
  };

  if (!isOpen && pendingItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Toggle button if closed */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg pointer-events-auto hover:bg-indigo-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-xs font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full absolute -top-1 -right-1">{pendingItems.length}</span>
        </button>
      )}

      {/* iPhone Simulator Frame */}
      {isOpen && (
        <div className="w-[300px] sm:w-[320px] h-[500px] bg-white rounded-[2rem] border-[8px] border-slate-800 shadow-2xl flex flex-col overflow-hidden pointer-events-auto relative">
          {/* Dynamic Island / Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-xl z-20"></div>
          
          {/* Status Bar */}
          <div className="bg-slate-100 h-8 flex justify-between items-end px-4 pb-1 text-[10px] font-semibold text-slate-800 z-10">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <span className="font-bold">5G</span>
              <Smartphone className="w-3 h-3" />
            </div>
          </div>
          
          {/* Twilio App Header */}
          <div className="bg-indigo-600 text-white p-3 text-center shadow-md flex items-center justify-between z-10">
            <div className="w-6"></div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold flex items-center gap-1"><MessageCircle className="w-4 h-4"/> Twilio Proxy</span>
              <span className="text-[9px] opacity-80">LO Mobile Simulator</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-6 h-6 flex items-center justify-center text-white/80 hover:text-white rounded-full bg-white/10 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {/* Chat Body */}
          <div className="flex-1 bg-slate-50 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {pendingItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="text-xs">No pending action items.<br/>Incoming questions will arrive via SMS here.</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                {/* Incoming Message Bubble */}
                <div className="flex flex-col items-start max-w-[90%]">
                  <div className="bg-slate-200 text-slate-800 rounded-2xl rounded-tl-sm p-3 shadow-xs">
                    <p className="text-xs leading-relaxed">
                      <strong>New Property Question!</strong><br/><br/>
                      <strong>From:</strong> {activeItem?.leadName}<br/>
                      <strong>Re:</strong> {activeItem?.propertyAddress}<br/><br/>
                      "{activeItem?.questionText}"<br/><br/>
                      <em>Reply directly to this text to sync answer to buyer.</em>
                    </p>
                  </div>
                </div>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input Area */}
          {pendingItems.length > 0 && (
            <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center gap-2 z-10 pb-4">
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSimulateReply();
                }}
                placeholder="Text Message"
                className="flex-1 bg-white rounded-full px-4 py-2 text-xs border border-slate-200 focus:outline-none focus:border-indigo-400"
              />
              <button 
                onClick={handleSimulateReply}
                disabled={!replyText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-50 shrink-0 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          )}
          
          {/* Home Indicator */}
          <div className="h-4 bg-slate-50 flex items-center justify-center z-10">
            <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};
