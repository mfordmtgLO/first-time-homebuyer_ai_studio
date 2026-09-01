import React, { useState } from "react";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UploadCloud, 
  ShieldCheck, 
  FolderLock, 
  Download, 
  FolderPlus, 
  ExternalLink, 
  Plus, 
  Trash2, 
  HardDrive,
  Eye
} from "lucide-react";
import { DocumentItem } from "../types";
import { GoogleDriveDocImporterModal } from "./GoogleDriveDocImporterModal";
import { DocumentQuickPreviewModal } from "./DocumentQuickPreviewModal";

interface DocumentVaultProps {
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  onNavigate?: (tab: string, mode?: "website" | "dashboard") => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  setDocuments,
  onNavigate,
}) => {
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [previewingDoc, setPreviewingDoc] = useState<DocumentItem | null>(null);

  const toggleDocStatus = (id: string) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== id) return doc;
        const nextStatus: DocumentItem["status"] =
          doc.status === "pending"
            ? "ready"
            : doc.status === "ready"
            ? "submitted"
            : "pending";
        return { 
          ...doc, 
          status: nextStatus, 
          fileUrl: doc.fileUrl || (nextStatus !== "pending" ? "sample_verified_doc.pdf" : undefined) 
        };
      })
    );
  };

  const handleUpdateStatus = (id: string, newStatus: DocumentItem["status"]) => {
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.id !== id) return doc;
        return {
          ...doc,
          status: newStatus,
          fileUrl: doc.fileUrl || (newStatus !== "pending" ? "sample_verified_doc.pdf" : undefined)
        };
      })
    );
    if (previewingDoc && previewingDoc.id === id) {
      setPreviewingDoc(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleImportDocument = (newDoc: DocumentItem) => {
    setDocuments(prev => [newDoc, ...prev]);
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const readyCount = documents.filter(d => d.status === "ready" || d.status === "submitted").length;
  const totalCount = documents.length;
  const pct = totalCount > 0 ? Math.round((readyCount / totalCount) * 100) : 0;

  const categories = ["All", "Income & Taxes", "Assets & Bank", "Identification & Credit", "Property & Contract"];

  const filteredDocs = selectedCategoryFilter === "All"
    ? documents
    : documents.filter(d => d.category === selectedCategoryFilter);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <FolderLock className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Pre-Approval & Underwriting Locker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Underwriting Document Vault
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D] max-w-2xl">
              Mortgage underwriters require clean, unredacted financial documentation. Import directly from your Google Drive/Docs or mark items verified to streamline clear-to-close approval.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Import from Google Drive / Docs Trigger */}
            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-amber-700" />
              <span>Import from Google Drive / Docs</span>
            </button>

            <div className="bg-[#F1EFE9] p-3.5 rounded-2xl border border-[#EAE7E0] flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-[#606C5D] block font-medium">Lender Package</span>
                <span className="text-xs font-bold text-[#4A5D4E]">{readyCount} of {totalCount} Ready</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE7E0] text-[#4A5D4E] flex items-center justify-center font-bold text-xs shadow-xs">
                {pct}%
              </div>
            </div>
          </div>
        </div>

        {/* Security & Workspace Sync Banner */}
        <div className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#EAE7E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#606C5D]">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#4A5D4E] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#2D362E]">Google Drive & Workspace Integration:</strong> Files imported from Google Drive remain safely stored in your cloud account and are instantly referenced for underwriting reviews and closing packages.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategoryFilter === cat
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#606C5D] border border-[#EAE7E0]"
              }`}
            >
              {cat} {cat === "All" ? `(${documents.length})` : `(${documents.filter(d => d.category === cat).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isReady = doc.status === "ready";
          const isSubmitted = doc.status === "submitted";
          const isImportedFromDrive = doc.importedFrom === "google_drive" || doc.importedFrom === "google_docs";

          return (
            <div
              key={doc.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                isSubmitted
                  ? "bg-[#4A5D4E]/10 border-[#4A5D4E]/30"
                  : isReady
                  ? "bg-[#F1EFE9] border-[#4A5D4E]/30"
                  : "bg-white border-[#EAE7E0] hover:border-[#DEDAD2]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                      {doc.category}
                    </span>
                    {isImportedFromDrive && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <FolderPlus className="w-2.5 h-2.5" />
                        {doc.importedFrom === "google_docs" ? "Google Doc" : "Google Drive"}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      isSubmitted
                        ? "bg-[#4A5D4E] text-white"
                        : isReady
                        ? "bg-[#C18C5D] text-white"
                        : "bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#2D362E]">
                  {doc.title}
                </h3>
                <p className="text-xs text-[#606C5D] leading-relaxed">
                  {doc.description}
                </p>

                {doc.fileSizeFormatted && (
                  <span className="text-[10px] text-[#9A9488] block">
                    Size: {doc.fileSizeFormatted}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => toggleDocStatus(doc.id)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                      isSubmitted
                        ? "bg-[#4A5D4E] text-white"
                        : isReady
                        ? "bg-[#C18C5D] text-white"
                        : "bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#2D362E] border border-[#EAE7E0]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSubmitted ? "Submitted" : isReady ? "Mark Submitted" : "Mark Ready"}</span>
                  </button>

                  {/* Quick Preview Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewingDoc(doc)}
                    className="py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Quick Preview without downloading"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Preview</span>
                  </button>

                  {doc.fileUrl && (
                    <a
                      href={doc.driveWebViewLink || doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white hover:bg-[#FAF9F5] border border-[#EAE7E0] text-[#4A5D4E] text-xs flex items-center gap-1"
                      title="Open linked Google Drive document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {isImportedFromDrive && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1.5 text-[#9A9488] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Remove imported document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Drive & Docs Importer Modal */}
      <GoogleDriveDocImporterModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        onImportDocument={handleImportDocument}
        existingDocuments={documents}
      />

      {/* Google Drive Quick Preview Modal */}
      <DocumentQuickPreviewModal
        isOpen={!!previewingDoc}
        onClose={() => setPreviewingDoc(null)}
        document={previewingDoc}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

