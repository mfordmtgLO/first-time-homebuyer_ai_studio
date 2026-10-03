import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "../firebase";
import {
  Building,
  Check,
  CheckSquare,
  Square,
  Sparkles,
  Filter,
  ArrowRight,
  Trash2,
  Clock,
  MapPin,
  DollarSign,
  Send,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  ShieldCheck,
  User,
  Phone,
  Mail,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  HeartHandshake,
} from "lucide-react";
import { formatUSD } from "../utils/mortgageMath";
import { PropertyListing, RbacRole } from "../types";

interface CurationQueueItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  source: string;
  city: string;
  priceRange: string;
  timeline: string;
  requestedAt: string;
  status: "requested" | "curated" | "pushed" | "viewed";
  curationDoc?: {
    leadId: string;
    email: string;
    name: string;
    listings: { listingId: string; curatedAt: string }[];
    curatedBy: string;
    status: string;
    pushedAt: string;
    buyerNote?: string | null;
  } | null;
  assignedLoId?: string | null;
}

interface CurationQueueProps {
  userRole?: RbacRole | "admin" | "lo" | null;
  onTriggerToast?: (msg: string) => void;
}

export const CurationQueue: React.FC<CurationQueueProps> = ({
  userRole,
  onTriggerToast = (msg) => console.log(msg),
}) => {
  const [queue, setQueue] = useState<CurationQueueItem[]>([]);
  const [candidateListings, setCandidateListings] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAuditorMasked, setIsAuditorMasked] = useState<boolean>(false);

  // Search & Filter State for Queue Table
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "requested" | "pushed">("all");

  // Listing Picker Modal State
  const [activePickerLead, setActivePickerLead] = useState<CurationQueueItem | null>(null);
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [buyerNote, setBuyerNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Picker Modal Filters
  const [pickerCityFilter, setPickerCityFilter] = useState<string>("all");
  const [pickerProgramFilter, setPickerProgramFilter] = useState<string>("all");
  const [pickerSearchQuery, setPickerSearchQuery] = useState<string>("");
  const [pickerMaxPrice, setPickerMaxPrice] = useState<number>(1000000);

  // Load Queue & Listings
  const loadCurationData = async () => {
    setIsRefreshing(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 1. Fetch Queue
      const queueRes = await fetch("/api/leads/curate/queue", { headers });
      if (queueRes.ok) {
        const data = await queueRes.json();
        setQueue(data.queue || []);
        setIsAuditorMasked(!!data.isAuditorMasked);
      } else {
        console.warn("Queue fetch error:", await queueRes.text());
      }

      // 2. Fetch Listings
      const listingsRes = await fetch("/api/leads/curate/listings", { headers });
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setCandidateListings(data.listings || []);
      }
    } catch (err: any) {
      console.error("Error loading curation queue data:", err);
      onTriggerToast("Notice: Could not refresh curation queue from cloud API.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCurationData();
  }, []);

  // Open Listing Picker for a Lead
  const handleOpenPicker = (lead: CurationQueueItem) => {
    setActivePickerLead(lead);

    // If lead already has married listings, pre-populate with them for re-marry/review
    if (lead.curationDoc?.listings && Array.isArray(lead.curationDoc.listings)) {
      setSelectedListingIds(lead.curationDoc.listings.map((l) => l.listingId));
      setBuyerNote(lead.curationDoc.buyerNote || "");
    } else {
      setSelectedListingIds([]);
      setBuyerNote("");
    }

    // Default city filter to lead's city if it matches available listings
    const leadCity = lead.city?.trim() || "";
    setPickerCityFilter(leadCity || "all");
    setPickerProgramFilter("all");
    setPickerSearchQuery("");
    setPickerMaxPrice(1000000);
  };

  const handleClosePicker = () => {
    setActivePickerLead(null);
    setSelectedListingIds([]);
    setBuyerNote("");
  };

  // Toggle selection for a listing
  const handleToggleListing = (id: string) => {
    setSelectedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit "Marry to Lead" Action
  const handleConfirmMarry = async () => {
    if (!activePickerLead) return;
    if (selectedListingIds.length === 0) {
      onTriggerToast("Please select at least 1 listing to marry to this lead.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/leads/curate/marry", {
        method: "POST",
        headers,
        body: JSON.stringify({
          leadId: activePickerLead.id,
          listingIds: selectedListingIds,
          buyerNote: buyerNote.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to marry listings.");
      }

      onTriggerToast(
        `🎉 Successfully married ${selectedListingIds.length} homes to ${activePickerLead.fullName} and pushed to buyer plugin!`
      );
      handleClosePicker();
      await loadCurationData();
    } catch (err: any) {
      console.error("Marry action error:", err);
      onTriggerToast(`Error: ${err.message || "Failed to marry listings."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Un-marry Action
  const handleUnmarry = async (lead: CurationQueueItem) => {
    if (!confirm(`Are you sure you want to un-marry listings for ${lead.fullName}? The curation doc will be deleted and the request will return to "requested".`)) {
      return;
    }

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/leads/curate/unmarry", {
        method: "POST",
        headers,
        body: JSON.stringify({ leadId: lead.id }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to un-marry listings.");
      }

      onTriggerToast(`Un-married listings for ${lead.fullName}. Returned to requested state.`);
      await loadCurationData();
    } catch (err: any) {
      console.error("Unmarry error:", err);
      onTriggerToast(`Error: ${err.message || "Failed to un-marry."}`);
    }
  };

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      // Status filter
      if (statusFilter === "requested" && item.status !== "requested") return false;
      if (statusFilter === "pushed" && item.status !== "pushed") return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.fullName.toLowerCase().includes(q);
        const matchCity = item.city.toLowerCase().includes(q);
        const matchEmail = item.email.toLowerCase().includes(q);
        const matchSource = item.source.toLowerCase().includes(q);
        if (!matchName && !matchCity && !matchEmail && !matchSource) return false;
      }

      return true;
    });
  }, [queue, statusFilter, searchQuery]);

  // Unique Cities in candidate pool for picker dropdown
  const candidateCities = useMemo(() => {
    const cities = new Set<string>();
    candidateListings.forEach((l) => {
      if (l.city) cities.add(l.city);
    });
    return Array.from(cities).sort();
  }, [candidateListings]);

  // Filtered candidate listings for the picker modal
  const filteredPickerListings = useMemo(() => {
    return candidateListings.filter((listing) => {
      // City filter
      if (
        pickerCityFilter !== "all" &&
        listing.city?.toLowerCase() !== pickerCityFilter.toLowerCase()
      ) {
        return false;
      }

      // Max price
      if (listing.price && listing.price > pickerMaxPrice) {
        return false;
      }

      // Program filter
      if (pickerProgramFilter !== "all") {
        const overlay = listing.overlayEligibility || {};
        if (pickerProgramFilter === "lakeview" && !overlay.lakeviewNationalEligible && !overlay.lakeviewNational) return false;
        if (pickerProgramFilter === "usda" && !overlay.usdaEligible && !overlay.usda) return false;
        if (pickerProgramFilter === "lmi" && !overlay.lmiEligible && !overlay.lmi) return false;
        if (pickerProgramFilter === "firsthome" && !overlay.firstHomeEligible) return false;
      }

      // Keyword search
      if (pickerSearchQuery.trim()) {
        const q = pickerSearchQuery.toLowerCase().trim();
        const matchAddr = listing.address.toLowerCase().includes(q);
        const matchCity = (listing.city || "").toLowerCase().includes(q);
        const matchTitle = listing.title.toLowerCase().includes(q);
        if (!matchAddr && !matchCity && !matchTitle) return false;
      }

      return true;
    });
  }, [candidateListings, pickerCityFilter, pickerProgramFilter, pickerSearchQuery, pickerMaxPrice]);

  // Summary Metrics
  const requestedCount = queue.filter((q) => q.status === "requested").length;
  const pushedCount = queue.filter((q) => q.status === "pushed").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#2D362E] via-[#38463B] to-[#1E2520] text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight">
                    Lead Curation Console &amp; "Marry to Lead" Hub
                  </h2>
                  <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    GLBA Compliant
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  Review borrower curated list requests, pick qualified low/no down payment homes verbatim from the canonical pool, and marry them directly to buyer apps.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadCurationData}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              title="Refresh curation queue from Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-stone-400 block font-medium">Open Curation Requests</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">{requestedCount}</span>
              <span className="text-[10px] text-amber-300/80 uppercase font-bold">Awaiting Curation</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
            <span className="text-[11px] text-stone-400 block font-medium">Married &amp; Pushed</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">{pushedCount}</span>
              <span className="text-[10px] text-emerald-300/80 uppercase font-bold">In Buyer Apps</span>
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/5 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-stone-400 block font-medium">Candidate Pool Store</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">{candidateListings.length}</span>
              <span className="text-[10px] text-stone-300 uppercase font-bold">Canonical Listings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auditor Masking Warning Banner */}
      {isAuditorMasked && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Compliance Auditor View:</strong> Customer PII (phone and email) is cryptographically masked. Read-only audit access active.
          </span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-3xl border border-[#EAE7E0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lead name, city, email, or source..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] focus:bg-white focus:ring-2 focus:ring-[#4A5D4E] outline-none text-[#2D362E]"
            />
            <Filter className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#FAF9F5] p-1 rounded-xl border border-[#EAE7E0] text-xs font-semibold">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "all"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              All ({queue.length})
            </button>
            <button
              onClick={() => setStatusFilter("requested")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "requested"
                  ? "bg-amber-700 text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              Requested ({requestedCount})
            </button>
            <button
              onClick={() => setStatusFilter("pushed")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === "pushed"
                  ? "bg-emerald-700 text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              Pushed ({pushedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-[#4A5D4E] animate-spin mx-auto" />
            <p className="text-xs text-stone-500">Loading curation queue from Firestore...</p>
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[#FAF9F5]/40">
            <Building className="w-8 h-8 text-stone-400 mx-auto" />
            <h4 className="font-bold text-sm text-[#2D362E]">No curation requests found</h4>
            <p className="text-xs text-[#606C5D] max-w-sm mx-auto">
              When homebuyers request a curated list via the 24/7 AI Chatbot, web pre-qual forms, or Facebook ads, their structured briefs will appear in this queue.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] text-[#606C5D] font-bold border-b border-[#EAE7E0] uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Homebuyer Lead</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Desired Area</th>
                  <th className="py-3.5 px-4">Target Budget</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7E0]/60">
                {filteredQueue.map((item) => {
                  const isRequested = item.status === "requested";
                  const isPushed = item.status === "pushed" || !!item.curationDoc;
                  const marriedCount = item.curationDoc?.listings?.length || 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#FAF9F5]/80 transition-colors group cursor-pointer"
                      onClick={() => handleOpenPicker(item)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#EAE7E0] text-[#2D362E] font-bold flex items-center justify-center shrink-0">
                            {item.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#2D362E] block group-hover:text-emerald-800 transition-colors">
                              {item.fullName}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Source: <span className="font-semibold text-stone-700">{item.source}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-stone-700 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{item.email || "No email"}</span>
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[10px]">
                            <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-[#2D362E] font-medium">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>{item.city}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-[#2D362E]">
                        {item.priceRange}
                      </td>

                      <td className="py-3.5 px-4 text-stone-600">
                        {item.timeline}
                      </td>

                      <td className="py-3.5 px-4">
                        {isRequested ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Requested
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Pushed ({marriedCount} homes)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPicker(item)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                              isRequested
                                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                                : "bg-[#4A5D4E] hover:bg-[#38463B] text-white"
                            }`}
                          >
                            <span>{isRequested ? "Pick & Marry" : `Re-Marry (${marriedCount})`}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>

                          {isPushed && (
                            <button
                              onClick={() => handleUnmarry(item)}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Un-marry listings (resets to requested)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LISTING PICKER & "MARRY TO LEAD" MODAL */}
      {/* ========================================================================= */}
      {activePickerLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-white border-b border-[#EAE7E0] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#2D362E]">
                      Marry Listings to: <span className="text-emerald-900">{activePickerLead.fullName}</span>
                    </h3>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Target: {activePickerLead.city}
                    </span>
                  </div>
                  <p className="text-xs text-[#606C5D]">
                    Budget: <strong>{activePickerLead.priceRange}</strong> • Timeline: <strong>{activePickerLead.timeline}</strong> • Contact: <span className="font-mono">{activePickerLead.email}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleClosePicker}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 bg-white/80 border-b border-[#EAE7E0] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">City Filter</label>
                <select
                  value={pickerCityFilter}
                  onChange={(e) => setPickerCityFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] outline-none"
                >
                  <option value="all">All Available Cities ({candidateListings.length})</option>
                  {candidateCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Program Eligibility</label>
                <select
                  value={pickerProgramFilter}
                  onChange={(e) => setPickerProgramFilter(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] outline-none"
                >
                  <option value="all">All Qualified Programs</option>
                  <option value="lakeview">Lakeview (140% AMI)</option>
                  <option value="usda">USDA RD (0% Down)</option>
                  <option value="lmi">Flex Lending / LMI</option>
                  <option value="firsthome">OHCS FirstHome ($15k DPA)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Search Keywords</label>
                <input
                  type="text"
                  value={pickerSearchQuery}
                  onChange={(e) => setPickerSearchQuery(e.target.value)}
                  placeholder="Address, MLS, or keyword..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  Max Price: {formatUSD(pickerMaxPrice)}
                </label>
                <input
                  type="range"
                  min={200000}
                  max={1200000}
                  step={25000}
                  value={pickerMaxPrice}
                  onChange={(e) => setPickerMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Candidate Listings Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
                <span>
                  Showing <strong>{filteredPickerListings.length}</strong> canonical listings matching filters
                </span>
                <span className="text-emerald-800 font-bold font-mono">
                  {selectedListingIds.length} homes selected for {activePickerLead.fullName}
                </span>
              </div>

              {filteredPickerListings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-[#EAE7E0] space-y-2">
                  <Building className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="font-bold text-sm text-[#2D362E]">No listings match this filter</p>
                  <p className="text-xs text-[#606C5D]">Try selecting "All Available Cities" or raising the max price slider.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPickerListings.map((listing) => {
                    const isSelected = selectedListingIds.includes(listing.id);
                    const overlay = listing.overlayEligibility || {};

                    return (
                      <div
                        key={listing.id}
                        onClick={() => handleToggleListing(listing.id)}
                        className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between relative shadow-2xs hover:shadow-md ${
                          isSelected
                            ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                            : "border-[#EAE7E0] hover:border-stone-400"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-sm font-black text-[#2D362E] font-mono block">
                                {formatUSD(listing.price || 0)}
                              </span>
                              <span className="text-[11px] font-bold text-stone-800 line-clamp-1">
                                {listing.address}
                              </span>
                              <span className="text-[10px] text-stone-500 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-emerald-700" />
                                {listing.city}, {listing.county || "OR"}
                              </span>
                            </div>

                            <div className="p-1 rounded-lg">
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-emerald-700" />
                              ) : (
                                <Square className="w-5 h-5 text-stone-300" />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-stone-600 font-mono pt-1 border-t border-[#EAE7E0]/60">
                            <span>{listing.beds || 3} Beds</span>
                            <span>•</span>
                            <span>{listing.baths || 2} Baths</span>
                            <span>•</span>
                            <span>{listing.sqft?.toLocaleString() || "1,850"} SqFt</span>
                          </div>

                          {/* Verbatim Program Eligibility Badges */}
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            {(overlay.lakeviewNationalEligible || overlay.lakeviewNational) && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                Lakeview
                              </span>
                            )}
                            {(overlay.usdaEligible || overlay.usda) && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                USDA RD (0% Down)
                              </span>
                            )}
                            {(overlay.lmiEligible || overlay.lmi) && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                                LMI Flex
                              </span>
                            )}
                            {overlay.firstHomeEligible && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                FirstHome ($15k)
                              </span>
                            )}
                          </div>
                        </div>

                        {listing.listingAgent && (
                          <div className="text-[9px] text-stone-400 font-mono mt-2 pt-1 border-t border-[#EAE7E0]/40">
                            Agent: {listing.listingAgent.name || "Co-Brand Partner"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="p-5 bg-white border-t border-[#EAE7E0] space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Personalized Note to {activePickerLead.fullName} (Optional — displays on buyer's plugin view):
                </label>
                <input
                  type="text"
                  value={buyerNote}
                  onChange={(e) => setBuyerNote(e.target.value)}
                  placeholder="e.g. 'Hi there! I hand-picked these zero-down eligible homes in your target area for you to tour this weekend.'"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                <div className="text-xs text-stone-600">
                  <span>Selected: </span>
                  <strong className="text-emerald-900 font-bold">{selectedListingIds.length} listing(s)</strong>
                  {activePickerLead.curationDoc && (
                    <span className="text-amber-700 text-[11px] block sm:inline sm:ml-2">
                      (Replaces prior list of {activePickerLead.curationDoc.listings?.length || 0} homes)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClosePicker}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmMarry}
                    disabled={isSubmitting || selectedListingIds.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <HeartHandshake className="w-4 h-4" />
                    )}
                    <span>
                      {isSubmitting
                        ? "Marrying & Pushing..."
                        : `Marry ${selectedListingIds.length} Listings & Push to App`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
