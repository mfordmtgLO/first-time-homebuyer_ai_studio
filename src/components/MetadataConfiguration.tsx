import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Search,
  Share2,
  Twitter,
  Code2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Copy,
  RotateCcw,
  Save,
  Image as ImageIcon,
  Check,
  Building,
  Smartphone,
  Laptop,
  Flame,
  CheckCheck
} from "lucide-react";
import { PublicWebsiteMetadata } from "../types";
import {
  DEFAULT_SEO_METADATA,
  SEO_PRESET_TEMPLATES,
  CURATED_OG_IMAGES,
  applyMetadataToDocument,
  fetchSavedSeoMetadata,
  persistSeoMetadata,
  auditSeoMetadata,
  SeoPresetTemplate
} from "../utils/seoManager";

interface MetadataConfigurationProps {
  onBackToBranchManagement?: () => void;
}

export const MetadataConfiguration: React.FC<MetadataConfigurationProps> = ({
  onBackToBranchManagement
}) => {
  const [metadata, setMetadata] = useState<PublicWebsiteMetadata>(DEFAULT_SEO_METADATA);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeConfigTab, setActiveConfigTab] = useState<"search" | "social" | "twitter" | "schema">("search");
  const [previewPlatform, setPreviewPlatform] = useState<"google_desktop" | "google_mobile" | "social_facebook" | "imessage" | "twitter">("google_desktop");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [syncSocialWithSearch, setSyncSocialWithSearch] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Load saved metadata on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const saved = await fetchSavedSeoMetadata();
        if (isMounted) {
          setMetadata(saved);
          applyMetadataToDocument(saved);
        }
      } catch (err) {
        console.warn("Failed to load initial SEO metadata:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute live SEO health audit
  const audit = useMemo(() => {
    return auditSeoMetadata(metadata);
  }, [metadata]);

  // Handle Field Updates
  const updateField = <K extends keyof PublicWebsiteMetadata>(field: K, value: PublicWebsiteMetadata[K]) => {
    setMetadata((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-sync Open Graph with Search if toggled
      if (syncSocialWithSearch) {
        if (field === "metaTitle") {
          updated.ogTitle = value as string;
          updated.twitterTitle = value as string;
        } else if (field === "metaDescription") {
          updated.ogDescription = value as string;
          updated.twitterDescription = value as string;
        }
      }
      return updated;
    });
    setSaveSuccess(false);
  };

  // Apply Preset Template
  const handleApplyTemplate = (template: SeoPresetTemplate) => {
    setMetadata((prev) => ({
      ...prev,
      ...template.metadata
    }));
    setActiveTemplateId(template.id);
    setSaveSuccess(false);
  };

  // Reset to Defaults
  const handleResetToDefaults = () => {
    if (confirm("Reset all public site metadata to the recommended default SEO tags?")) {
      setMetadata(DEFAULT_SEO_METADATA);
      setActiveTemplateId(null);
      setSaveSuccess(false);
    }
  };

  // Save & Publish
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await persistSeoMetadata(metadata, "Branch Manager (Mike Ford)");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      alert("Failed to save SEO metadata: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  };

  // Generate copyable HTML meta block
  const generatedHtmlMetaBlock = useMemo(() => {
    const lines = [
      `<!-- Primary Page Meta Tags -->`,
      `<title>${metadata.metaTitle}</title>`,
      `<meta name="title" content="${metadata.metaTitle}">`,
      `<meta name="description" content="${metadata.metaDescription}">`,
      metadata.keywords ? `<meta name="keywords" content="${metadata.keywords}">` : null,
      `<meta name="robots" content="${metadata.robots || 'index, follow'}">`,
      metadata.author ? `<meta name="author" content="${metadata.author}">` : null,
      ``,
      `<!-- Open Graph / Facebook / LinkedIn / iMessage -->`,
      `<meta property="og:type" content="${metadata.ogType || 'website'}">`,
      `<meta property="og:site_name" content="${metadata.ogSiteName || 'First-Time Homebuyer Roadmap'}">`,
      `<meta property="og:title" content="${metadata.ogTitle || metadata.metaTitle}">`,
      `<meta property="og:description" content="${metadata.ogDescription || metadata.metaDescription}">`,
      metadata.ogImage ? `<meta property="og:image" content="${metadata.ogImage}">` : null,
      metadata.canonicalUrl ? `<meta property="og:url" content="${metadata.canonicalUrl}">` : null,
      ``,
      `<!-- Twitter / X Cards -->`,
      `<meta name="twitter:card" content="${metadata.twitterCard || 'summary_large_image'}">`,
      `<meta name="twitter:title" content="${metadata.twitterTitle || metadata.ogTitle || metadata.metaTitle}">`,
      `<meta name="twitter:description" content="${metadata.twitterDescription || metadata.ogDescription || metadata.metaDescription}">`,
      metadata.twitterImage || metadata.ogImage ? `<meta name="twitter:image" content="${metadata.twitterImage || metadata.ogImage}">` : null,
      metadata.twitterSite ? `<meta name="twitter:site" content="${metadata.twitterSite}">` : null,
      metadata.canonicalUrl ? `<link rel="canonical" href="${metadata.canonicalUrl}">` : null
    ].filter((l) => l !== null);

    return lines.join("\n");
  }, [metadata]);

  const handleCopyMetaHtml = () => {
    navigator.clipboard.writeText(generatedHtmlMetaBlock);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const domainDisplay = typeof window !== "undefined" ? window.location.hostname : "homebuyerroadmap.org";

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Globe className="w-8 h-8 text-[#4A5D4E] animate-spin" />
          <p className="text-sm font-medium text-[#606C5D]">Loading public website metadata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE7E0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              <Building className="w-3.5 h-3.5 text-amber-700" />
              Branch Manager Admin
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Live on Public Web
            </span>
            {metadata.lastUpdated && (
              <span className="hidden md:inline text-xs text-[#9A9488]">
                Last published: {new Date(metadata.lastUpdated).toLocaleDateString()} {new Date(metadata.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
            Public Website SEO & Metadata Configuration
          </h1>
          <p className="text-xs sm:text-sm text-[#606C5D] mt-0.5 max-w-3xl">
            Control how your website appears on Google, Bing, Facebook, LinkedIn, iMessage, and Twitter. Optimize your meta tags to boost organic search rankings and drive higher click-through rates (CTR) from prospective homebuyers.
          </p>
        </div>

        {/* Global Save & Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onBackToBranchManagement && (
            <button
              onClick={onBackToBranchManagement}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-[#606C5D] hover:text-[#2D362E] hover:bg-[#EAE7E0]/50 transition-colors"
            >
              Back to Branch Hub
            </button>
          )}

          <button
            onClick={handleResetToDefaults}
            title="Reset to recommended defaults"
            className="p-2.5 rounded-xl border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#606C5D] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#2D362E] transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>View Public Site</span>
          </a>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all ${
              saveSuccess
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-[#2D362E] hover:bg-[#4A5D4E] text-white"
            } disabled:opacity-50`}
          >
            {isSaving ? (
              <>
                <Globe className="w-4 h-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>Published Live!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Publish Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* CTR Booster Templates Banner */}
      <div className="bg-gradient-to-r from-[#FAF9F5] via-white to-[#F5F2EB] rounded-2xl border border-[#EAE7E0] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2D362E]">
                High-Converting SEO Strategy Presets (Click to Auto-Fill)
              </h2>
              <p className="text-xs text-[#606C5D]">
                Pre-tested headline formulas designed to maximize organic clicks from Google and social media feeds.
              </p>
            </div>
          </div>
          <span className="text-[11px] text-[#9A9488] font-mono">
            {SEO_PRESET_TEMPLATES.length} Campaign Formulas Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SEO_PRESET_TEMPLATES.map((tmpl) => {
            const isSelected = activeTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className={`p-3 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? "bg-white border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20 shadow-xs"
                    : "bg-white/80 hover:bg-white border-[#EAE7E0] hover:border-[#C18C5D]/40"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tmpl.badgeColor}`}>
                    {tmpl.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#4A5D4E]" />}
                </div>
                <div className="text-xs font-bold text-[#2D362E] line-clamp-1">{tmpl.name}</div>
                <div className="text-[11px] text-[#606C5D] mt-1 line-clamp-2 leading-relaxed">
                  {tmpl.targetGoal}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Configuration Form (Left) & Real-Time Live Previews (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-[#EAE7E0] space-x-1 sm:space-x-2 bg-[#FAF9F5] p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveConfigTab("search");
                setPreviewPlatform("google_desktop");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                activeConfigTab === "search"
                  ? "bg-white text-[#2D362E] shadow-2xs border border-[#EAE7E0]"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Search className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>Google SERP</span>
            </button>

            <button
              onClick={() => {
                setActiveConfigTab("social");
                setPreviewPlatform("social_facebook");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                activeConfigTab === "social"
                  ? "bg-white text-[#2D362E] shadow-2xs border border-[#EAE7E0]"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Open Graph</span>
            </button>

            <button
              onClick={() => {
                setActiveConfigTab("twitter");
                setPreviewPlatform("twitter");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                activeConfigTab === "twitter"
                  ? "bg-white text-[#2D362E] shadow-2xs border border-[#EAE7E0]"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Twitter className="w-3.5 h-3.5 text-sky-500" />
              <span>Twitter / X</span>
            </button>

            <button
              onClick={() => setActiveConfigTab("schema")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                activeConfigTab === "schema"
                  ? "bg-white text-[#2D362E] shadow-2xs border border-[#EAE7E0]"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Rich Schema</span>
            </button>
          </div>

          {/* Form Content Card */}
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 sm:p-6 shadow-xs space-y-5">
            {/* TAB 1: Search Engine Optimization */}
            {activeConfigTab === "search" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#4A5D4E]" />
                    <span>Google & Bing SERP Optimization</span>
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-medium text-[#606C5D] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncSocialWithSearch}
                      onChange={(e) => setSyncSocialWithSearch(e.target.checked)}
                      className="rounded border-[#EAE7E0] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                    />
                    <span>Auto-sync with Open Graph tags</span>
                  </label>
                </div>

                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                      <span>Meta Title (Browser & Search Snippet)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        metadata.metaTitle.length >= 45 && metadata.metaTitle.length <= 60
                          ? "text-emerald-700"
                          : metadata.metaTitle.length > 60
                          ? "text-amber-700 font-black"
                          : "text-[#9A9488]"
                      }`}
                    >
                      {metadata.metaTitle.length} / 60 chars {metadata.metaTitle.length > 60 && "(Truncated by Google)"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metadata.metaTitle}
                    onChange={(e) => updateField("metaTitle", e.target.value)}
                    placeholder="e.g., First-Time Homebuyer Roadmap | Oregon Down Payment Grants & Calculators"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 focus:border-[#4A5D4E] transition-all"
                  />
                  <p className="text-[11px] text-[#606C5D] mt-1">
                    Google displays the first 50–60 characters. Place your most compelling proposition and target city/state at the beginning.
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                      <span>Meta Description (SERP Summary Snippet)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        metadata.metaDescription.length >= 120 && metadata.metaDescription.length <= 160
                          ? "text-emerald-700"
                          : metadata.metaDescription.length > 160
                          ? "text-amber-700"
                          : "text-[#9A9488]"
                      }`}
                    >
                      {metadata.metaDescription.length} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={metadata.metaDescription}
                    onChange={(e) => updateField("metaDescription", e.target.value)}
                    placeholder="e.g., Step-by-step Oregon first-time homebuyer roadmap. Calculate monthly payments, discover $10,000+ DPA grants, USDA 0% down loans, and connect with trusted local lenders."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 focus:border-[#4A5D4E] transition-all leading-relaxed"
                  />
                  <p className="text-[11px] text-[#606C5D] mt-1">
                    Aim for 120–158 characters. Include a strong call-to-action like <em>Calculate</em>, <em>Qualify</em>, or <em>Explore Grants</em>.
                  </p>
                </div>

                {/* Target Search Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#2D362E]">
                      Target Search Keywords (Comma-separated)
                    </label>
                    <span className="text-[11px] text-[#9A9488]">
                      {metadata.keywords ? metadata.keywords.split(",").length : 0} keywords
                    </span>
                  </div>
                  <input
                    type="text"
                    value={metadata.keywords}
                    onChange={(e) => updateField("keywords", e.target.value)}
                    placeholder="first time home buyer, Oregon down payment assistance, USDA zero down, mortgage calculator"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 focus:border-[#4A5D4E] transition-all"
                  />
                  {/* Keyword Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-[#9A9488] font-bold mr-1">Quick Add:</span>
                    {[
                      "Oregon DPA Grants",
                      "USDA 100% Financing",
                      "2-1 Buydown",
                      "Portland Home Loans",
                      "OHCS FirstHome",
                      "FHA Down Payment Help"
                    ].map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => {
                          const current = metadata.keywords ? metadata.keywords.split(",").map((k) => k.trim()) : [];
                          if (!current.includes(kw)) {
                            current.push(kw);
                            updateField("keywords", current.join(", "));
                          }
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] transition-colors"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Canonical URL & Indexing Directives */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE7E0]">
                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={metadata.canonicalUrl}
                      onChange={(e) => updateField("canonicalUrl", e.target.value)}
                      placeholder="https://yourdomain.com (Leave blank for auto)"
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                    <p className="text-[10px] text-[#9A9488] mt-1">
                      Prevents duplicate content penalties if accessing via multiple domains.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      Robots Directive (Search Indexing)
                    </label>
                    <select
                      value={metadata.robots || "index, follow"}
                      onChange={(e) => updateField("robots", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    >
                      <option value="index, follow">index, follow (Allow All Search Engines)</option>
                      <option value="noindex, follow">noindex, follow (Hide from Search, Follow Links)</option>
                      <option value="noindex, nofollow">noindex, nofollow (Strictly Private / Do Not Index)</option>
                    </select>
                    <p className="text-[10px] text-[#9A9488] mt-1">
                      Set to <em>index, follow</em> to drive organic search traffic.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Open Graph & Social Sharing */}
            {activeConfigTab === "social" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span>Open Graph Tags (Facebook, LinkedIn, iMessage, WhatsApp)</span>
                  </h3>
                  <span className="text-xs text-[#606C5D]">Protocol: OpenGraph 2.0</span>
                </div>

                {/* OG Title */}
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                    Open Graph Title (og:title)
                  </label>
                  <input
                    type="text"
                    value={metadata.ogTitle || ""}
                    onChange={(e) => updateField("ogTitle", e.target.value)}
                    placeholder={metadata.metaTitle}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <p className="text-[11px] text-[#606C5D] mt-1">
                    Displays in bold on Facebook feed posts, LinkedIn updates, and Apple iMessage preview bubbles.
                  </p>
                </div>

                {/* OG Description */}
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                    Open Graph Description (og:description)
                  </label>
                  <textarea
                    rows={2}
                    value={metadata.ogDescription || ""}
                    onChange={(e) => updateField("ogDescription", e.target.value)}
                    placeholder={metadata.metaDescription}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all leading-relaxed"
                  />
                </div>

                {/* OG Image */}
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                    Open Graph Social Banner Image (og:image — Recommended 1200 x 630 px)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={metadata.ogImage}
                      onChange={(e) => updateField("ogImage", e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-xs text-[#2D362E] focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Curated High-Res Image Presets */}
                  <div className="mt-3">
                    <span className="text-[11px] font-bold text-[#606C5D] block mb-2">
                      Or select a curated high-impact banner:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CURATED_OG_IMAGES.map((img) => {
                        const isSelected = metadata.ogImage === img.url;
                        return (
                          <button
                            key={img.url}
                            type="button"
                            onClick={() => updateField("ogImage", img.url)}
                            className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                              isSelected
                                ? "ring-2 ring-blue-600 border-blue-600 shadow-xs"
                                : "border-[#EAE7E0] opacity-85 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-16 object-cover"
                            />
                            <div className="p-1.5 bg-white text-[10px] font-bold text-[#2D362E] truncate">
                              {img.label}
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* OG Type & Site Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EAE7E0]">
                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      og:type
                    </label>
                    <input
                      type="text"
                      value={metadata.ogType || "website"}
                      onChange={(e) => updateField("ogType", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      og:site_name
                    </label>
                    <input
                      type="text"
                      value={metadata.ogSiteName || "First-Time Homebuyer Roadmap"}
                      onChange={(e) => updateField("ogSiteName", e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Twitter / X Cards */}
            {activeConfigTab === "twitter" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-sky-500" />
                    <span>Twitter / X Card Tags</span>
                  </h3>
                  <span className="text-xs text-[#606C5D]">X Feed Display Standard</span>
                </div>

                {/* Twitter Card Format */}
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                    Twitter Card Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateField("twitterCard", "summary_large_image")}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        metadata.twitterCard === "summary_large_image"
                          ? "bg-sky-50/50 border-sky-500 ring-1 ring-sky-500/20"
                          : "border-[#EAE7E0] hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#2D362E]">summary_large_image (Recommended)</div>
                        <div className="text-[11px] text-[#606C5D] mt-0.5">
                          Full-width 1200x630 banner that dominates mobile feeds for up to 3x higher click-throughs.
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField("twitterCard", "summary")}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                        metadata.twitterCard === "summary"
                          ? "bg-sky-50/50 border-sky-500 ring-1 ring-sky-500/20"
                          : "border-[#EAE7E0] hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <Laptop className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#2D362E]">summary (Small Square)</div>
                        <div className="text-[11px] text-[#606C5D] mt-0.5">
                          Compact thumbnail on the left side with text on the right.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Twitter Title & Description */}
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                    Twitter Title (twitter:title)
                  </label>
                  <input
                    type="text"
                    value={metadata.twitterTitle || ""}
                    onChange={(e) => updateField("twitterTitle", e.target.value)}
                    placeholder={metadata.ogTitle || metadata.metaTitle}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-sm text-[#2D362E] focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                    Twitter Description (twitter:description)
                  </label>
                  <textarea
                    rows={2}
                    value={metadata.twitterDescription || ""}
                    onChange={(e) => updateField("twitterDescription", e.target.value)}
                    placeholder={metadata.ogDescription || metadata.metaDescription}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:bg-white text-sm text-[#2D362E] focus:outline-none focus:border-sky-500 leading-relaxed"
                  />
                </div>

                {/* Twitter Handle */}
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">
                    Twitter Site / Creator Handle (twitter:site)
                  </label>
                  <input
                    type="text"
                    value={metadata.twitterSite || ""}
                    onChange={(e) => updateField("twitterSite", e.target.value)}
                    placeholder="@CFMTG or @MikeFordMortgage"
                    className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E] focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Google Structured Data (Schema.org JSON-LD) */}
            {activeConfigTab === "schema" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-purple-600" />
                      <span>Google Rich Results & Local Business Schema</span>
                    </h3>
                    <p className="text-xs text-[#606C5D] mt-0.5">
                      JSON-LD Structured Data helps Google recognize your branch as an accredited FinancialService & MortgageBroker in Oregon.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#2D362E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={metadata.enableStructuredData !== false}
                      onChange={(e) => updateField("enableStructuredData", e.target.checked)}
                      className="rounded border-[#EAE7E0] text-purple-600 focus:ring-purple-500"
                    />
                    <span>Enable JSON-LD</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      Business Entity Name
                    </label>
                    <input
                      type="text"
                      value={metadata.businessName || ""}
                      onChange={(e) => updateField("businessName", e.target.value)}
                      placeholder="Cascade Financial Mortgage - Mike Ford Team"
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      NMLS License ID
                    </label>
                    <input
                      type="text"
                      value={metadata.nmlsId || ""}
                      onChange={(e) => updateField("nmlsId", e.target.value)}
                      placeholder="NMLS #123456"
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      Direct Telephone
                    </label>
                    <input
                      type="text"
                      value={metadata.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="(503) 555-0192"
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      Primary Service City & State
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={metadata.city || ""}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Portland"
                        className="flex-1 px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E]"
                      />
                      <input
                        type="text"
                        value={metadata.state || "OR"}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="OR"
                        className="w-16 px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#2D362E] text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Code Viewer */}
                <div className="mt-4 pt-4 border-t border-[#EAE7E0]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-[#606C5D]">
                      Generated JSON-LD Payload:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyMetaHtml}
                      className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-bold"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? "Copied" : "Copy Full HTML Meta Block"}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-[#1E231F] text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(
                      {
                        "@context": "https://schema.org",
                        "@type": ["FinancialService", "MortgageBroker"],
                        "name": metadata.businessName || "Cascade Financial Mortgage - Mike Ford Team",
                        "description": metadata.metaDescription,
                        "telephone": metadata.phone || "(503) 555-0192",
                        "address": {
                          "@type": "PostalAddress",
                          "addressLocality": metadata.city || "Portland",
                          "addressRegion": metadata.state || "OR",
                          "addressCountry": "US"
                        },
                        "areaServed": "Oregon",
                        "hasCredential": metadata.nmlsId
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Live Previews & SEO Health Scorecard (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* SEO & CTR Health Audit Scorecard */}
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-black text-sm ${
                    audit.score >= 90
                      ? "bg-emerald-100 text-emerald-800"
                      : audit.score >= 75
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {audit.grade}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#2D362E]">SEO & CTR Optimization Score</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-24 h-2 rounded-full bg-[#FAF9F5] overflow-hidden border border-[#EAE7E0]">
                      <div
                        className={`h-full transition-all duration-500 ${
                          audit.score >= 90
                            ? "bg-emerald-500"
                            : audit.score >= 75
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${audit.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-black text-[#2D362E]">{audit.score}/100</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-bold text-[#4A5D4E] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {audit.items.filter((i) => i.status === "pass").length} / {audit.items.length} Passed
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 divide-y divide-[#EAE7E0]/60 text-xs">
              {audit.items.map((item) => (
                <div key={item.id} className="pt-2 flex items-start gap-2">
                  {item.status === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : item.status === "warning" ? (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-[#2D362E] flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-[10px] text-[#9A9488] font-mono">
                        {item.score}/{item.maxScore} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-[#606C5D] mt-0.5 leading-tight">{item.message}</p>
                    {item.recommendation && (
                      <p className="text-[10px] text-amber-800 font-medium mt-0.5 bg-amber-50/80 p-1 rounded">
                        Tip: {item.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Preview Switcher Header */}
          <div className="bg-[#FAF9F5] rounded-xl p-1 border border-[#EAE7E0] flex items-center justify-between">
            <span className="text-xs font-bold text-[#2D362E] px-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Live Platform Previews</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewPlatform("google_desktop")}
                title="Google Desktop SERP"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  previewPlatform === "google_desktop"
                    ? "bg-white text-[#2D362E] shadow-2xs font-bold"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform("google_mobile")}
                title="Google Mobile SERP"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  previewPlatform === "google_mobile"
                    ? "bg-white text-[#2D362E] shadow-2xs font-bold"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform("social_facebook")}
                title="Facebook / LinkedIn"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  previewPlatform === "social_facebook"
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform("imessage")}
                title="iMessage / SMS Bubble"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  previewPlatform === "imessage"
                    ? "bg-white text-emerald-700 shadow-2xs font-bold"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewPlatform("twitter")}
                title="Twitter / X Card"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  previewPlatform === "twitter"
                    ? "bg-white text-sky-600 shadow-2xs font-bold"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <Twitter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Preview Display Box */}
          <div className="rounded-2xl border border-[#EAE7E0] bg-white p-4 shadow-sm overflow-hidden">
            {/* Google Desktop Preview */}
            {previewPlatform === "google_desktop" && (
              <div className="space-y-2 font-sans text-left">
                <div className="flex items-center gap-1.5 text-xs text-[#202124]">
                  <div className="w-6 h-6 rounded-full bg-[#F1F3F4] flex items-center justify-center text-[10px] font-bold text-[#4A5D4E]">
                    OR
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-[#202124] leading-tight">
                      {metadata.businessName || "First-Time Homebuyer Roadmap"}
                    </div>
                    <div className="text-[11px] text-[#4d5156] leading-tight">
                      https://{domainDisplay} › oregon-grants
                    </div>
                  </div>
                </div>

                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[18px] text-[#1a0dab] hover:underline font-normal leading-snug line-clamp-1 cursor-pointer"
                >
                  {metadata.metaTitle || "First-Time Homebuyer Roadmap"}
                </a>

                <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
                  <span className="text-[#70757a] text-xs mr-1">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} —
                  </span>
                  {metadata.metaDescription || "Comprehensive homebuyer portal and loan calculators."}
                </p>
              </div>
            )}

            {/* Google Mobile Preview */}
            {previewPlatform === "google_mobile" && (
              <div className="max-w-[340px] mx-auto p-3 bg-[#F8F9FA] rounded-2xl border border-[#EAE7E0] space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-white shadow-2xs flex items-center justify-center text-[10px] font-bold text-[#4A5D4E]">
                    OR
                  </div>
                  <div className="truncate">
                    <div className="text-[12px] font-semibold text-[#202124]">
                      {metadata.businessName || "First-Time Homebuyer Roadmap"}
                    </div>
                    <div className="text-[10px] text-[#5f6368] truncate">
                      https://{domainDisplay}
                    </div>
                  </div>
                </div>

                <div className="text-[16px] text-[#1a0dab] font-normal leading-snug line-clamp-2">
                  {metadata.metaTitle}
                </div>

                <p className="text-[12px] text-[#4d5156] leading-relaxed line-clamp-3">
                  {metadata.metaDescription}
                </p>
              </div>
            )}

            {/* Facebook / LinkedIn Preview */}
            {previewPlatform === "social_facebook" && (
              <div className="rounded-xl border border-[#DADDE1] bg-[#F0F2F5] overflow-hidden text-left shadow-2xs">
                {metadata.ogImage ? (
                  <div className="relative w-full aspect-[1.91/1] bg-slate-100 overflow-hidden">
                    <img
                      src={metadata.ogImage}
                      alt={metadata.ogTitle || metadata.metaTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-[1.91/1] bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                    No Open Graph image specified
                  </div>
                )}
                <div className="p-3 bg-white border-t border-[#DADDE1]">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#65676B]">
                    {domainDisplay}
                  </div>
                  <div className="text-sm font-bold text-[#050505] line-clamp-1 mt-0.5">
                    {metadata.ogTitle || metadata.metaTitle}
                  </div>
                  <div className="text-xs text-[#65676B] line-clamp-2 mt-0.5 leading-normal">
                    {metadata.ogDescription || metadata.metaDescription}
                  </div>
                </div>
              </div>
            )}

            {/* Apple iMessage / SMS Bubble Preview */}
            {previewPlatform === "imessage" && (
              <div className="max-w-[320px] mx-auto p-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-2.5 shadow-xs space-y-2 text-left">
                  {metadata.ogImage && (
                    <img
                      src={metadata.ogImage}
                      alt={metadata.ogTitle}
                      className="w-full h-32 object-cover rounded-xl border border-emerald-200/60"
                    />
                  )}
                  <div className="px-1">
                    <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                      {domainDisplay}
                    </div>
                    <div className="text-xs font-bold text-[#2D362E] line-clamp-1 mt-0.5">
                      {metadata.ogTitle || metadata.metaTitle}
                    </div>
                    <div className="text-[11px] text-[#606C5D] line-clamp-2 mt-0.5">
                      {metadata.ogDescription || metadata.metaDescription}
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-[#9A9488] mt-1 mr-1">Delivered via iMessage</div>
              </div>
            )}

            {/* Twitter / X Feed Card Preview */}
            {previewPlatform === "twitter" && (
              <div className="rounded-2xl border border-[#CFD9DE] overflow-hidden text-left bg-white shadow-2xs">
                {metadata.twitterCard === "summary_large_image" ? (
                  <>
                    <div className="w-full aspect-[2/1] bg-slate-100 overflow-hidden">
                      <img
                        src={metadata.twitterImage || metadata.ogImage}
                        alt="Twitter card banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-[12px] text-[#536471] flex items-center gap-1">
                        <span>{domainDisplay}</span>
                        {metadata.twitterSite && <span>• {metadata.twitterSite}</span>}
                      </div>
                      <div className="text-sm font-bold text-[#0F1419] line-clamp-1 mt-0.5">
                        {metadata.twitterTitle || metadata.ogTitle || metadata.metaTitle}
                      </div>
                      <div className="text-xs text-[#536471] line-clamp-2 mt-0.5">
                        {metadata.twitterDescription || metadata.ogDescription || metadata.metaDescription}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex p-3 gap-3 items-center">
                    <img
                      src={metadata.twitterImage || metadata.ogImage}
                      alt="Twitter thumb"
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#536471]">{domainDisplay}</div>
                      <div className="text-xs font-bold text-[#0F1419] line-clamp-1 mt-0.5">
                        {metadata.twitterTitle || metadata.metaTitle}
                      </div>
                      <div className="text-[11px] text-[#536471] line-clamp-2 mt-0.5">
                        {metadata.twitterDescription || metadata.metaDescription}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
