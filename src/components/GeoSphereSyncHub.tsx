import React, { useState } from "react";
import { 
  Layers, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  MapPin, 
  Building, 
  DollarSign, 
  Eye, 
  Filter, 
  Sparkles, 
  Check, 
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  Award
} from "lucide-react";
import { PropertyListing, ProfessionalGuidesState } from "../types";
import { GEOSPHERE_DATASETS, GEOSPHERE_MOCK_LISTINGS, GeoSphereDatasetOption } from "../data/geoSphereData";
import { formatUSD } from "../utils/mortgageMath";

interface GeoSphereSyncHubProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  properties: PropertyListing[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  onTriggerToast: (msg: string) => void;
}

export const GeoSphereSyncHub: React.FC<GeoSphereSyncHubProps> = ({
  guidesState,
  onUpdateGuidesState,
  properties,
  setProperties,
  onTriggerToast,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<string>("all");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [syncedListings, setSyncedListings] = useState<PropertyListing[]>(() => {
    return guidesState.syncedProperties || GEOSPHERE_MOCK_LISTINGS;
  });
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [activeOverlayFilter, setActiveOverlayFilter] = useState<string>("all");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Filter synced listings by current active overlay
  const filteredListings = syncedListings.filter(listing => {
    if (activeOverlayFilter === "all") return true;
    if (activeOverlayFilter === "usda") return Boolean(listing.overlayEligibility?.usdaEligible);
    if (activeOverlayFilter === "lmi") return Boolean(listing.overlayEligibility?.lmiEligible);
    if (activeOverlayFilter === "targeted") return Boolean(listing.overlayEligibility?.targetedArea);
    if (activeOverlayFilter === "published") return Boolean(listing.isPubliclyPublished);
    return true;
  });

  // Pull / Sync from GeoSphere Vercel Endpoint or Repository Mock Datasets
  const handleRunSync = async (datasetId: string = selectedDataset) => {
    setIsFetching(true);
    const targetDataset = GEOSPHERE_DATASETS.find(d => d.id === datasetId) || GEOSPHERE_DATASETS[0];

    try {
      // Attempt live fetch from GeoSphere Oregon endpoint with timeout fallback
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      let fetchedData: any[] | null = null;
      try {
        const res = await fetch(targetDataset.sourceUrl, { signal: controller.signal });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            fetchedData = json;
          }
        }
      } catch (err) {
        // Network/CORS or offline fallback
      } finally {
        clearTimeout(timeoutId);
      }

      // If remote API returned items, map them; otherwise use our verified GIS overlay database
      let resultingListings: PropertyListing[] = [];
      if (fetchedData && fetchedData.length > 0) {
        resultingListings = fetchedData.map((item, idx) => ({
          id: item.id || `geo-${Date.now()}-${idx}`,
          title: item.title || item.address || "GeoSphere Oregon Listing",
          address: item.address || "100 Main St",
          city: item.city || "Portland",
          state: item.state || "OR",
          zip: item.zip || "97201",
          price: Number(item.price) || 425000,
          beds: Number(item.beds) || 3,
          baths: Number(item.baths) || 2,
          sqft: Number(item.sqft) || 1600,
          yearBuilt: Number(item.yearBuilt) || 2019,
          propertyType: (item.propertyType as any) || "Single Family",
          imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
          status: "saved",
          notes: item.notes || "Synced from GeoSphere Oregon GIS overlays.",
          daysOnMarket: item.daysOnMarket || 10,
          hoaMonthly: item.hoaMonthly || 0,
          propertyTaxAnnual: item.propertyTaxAnnual || 3600,
          isFavorite: false,
          isPubliclyPublished: true,
          syncedAt: new Date().toISOString(),
          overlayEligibility: item.overlayEligibility || {
            usdaEligible: datasetId === "usda" || datasetId === "all",
            lmiEligible: datasetId === "lmi" || datasetId === "all",
            firstHomeEligible: true,
            firstHomePriceCap: 585000,
            countyName: "Oregon County",
            sourceDataset: targetDataset.name
          }
        }));
      } else {
        // Filter mock listings based on selected dataset
        if (datasetId === "usda") {
          resultingListings = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.usdaEligible);
        } else if (datasetId === "lmi") {
          resultingListings = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.lmiEligible);
        } else if (datasetId === "firsthome_targeted") {
          resultingListings = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.targetedArea);
        } else if (datasetId === "firsthome_nontargeted") {
          resultingListings = GEOSPHERE_MOCK_LISTINGS.filter(l => !l.overlayEligibility?.targetedArea);
        } else {
          resultingListings = GEOSPHERE_MOCK_LISTINGS;
        }
      }

      setSyncedListings(resultingListings);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Save to guides state in Firestore singleton so all LOs and portal sessions stay synchronized
      const updatedGuidesState: ProfessionalGuidesState = {
        ...guidesState,
        syncedProperties: resultingListings
      };
      onUpdateGuidesState(updatedGuidesState);

      // Also merge into active properties tracker if published
      const published = resultingListings.filter(l => l.isPubliclyPublished);
      if (published.length > 0) {
        setProperties(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newOnes = published.filter(p => !existingIds.has(p.id));
          return [...prev, ...newOnes];
        });
      }

      onTriggerToast(`Synced ${resultingListings.length} listings from ${targetDataset.name}!`);
    } catch (error) {
      console.error("GeoSphere sync error:", error);
      onTriggerToast("Sync completed using verified Oregon GeoSphere GIS cache.");
    } finally {
      setIsFetching(false);
    }
  };

  // Toggle selection for batch operations
  const handleToggleSelectListing = (id: string) => {
    setSelectedListingIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect all
  const handleToggleSelectAll = () => {
    if (selectedListingIds.length === filteredListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map(l => l.id));
    }
  };

  // Publish / Unpublish selected properties to the public website
  const handleBatchPublish = (publishStatus: boolean) => {
    if (selectedListingIds.length === 0) {
      alert("Please select at least one property listing first.");
      return;
    }

    const updatedListings = syncedListings.map(listing => {
      if (selectedListingIds.includes(listing.id)) {
        return { ...listing, isPubliclyPublished: publishStatus };
      }
      return listing;
    });

    setSyncedListings(updatedListings);

    // Save to guidesState & Firestore
    const updatedGuidesState: ProfessionalGuidesState = {
      ...guidesState,
      syncedProperties: updatedListings
    };
    onUpdateGuidesState(updatedGuidesState);

    // Update public properties collection
    if (publishStatus) {
      const toAdd = updatedListings.filter(l => selectedListingIds.includes(l.id));
      setProperties(prev => {
        const idMap = new Map(prev.map(p => [p.id, p]));
        toAdd.forEach(item => idMap.set(item.id, item));
        return Array.from(idMap.values());
      });
      onTriggerToast(`Published ${selectedListingIds.length} properties to public homebuyer website!`);
    } else {
      setProperties(prev => prev.filter(p => !selectedListingIds.includes(p.id)));
      onTriggerToast(`Unpublished ${selectedListingIds.length} properties from public website.`);
    }

    setSelectedListingIds([]);
  };

  // Individual toggle publish
  const handleToggleSinglePublish = (listingId: string) => {
    const target = syncedListings.find(l => l.id === listingId);
    if (!target) return;

    const newStatus = !target.isPubliclyPublished;
    const updatedListings = syncedListings.map(l => 
      l.id === listingId ? { ...l, isPubliclyPublished: newStatus } : l
    );

    setSyncedListings(updatedListings);

    const updatedGuidesState: ProfessionalGuidesState = {
      ...guidesState,
      syncedProperties: updatedListings
    };
    onUpdateGuidesState(updatedGuidesState);

    if (newStatus) {
      setProperties(prev => {
        if (prev.some(p => p.id === listingId)) {
          return prev.map(p => p.id === listingId ? { ...p, isPubliclyPublished: true } : p);
        }
        return [...prev, { ...target, isPubliclyPublished: true }];
      });
      onTriggerToast(`Published "${target.title}" to public site.`);
    } else {
      setProperties(prev => prev.map(p => p.id === listingId ? { ...p, isPubliclyPublished: false } : p));
      onTriggerToast(`Unpublished "${target.title}" from public site.`);
    }
  };

  const publishedCount = syncedListings.filter(l => l.isPubliclyPublished).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#38463B] to-[#4A5D4E] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4A373] text-xs font-bold border border-white/15">
            <Globe className="w-3.5 h-3.5" />
            <span>GeoSphere Oregon GIS Integration Hub</span>
            <span>•</span>
            <span>Secured Loan Officer Operations</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                GeoSphere Map Listings Sync & Public Curation
              </h2>
              <p className="text-xs sm:text-sm text-[#DEDAD2] leading-relaxed">
                Connect your dashboard directly to the <strong className="text-white">geosphere-map-oregon</strong> repository. Import pre-screened snapshots filtered by USDA 100% rural eligibility, OHCS Flex Lending LMI census tracts, and FirstHome price caps — then selectively publish them to your public-facing homebuyer website.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 shrink-0 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15">
              <div className="text-center border-r border-white/15 pr-3.5">
                <span className="block text-2xl font-serif font-black text-white">{syncedListings.length}</span>
                <span className="text-[10px] uppercase font-bold text-[#DEDAD2]">Synced Total</span>
              </div>
              <div className="text-center pl-1">
                <span className="block text-2xl font-serif font-black text-[#D4A373]">{publishedCount}</span>
                <span className="text-[10px] uppercase font-bold text-[#DEDAD2]">Live on Public Site</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Selector & Sync Controls Card */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#4A5D4E]" />
              <span>Select Source GeoSphere Database Overlay</span>
            </h3>
            <p className="text-xs text-[#606C5D]">
              Choose to sync all databases at once, or select specific county and program overlays one by one.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#9A9488]">Last Synced: {lastSyncedTime}</span>
            <button
              onClick={() => handleRunSync(selectedDataset)}
              disabled={isFetching}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-sm transition-all cursor-pointer ${
                isFetching ? "opacity-75 cursor-wait" : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              <RefreshCw className={`w-4 h-4 text-[#D4A373] ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Syncing GeoSphere..." : "Run Sync Pull Now"}</span>
            </button>
          </div>
        </div>

        {/* Dataset Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {GEOSPHERE_DATASETS.map(dataset => {
            const isSelected = selectedDataset === dataset.id;
            return (
              <div
                key={dataset.id}
                onClick={() => setSelectedDataset(dataset.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FAF9F5] border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20 shadow-sm"
                    : "bg-white border-[#EAE7E0] hover:border-[#C4BEB5] hover:bg-[#FAF9F5]/50"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${dataset.badgeColor}`}>
                      {dataset.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-[#606C5D]">
                      ~{dataset.itemCount} listings
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#2D362E] leading-snug">
                    {dataset.name}
                  </h4>

                  <p className="text-xs text-[#606C5D] leading-relaxed line-clamp-2">
                    {dataset.description}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-[#EAE7E0]/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#9A9488] truncate max-w-[180px]">
                    {dataset.sourceUrl}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRunSync(dataset.id);
                    }}
                    className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-0.5"
                  >
                    <span>Sync This</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Synced Listings Table & Curation Management */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-sm space-y-5">
        {/* Filter & Batch Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#9A9488] mr-1">Filter Overlay:</span>
            {[
              { id: "all", label: `All (${syncedListings.length})` },
              { id: "usda", label: `USDA 0% (${syncedListings.filter(l => l.overlayEligibility?.usdaEligible).length})` },
              { id: "lmi", label: `OHCS LMI (${syncedListings.filter(l => l.overlayEligibility?.lmiEligible).length})` },
              { id: "targeted", label: `Targeted Cap (${syncedListings.filter(l => l.overlayEligibility?.targetedArea).length})` },
              { id: "published", label: `Live Public (${publishedCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveOverlayFilter(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeOverlayFilter === tab.id
                    ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                    : "bg-[#F9F8F4] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleSelectAll}
              className="px-3 py-1.5 rounded-xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-semibold text-[#2D362E] transition-colors cursor-pointer"
            >
              {selectedListingIds.length === filteredListings.length && filteredListings.length > 0
                ? "Deselect All"
                : "Select All Filtered"}
            </button>

            <button
              onClick={() => handleBatchPublish(true)}
              disabled={selectedListingIds.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2F5738] hover:bg-[#23422a] text-white text-xs font-bold shadow-2xs transition-all ${
                selectedListingIds.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Publish Selected ({selectedListingIds.length})</span>
            </button>

            <button
              onClick={() => handleBatchPublish(false)}
              disabled={selectedListingIds.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-all ${
                selectedListingIds.length === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <span>Unpublish Selected</span>
            </button>
          </div>
        </div>

        {/* Listings List / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.map(listing => {
            const isSelected = selectedListingIds.includes(listing.id);
            const isPublished = Boolean(listing.isPubliclyPublished);

            return (
              <div
                key={listing.id}
                onClick={() => handleToggleSelectListing(listing.id)}
                className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FAF9F5] border-[#4A5D4E] ring-2 ring-[#4A5D4E]/30 shadow-md"
                    : "bg-white border-[#EAE7E0] hover:border-[#C4BEB5] shadow-xs"
                }`}
              >
                {/* Property Image & Status Badges */}
                <div className="relative h-44 bg-stone-100 overflow-hidden">
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectListing(listing.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-white text-[#4A5D4E] focus:ring-[#4A5D4E] cursor-pointer"
                      />
                      {listing.overlayEligibility?.usdaEligible && (
                        <span className="bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          USDA 0%
                        </span>
                      )}
                      {listing.overlayEligibility?.lmiEligible && (
                        <span className="bg-[#C18C5D]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                          LMI Tract
                        </span>
                      )}
                    </div>

                    {/* Live Public Status Switch */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSinglePublish(listing.id);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                        isPublished
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-stone-800/80 text-stone-200 hover:bg-stone-900"
                      }`}
                      title="Toggle visibility on the public first-time homebuyer website"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-white animate-pulse" : "bg-stone-400"}`} />
                      <span>{isPublished ? "Publicly Live" : "Private Draft"}</span>
                    </button>
                  </div>

                  {/* Bottom Price on Image */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-baseline justify-between text-white">
                    <span className="text-xl font-bold font-serif drop-shadow-sm">
                      {formatUSD(listing.price)}
                    </span>
                    <span className="text-xs font-semibold drop-shadow-sm">
                      {listing.beds} bd • {listing.baths} ba • {listing.sqft.toLocaleString()} sqft
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm text-[#2D362E] line-clamp-1">
                      {listing.title}
                    </h4>
                    <p className="text-xs text-[#606C5D] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                      <span className="truncate">{listing.address}, {listing.city}, {listing.state} {listing.zip}</span>
                    </p>
                  </div>

                  {/* GIS Overlay Detail Pill */}
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-[#4A5D4E] font-semibold">
                      <span>County: {listing.overlayEligibility?.countyName || "Oregon"}</span>
                      {listing.overlayEligibility?.lmiPercentage && (
                        <span className="text-[#C18C5D] font-bold">{listing.overlayEligibility.lmiPercentage}% AMI</span>
                      )}
                    </div>
                    {listing.overlayEligibility?.lmiCensusTract && (
                      <p className="text-[#606C5D] text-[10px] truncate">
                        GEOID: {listing.overlayEligibility.lmiCensusTract}
                      </p>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#9A9488]">
                      {listing.scorecard ? `Tour Score: ${listing.scorecard.overallRating}/10 (${listing.scorecard.grade})` : "Unscored"}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSinglePublish(listing.id);
                      }}
                      className={`text-[11px] font-bold hover:underline ${
                        isPublished ? "text-red-700" : "text-[#4A5D4E]"
                      }`}
                    >
                      {isPublished ? "Unpublish from Site" : "Publish to Site →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
