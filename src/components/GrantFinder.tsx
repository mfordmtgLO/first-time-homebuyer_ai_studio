import React, { useState } from "react";
import { 
  Award, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Home
} from "lucide-react";
import { ProfessionalGuidesState } from "../types";

export interface GrantFinderProps {
  guidesState?: ProfessionalGuidesState;
  onNavigate?: (tab: string, mode?: string) => void;
}

const LOAN_OPTIONS = [
  {
    id: "usda-rd",
    name: "USDA RD",
    subtitle: "No Down Payment",
    description: "100% financing option designed for rural and suburban homebuyers. Zero down payment required, competitive interest rates, and lenient credit requirements.",
    icon: <MapPin className="w-5 h-5 text-emerald-600" />,
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200"
  },
  {
    id: "ohcs-flex",
    name: "OHCS Flex Lending",
    subtitle: "Low or No Down Payment",
    description: "Oregon Housing and Community Services program providing up to 5% cash assistance for down payment or closing costs. Can be paired with other low-down options.",
    icon: <DollarSign className="w-5 h-5 text-blue-600" />,
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
    badgeBorder: "border-blue-200"
  },
  {
    id: "the-national",
    name: "The National",
    subtitle: "Low or No Down Payment",
    description: "A flexible national financing solution designed to expand homeownership opportunities with minimal upfront costs and accessible underwriting.",
    icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200"
  },
  {
    id: "nhf",
    name: "National Homebuyer's Fund",
    subtitle: "Low or No Down Payment",
    description: "Offers down payment and closing cost assistance grants or forgivable loans up to 5% of the total loan amount. Open to first-time and repeat buyers.",
    icon: <Award className="w-5 h-5 text-amber-600" />,
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200"
  },
  {
    id: "va",
    name: "VA",
    subtitle: "No Down Payment",
    description: "Exclusive 100% financing for eligible veterans, active-duty service members, and surviving spouses. No private mortgage insurance (PMI) required.",
    icon: <Award className="w-5 h-5 text-red-600" />,
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200"
  },
  {
    id: "fannie-homeready",
    name: "Fannie Mae / HomeReady",
    subtitle: "3% Down Payment",
    description: "Ideal for low-to-moderate income borrowers, featuring reduced mortgage insurance requirements and flexible funding sources for the down payment.",
    icon: <Building className="w-5 h-5 text-indigo-600" />,
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-200"
  },
  {
    id: "freddie-homepossible",
    name: "Freddie Mac / Home Possible",
    subtitle: "3% Down Payment",
    description: "Designed to help very low-to-low income borrowers attain homeownership with a minimum 3% down payment and flexible credit terms.",
    icon: <Building className="w-5 h-5 text-sky-600" />,
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-200"
  }
];

