import React, { useState } from "react";
import { LoanOfficerProfile } from "../types";
import { X, DollarSign, Megaphone, Video, Globe, MapPin, Tag, Plus, CheckCircle2 } from "lucide-react";

interface AddAdExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanOfficers: LoanOfficerProfile[];
  selectedLoId?: string;
  onSaveExpense: (loId: string, expense: { source: string; amount: number; campaignName: string; assetType: string }) => void;
}

export const AddAdExpenseModal: React.FC<AddAdExpenseModalProps> = ({
  isOpen,
  onClose,
  loanOfficers,
  selectedLoId,
  onSaveExpense,
}) => {
  const [loId, setLoId] = useState<string>(selectedLoId || loanOfficers[0]?.id || "");
  const [source, setSource] = useState<string>("Facebook Ads");
  const [amount, setAmount] = useState<string>("250");
  const [campaignName, setCampaignName] = useState<string>("");
  const [assetType, setAssetType] = useState<string>("facebook_ad");

  if (!isOpen) return null;

  const currentLo = loanOfficers.find((l) => l.id === loId) || loanOfficers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onSaveExpense(loId, {
      source,
      amount: numAmount,
      campaignName: campaignName || `${source} Campaign - ${new Date().toLocaleDateString()}`,
      assetType,
    });
    onClose();
  };

  const handleSourceChange = (newSource: string) => {
    setSource(newSource);
    if (newSource === "Facebook Ads") {
      setAssetType("facebook_ad");
      if (!campaignName) setCampaignName("Meta Feed - First-Time Homebuyer DPA Flyer");
    } else if (newSource === "Google Ads") {
      setAssetType("google_ad");
      if (!campaignName) setCampaignName("Google Search - Oregon FTHB Grants");
    } else if (newSource === "YouTube Video Ads") {
      setAssetType("youtube_video");
      if (!campaignName) setCampaignName("Vantage AI Video - Neighborhood Walkthrough");
    } else if (newSource === "GeoSphere GIS Map") {
      setAssetType("geosphere_map");
      if (!campaignName) setCampaignName("GeoSphere Map Interactive Property Widget");
    } else {
      setAssetType("social_media");
      if (!campaignName) setCampaignName("Instagram Reels / Social Post");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D362E]">Log Advertising Expense &amp; Cost</h3>
              <p className="text-xs text-[#606C5D]">Record LO ad spend to dynamically calculate ROLI and Cost Per Lead</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F1EFE9] flex items-center justify-center text-[#9A9488] hover:text-[#2D362E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D362E]">Loan Officer</label>
            <select
              value={loId}
              onChange={(e) => setLoId(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-medium text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
            >
              {loanOfficers.map((lo) => (
                <option key={lo.id} value={lo.id}>
                  {lo.name} ({lo.branchId || "No Branch"} - {lo.branchCity || "Lake Oswego"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D362E]">Ad Publishing Source</label>
              <select
                value={source}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-medium text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
              >
                <option value="Facebook Ads">Facebook Ads (Meta)</option>
                <option value="Google Ads">Google Ads (Search/PPC)</option>
                <option value="YouTube Video Ads">YouTube Video Ads (Vantage AI)</option>
                <option value="GeoSphere GIS Map">GeoSphere GIS Map (RentCast)</option>
                <option value="Social Media">Social Media (Instagram/LinkedIn)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2D362E]">Expense Amount ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9A9488]">$</span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250.00"
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl pl-7 pr-3 py-2 text-xs font-bold font-mono text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D362E]">Exact Published Ad Copy or Video Asset Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vantage AI Video - 1240 Willamette Heights Walkthrough"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
            />
            <p className="text-[10px] text-[#9A9488]">
              Matches leads attribution to calculate exact Cost Per Lead (CPL) for this asset.
            </p>
          </div>

          {currentLo && (
            <div className="p-3 bg-[#F9F8F4] rounded-xl border border-[#EAE7E0] text-xs space-y-1">
              <div className="flex items-center justify-between text-[#606C5D]">
                <span>Current Total Ad Spend:</span>
                <span className="font-mono font-bold text-[#2D362E]">${currentLo.adExpensesTotal || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#606C5D]">
                <span>New Projected Total:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ${(currentLo.adExpensesTotal || 0) + (parseFloat(amount) || 0)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE7E0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:text-[#2D362E] hover:bg-[#F1EFE9] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Ad Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
