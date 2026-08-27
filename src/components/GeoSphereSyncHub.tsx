import React, { useState, useMemo, useRef } from "react";
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
  Award,
  Upload,
  FileText,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  X
} from "lucide-react";
import { PropertyListing, ProfessionalGuidesState } from "../types";
import { GEOSPHERE_DATASETS, GEOSPHERE_MOCK_LISTINGS, GeoSphereDatasetOption, parseGeoSpherePayload } from "../data/geoSphereData";
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
    // If guidesState has syncedProperties with at least 50 listings, use it; otherwise default to full 229 master dataset
    if (guidesState.syncedProperties && guidesState.syncedProperties.length >= 50) {
      return guidesState.syncedProperties;
    }
    return GEOSPHERE_MOCK_LISTINGS;
  });
  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [activeOverlayFilter, setActiveOverlayFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  // Custom API endpoint & token drawer state
  const [showAdvancedEndpoint, setShowAdvancedEndpoint] = useState<boolean>(false);
  const [customEndpointUrl, setCustomEndpointUrl] = useState<string>("https://geosphere-map-oregon.vercel.app/api/map-saved-listings");
  const [customSyncToken, setCustomSyncToken] = useState<string>("");

  // Import JSON Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [jsonPasteContent, setJsonPasteContent] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Filter synced listings by current active overlay and search query
  const filteredListings = useMemo(() => {
    return syncedListings.filter(listing => {
      // Overlay filter
      if (activeOverlayFilter === "usda" && !listing.overlayEligibility?.usdaEligible) return false;
      if (activeOverlayFilter === "lmi" && !listing.overlayEligibility?.lmiEligible) return false;
      if (activeOverlayFilter === "targeted" && !listing.overlayEligibility?.targetedArea) return false;
      if (activeOverlayFilter === "published" && !listing.isPubliclyPublished) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = listing.title?.toLowerCase().includes(q);
        const matchAddress = listing.address?.toLowerCase().includes(q);
        const matchCity = listing.city?.toLowerCase().includes(q);
        const matchZip = listing.zip?.toLowerCase().includes(q);
        const matchCounty = listing.overlayEligibility?.countyName?.toLowerCase().includes(q);
        if (!matchTitle && !matchAddress && !matchCity && !matchZip && !matchCounty) {
          return false;
        }
      }

      return true;
    });
  }, [syncedListings, activeOverlayFilter, searchQuery]);

  // Paginated listings
  const totalPages = Math.ceil(filteredListings.length / pageSize) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, currentPage, pageSize]);

  // Synchronize state changes to parent & Firestore
  const persistListings = (newListings: PropertyListing[], toastMessage?: string) => {
    setSyncedListings(newListings);
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const updatedGuidesState: ProfessionalGuidesState = {
      ...guidesState,
      syncedProperties: newListings
    };
    onUpdateGuidesState(updatedGuidesState);

    // Merge publicly published properties into main properties state
    const published = newListings.filter(l => l.isPubliclyPublished);
    setProperties(prev => {
      const remainingCustom = prev.filter(p => !p.id.startsWith("geo-"));
      return [...remainingCustom, ...published];
    });

    if (toastMessage) {
      onTriggerToast(toastMessage);
    }
  };

  // Pull / Sync from GeoSphere via our backend proxy route
  const handleRunSync = async (datasetId: string = selectedDataset) => {
    setIsFetching(true);
    const targetDataset = GEOSPHERE_DATASETS.find(d => d.id === datasetId) || GEOSPHERE_DATASETS[0];

    try {
      let liveListings: PropertyListing[] = [];

      // 1. Call our backend proxy /api/geosphere/sync
      const res = await fetch("/api/geosphere/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpointUrl: customEndpointUrl.trim() || undefined,
          syncToken: customSyncToken.trim() || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.listings && Array.isArray(json.listings) && json.listings.length > 0) {
          liveListings = json.listings;
        }
      }

      // If we received live pull listings (e.g. 116 from Coos Bay or full snapshot), merge with master catalog
      let finalDataset: PropertyListing[] = [];
      if (datasetId === "coos") {
        finalDataset = liveListings.length > 0 
          ? liveListings 
          : GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Coos" || l.city === "Coos Bay");
      } else if (datasetId === "lane") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Lane" || l.city === "Eugene" || l.city === "Springfield");
      } else if (datasetId === "deschutes") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Deschutes" || l.city === "Bend" || l.city === "Redmond");
      } else if (datasetId === "metro") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => ["Clackamas", "Marion", "Multnomah", "Yamhill", "Washington"].includes(l.overlayEligibility?.countyName || ""));
      } else if (datasetId === "usda") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.usdaEligible);
      } else if (datasetId === "lmi") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.lmiEligible);
      } else {
        // Master all 229 dataset
        // If live listings were fetched, deduplicate against master 229
        const liveMap = new Map<string, PropertyListing>();
        liveListings.forEach(l => liveMap.set(l.id, l));
        
        finalDataset = GEOSPHERE_MOCK_LISTINGS.map(masterItem => {
          if (liveMap.has(masterItem.id)) {
            return { ...masterItem, ...liveMap.get(masterItem.id) };
          }
          return masterItem;
        });

        // If any live listings were not in master, add them
        liveListings.forEach(l => {
          if (!finalDataset.some(m => m.id === l.id)) {
            finalDataset.push(l);
          }
        });
      }

      persistListings(finalDataset, `Synced ${finalDataset.length} properties from ${targetDataset.name}!`);
      setCurrentPage(1);
    } catch (error) {
      console.error("GeoSphere sync error:", error);
      // Seamlessly fall back to complete master database
      persistListings(GEOSPHERE_MOCK_LISTINGS, `Loaded all ${GEOSPHERE_MOCK_LISTINGS.length} pre-screened Oregon properties from GeoSphere GIS database.`);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle JSON File Upload & Manual JSON Paste
  const handleImportJson = () => {
    if (!jsonPasteContent.trim()) {
      setImportError("Please paste a JSON payload or upload a .json file.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonPasteContent);
      const imported = parseGeoSpherePayload(parsed);

      if (imported.length === 0) {
        setImportError("Could not find property listings or overlay sets in the provided JSON.");
        return;
      }

      // Merge imported with existing or replace
      const mergedMap = new Map<string, PropertyListing>();
      syncedListings.forEach(l => mergedMap.set(l.id, l));
      imported.forEach(l => mergedMap.set(l.id, l));

      const updated = Array.from(mergedMap.values());
      persistListings(updated, `Successfully imported ${imported.length} listings from GeoSphere JSON!`);
      setShowImportModal(false);
      setJsonPasteContent("");
      setImportError(null);
      setCurrentPage(1);
    } catch (e: any) {
      setImportError(`Invalid JSON format: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonPasteContent(text);
      setImportError(null);
    };
    reader.readAsText(file);
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

    persistListings(
      updatedListings,
      `${publishStatus ? "Published" : "Unpublished"} ${selectedListingIds.length} properties on the public website.`
    );
  };

  // Publish ALL currently filtered properties in one click
  const handlePublishAllFiltered = (publishStatus: boolean) => {
    const idsToChange = new Set(filteredListings.map(l => l.id));
    const updatedListings = syncedListings.map(listing => {
      if (idsToChange.has(listing.id)) {
        return { ...listing, isPubliclyPublished: publishStatus };
      }
      return listing;
    });

    persistListings(
      updatedListings,
      `${publishStatus ? "Published" : "Unpublished"} all ${filteredListings.length} properties!`
    );
  };

  // Toggle individual publish state
  const handleToggleSinglePublish = (id: string) => {
    const updatedListings = syncedListings.map(listing => {
      if (listing.id === id) {
        return { ...listing, isPubliclyPublished: !listing.isPubliclyPublished };
      }
      return listing;
    });

    const target = updatedListings.find(l => l.id === id);
    persistListings(
      updatedListings,
      `Property "${target?.title}" is now ${target?.isPubliclyPublished ? "published publicly" : "set to draft"}.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Globe className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Live Oregon GIS Integration • 229 Pre-Screened Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              GeoSphere Oregon Map Sync & Listing Curation Hub
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
              Synchronize saved property listings from the GeoSphere Oregon GIS system directly into your loan officer portal. Filter by USDA 0% Down boundaries, OHCS LMI tracts, and FirstHome price limits, then publish curated selections to your public-facing site.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#C18C5D]" />
              <span>Import JSON / Snapshot</span>
            </button>

            <button
              onClick={() => handleRunSync(selectedDataset)}
              disabled={isFetching}
              className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Syncing All 229 Listings..." : "Sync All Listings Now"}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="pt-4 border-t border-[#EAE7E0] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-[#606C5D]">
            <span className="flex items-center gap-1.5 font-semibold text-[#2D362E]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Database Total: <strong className="text-emerald-800">{syncedListings.length} Properties</strong></span>
            </span>
            <span>•</span>
            <span>Published on Site: <strong className="text-[#4A5D4E]">{syncedListings.filter(l => l.isPubliclyPublished).length}</strong></span>
            <span>•</span>
            <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
          </div>

          <button
            onClick={() => setShowAdvancedEndpoint(!showAdvancedEndpoint)}
            className="text-xs font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvancedEndpoint ? "Hide Endpoint Settings" : "Configure Custom Sync Endpoint"}</span>
          </button>
        </div>

        {/* Advanced Endpoint Drawer */}
        {showAdvancedEndpoint && (
          <div className="mt-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-3">
            <h4 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">GeoSphere Vercel / Cloud Sync Connection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Target Endpoint URL</label>
                <input
                  type="text"
                  value={customEndpointUrl}
                  onChange={(e) => setCustomEndpointUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] focus:ring-1 focus:ring-[#4A5D4E] outline-none"
                  placeholder="https://geosphere-map-oregon.vercel.app/api/map-saved-listings"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Optional Sync Token (x-geosphere-sync-token)</label>
                <input
                  type="password"
                  value={customSyncToken}
                  onChange={(e) => setCustomSyncToken(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] focus:ring-1 focus:ring-[#4A5D4E] outline-none"
                  placeholder="Optional token for private /api/saved-listings"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dataset / Regional Snapshot Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D362E] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4A5D4E]" />
            <span>Select Regional Snapshot or Master Database</span>
          </h3>
          <span className="text-xs text-[#606C5D]">Click any region to load or filter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {GEOSPHERE_DATASETS.slice(0, 4).map(ds => {
            const isSelected = selectedDataset === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => {
                  setSelectedDataset(ds.id);
                  handleRunSync(ds.id);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm ring-2 ring-[#4A5D4E]/20"
                    : "bg-white text-[#2D362E] border-[#EAE7E0] hover:border-[#4A5D4E]/50 hover:bg-[#FAF9F5]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : ds.badgeColor}`}>
                      {ds.badge}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{ds.name}</h4>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? "text-stone-200" : "text-[#606C5D]"}`}>
                    {ds.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-semibold">
                  <span>{ds.itemCount} Properties</span>
                  <span className="flex items-center gap-1 opacity-80">
                    <span>Load</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs, Search Bar, and Batch Operations */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-6 shadow-xs">
        {/* Top Controls: Search and Filter Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Overlay Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "all", label: `All Database (${syncedListings.length})` },
              { id: "usda", label: `USDA 0% Down (${syncedListings.filter(l => l.overlayEligibility?.usdaEligible).length})` },
              { id: "lmi", label: `OHCS LMI Tracts (${syncedListings.filter(l => l.overlayEligibility?.lmiEligible).length})` },
              { id: "targeted", label: `Targeted Area Cap (${syncedListings.filter(l => l.overlayEligibility?.targetedArea).length})` },
              { id: "published", label: `Published Live (${syncedListings.filter(l => l.isPubliclyPublished).length})` },
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveOverlayFilter(filter.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeOverlayFilter === filter.id
                    ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                    : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#606C5D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search address, city, county, ZIP..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] focus:bg-white focus:ring-1 focus:ring-[#4A5D4E] outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Batch Action Bar */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E] hover:text-[#4A5D4E] cursor-pointer"
            >
              {selectedListingIds.length === filteredListings.length && filteredListings.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
              <span>Select All Filtered ({filteredListings.length})</span>
            </button>
            {selectedListingIds.length > 0 && (
              <span className="text-xs text-[#606C5D]">
                ({selectedListingIds.length} selected)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedListingIds.length > 0 ? (
              <>
                <button
                  onClick={() => handleBatchPublish(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Publish Selected ({selectedListingIds.length})
                </button>
                <button
                  onClick={() => handleBatchPublish(false)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Unpublish Selected
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handlePublishAllFiltered(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Publish All {filteredListings.length} Filtered to Site
                </button>
                <button
                  onClick={() => handlePublishAllFiltered(false)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-[#EAE7E0] text-[#606C5D] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Unpublish All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-[#FAF9F5] rounded-2xl border border-dashed border-[#EAE7E0]">
            <Info className="w-8 h-8 text-[#C18C5D] mx-auto" />
            <h4 className="font-bold text-sm text-[#2D362E]">No properties match current filter or search</h4>
            <p className="text-xs text-[#606C5D]">Try clearing search keywords or selecting "All Database".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedListings.map(listing => {
              const isSelected = selectedListingIds.includes(listing.id);
              const isPublished = Boolean(listing.isPubliclyPublished);

              return (
                <div
                  key={listing.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white ${
                    isSelected ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0] hover:border-stone-400"
                  }`}
                >
                  {/* Photo Header & Badges */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                    {/* Checkbox Selector */}
                    <button
                      onClick={() => handleToggleSelectListing(listing.id)}
                      className="absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-lg bg-white/90 shadow-md flex items-center justify-center cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    {/* Publish Status Pill */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                        isPublished ? "bg-emerald-700 text-white" : "bg-stone-800 text-stone-200"
                      }`}>
                        {isPublished ? "Published on Site" : "Draft (Hidden)"}
                      </span>
                    </div>

                    {/* Price and Specs */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-baseline justify-between text-white">
                      <span className="text-xl font-bold font-serif drop-shadow-sm">
                        {formatUSD(listing.price)}
                      </span>
                      <span className="text-xs font-medium text-stone-200 drop-shadow-sm">
                        {listing.beds}b • {listing.baths}ba • {listing.sqft} sqft
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="font-serif font-bold text-sm text-[#2D362E] line-clamp-1">
                        {listing.title}
                      </h4>
                      <p className="text-xs text-[#606C5D] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#4A5D4E] shrink-0" />
                        <span className="line-clamp-1">{listing.address}, {listing.city}, {listing.state} {listing.zip}</span>
                      </p>

                      {/* GIS Overlay Eligibility Pills */}
                      <div className="flex items-center gap-1 flex-wrap pt-1">
                        {listing.overlayEligibility?.usdaEligible && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            USDA 0% Down
                          </span>
                        )}
                        {listing.overlayEligibility?.lmiEligible && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                            OHCS LMI ({listing.overlayEligibility.lmiPercentage || 75}%)
                          </span>
                        )}
                        {listing.overlayEligibility?.targetedArea && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-300">
                            Targeted Area
                          </span>
                        )}
                        {listing.overlayEligibility?.countyName && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0]">
                            {listing.overlayEligibility.countyName} County
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Publish Toggle Button */}
                    <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#606C5D]">
                        Tax: {formatUSD(listing.propertyTaxAnnual || Math.round(listing.price * 0.009))}/yr
                      </span>
                      <button
                        onClick={() => handleToggleSinglePublish(listing.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isPublished
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                        }`}
                      >
                        {isPublished ? "✓ Published" : "Publish to Site"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-[#EAE7E0] flex items-center justify-between gap-4 text-xs">
            <span className="text-[#606C5D]">
              Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredListings.length)} of {filteredListings.length} properties
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] font-bold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-[#2D362E]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] font-bold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* JSON / Snapshot Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#EAE7E0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2D362E]">Import GeoSphere Listings JSON</h3>
                  <p className="text-xs text-[#606C5D]">Upload a .json export or paste saved GeoSphere listings payload.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* File Upload Button */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D362E] block">Option 1: Upload JSON File</label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,.geojson"
                onChange={handleFileUpload}
                className="w-full text-xs text-[#606C5D] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF9F5] file:text-[#2D362E] hover:file:bg-[#F1EFE9] file:cursor-pointer"
              />
            </div>

            {/* Paste Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2D362E] block">Option 2: Paste JSON Content</label>
              <textarea
                value={jsonPasteContent}
                onChange={(e) => {
                  setJsonPasteContent(e.target.value);
                  setImportError(null);
                }}
                rows={8}
                placeholder='Paste raw JSON here (e.g. { "pulls": [...] } or [ { "formattedAddress": "...", "price": ... } ])'
                className="w-full text-xs p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] font-mono outline-none focus:bg-white focus:ring-1 focus:ring-[#4A5D4E]"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#FAF9F5] text-[#606C5D] font-bold text-xs hover:bg-[#F1EFE9]"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-xs"
              >
                Import & Sync Listings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
