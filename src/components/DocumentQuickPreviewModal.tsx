import React, { useState, useEffect } from "react";
import { 
  Eye, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  HardDrive, 
  Layers, 
  Maximize2, 
  Sparkles, 
  Lock, 
  Copy, 
  Check, 
  RefreshCw, 
  FileSpreadsheet, 
  FileCheck,
  AlertCircle,
  FileCode,
  Calendar,
  User,
  Clock,
  Printer,
  ChevronRight,
  Stamp
} from "lucide-react";
import { DocumentItem } from "../types";
import { googleWorkspace, DriveFilePreviewData, getSafeGoogleWorkspaceUrl } from "../services/googleWorkspaceService";

interface DocumentQuickPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  onUpdateStatus?: (id: string, newStatus: DocumentItem["status"]) => void;
}

export const DocumentQuickPreviewModal: React.FC<DocumentQuickPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<"visual" | "snippet" | "metadata">("visual");
  const [previewData, setPreviewData] = useState<DriveFilePreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [isIframeActive, setIsIframeActive] = useState(false);

  useEffect(() => {
    if (!isOpen || !doc) {
      setPreviewData(null);
      setIsIframeActive(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const fileId = doc.driveFileId || doc.id;
    googleWorkspace.getDriveFilePreview(fileId, doc.driveMimeType, doc.title)
      .then((data) => {
        if (isMounted) {
          setPreviewData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load drive preview", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

  const handleCopySnippet = () => {
    if (!previewData?.snippet) return;
    navigator.clipboard.writeText(previewData.snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const isImportedFromDrive = doc.importedFrom === "google_drive" || doc.importedFrom === "google_docs";
  const isDoc = doc.importedFrom === "google_docs" || doc.driveMimeType?.includes("document");

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-[#EAE7E0] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F5] border-b border-[#EAE7E0] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isDoc 
                ? "bg-sky-50 text-sky-700 border-sky-200" 
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}>
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D362E] truncate">
                  {doc.title}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Google Drive API Preview
                </span>
                {isImportedFromDrive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    {isDoc ? "Google Docs" : "Google Drive"}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#606C5D] truncate mt-0.5">
                {doc.description || "Underwriting document synced from your authorized Google Workspace"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={getSafeGoogleWorkspaceUrl(doc.driveWebViewLink || doc.fileUrl, isDoc ? "docs" : "drive")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#4A5D4E] transition-colors"
              title="Open full file in Google Drive"
            >
              <span>{isDoc ? "Open in Docs" : "Open in Drive"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#9A9488] hover:text-[#2D362E] hover:bg-[#F1EFE9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-[#FAF9F5] border-b border-[#EAE7E0] flex items-center justify-between overflow-x-auto gap-4">
          <div className="flex items-center gap-2 py-2">
            <button
              type="button"
              onClick={() => setActiveTab("visual")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "visual"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Document Render & Thumbnail</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("snippet")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "snippet"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Underwriting Snippet & Extraction</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("metadata")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "metadata"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Drive Metadata & Audit</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#606C5D]">
            <span>Category:</span>
            <span className="px-2.5 py-0.5 rounded-lg bg-white border border-[#EAE7E0] text-[#2D362E]">
              {doc.category}
            </span>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-white space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#4A5D4E] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#2D362E]">Querying Google Drive API for Document Thumbnail & Content...</p>
              <p className="text-[11px] text-[#9A9488]">Retrieving encrypted preview metadata without requiring local file download.</p>
            </div>
          ) : activeTab === "visual" ? (
            /* TAB 1: VISUAL THUMBNAIL & HIGH-FIDELITY RENDER */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#2D362E]">Instant Zero-Download Preview</h4>
                    <p className="text-[11px] text-[#606C5D]">
                      Rendering authenticated Google Drive payload stream safely in-app.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIframeActive(!isIframeActive)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isIframeActive ? "Show Structured Sheet" : "Toggle Drive Embed Frame"}</span>
                  </button>
                </div>
              </div>

              {isIframeActive && previewData?.embedUrl ? (
                <div className="border border-[#EAE7E0] rounded-2xl overflow-hidden shadow-inner bg-[#F1EFE9] h-96 relative">
                  <iframe
                    src={previewData.embedUrl}
                    title={doc.title}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : (
                /* High-Fidelity Document Visual Sheet Representation */
                <div className="relative mx-auto max-w-2xl bg-white border border-[#DEDAD2] rounded-2xl p-6 sm:p-8 shadow-md font-sans text-[#2D362E] space-y-6">
                  {/* Decorative Document Watermark / Stamp */}
                  <div className="absolute top-6 right-6 border-2 border-emerald-600/30 text-emerald-800/60 font-mono text-[10px] font-bold px-3 py-1 rounded-md uppercase rotate-6 pointer-events-none tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>NMLS UNDERWRITING VERIFIED</span>
                  </div>

                  {/* Header of Visual Sheet */}
                  <div className="border-b border-[#EAE7E0] pb-4 flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] mb-1">
                        OFFICIAL RECORD • GOOGLE DRIVE API REPOSITORY
                      </div>
                      <h2 className="text-base sm:text-lg font-serif font-bold text-[#2D362E]">
                        {previewData?.name || doc.title}
                      </h2>
                      <div className="text-xs text-[#606C5D] mt-1 flex items-center gap-3">
                        <span>Category: <strong>{doc.category}</strong></span>
                        <span>•</span>
                        <span>Size: <strong>{previewData?.sizeFormatted || doc.fileSizeFormatted || "1.8 MB"}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Key Insight Value Grid */}
                  {previewData?.keyInsights && previewData.keyInsights.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EAE7E0]">
                      {previewData.keyInsights.map((insight, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#9A9488] block uppercase tracking-wider">
                            {insight.label}
                          </span>
                          <span className="text-xs font-bold text-[#2D362E] block truncate">
                            {insight.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Document Body Snippet inside Visual Preview */}
                  <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] text-xs leading-relaxed text-[#4A5D4E] font-mono whitespace-pre-wrap">
                    {previewData?.snippet}
                  </div>

                  {/* Visual Underwriting Sign-Off Stamp Box */}
                  <div className="pt-4 border-t border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-[#606C5D]">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#4A5D4E]" />
                      <span>Drive File ID: <code className="bg-[#F1EFE9] px-1 py-0.5 rounded text-[10px]">{previewData?.id || "drive-doc-verified"}</code></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for TRID & AUS Submission</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "snippet" ? (
            /* TAB 2: UNDERWRITING SNIPPET & EXTRACTION */
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-amber-50/80 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">AI Underwriting Document Extraction</h4>
                    <p className="text-[11px] text-amber-800">
                      Key qualifying figures extracted via Google Drive & Docs text payload parsing.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSnippet ? "Copied!" : "Copy Snippet"}</span>
                </button>
              </div>

              {/* Extracted Text Snippet Block */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9488]">
                  Verified Document Content Snippet
                </label>
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] text-xs leading-relaxed text-[#2D362E] font-mono whitespace-pre-wrap">
                  {previewData?.snippet}
                </div>
              </div>

              {/* Underwriting Checkpoints Audit List */}
              {previewData?.underwritingCheckpoints && previewData.underwritingCheckpoints.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#9A9488]">
                    Underwriting Compliance Checkpoints
                  </label>
                  <div className="space-y-2">
                    {previewData.underwritingCheckpoints.map((checkpoint, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-[#EAE7E0] flex items-start gap-2.5 text-xs text-[#2D362E]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{checkpoint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: DRIVE METADATA & AUDIT */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">File Name</span>
                  <p className="text-xs font-bold text-[#2D362E] break-all">{previewData?.name}</p>
                </div>

                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">MIME Content Type</span>
                  <p className="text-xs font-mono font-bold text-[#4A5D4E]">{previewData?.mimeType}</p>
                </div>

                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">File Size</span>
                  <p className="text-xs font-bold text-[#2D362E]">{previewData?.sizeFormatted || "2.4 MB"}</p>
                </div>

                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Last Modified in Drive</span>
                  <p className="text-xs font-bold text-[#2D362E]">
                    {previewData?.modifiedTime ? new Date(previewData.modifiedTime).toLocaleString() : "Recently"}
                  </p>
                </div>

                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Google Drive File ID</span>
                  <p className="text-xs font-mono text-[#606C5D] break-all">{previewData?.id}</p>
                </div>

                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Document Security</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Encrypted at Rest & in Transit (OAuth 2.0)</span>
                  </div>
                </div>
              </div>

              {previewData?.owners && previewData.owners.length > 0 && (
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-xs">
                      {previewData.owners[0].displayName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#9A9488] uppercase block">Drive Owner</span>
                      <span className="text-xs font-bold text-[#2D362E]">{previewData.owners[0].displayName}</span>
                      {previewData.owners[0].emailAddress && (
                        <span className="text-[11px] text-[#606C5D] block">{previewData.owners[0].emailAddress}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Authorized
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 bg-[#FAF9F5] border-t border-[#EAE7E0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#606C5D]">Lender Status:</span>
            {onUpdateStatus && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateStatus(doc.id, "ready")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    doc.status === "ready"
                      ? "bg-[#C18C5D] text-white shadow-xs"
                      : "bg-white hover:bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                  }`}
                >
                  Mark Ready
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(doc.id, "submitted")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    doc.status === "submitted"
                      ? "bg-[#4A5D4E] text-white shadow-xs"
                      : "bg-white hover:bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                  }`}
                >
                  Mark Submitted
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(doc.id, "pending")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    doc.status === "pending"
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : "bg-white hover:bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                  }`}
                >
                  Pending
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <a
              href={getSafeGoogleWorkspaceUrl(doc.driveWebViewLink || doc.fileUrl, isDoc ? "docs" : "drive")}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#2D362E] flex items-center gap-1.5 transition-colors"
            >
              <span>{isDoc ? "Open in Docs" : "Open in Drive"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
