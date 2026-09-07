import React, { useState } from "react";
import { Sparkles, Loader2, Mail, Send, ChevronDown, CheckCircle2 } from "lucide-react";
import { PropertyListing } from "../types";

interface SmartCompareAIProps {
  properties: PropertyListing[];
  loanOfficer?: { name: string; email: string; phone: string };
  agent?: { name: string; email: string; phone: string; brokerage: string };
}

export const SmartCompareAI: React.FC<SmartCompareAIProps> = ({
  properties,
  loanOfficer,
  agent,
}) => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [contactSent, setContactSent] = useState(false);

  const handleAICompare = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini/property-compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          properties,
          userPrompt: prompt,
          loanOfficer: loanOfficer,
          agent: agent,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactRequest = () => {
    // Simulate sending email
    setContactSent(true);
    setTimeout(() => setContactSent(false), 3000);
  };

  return (
    <div className="mt-8 border-t border-[#EAE7E0] pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#C18C5D]" />
        <h4 className="text-lg font-serif font-bold text-[#2D362E]">Smart AI Assist Comparison</h4>
      </div>

      {!result ? (
        <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#EAE7E0] space-y-3">
          <p className="text-xs text-[#606C5D]">
            What are your priorities? (e.g., "I need a quiet neighborhood for remote work", "Which
            one is better for a growing family?", "Compare the commute and walkability.")
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your specific needs here..."
              className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
              onKeyDown={(e) => e.key === "Enter" && handleAICompare()}
            />
            <button
              onClick={handleAICompare}
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              Analyze
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-[#FAF9F5] p-5 rounded-xl border border-[#EAE7E0]">
            <h5 className="font-bold text-[#2D362E] mb-2 text-sm">AI Analysis Overview</h5>
            <p className="text-xs text-[#606C5D] leading-relaxed">{result.overview}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.propertyComparisons?.map((comp: any, idx: number) => (
              <div key={idx} className="bg-white border border-[#EAE7E0] rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h6 className="font-bold text-[#2D362E] text-sm">{comp.address}</h6>
                  <span className="bg-[#EAE7E0] text-[#4A5D4E] text-[10px] font-bold px-2 py-1 rounded-full">
                    {comp.matchScore}% Match
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                      Pros
                    </span>
                    <ul className="mt-1 space-y-1">
                      {comp.pros?.map((pro: string, i: number) => (
                        <li key={i} className="text-xs text-[#606C5D] flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">
                      Cons
                    </span>
                    <ul className="mt-1 space-y-1">
                      {comp.cons?.map((con: string, i: number) => (
                        <li key={i} className="text-xs text-[#606C5D] flex items-start gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5 ml-1 mr-0.5" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <h5 className="font-bold text-[#2D362E] text-sm mb-1">Recommendation</h5>
            <p className="text-xs text-[#606C5D]">{result.recommendation}</p>
          </div>

          {/* Lead Capture CTA */}
          <div className="bg-[#4A5D4E] p-6 rounded-2xl shadow-md text-center text-white space-y-3">
            <h5 className="font-bold text-lg">Want a tailored list?</h5>
            <p className="text-sm text-[#E8ECE6]">
              {result.callToAction ||
                `Contact your local guides ${loanOfficer?.name || "Mike Ford"} ${loanOfficer?.phone ? "(" + loanOfficer.phone + ")" : ""} and ${agent?.name || "Kanndice McLean"} ${agent?.phone ? "(" + agent.phone + ")" : ""} to get a custom property list emailed directly to you matching these exact criteria.`}
            </p>
            <div className="flex justify-center pt-2">
              <button
                onClick={handleContactRequest}
                disabled={contactSent}
                className="px-6 py-2.5 bg-white text-[#4A5D4E] hover:bg-[#F1EFE9] rounded-xl text-sm font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-80"
              >
                {contactSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Request Sent!
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Request Custom List
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                setResult(null);
                setPrompt("");
              }}
              className="text-xs text-[#9A9488] hover:text-[#2D362E] underline"
            >
              Ask a different comparison question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
