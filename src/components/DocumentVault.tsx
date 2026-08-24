import React from "react";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UploadCloud, 
  ShieldCheck,
  FolderLock,
  Download
} from "lucide-react";
import { DocumentItem } from "../types";

interface DocumentVaultProps {
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  setDocuments,
}) => {
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
        return { ...doc, status: nextStatus, fileUrl: nextStatus !== "pending" ? "sample_verified_doc.pdf" : undefined };
      })
    );
  };

  const readyCount = documents.filter(d => d.status === "ready" || d.status === "submitted").length;
  const totalCount = documents.length;
  const pct = Math.round((readyCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <FolderLock className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Pre-Approval Document Locker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Underwriting Document Vault
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D] max-w-2xl">
              Mortgage underwriters require clean, unredacted financial documentation. Keep your pre-approval package organized to prevent underwriting delays.
            </p>
          </div>

          <div className="bg-[#F1EFE9] p-4 rounded-2xl border border-[#EAE7E0] flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xs text-[#606C5D] block font-medium">Lender Package</span>
              <span className="text-sm font-bold text-[#4A5D4E]">{readyCount} of {totalCount} Ready</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE7E0] text-[#4A5D4E] flex items-center justify-center font-bold text-sm shadow-xs">
              {pct}%
            </div>
          </div>
        </div>

        {/* Security Assurance Notice */}
        <div className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#EAE7E0] flex items-start gap-3 text-xs text-[#606C5D]">
          <ShieldCheck className="w-5 h-5 text-[#4A5D4E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#2D362E]">Client-Side Privacy:</strong> Your checklist items and document statuses are stored locally in your session. Always verify all pages of bank statements (e.g. including blank last pages) before emailing directly to your licensed mortgage loan officer.
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => {
          const isReady = doc.status === "ready";
          const isSubmitted = doc.status === "submitted";

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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                    {doc.category}
                  </span>
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
              </div>

              <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between">
                <button
                  onClick={() => toggleDocStatus(doc.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                    isSubmitted
                      ? "bg-[#4A5D4E] text-white"
                      : isReady
                      ? "bg-[#C18C5D] text-white"
                      : "bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#2D362E] border border-[#EAE7E0]"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmitted ? "Verified Submitted" : isReady ? "Mark Submitted" : "Mark Ready"}</span>
                </button>

                {doc.fileUrl && (
                  <span className="text-[11px] text-[#4A5D4E] font-medium flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Attached
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
