import React, { useState, useMemo } from "react";
import { MediaAssetLeadTrackerModal } from "./MediaAssetLeadTrackerModal";
import { 
  Home, 
  Sparkles, 
  Zap, 
  Check, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  List, 
  Grid, 
  Share2, 
  ExternalLink, 
  Copy, 
  Sliders, 
  ShieldCheck, 
  ChevronDown, 
  Play, 
  Video, 
  Send, 
  RefreshCw, 
  ArrowUpRight, 
  CheckSquare, 
  Square,
  Eye,
  AlertCircle
} from "lucide-react";
import { 
  LoanOfficerProfile,
  CapturedLead, 
  RealEstateAgentProfile, 
  AdCampaignDraft, 
  LoanOfficerAdSettings,
  PropertyListing 
} from "../types";
import { 
  pushCoBrandedListingToVantageQueue, 
  createDraftAdFromCoBrandedKit 
} from "../utils/agentListingCrossReference";

export interface AdQueueItem {
  id: string;
  sourceType: 'draft_campaign' | 'incoming_property';
  campaignName: string;
  headline: string;
  secondaryHeadlines?: string[];
  primaryText: string;
  descriptionText: string;
  platform: 'meta' | 'google';
  targetLocations: string[];
  status: 'draft' | 'ready_to_launch' | 'published';
  isVantageCurated: boolean;
  isNewAwaitingPublication: boolean;
  publishedChannels: ('facebook' | 'google' | 'social_media')[];
  publishedAt?: string;
  propertyAddress: string;
  propertyCity: string;
  propertyPrice?: number;
  propertyBeds?: number;
  propertyBaths?: number;
  propertySqft?: number;
  propertyImage?: string;
  targetUrl: string;
  dailyBudget: number;
  keywords?: string[];
  videoUrl?: string;
  lastSaved: string;
  draftRef?: AdCampaignDraft;
  propertyRef?: PropertyListing;
}

interface AdQueueManagerProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent: RealEstateAgentProfile;
  adCampaignDrafts: AdCampaignDraft[];
  properties: PropertyListing[];
  leads?: CapturedLead[];
  pairingUrl: string;
  adSettings: LoanOfficerAdSettings;
  onSaveAdDraft: (draft: AdCampaignDraft) => void;
  onUpdateCampaign?: (campaign: AdCampaignDraft) => void;
  onBulkUpdateCampaigns?: (campaigns: AdCampaignDraft[]) => void;
}