export const GrantFinder: React.FC<GrantFinderProps> = ({ guidesState, onNavigate }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    desiredArea: "",
    consentToText: false,
    wantConnection: "yes"
  });
  const [submitted, setSubmitted] = useState(false);

  const loName = guidesState?.loanOfficer?.name || "Mike Ford";
  const agentId = guidesState?.activeAgentId;
  const agentData = guidesState?.agentRoster?.find(a => a.id === agentId);
  const agentName = agentData?.name || "Kanndice McLean";

  const handleLearnMore = () => {
    if (onNavigate) {
      onNavigate("hero", "website");
      setTimeout(() => {
        document.getElementById("local-professional-guides-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs sm:text-sm font-bold border border-[#EAE7E0] shadow-sm">
          <Home className="w-4 h-4 text-[#C18C5D]" />
          <span>Homeownership Path</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D362E] leading-tight">
          Low or No Down Payment Home Loan Options
        </h2>
        <p className="text-sm sm:text-base text-[#606C5D] leading-relaxed">
          Explore powerful financing options designed to minimize your upfront costs. From 0% down rural loans to low-down payment conventional products, we help you secure the keys to your new home sooner.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Loan Options Grid */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {LOAN_OPTIONS.map(option => (
              <div 
                key={option.id} 
                className="bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-5 shadow-sm hover:border-[#4A5D4E]/30 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${option.badgeBg} ${option.badgeBorder}`}>
                      {option.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D362E] text-base leading-tight">{option.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${option.badgeBg} ${option.badgeText} ${option.badgeBorder} inline-block mt-1 uppercase tracking-wide`}>
                        {option.subtitle}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#606C5D] leading-relaxed">
                    {option.description}
                  </p>
                </div>
                
                <button 
                  onClick={handleLearnMore}
                  className="w-full mt-4 py-2.5 rounded-xl bg-[#F9F8F4] hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-bold border border-[#EAE7E0] transition-colors flex items-center justify-center gap-2"
                >
                  Learn More
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Lead Capture Form */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="lg:sticky top-6">
            <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4A5D4E] to-[#C18C5D]" />
              
              {!submitted ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-2xl text-[#2D362E]">Find Eligible Homes</h3>
                    <p className="text-xs text-[#606C5D] leading-relaxed">
                      Enter your desired city or county to receive a custom-filtered list of recent homes for sale that may qualify for these low or no down payment options.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">First Name</label>
                        <input 
                          type="text" required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-sm text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Last Name</label>
                        <input 
                          type="text" required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-sm text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-sm text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]" 
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-sm text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Desired City or County</label>
                      <input 
                        type="text" required placeholder="e.g. Portland, Clackamas County"
                        value={formData.desiredArea}
                        onChange={(e) => setFormData({...formData, desiredArea: e.target.value})}
                        className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-sm text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]" 
                      />
                    </div>

                    {guidesState?.isCoBranded && (
                      <div className="pt-2">
                        <label className="text-xs text-[#606C5D] font-medium leading-relaxed block pb-2">
                          After we send you your custom filtered property listings, would you like your Local Guide/Loan officer, <strong className="text-[#4A5D4E]">{loName}</strong>, to connect you with your Local Guide/Agent, <strong className="text-[#C18C5D]">{agentName}</strong>?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs text-[#2D362E] cursor-pointer">
                            <input 
                              type="radio" name="connection" value="yes"
                              checked={formData.wantConnection === "yes"}
                              onChange={(e) => setFormData({...formData, wantConnection: e.target.value})}
                              className="accent-[#4A5D4E] w-4 h-4"
                            />
                            Yes, please connect us!
                          </label>
                          <label className="flex items-center gap-2 text-xs text-[#2D362E] cursor-pointer">
                            <input 
                              type="radio" name="connection" value="no"
                              checked={formData.wantConnection === "no"}
                              onChange={(e) => setFormData({...formData, wantConnection: e.target.value})}
                              className="accent-[#4A5D4E] w-4 h-4"
                            />
                            Not right now
                          </label>
                        </div>
                      </div>
                    )}

                    {!guidesState?.isCoBranded && (
                      <div className="pt-2">
                        <label className="text-xs text-[#606C5D] font-medium leading-relaxed block pb-2">
                          After we send you your custom filtered property listings, would you like your Local Guide/Loan officer, <strong className="text-[#4A5D4E]">{loName}</strong>, to connect you with a verified Local Realtor Guide?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs text-[#2D362E] cursor-pointer">
                            <input 
                              type="radio" name="connection" value="yes"
                              checked={formData.wantConnection === "yes"}
                              onChange={(e) => setFormData({...formData, wantConnection: e.target.value})}
                              className="accent-[#4A5D4E] w-4 h-4"
                            />
                            Yes, please connect us!
                          </label>
                          <label className="flex items-center gap-2 text-xs text-[#2D362E] cursor-pointer">
                            <input 
                              type="radio" name="connection" value="no"
                              checked={formData.wantConnection === "no"}
                              onChange={(e) => setFormData({...formData, wantConnection: e.target.value})}
                              className="accent-[#4A5D4E] w-4 h-4"
                            />
                            Not right now
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="pt-1">
                      <label className="flex items-start gap-2 text-[10px] text-[#9A9488] leading-tight cursor-pointer">
                        <input 
                          type="checkbox" required
                          checked={formData.consentToText}
                          onChange={(e) => setFormData({...formData, consentToText: e.target.checked})}
                          className="mt-0.5 rounded border-[#EAE7E0] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                        />
                        By checking this box, I consent to receive text messages regarding my request at the number provided above. Standard data rates may apply.
                      </label>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#4A5D4E] hover:bg-[#3A4A3D] text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send My Custom Listings
                    </button>
                  </form>
                </div>
              ) : (
                <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-emerald-50">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="font-serif font-bold text-2xl text-[#2D362E]">Request Sent!</h4>
                  <p className="text-sm text-[#606C5D] leading-relaxed max-w-xs mx-auto">
                    Thanks {formData.firstName}! We are generating your custom filtered property listings for {formData.desiredArea}. We will be in touch shortly via email and text.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-[#4A5D4E] text-xs font-bold hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
