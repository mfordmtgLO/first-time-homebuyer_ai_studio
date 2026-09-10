import React from "react";
import { ShieldCheck, X, FileText, Lock, Smartphone, CheckCircle2 } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2D362E] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
                <span>Privacy Policy</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800 uppercase font-bold">
                  TCPA & 10DLC Compliant
                </span>
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Cornerstone First Mortgage · Mike Ford (NMLS #288455) · Effective Date: January 1, 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Policy Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-[#2D362E] text-xs sm:text-sm leading-relaxed">
          {/* Key Twilio & Carrier Compliance Callout Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Consumer SMS & Cellular Privacy Commitment</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">
              <strong>Strict No-Sharing Policy:</strong> No mobile information or phone numbers collected through our website, chatbots, or inquiry forms will be shared with third parties or affiliates for marketing or promotional purposes. Information sharing to subcontractors in support services (such as SMS delivery) is permitted solely for delivering the requested transaction services.
            </p>
          </div>

          <section className="space-y-2">
            <h4 className="font-bold text-sm text-[#2D362E] uppercase tracking-wide">1. Information We Collect</h4>
            <p className="text-[#606C5D]">
              When you use our First-Time Homebuyer Portal, request grant eligibility reviews, or communicate with our licensed loan officers and real estate partners, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#606C5D]">
              <li><strong>Contact Details:</strong> Your name, email address, mobile phone number, and preferred contact times.</li>
              <li><strong>Mortgage & Grant Preferences:</strong> Desired purchase city/county, target home price, down payment assistance grant selections, and pre-qualification timeline.</li>
              <li><strong>Consent Records:</strong> Timestamps, IP addresses, and digital confirmation of your TCPA express written consent for SMS and email alerts.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-sm text-[#2D362E] uppercase tracking-wide">2. How We Use Your Information</h4>
            <p className="text-[#606C5D]">
              We use the collected information strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#606C5D]">
              <li>Providing home loan estimates, Down Payment Assistance (DPA) qualification assessments, and property listing updates.</li>
              <li>Connecting you with licensed mortgage professional Mike Ford (NMLS #288455) and your designated real estate partner.</li>
              <li>Sending transactional SMS alerts regarding property questions, loan milestone updates, or scheduled appointments when opted-in.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-sm text-[#2D362E] uppercase tracking-wide flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#4A5D4E]" />
              <span>3. SMS / Text Messaging Terms & Disclosures (A2P 10DLC & TCPA)</span>
            </h4>
            <p className="text-[#606C5D]">
              If you opt-in to receive text messages through our web forms, chat assistants, or listing inquiry tools:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#606C5D]">
              <li><strong>Message Frequency:</strong> Recurring messages may vary based on your homebuying stage, requested rate alerts, and property inquiries.</li>
              <li><strong>Carrier Rates:</strong> Message and data rates may apply depending on your mobile carrier and plan.</li>
              <li><strong>Opt-Out Instructions:</strong> You can cancel SMS notifications at any time by replying <strong>STOP</strong> to any message received. Upon sending STOP, you will receive a single confirmation message confirming your unsubscription.</li>
              <li><strong>Customer Support:</strong> For assistance, reply <strong>HELP</strong> to any text message, call <strong>(503) 555-0199</strong>, or email <strong>fordmj@gmail.com</strong>.</li>
              <li><strong>Carriers Supported:</strong> Compatible carriers include AT&amp;T, T-Mobile, Verizon, Sprint, and major independent US cellular networks. Carriers are not liable for delayed or undelivered messages.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-sm text-[#2D362E] uppercase tracking-wide">4. Data Security & Storage</h4>
            <p className="text-[#606C5D]">
              We adhere to strict banking-level encryption standards (TLS 1.3 in transit and AES-256 at rest) in compliance with the Gramm-Leach-Bliley Act (GLBA Safeguards Rule, 16 CFR Part 314). Your personal information and credit parameters are housed in secure enterprise cloud environments and are never sold to data aggregators.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="font-bold text-sm text-[#2D362E] uppercase tracking-wide">5. Contact Information & Licensing</h4>
            <div className="p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs space-y-1 text-[#606C5D]">
              <p><strong>Mike Ford · Senior Loan Officer · NMLS #288455</strong></p>
              <p>Cornerstone First Mortgage, LLC · Company NMLS #173855 · Equal Housing Opportunity Lender</p>
              <p>Office: 17850 Pilkington Rd | Lake Oswego, OR 97035</p>
              <p>Email: <a href="mailto:fordmj@gmail.com" className="text-[#4A5D4E] underline">fordmj@gmail.com</a> | NMLS Consumer Access: <a href="https://www.nmlsconsumeraccess.org/" target="_blank" rel="noreferrer" className="text-[#4A5D4E] underline">www.nmlsconsumeraccess.org</a></p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-[#F1EFE9] border-t border-[#EAE7E0] p-4 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-[#606C5D] flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Updated & Active for Oregon & Washington Borrowers</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
