import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Brain, Database, UploadCloud, Users, Target, ShieldCheck, FileText, Zap, PieChart, Briefcase, Calculator, Eye, Activity } from "lucide-react";

interface Slide {
  id: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  points: string[];
}

export const SystemPitchDeck: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const slides: Slide[] = [
    {
      id: "ingestion",
      title: "How the Mortgage AI 2nd Brain Learns",
      subtitle: "Continuous Ingestion & Knowledge Accumulation",
      icon: <Database className="w-8 h-8 text-indigo-500" />,
      points: [
        "Online Gemini/Google Research: Actively pulls real-time market data and broad industry shifts.",
        "Memorizing Chat Histories: Learns from thousands of interactions, saving the most successful tactical answers and unique borrower scenarios from all dashboard users.",
        "Manual File Uploads (Notepad, Word, PDFs): Extracts text directly, converts complex PDFs into structured JSON for the AI Vault/Storage, expanding its local knowledge base.",
        "Google Workspace Integration: Connects seamlessly to read successful closing narratives directly from Google Docs.",
        "Schedule C Analyzer: Ingests non-PII, name-only tax data over time to become smarter at self-employed cashflow calculations and spotting add-back opportunities."
      ]
    },
    {
      id: "tactical",
      title: "Tactical Knowledge & Loan Product Mastery",
      subtitle: "Hyper-Specific Guidelines & Structuring Advantages",
      icon: <Target className="w-8 h-8 text-rose-500" />,
      points: [
        "Specialized Down Payment Assistance (DPA): Expert on OHCS Flex Lending, FirstHome, USDA RD (Rural Development), and 'Lakeside National' zero/low down payment options.",
        "VA & Military Specializations: Deep knowledge of VA Zero Down, unique DTI structuring, and creative seller contribution/concession guidelines.",
        "Non-QM & Alternative Income: Advanced structuring for Bank Statement deposit income and DSCR (Debt Service Coverage Ratio) investor loans.",
        "Memory Component: Constantly refines its answers based on what structures successfully close, offering tactical advice rather than generic textbook answers."
      ]
    },
    {
      id: "integration",
      title: "Dashboard Integration: Where the Brain Lives",
      subtitle: "Silent Co-Pilot Across the Entire Lead-to-Loan Journey",
      icon: <Brain className="w-8 h-8 text-emerald-500" />,
      points: [
        "Daily Briefing & Lead Triage: Organizes the 'Start your day' overview—highlighting high-priority leads for the morning and shifting to follow-up tasks in the afternoon.",
        "Scenario Builder & Conversions: Sits within the tools to help draft highly-converting, bespoke email and text outreach based on live math.",
        "Outreach Template Assistance: Auto-generates compliance-checked, personalized scripts across all outreach sections.",
        "Recruitment Engine: Assists in crafting targeted pitches for Loan Officer & Agent recruiting sections of the dashboard."
      ]
    },
    {
      id: "analytics",
      title: "Conversion Tracking & Success Ratios",
      subtitle: "AI-Powered ROI & Funnel Analytics",
      icon: <PieChart className="w-8 h-8 text-amber-500" />,
      points: [
        "Source Comparison: Tracks success ratios between Roadmap requests, Agent Co-brand leads, Downpayment geographic requests, and Chatbot intakes.",
        "Paid Ads Tracker: Measures actual ROI on Facebook and Google Ad spend against closed loans, not just clicks.",
        "Outreach Efficacy: Compares Email vs. Text response rates over time to suggest the highest-converting follow-up method per lead demographic.",
        "Full Funnel Ecosystem: Unifies the First-Time Homebuyer Site -> Intake Funnel -> Dashboard CRM -> Agent Co-Brand tools into one trackable growth engine."
      ]
    },
    {
      id: "branch-manager",
      title: "Branch Manager / Admin Command Center",
      subtitle: "Oversight, Shadowing, and Process Optimization",
      icon: <Eye className="w-8 h-8 text-blue-500" />,
      points: [
        "Team Shadowing: Full control to oversee and shadow every downstream team loan officer's dashboard to ensure quality and compliance.",
        "Utilization Metrics: Tracks which LOs are actively using the AI 2nd Brain, Scenario Calculators, and building Agent 'Pairs'.",
        "Visual Analytics: Bar and Pie charts tracking leads coming into the system, searchable by date range, YTD, or all-time.",
        "Average Days to Close: Pinpoints the exact number of days from lead intake to funded/closed status. Crucial metric for tweaking systems, recruiting elite LOs, and attracting top-tier Agent partners."
      ]
    }
  ];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="bg-[#FDFCF9] rounded-3xl border border-[#EAE7E0] overflow-hidden shadow-xs flex flex-col h-[700px]">
      {/* Header */}
      <div className="bg-[#2D362E] p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display">Mortgage AI System Architecture</h2>
          <p className="text-sm text-emerald-100 opacity-80">Sales & CRM Pitch Deck</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium px-3 py-1 bg-white/10 rounded-full">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center relative">
        <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" key={currentSlide.id}>
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-sm border border-[#EAE7E0] flex items-center justify-center mb-6">
            {currentSlide.icon}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-[#2D362E] font-display">{currentSlide.title}</h3>
            <p className="text-lg text-[#C18C5D] font-medium">{currentSlide.subtitle}</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 sm:p-8 text-left shadow-sm">
            <ul className="space-y-4">
              {currentSlide.points.map((point, idx) => {
                const [boldPart, ...rest] = point.split(":");
                return (
                  <li key={idx} className="flex items-start gap-3 text-[#4A5D4E]">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C18C5D] shrink-0" />
                    <p className="leading-relaxed">
                      {rest.length > 0 ? (
                        <>
                          <strong className="text-[#2D362E]">{boldPart}:</strong>
                          {rest.join(":")}
                        </>
                      ) : (
                        point
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Navigation Overlays */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white border border-[#EAE7E0] rounded-full text-[#4A5D4E] hover:text-[#2D362E] hover:bg-[#F9F8F4] shadow-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white border border-[#EAE7E0] rounded-full text-[#4A5D4E] hover:text-[#2D362E] hover:bg-[#F9F8F4] shadow-sm transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Footer Indicators */}
      <div className="p-6 border-t border-[#EAE7E0] bg-white flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlideIndex(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlideIndex ? "w-8 bg-[#4A5D4E]" : "w-2 bg-[#EAE7E0] hover:bg-[#C18C5D]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
