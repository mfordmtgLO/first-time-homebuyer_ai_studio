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
      id: "frontend-ux",
      title: "1. Front-End User Website Features",
      subtitle: "Immersive Homebuyer Tools, Maps & Interactive Roadmaps",
      icon: <Calculator className="w-8 h-8 text-indigo-500" />,
      points: [
        "Curated Property Feed: Hundreds of live homes across Oregon cities, complete with price, square footage, and tour grades.",
        "Interactive Maps & Google My Maps Sync: Instant 1-click KML export and 4-step import guide so visitors can permanently pin homes to their Google Maps accounts.",
        "Affordability & Grant Calculators: Built-in OHCS down payment assistance, USDA RD rural eligibility, and LMI grant overlays.",
        "Custom Tour Scorecard & PDF Reports: Visitors generate comprehensive home tour audits and shareable roadmaps instantly."
      ]
    },
    {
      id: "cobranding",
      title: "2. Dynamic LO & Agent 'Pair' Co-Branding",
      subtitle: "Dynamic URL Parameters & Default Loan Officer/Agent Matching",
      icon: <Users className="w-8 h-8 text-rose-500" />,
      points: [
        "Dynamic URL Routing: Custom source links (e.g., `?lo=mike&agent=kanndice`) instantly customize the entire page branding.",
        "Default LO/Agent Pair: Automatically loads the designated Loan Officer (Mike Ford) and preferred Co-branded Partner (Kanndice McLean) across all interface headers, sidebars, and call-to-action badges.",
        "Embedded Contact Cards: Every property card, scorecard, and exported Google Maps pin displays direct tap-to-call/email information.",
        "Tailored Persuasion CTAs: Prominently features the tailored call: 'For more information on low/no down payment products matched for eligible areas, call Mike Ford. To get a personalized home search profile, reach out to Kanndice McLean.'"
      ]
    },
    {
      id: "lead-persuasion",
      title: "3. Visitor Engagement & Lead Capture",
      subtitle: "Multi-Touch Conversion & Information Gathering Touchpoints",
      icon: <Target className="w-8 h-8 text-amber-500" />,
      points: [
        "Interactive Roadmap Generator: Engages visitors with a 6-step readiness quiz capturing name, email, phone, and timeline.",
        "Favorite & Tour Requests: Triggers automated agent alerts when a visitor favorites a home or requests a tour.",
        "Instant Email Bundles: Allows visitors to email their entire dashboard summary, mortgage roadmap, and saved home list to themselves and their co-branded team.",
        "Map Export Funnel: Captures high-intent buyers as they export KML layers and save curated property pins to Google Maps."
      ]
    },
    {
      id: "backend-routing",
      title: "4. Back-End CRM & Lead Routing",
      subtitle: "Dashboard Automation, Task Queues & Conversion Outreach",
      icon: <Database className="w-8 h-8 text-emerald-500" />,
      points: [
        "Unified Pipeline Dashboard: Centralizes all inbound leads, form submissions, roadmap milestones, and property favorites in real-time.",
        "Smart Lead Scoring: Automatically prioritizes hot leads based on pre-approval status, credit range, and map export activity.",
        "Task & Follow-Up Queues: Organizes morning priority calls and afternoon SMS/email follow-up workflows for loan officers.",
        "Branch Manager Oversight: Full visibility across all downstream LO dashboards, tracking conversion ratios and Days-to-Close."
      ]
    },
    {
      id: "automations",
      title: "5. Automations, Templates & Follow-Up Campaigns",
      subtitle: "AI-Powered SMS/Email Sequences & Lead Journey Tracking",
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      points: [
        "AI 2nd Brain Outreach: Automatically drafts personalized, compliance-checked SMS and email follow-up messages based on live borrower math.",
        "Multi-Channel Drip Campaigns: Automated email and text sequences nurturing first-time buyers through pre-approval, underwriting, and closing.",
        "Lead Journey Tracking: Complete audit trail logging every interaction, email sent, property favorited, and tour scheduled.",
        "Co-Branded Notifications: Instant dispatching of partner alerts (SMS to real estate agents) whenever their buyer interacts with a property."
      ]
    },
    {
      id: "ingestion",
      title: "6. Mortgage AI & Market Data Ingestion",
      subtitle: "Continuous Knowledge Accumulation & Strategy Refinement",
      icon: <Brain className="w-8 h-8 text-indigo-500" />,
      points: [
        "Online Research: Actively pulls real-time market data and industry shifts via Gemini AI.",
        "Tactical Knowledge Mastery: Expert on OHCS Flex Lending, FirstHome, USDA RD, and Non-QM loan structures.",
        "Manual & Workspace Uploads: Extracts text from uploaded notes, PDFs, and Google Docs to expand local knowledge.",
        "Full Funnel Ecosystem: Unifies frontend visitor experiences with powerful backend CRM tools for maximum loan conversions."
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
