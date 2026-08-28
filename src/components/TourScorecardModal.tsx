import React, { useState } from "react";
import { 
  X, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Save, 
  Sparkles, 
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react";
import { PropertyListing, TourScorecard } from "../types";
import { formatUSD } from "../utils/mortgageMath";

interface TourScorecardModalProps {
  property: PropertyListing;
  onClose: () => void;
  onSave: (updatedProperty: PropertyListing) => void;
}

export const TourScorecardModal: React.FC<TourScorecardModalProps> = ({
  property,
  onClose,
  onSave,
}) => {
  const initialScorecard: TourScorecard = property.scorecard || {
    roofAndExterior: 8,
    foundationAndStructure: 8,
    hvacAndElectrical: 8,
    plumbingAndWaterPressure: 8,
    kitchenAndBathrooms: 8,
    layoutAndNaturalLight: 8,
    neighborhoodAndSafety: 8,
    parkingAndAccess: 8,
    noiseAndSurroundings: 8,
    estimatedRenovationCost: 2500,
    redFlags: [],
    positives: [],
    overallRating: 8.0,
    grade: "B+",
  };

  const [scorecard, setScorecard] = useState<TourScorecard>(initialScorecard);
  const [newRedFlag, setNewRedFlag] = useState("");
  const [newPositive, setNewPositive] = useState("");

  const calculateGrade = (score: number): "A+" | "A" | "B+" | "B" | "C" | "D" => {
    if (score >= 9.0) return "A+";
    if (score >= 8.3) return "A";
    if (score >= 7.5) return "B+";
    if (score >= 6.8) return "B";
    if (score >= 5.5) return "C";
    return "D";
  };

  const updateCategory = (key: keyof TourScorecard, value: number) => {
    setScorecard(prev => {
      const updated = { ...prev, [key]: value };
      const sum =
        updated.roofAndExterior +
        updated.foundationAndStructure +
        updated.hvacAndElectrical +
        updated.plumbingAndWaterPressure +
        updated.kitchenAndBathrooms +
        updated.layoutAndNaturalLight +
        updated.neighborhoodAndSafety +
        updated.parkingAndAccess +
        updated.noiseAndSurroundings;
      const overall = Math.round((sum / 9) * 10) / 10;
      return {
        ...updated,
        overallRating: overall,
        grade: calculateGrade(overall)
      };
    });
  };

  const addRedFlag = () => {
    if (!newRedFlag.trim()) return;
    setScorecard(prev => ({
      ...prev,
      redFlags: [...prev.redFlags, newRedFlag.trim()]
    }));
    setNewRedFlag("");
  };

  const removeRedFlag = (index: number) => {
    setScorecard(prev => ({
      ...prev,
      redFlags: prev.redFlags.filter((_, i) => i !== index)
    }));
  };

  const addPositive = () => {
    if (!newPositive.trim()) return;
    setScorecard(prev => ({
      ...prev,
      positives: [...prev.positives, newPositive.trim()]
    }));
    setNewPositive("");
  };

  const removePositive = (index: number) => {
    setScorecard(prev => ({
      ...prev,
      positives: prev.positives.filter((_, i) => i !== index)
    }));
  };

  const handleExportSingleCSV = () => {
    const headers = [
      "Property Title", "Address", "City", "State", "Zip Code", "Price ($)",
      "Property Type", "Bedrooms", "Bathrooms", "Square Feet",
      "Overall Tour Grade", "Overall Scorecard Rating (1-10)",
      "Roof & Exterior (1-10)", "Foundation & Structure (1-10)", "HVAC & Electrical (1-10)",
      "Plumbing & Water Pressure (1-10)", "Kitchen & Bathrooms (1-10)", "Layout & Natural Light (1-10)",
      "Neighborhood & Safety (1-10)", "Parking & Access (1-10)", "Noise & Surroundings (1-10)",
      "Est. Renovation Cost ($)", "Red Flags", "Positive Highlights", "Notes"
    ].join(",");

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const row = [
      escapeCsv(property.title),
      escapeCsv(property.address),
      escapeCsv(property.city),
      escapeCsv(property.state),
      escapeCsv(property.zip),
      property.price,
      escapeCsv(property.propertyType),
      property.beds,
      property.baths,
      property.sqft,
      escapeCsv(scorecard.grade),
      scorecard.overallRating,
      scorecard.roofAndExterior,
      scorecard.foundationAndStructure,
      scorecard.hvacAndElectrical,
      scorecard.plumbingAndWaterPressure,
      scorecard.kitchenAndBathrooms,
      scorecard.layoutAndNaturalLight,
      scorecard.neighborhoodAndSafety,
      scorecard.parkingAndAccess,
      scorecard.noiseAndSurroundings,
      scorecard.estimatedRenovationCost,
      escapeCsv(scorecard.redFlags.length > 0 ? scorecard.redFlags.join("; ") : "None"),
      escapeCsv(scorecard.positives.length > 0 ? scorecard.positives.join("; ") : "None"),
      escapeCsv(property.notes || "")
    ].join(",");

    const csvContent = [headers, row].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Tour-Scorecard-${property.address.replace(/[^a-zA-Z0-9]/g, "-")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onSave({
      ...property,
      scorecard
    });
    onClose();
  };

  const categories = [
    { key: "roofAndExterior" as const, label: "Roof, Gutters & Exterior Siding", hint: "Look for curling shingles, rot, or peeling paint" },
    { key: "foundationAndStructure" as const, label: "Foundation & Slab / Crawlspace", hint: "Check for diagonal wall cracks, sticking doors, uneven floors" },
    { key: "hvacAndElectrical" as const, label: "HVAC System & Electrical Breaker Panel", hint: "Check age on HVAC label plate, look for modern 200A panel" },
    { key: "plumbingAndWaterPressure" as const, label: "Plumbing, Drains & Water Pressure", hint: "Turn on multiple faucets & shower at once; flush toilet" },
    { key: "kitchenAndBathrooms" as const, label: "Kitchen Appliances & Bath Fixtures", hint: "Check under sink for leaks, look at tile grout condition" },
    { key: "layoutAndNaturalLight" as const, label: "Floorplan Layout & Window Light", hint: "Evaluate room flow, storage, and natural daytime illumination" },
    { key: "neighborhoodAndSafety" as const, label: "Neighborhood Vibe & Street Safety", hint: "Condition of neighboring homes, pride of ownership" },
    { key: "parkingAndAccess" as const, label: "Parking, Driveway & Garage Access", hint: "Adequate parking for guests, driveway steepness" },
    { key: "noiseAndSurroundings" as const, label: "Traffic Noise & Ambient Privacy", hint: "Listen for highway noise, flight paths, or barking dogs" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#EAE7E0] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] uppercase">
                Tour Evaluation
              </span>
              <span className="text-xs text-[#606C5D] font-medium">On-Site Inspection</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#2D362E] mt-1">
              {property.title}
            </h3>
            <p className="text-xs text-[#606C5D]">{property.address}, {property.city}, {property.state}</p>
          </div>

          {/* Grade Badge */}
          <div className="text-right flex items-center gap-3">
            <div className="bg-[#F1EFE9] p-3 rounded-2xl border border-[#EAE7E0] text-center">
              <span className="text-[10px] text-[#606C5D] uppercase font-bold block">Overall Rating</span>
              <span className="text-2xl font-bold text-[#4A5D4E]">
                Grade {scorecard.grade}
              </span>
              <span className="text-[10px] text-[#606C5D] block font-medium">
                {scorecard.overallRating} / 10
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F1EFE9] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 9 Category Sliders */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A9488]">
            Score Structural & Livability Criteria (1 to 10)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map(cat => (
              <div key={cat.key} className="bg-[#F9F8F4] p-3.5 rounded-xl border border-[#EAE7E0] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D362E]">{cat.label}</span>
                  <span className="font-bold text-[#4A5D4E] bg-white px-2 py-0.5 rounded border border-[#EAE7E0]">
                    {scorecard[cat.key]} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={scorecard[cat.key]}
                  onChange={(e) => updateCategory(cat.key, Number(e.target.value))}
                  className="w-full h-1.5 bg-[#EAE7E0] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
                />
                <span className="text-[10px] text-[#606C5D] block leading-tight">{cat.hint}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated Renovation Needs */}
        <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
          <label className="block text-xs font-bold text-[#2D362E]">
            Estimated Immediate Repairs / Cosmetic Renovation ($)
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
            <input
              type="number"
              step="500"
              min="0"
              value={scorecard.estimatedRenovationCost}
              onChange={(e) => setScorecard(prev => ({ ...prev, estimatedRenovationCost: Number(e.target.value) }))}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-4 py-2 text-sm text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
          <span className="text-[11px] text-[#606C5D]">e.g. carpet replacement, painting, water heater, fence repair</span>
        </div>

        {/* Positives & Red Flags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Positives */}
          <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5D4E]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Standout Positives & Upgrades</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Quartz counters, copper pipes..."
                value={newPositive}
                onChange={(e) => setNewPositive(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPositive()}
                className="flex-1 bg-white border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
              />
              <button
                type="button"
                onClick={addPositive}
                className="px-3 py-1.5 bg-[#4A5D4E] text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Add
              </button>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {scorecard.positives.map((pos, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded-md text-[#2D362E] border border-[#EAE7E0]">
                  <span className="truncate">{pos}</span>
                  <button onClick={() => removePositive(idx)} className="text-[#9A9488] hover:text-rose-600 ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C18C5D]">
              <AlertTriangle className="w-4 h-4" />
              <span>Red Flags & Concerns</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Sloping floor, 18-yr old AC..."
                value={newRedFlag}
                onChange={(e) => setNewRedFlag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addRedFlag()}
                className="flex-1 bg-white border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#C18C5D]"
              />
              <button
                type="button"
                onClick={addRedFlag}
                className="px-3 py-1.5 bg-[#C18C5D] text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Add
              </button>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {scorecard.redFlags.map((flag, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white px-2.5 py-1 rounded-md text-[#2D362E] border border-[#EAE7E0]">
                  <span className="truncate">{flag}</span>
                  <button onClick={() => removeRedFlag(idx)} className="text-[#9A9488] hover:text-rose-600 ml-2">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EAE7E0]">
          <button
            type="button"
            onClick={handleExportSingleCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#4A5D4E] font-semibold text-xs transition-colors shadow-2xs"
            title="Download CSV for this property scorecard"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#4A5D4E]" />
            <span>Download Scorecard CSV</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#606C5D] text-xs font-semibold border border-[#EAE7E0]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Tour Scorecard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