export const AdQueueManager: React.FC<AdQueueManagerProps> = ({
  loanOfficer,
  activeAgent,
  adCampaignDrafts,
  properties,
  leads = [],
  pairingUrl,
  adSettings,
  onSaveAdDraft,
  onUpdateCampaign,
  onBulkUpdateCampaigns
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "ready" | "published">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "vantage_sync" | "paired_property" | "custom">("all");
  const [channelFilter, setChannelFilter] = useState<"all" | "meta" | "google" | "social">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOrder, setSortOrder] = useState<"newest" | "status" | "price_desc" | "price_asc">("newest");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  

  // Review Modal State
  const [previewItem, setPreviewItem] = useState<AdQueueItem | null>(null);
  const [trackingAsset, setTrackingAsset] = useState<AdQueueItem | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: 'success' | 'info' | 'error', text: string } | null>(null);
  const [isPublishingBatch, setIsPublishingBatch] = useState(false);

  // Unify paired properties and adCampaignDrafts into a comprehensive Ad Queue
  const queueItems: AdQueueItem[] = useMemo(() => {
    const items: AdQueueItem[] = [];
    const pairedProperties = properties.filter(p => p.isLoAgentPair);

    // 1. Process all existing adCampaignDrafts
    adCampaignDrafts.forEach((draft) => {
      // Find matching property if any
      const matchingProp = properties.find(
        p => (draft.propertyId && p.id === draft.propertyId) ||
             (draft.propertyAddress && p.address?.toLowerCase().includes(draft.propertyAddress.toLowerCase())) ||
             (draft.campaignName && p.address && draft.campaignName.toLowerCase().includes(p.address.split(',')[0].toLowerCase()))
      );

      const normalizedStatus: 'draft' | 'ready_to_launch' | 'published' = 
        draft.status === 'published' || draft.status === 'live' || draft.status === 'active'
          ? 'published'
          : draft.status === 'ready_to_launch' || draft.status === 'approved'
            ? 'ready_to_launch'
            : 'draft';

      const isAwaitingFirstRun = 
        draft.isNewAwaitingPublication !== false && 
        normalizedStatus !== 'published' && 
        (!draft.publishedChannels || draft.publishedChannels.length === 0);

      items.push({
        id: draft.id,
        sourceType: 'draft_campaign',
        campaignName: draft.campaignName || "Co-Branded Ad Campaign",
        headline: draft.headline || "First-Time Homebuyer Financing",
        secondaryHeadlines: draft.secondaryHeadlines || [],
        primaryText: draft.primaryText || draft.coreMessage || "",
        descriptionText: draft.descriptionText || "",
        platform: draft.platform || 'meta',
        targetLocations: draft.targetLocations || ["Oregon"],
        status: normalizedStatus,
        isVantageCurated: Boolean(draft.isVantageCurated || draft.id.includes("vantage") || draft.campaignName?.includes("Vantage")),
        isNewAwaitingPublication: isAwaitingFirstRun,
        publishedChannels: draft.publishedChannels || (normalizedStatus === 'published' ? [draft.platform === 'google' ? 'google' : 'facebook'] : []),
        publishedAt: draft.publishedAt,
        propertyAddress: draft.propertyAddress || matchingProp?.address || "Oregon First-Time Buyer Program",
        propertyCity: draft.propertyCity || matchingProp?.city || "Portland Metro",
        propertyPrice: draft.propertyPrice || matchingProp?.price,
        propertyBeds: matchingProp?.beds,
        propertyBaths: matchingProp?.baths,
        propertySqft: matchingProp?.sqft,
        propertyImage: matchingProp?.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
        targetUrl: draft.targetUrl || pairingUrl,
        dailyBudget: draft.dailyBudget || 25,
        keywords: draft.keywords || [],
        videoUrl: draft.videoUrl || (draft.assets && draft.assets[0]),
        lastSaved: draft.lastSaved || new Date().toISOString(),
        draftRef: draft,
        propertyRef: matchingProp
      });
    });

    // 2. Add incoming paired properties that don't have an ad draft yet as pending items in the queue
    pairedProperties.forEach((property) => {
      const alreadyHasDraft = items.some(
        item => item.propertyRef?.id === property.id || 
                item.propertyAddress.toLowerCase().includes(property.address.split(',')[0].toLowerCase())
      );

      if (!alreadyHasDraft) {
        items.push({
          id: `prop-queue-${property.id}`,
          sourceType: 'incoming_property',
          campaignName: `[Paired Listing] ${activeAgent.name} + ${loanOfficer.name}: ${property.address}`,
          headline: `Stop Renting: Tour ${property.address.split(',')[0]} in ${property.city}`,
          secondaryHeadlines: ["0% Down USDA & DPA Financing Available", "Fast Pre-Approval with Mike Ford"],
          primaryText: `Co-listed with ${activeAgent.name}. Calculate your monthly mortgage payment and unlock up to $30,000 in Oregon down payment assistance on this home.`,
          descriptionText: `Price: $${property.price?.toLocaleString()} • Free Rate Buydown Analysis Inside`,
          platform: 'meta',
          targetLocations: [property.city, "Oregon"],
          status: 'draft',
          isVantageCurated: true,
          isNewAwaitingPublication: true,
          publishedChannels: [],
          propertyAddress: property.address,
          propertyCity: property.city,
          propertyPrice: property.price,
          propertyBeds: property.beds,
          propertyBaths: property.baths,
          propertySqft: property.sqft,
          propertyImage: property.imageUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
          targetUrl: `${pairingUrl}?property=${property.id}`,
          dailyBudget: 25,
          keywords: [`${property.city} real estate`, "down payment assistance", "oregon home loan"],
          lastSaved: new Date().toISOString(),
          propertyRef: property
        });
      }
    });

    return items;
  }, [adCampaignDrafts, properties,
  leads = [], activeAgent, loanOfficer, pairingUrl]);

  // Filter & Search computation
  const filteredItems = useMemo(() => {
    return queueItems.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesAddress = item.propertyAddress.toLowerCase().includes(query);
        const matchesHeadline = item.headline.toLowerCase().includes(query);
        const matchesCopy = item.primaryText.toLowerCase().includes(query);
        const matchesCity = item.propertyCity.toLowerCase().includes(query);
        const matchesKeywords = item.keywords?.some(k => k.toLowerCase().includes(query));
        const matchesCampaign = item.campaignName.toLowerCase().includes(query);
        if (!matchesAddress && !matchesHeadline && !matchesCopy && !matchesCity && !matchesKeywords && !matchesCampaign) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== "all") {
        if (statusFilter === "draft" && item.status !== "draft") return false;
        if (statusFilter === "ready" && item.status !== "ready_to_launch") return false;
        if (statusFilter === "published" && item.status !== "published") return false;
      }

      // 3. Source Filter
      if (sourceFilter !== "all") {
        if (sourceFilter === "vantage_sync" && !item.isVantageCurated) return false;
        if (sourceFilter === "paired_property" && !item.propertyRef) return false;
        if (sourceFilter === "custom" && (item.isVantageCurated || item.propertyRef)) return false;
      }

      // 4. Channel Filter
      if (channelFilter !== "all") {
        if (channelFilter === "meta" && item.platform !== "meta" && !item.publishedChannels.includes("facebook")) return false;
        if (channelFilter === "google" && item.platform !== "google" && !item.publishedChannels.includes("google")) return false;
        if (channelFilter === "social" && !item.publishedChannels.includes("social_media") && !item.videoUrl) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.lastSaved).getTime() - new Date(a.lastSaved).getTime();
      }
      if (sortOrder === "status") {
        const order = { ready_to_launch: 0, draft: 1, published: 2 };
        return order[a.status] - order[b.status];
      }
      if (sortOrder === "price_desc") {
        return (b.propertyPrice || 0) - (a.propertyPrice || 0);
      }
      if (sortOrder === "price_asc") {
        return (a.propertyPrice || 0) - (b.propertyPrice || 0);
      }
      return 0;
    });
  }, [queueItems, searchQuery, statusFilter, sourceFilter, channelFilter, sortOrder]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: queueItems.length,
      vantage_sync: queueItems.filter(i => i.isVantageCurated).length,
      draft: queueItems.filter(i => i.status === "draft").length,
      ready: queueItems.filter(i => i.status === "ready_to_launch").length,
      published: queueItems.filter(i => i.status === "published").length,
      awaitingFirstRun: queueItems.filter(i => i.isNewAwaitingPublication).length,
    };
  }, [queueItems]);

  // Toggle selection
  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  // Status Change Handler with state persistence
  const handleUpdateItemStatus = async (item: AdQueueItem, newStatus: 'draft' | 'ready_to_launch' | 'published') => {
    try {
      let draftToPersist: AdCampaignDraft;

      if (item.draftRef) {
        draftToPersist = {
          ...item.draftRef,
          status: newStatus,
          lastSaved: new Date().toISOString(),
          isNewAwaitingPublication: newStatus === 'published' ? false : item.draftRef.isNewAwaitingPublication,
          publishedChannels: newStatus === 'published' && (!item.draftRef.publishedChannels || item.draftRef.publishedChannels.length === 0)
            ? [item.draftRef.platform === 'google' ? 'google' : 'facebook']
            : item.draftRef.publishedChannels,
          publishedAt: newStatus === 'published' ? (item.draftRef.publishedAt || new Date().toISOString()) : item.draftRef.publishedAt
        };
      } else if (item.propertyRef) {
        // Generate draft from kit
        const kit = await pushCoBrandedListingToVantageQueue(
          item.propertyRef,
          loanOfficer,
          activeAgent,
          pairingUrl
        );
        draftToPersist = createDraftAdFromCoBrandedKit(kit, newStatus);
      } else {
        draftToPersist = {
          id: item.id,
          platform: item.platform,
          loId: loanOfficer.id,
          agentId: activeAgent.id,
          campaignName: item.campaignName,
          headline: item.headline,
          secondaryHeadlines: item.secondaryHeadlines,
          primaryText: item.primaryText,
          descriptionText: item.descriptionText,
          targetUrl: item.targetUrl,
          dailyBudget: item.dailyBudget,
          targetLocations: item.targetLocations,
          specialHousingCategory: true,
          adObjective: 'LEAD_GENERATION',
          status: newStatus,
          lastSaved: new Date().toISOString(),
          propertyAddress: item.propertyAddress,
          propertyCity: item.propertyCity,
          propertyPrice: item.propertyPrice,
          isVantageCurated: item.isVantageCurated,
          isNewAwaitingPublication: newStatus === 'published' ? false : item.isNewAwaitingPublication,
          publishedChannels: newStatus === 'published' ? [item.platform === 'google' ? 'google' : 'facebook'] : []
        };
      }

      if (onUpdateCampaign) {
        onUpdateCampaign(draftToPersist);
      } else {
        onSaveAdDraft(draftToPersist);
      }

      setFeedbackBanner({
        type: 'success',
        text: `Updated status of "${item.propertyAddress || item.headline}" to ${
          newStatus === 'published' ? 'Published / Live' : newStatus === 'ready_to_launch' ? 'Ready to Publish' : 'Draft'
        }`
      });
      setTimeout(() => setFeedbackBanner(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedbackBanner({ type: 'error', text: `Failed to update status: ${err.message}` });
    }
  };

  // Push property to Vantage AI Ads Engine for ad generation
  const handlePushToVantage = async (item: AdQueueItem) => {
    if (!item.propertyRef) return;
    setIsGeneratingCopyId(item.id);
    try {
      const kit = await pushCoBrandedListingToVantageQueue(
        item.propertyRef,
        loanOfficer,
        activeAgent,
        pairingUrl
      );
      // Still create the local tracking draft so we know it was pushed
      const draft = createDraftAdFromCoBrandedKit(kit, 'draft');
      onSaveAdDraft(draft);
      setFeedbackBanner({
        type: 'success',
        text: `⚡ Sent ${item.propertyAddress} to Vantage AI Ads Engine queue.`
      });
      setTimeout(() => setFeedbackBanner(null), 4000);
    } catch (err: any) {
      console.error(err);
      setFeedbackBanner({ type: 'error', text: `Error pushing to Vantage: ${err.message}` });
    } finally {
      setIsGeneratingCopyId(null);
    }
  };



  // Channel Publishing Execution
  const handlePublishToChannel = async (
    targetChannel: 'facebook' | 'google' | 'social_media', 
    itemIdsToPublish: string[]
  ) => {
    if (itemIdsToPublish.length === 0) return;
    setIsPublishingBatch(true);

    try {
      // 1. Call server publish endpoint
      const res = await fetch("/api/ads/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignIds: itemIdsToPublish,
          channel: targetChannel,
          adSettings,
          loanOfficer,
          agent: activeAgent
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publication failed");

      // 2. Persist state changes in guidesState
      const updatedDrafts: AdCampaignDraft[] = [];

      for (const id of itemIdsToPublish) {
        const item = queueItems.find(q => q.id === id);
        if (!item) continue;

        let existingDraft = item.draftRef;

        if (!existingDraft && item.propertyRef) {
          const kit = await pushCoBrandedListingToVantageQueue(
            item.propertyRef,
            loanOfficer,
            activeAgent,
            pairingUrl
          );
          existingDraft = createDraftAdFromCoBrandedKit(kit, 'published');
        }

        if (existingDraft) {
          const channels = Array.from(new Set([...(existingDraft.publishedChannels || []), targetChannel]));
          const updated: AdCampaignDraft = {
            ...existingDraft,
            status: 'published',
            isNewAwaitingPublication: false,
            publishedChannels: channels,
            publishedAt: new Date().toISOString(),
            lastSaved: new Date().toISOString()
          };
          updatedDrafts.push(updated);
          if (onUpdateCampaign) {
            onUpdateCampaign(updated);
          } else {
            onSaveAdDraft(updated);
          }
        }
      }

      if (onBulkUpdateCampaigns && updatedDrafts.length > 0) {
        const currentDrafts = adCampaignDrafts || [];
        const merged = currentDrafts.map(d => {
          const match = updatedDrafts.find(u => u.id === d.id);
          return match || d;
        });
        const newOnes = updatedDrafts.filter(u => !currentDrafts.some(c => c.id === u.id));
        onBulkUpdateCampaigns([...newOnes, ...merged]);
      }

      const channelName = 
        targetChannel === 'facebook' 
          ? 'Meta (Facebook & Instagram) Ads' 
          : targetChannel === 'google' 
            ? 'Google Search Ads' 
            : 'Connected Social Media Accounts';

      setFeedbackBanner({
        type: 'success',
        text: `✓ Successfully published ${itemIdsToPublish.length} ad(s) to ${channelName}! Live tracking active.`
      });
      setTimeout(() => setFeedbackBanner(null), 5000);

      // Clear selection
      setSelectedIds([]);
    } catch (err: any) {
      console.error(err);
      setFeedbackBanner({ type: 'error', text: `Publication error: ${err.message}` });
    } finally {
      setIsPublishingBatch(false);
    }
  };

  // Bulk status update for selected items
  const handleBulkStatusChange = (newStatus: 'draft' | 'ready_to_launch' | 'published') => {
    selectedIds.forEach(id => {
      const item = queueItems.find(q => q.id === id);
      if (item) {
        handleUpdateItemStatus(item, newStatus);
      }
    });
    setSelectedIds([]);
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#4A5D4E] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Vantage AI Co-Branded Ad Queue</span>
            </span>
            <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>{counts.vantage_sync} Curated Syncs</span>
            </span>
            {counts.awaitingFirstRun > 0 && (
              <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{counts.awaitingFirstRun} Awaiting 1st Run</span>
              </span>
            )}
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2D362E] mt-1.5">
            Incoming Paired Listings & Curated Ads Engine
          </h3>
          <p className="text-xs text-[#606C5D] mt-0.5 max-w-3xl">
            Review, edit status, boost with Gemini AI, and publish co-branded ads across Meta Ads, Google Search, and Social Media for <strong>{loanOfficer.name}</strong> & <strong>{activeAgent.name}</strong>.
          </p>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="flex items-center gap-2 text-xs font-semibold bg-white p-1.5 rounded-2xl border border-[#EAE7E0] shadow-2xs self-start lg:self-auto">
          <div className="px-3 py-1 bg-slate-50 text-slate-700 rounded-xl text-center border border-slate-200">
            <span className="text-[10px] uppercase text-[#9A9488] block font-bold">Drafts</span>
            <span className="text-sm font-bold">{counts.draft}</span>
          </div>
          <div className="px-3 py-1 bg-amber-50 text-amber-900 rounded-xl text-center border border-amber-200">
            <span className="text-[10px] uppercase text-amber-700 block font-bold">Ready</span>
            <span className="text-sm font-bold">{counts.ready}</span>
          </div>
          <div className="px-3 py-1 bg-emerald-50 text-emerald-900 rounded-xl text-center border border-emerald-200">
            <span className="text-[10px] uppercase text-emerald-700 block font-bold">Published</span>
            <span className="text-sm font-bold">{counts.published}</span>
          </div>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackBanner && (
        <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between border transition-all animate-in fade-in duration-200 ${
          feedbackBanner.type === 'success' 
            ? "bg-emerald-50 text-emerald-900 border-emerald-200" 
            : feedbackBanner.type === 'error'
              ? "bg-red-50 text-red-900 border-red-200"
              : "bg-blue-50 text-blue-900 border-blue-200"
        }`}>
          <div className="flex items-center gap-2">
            {feedbackBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackBanner.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackBanner(null)} 
            className="text-[10px] font-bold opacity-60 hover:opacity-100 uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Robust Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE7E0] space-y-3.5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by address, headline, copy keywords, city, or agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] focus:bg-white text-[#2D362E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Source Origin Filter */}
          <div className="md:col-span-3">
            <select
              value={sourceFilter}
              onChange={(e: any) => setSourceFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] text-[#2D362E] font-medium"
            >
              <option value="all">⚡ All Origins ({counts.all})</option>
              <option value="vantage_sync">⚡ Vantage AI Curated Sync ({counts.vantage_sync})</option>
              <option value="paired_property">🏡 GeoSphere Paired Listings</option>
              <option value="custom">📄 Standalone Ad Drafts</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div className="md:col-span-3">
            <select
              value={channelFilter}
              onChange={(e: any) => setChannelFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#4A5D4E] text-[#2D362E] font-medium"
            >
              <option value="all">All Channels</option>
              <option value="meta">Meta (Facebook & IG Ads)</option>
              <option value="google">Google Search Ads</option>
              <option value="social">Social Media & Video Walkthroughs</option>
            </select>
          </div>
        </div>

        {/* View Mode & Status Segmented Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#EAE7E0]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#EAE7E0]"
              }`}
            >
              All Items ({counts.all})
            </button>
            <button
              onClick={() => setStatusFilter("draft")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "draft"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#EAE7E0]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Drafts ({counts.draft})</span>
            </button>
            <button
              onClick={() => setStatusFilter("ready")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "ready"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#EAE7E0]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Ready to Publish ({counts.ready})</span>
            </button>
            <button
              onClick={() => setStatusFilter("published")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "published"
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#EAE7E0]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Published / Live ({counts.published})</span>
            </button>
          </div>

          {/* Layout & Sort Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <select
              value={sortOrder}
              onChange={(e: any) => setSortOrder(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-none text-[#606C5D] font-medium"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="status">Sort: Ready First</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="price_asc">Price: Low to High</option>
            </select>

            <div className="flex items-center bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white text-[#4A5D4E] shadow-2xs font-bold" : "text-[#9A9488] hover:text-[#2D362E]"
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-[#4A5D4E] shadow-2xs font-bold" : "text-[#9A9488] hover:text-[#2D362E]"
                }`}
                title="Grid Cards View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkbox Multi-Select & Bulk Publish Bar */}
      {filteredItems.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-[#EAE7E0] shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-[#2D362E] hover:text-[#4A5D4E] transition-colors"
            >
              {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
              ) : selectedIds.length > 0 ? (
                <div className="w-4 h-4 rounded bg-[#4A5D4E] flex items-center justify-center text-white text-[10px] font-bold">
                  -
                </div>
              ) : (
                <Square className="w-4 h-4 text-[#9A9488]" />
              )}
              <span>
                {selectedIds.length > 0 
                  ? `${selectedIds.length} of ${filteredItems.length} selected`
                  : `Select All (${filteredItems.length})`}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-[#9A9488] hover:text-red-600 font-semibold underline"
              >
                Deselect
              </button>
            )}
          </div>

          {/* Bulk Action & Channel Publish Target Buttons */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-[#9A9488] mr-1 hidden md:inline">
                Push Selected To:
              </span>

              <button
                onClick={() => handlePublishToChannel('facebook', selectedIds)}
                disabled={isPublishingBatch}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Publish to Meta Ads</span>
              </button>

              <button
                onClick={() => handlePublishToChannel('google', selectedIds)}
                disabled={isPublishingBatch}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Publish to Google Ads</span>
              </button>

              <button
                onClick={() => handlePublishToChannel('social_media', selectedIds)}
                disabled={isPublishingBatch}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Post Social Media</span>
              </button>

              <div className="h-4 w-px bg-gray-200 hidden sm:block mx-1" />

              <button
                onClick={() => handleBulkStatusChange('ready_to_launch')}
                className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
              >
                Mark Ready
              </button>
              <button
                onClick={() => handleBulkStatusChange('published')}
                className="px-2.5 py-1.5 text-[11px] font-bold rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              >
                Mark Live
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content: LIST VIEW vs GRID VIEW */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#EAE7E0] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F1EFE9] flex items-center justify-center mx-auto text-[#9A9488]">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="font-serif font-bold text-lg text-[#2D362E]">No Ads Matched Your Filters</h4>
          <p className="text-xs text-[#606C5D] max-w-sm mx-auto">
            Try adjusting your search query, switching from "{statusFilter}" to "All Items", or clearing channel filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setSourceFilter("all");
              setChannelFilter("all");
            }}
            className="px-4 py-2 bg-[#4A5D4E] text-white rounded-xl text-xs font-bold hover:bg-[#38463B]"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "list" ? (
        /* STRUCTURED LIST VIEW */
        <div className="bg-white border border-[#EAE7E0] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#EAE7E0] text-[10px] uppercase font-bold text-[#9A9488]">
                  <th className="py-3 px-4 w-10">
                    <button onClick={handleSelectAll} className="flex items-center">
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#9A9488]" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4">Status & Action</th>
                  <th className="py-3 px-4">Property & Campaign Copy</th>
                  <th className="py-3 px-4">Origin & Network</th>
                  <th className="py-3 px-4">Active Channels</th>
                  <th className="py-3 px-4 text-right">Execute / Push</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7E0] text-xs">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-[#FAF9F5] transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-4 px-4 align-top">
                        <button 
                          onClick={() => toggleSelectItem(item.id)}
                          className="pt-1 text-[#4A5D4E]"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#9A9488]" />
                          )}
                        </button>
                      </td>

                      {/* Status Dropdown Indicator & Pulsing Pin */}
                      <td className="py-4 px-4 align-top w-52">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.isNewAwaitingPublication ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-bold shadow-2xs">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="tracking-wide uppercase text-[9px]">Awaiting 1st Run</span>
                              </div>
                            ) : item.status === 'published' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Published</span>
                              </span>
                            ) : null}
                          </div>

                          {/* Status Select Menu */}
                          <div className="relative">
                            <select
                              value={item.status}
                              onChange={(e: any) => handleUpdateItemStatus(item, e.target.value)}
                              className={`w-full text-xs font-bold py-1.5 pl-2.5 pr-6 rounded-xl border appearance-none transition-all cursor-pointer focus:outline-none focus:ring-1 ${
                                item.status === 'published'
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-300 focus:ring-emerald-500"
                                  : item.status === 'ready_to_launch'
                                    ? "bg-amber-50 text-amber-900 border-amber-300 focus:ring-amber-500"
                                    : "bg-slate-50 text-slate-800 border-slate-300 focus:ring-slate-500"
                              }`}
                            >
                              <option value="draft">📝 Status: Draft</option>
                              <option value="ready_to_launch">🚀 Status: Ready to Publish</option>
                              <option value="published">✅ Status: Published / Live</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none text-gray-500" />
                          </div>

                        </div>
                      </td>

                      {/* Property & Ad Copy Details */}
                      <td className="py-4 px-4 align-top max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <strong className="text-[#2D362E] font-bold text-xs">
                              {item.propertyAddress}
                            </strong>
                            {item.propertyPrice && (
                              <span className="text-[11px] font-semibold text-[#4A5D4E] bg-[#FAF9F5] px-1.5 py-0.2 rounded border border-[#EAE7E0]">
                                ${item.propertyPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-[10px] text-[#606C5D]">{item.propertyCity}</span>
                          </div>

                          <div className="font-semibold text-xs text-indigo-950 line-clamp-1">
                            {item.headline}
                          </div>

                          <p className="text-[11px] text-[#606C5D] line-clamp-2 leading-relaxed">
                            {item.primaryText}
                          </p>

                          {/* Boosted Results Inline Display */}
                          {hasBoosted && (
                            <div className="mt-2 p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1.5 text-[10px]">
                              <div className="font-bold text-indigo-900 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-indigo-600" />
                                <span>Top AI Suggested Headlines:</span>
                              </div>
                              <ul className="list-disc pl-4 space-y-0.5 text-indigo-800">
                                {hasBoosted.headlines.map((hl, idx) => (
                                  <li key={idx} className="font-medium">{hl}</li>
                                ))}
                              </ul>
                              <div className="flex flex-wrap gap-1 pt-1">
                                {hasBoosted.audiences.map((aud, idx) => (
                                  <span key={idx} className="bg-white border border-indigo-200 text-indigo-700 px-1.5 py-0.2 rounded text-[9px]">
                                    🎯 {aud}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Origin & Platform */}
                      <td className="py-4 px-4 align-top w-40">
                        <div className="space-y-1.5">
                          {item.isVantageCurated ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold">
                              <Sparkles className="w-3 h-3" />
                              <span>Vantage AI Synced</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                              <span>Manual / Custom</span>
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              item.platform === 'meta' ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                            }`}>
                              {item.platform === 'meta' ? "Meta Ads" : "Google Search"}
                            </span>
                            {item.videoUrl && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 flex items-center gap-0.5">
                                <Video className="w-3 h-3" />
                                <span>Video</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Active Channels */}
                      <td className="py-4 px-4 align-top w-40">
                        {item.publishedChannels && item.publishedChannels.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {item.publishedChannels.includes('facebook') && (
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                                  Meta / FB
                                </span>
                              )}
                              {item.publishedChannels.includes('google') && (
                                <span className="text-[10px] font-bold bg-red-100 text-red-900 px-1.5 py-0.5 rounded border border-red-200">
                                  Google Ads
                                </span>
                              )}
                              
                        {item.publishedChannels.length > 0 && (
                          <div className="mt-2">
                            <button 
                              onClick={() => setTrackingAsset(item)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-200 transition-colors"
                              title="View full ad results tracking"
                            >
                              <Users className="w-3 h-3" />
                              {getLeadCount(item)} Leads
                            </button>
                          </div>
                        )}
                            {item.publishedChannels.includes('social_media') && (
                                <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded border border-purple-200">
                                  Social Media
                                </span>
                              )}
                            </div>
                            {item.publishedAt && (
                              <p className="text-[9px] text-[#9A9488]">
                                {new Date(item.publishedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#9A9488] italic">
                            Unpublished
                          </span>
                        )}
                      </td>

                      {/* Actions: Push & Preview */}
                      <td className="py-4 px-4 align-top text-right w-44">
                        <div className="flex flex-col gap-1.5 items-end">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="px-2.5 py-1 text-[11px] font-bold text-[#4A5D4E] bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>AI Studio Review</span>
                          </button>

                          {item.sourceType === 'incoming_property' && !item.draftRef ? (
                            <button
                              onClick={() => handlePushToVantage(item)}
                              disabled={isGeneratingCopyId === item.id}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-lg flex items-center gap-1 shadow-2xs"
                            >
                              <Sparkles className="w-3 h-3 text-[#D4A373]" />
                              <span>{isGeneratingCopyId === item.id ? "Sending..." : "⚡ Send to Vantage"}</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handlePublishToChannel('facebook', [item.id])}
                                className="px-2 py-1 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded"
                                title="Publish to Meta"
                              >
                                +Meta
                              </button>
                              <button
                                onClick={() => handlePublishToChannel('google', [item.id])}
                                className="px-2 py-1 text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded"
                                title="Publish to Google"
                              >
                                +Google
                              </button>
                              <button
                                onClick={() => handlePublishToChannel('social_media', [item.id])}
                                className="px-2 py-1 text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded"
                                title="Post to Social"
                              >
                                +Social
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div 
                key={item.id}
                className={`bg-white border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-all relative ${
                  isSelected 
                    ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" 
                    : "border-[#EAE7E0]"
                }`}
              >
                {/* Card Top Row: Checkbox, Origin Badge, Pulsing Pin */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleSelectItem(item.id)}
                        className="text-[#4A5D4E]"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#9A9488]" />
                        )}
                      </button>

                      {item.isVantageCurated && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                          <span>Vantage Sync</span>
                        </span>
                      )}
                    </div>

                    {item.isNewAwaitingPublication ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-bold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Awaiting 1st Run</span>
                      </div>
                    ) : item.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Published</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Property Header */}
                  <div>
                    <h5 className="font-bold text-xs text-[#2D362E] truncate" title={item.propertyAddress}>
                      {item.propertyAddress}
                    </h5>
                    <p className="text-[10px] text-[#606C5D] flex items-center gap-1 mt-0.5">
                      <span>{item.propertyCity}</span>
                      {item.propertyPrice && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[#4A5D4E]">${item.propertyPrice.toLocaleString()}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Headline & Body Copy */}
                  <div className="mt-2.5 bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0] space-y-1">
                    <p className="text-[11px] font-bold text-indigo-950 line-clamp-1">
                      {item.headline}
                    </p>
                    <p className="text-[10px] text-[#606C5D] line-clamp-2 leading-relaxed">
                      {item.primaryText}
                    </p>
                  </div>

                  {/* Boost Results */}
                  {hasBoosted && (
                    <div className="mt-2 p-2 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-[10px]">
                      <div className="font-bold text-indigo-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>AI Headlines:</span>
                      </div>
                      <ul className="list-disc pl-3 text-indigo-800 space-y-0.5 text-[9px]">
                        {hasBoosted.headlines.slice(0, 2).map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Status Dropdown & Publish Targets */}
                <div className="pt-2 border-t border-[#EAE7E0] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Status Dropdown */}
                    <div className="relative flex-1">
                      <select
                        value={item.status}
                        onChange={(e: any) => handleUpdateItemStatus(item, e.target.value)}
                        className={`w-full text-[10px] font-bold py-1 pl-2 pr-5 rounded-lg border appearance-none cursor-pointer focus:outline-none ${
                          item.status === 'published'
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : item.status === 'ready_to_launch'
                              ? "bg-amber-50 text-amber-900 border-amber-300"
                              : "bg-slate-50 text-slate-800 border-slate-300"
                        }`}
                      >
                        <option value="draft">Draft</option>
                        <option value="ready_to_launch">Ready to Publish</option>
                        <option value="published">Published</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-1.5 top-2 pointer-events-none text-gray-500" />
                    </div>


                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-1 rounded-lg text-[#606C5D] hover:bg-[#FAF9F5] border border-[#EAE7E0]"
                      title="AI Studio Review"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Channel Execution Bar */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePublishToChannel('facebook', [item.id])}
                      className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      + Meta
                    </button>
                    <button
                      onClick={() => handlePublishToChannel('google', [item.id])}
                      className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      + Google
                    </button>
                    <button
                      onClick={() => handlePublishToChannel('social_media', [item.id])}
                      className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                    >
                      + Social
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI STUDIO / REVIEW MODAL */}
      {trackingAsset && (
        <MediaAssetLeadTrackerModal
          assetId={trackingAsset.id}
          assetName={trackingAsset.campaignName}
          allLeads={leads}
          onClose={() => setTrackingAsset(null)}
        />
      )}

      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4A5D4E] text-white px-2 py-0.5 rounded">
                    AI Studio Review
                  </span>
                  {previewItem.isVantageCurated && (
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      Vantage AI Curated
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-xl text-[#2D362E] mt-1">
                  {previewItem.propertyAddress}
                </h4>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-xs font-bold text-[#9A9488] hover:text-[#2D362E] p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Video Asset Preview if present */}
            {previewItem.videoUrl && (
              <div className="bg-black rounded-2xl overflow-hidden shadow-inner">
                <video 
                  controls 
                  src={previewItem.videoUrl} 
                  className="w-full h-48 object-cover"
                />
                <div className="p-2 bg-slate-900 text-white text-[10px] flex items-center justify-between">
                  <span>🎬 Ready Walkthrough Video Asset</span>
                  <span className="font-mono text-[#D4A373]">1080x1920 9:16 Vertical Reel</span>
                </div>
              </div>
            )}

            {/* Complete Ad Copy Script */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#606C5D] block mb-1">Headline:</span>
                <p className="p-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl font-bold text-indigo-950">
                  {previewItem.headline}
                </p>
              </div>

              {previewItem.secondaryHeadlines && previewItem.secondaryHeadlines.length > 0 && (
                <div>
                  <span className="font-bold text-[#606C5D] block mb-1">Secondary Responsive Headlines:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {previewItem.secondaryHeadlines.map((sh, idx) => (
                      <div key={idx} className="p-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg text-[#2D362E]">
                        {sh}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-[#606C5D] block mb-1">Primary Ad Copy / Video Script:</span>
                <pre className="p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl whitespace-pre-wrap font-sans text-xs text-[#2D362E] leading-relaxed">
                  {previewItem.primaryText}
                </pre>
              </div>

              <div>
                <span className="font-bold text-[#606C5D] block mb-1">Co-Branded Destination Landing Page:</span>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-[#4A5D4E] flex items-center justify-between">
                  <span className="truncate">{previewItem.targetUrl}</span>
                  <a
                    href={previewItem.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Modal Bottom Publishing Action Bar */}
            <div className="pt-4 border-t border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#606C5D]">Manual Status:</span>
                <select
                  value={previewItem.status}
                  onChange={(e: any) => {
                    handleUpdateItemStatus(previewItem, e.target.value);
                    setPreviewItem(prev => prev ? { ...prev, status: e.target.value } : null);
                  }}
                  className="text-xs font-bold py-1.5 px-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5]"
                >
                  <option value="draft">Draft</option>
                  <option value="ready_to_launch">Ready to Publish</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handlePublishToChannel('facebook', [previewItem.id]);
                    setPreviewItem(null);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Publish Meta</span>
                </button>
                <button
                  onClick={() => {
                    handlePublishToChannel('google', [previewItem.id]);
                    setPreviewItem(null);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Publish Google</span>
                </button>
                <button
                  onClick={() => {
                    handlePublishToChannel('social_media', [previewItem.id]);
                    setPreviewItem(null);
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Post Social</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
