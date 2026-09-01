import React, { useState, useEffect } from "react";
import { 
  FolderPlus, 
  FileText, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  FileCheck, 
  RefreshCw, 
  HardDrive,
  ShieldCheck,
  Plus,
  Layers,
  ArrowRight,
  Filter,
  Eye,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  CornerLeftUp,
  Home,
  FileCode,
  Calendar,
  Lock,
  Sparkles
} from "lucide-react";
import { googleWorkspace, DriveFolderNode, DriveFolderBrowseResult, getSafeGoogleWorkspaceUrl } from "../services/googleWorkspaceService";
import { DocumentItem } from "../types";
import { DocumentQuickPreviewModal } from "./DocumentQuickPreviewModal";

interface GoogleDriveDocImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDocument: (importedDoc: DocumentItem) => void;
  existingDocuments: DocumentItem[];
}

export const GoogleDriveDocImporterModal: React.FC<GoogleDriveDocImporterModalProps> = ({
  isOpen,
  onClose,
  onImportDocument,
  existingDocuments
}) => {
  const [user, setUser] = useState(googleWorkspace.getUser());
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [browseData, setBrowseData] = useState<DriveFolderBrowseResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "root": true,
    "folder-mortgage": true
  });
  
  const [selectedCategory, setSelectedCategory] = useState<DocumentItem["category"]>("Income & Taxes");
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [importedSuccessMsg, setImportedSuccessMsg] = useState<string | null>(null);
  const [previewingDriveDoc, setPreviewingDriveDoc] = useState<DocumentItem | null>(null);

  useEffect(() => {
    return googleWorkspace.subscribe(setUser);
  }, []);

  const loadFolder = async (folderId: string, query?: string) => {
    setIsLoading(true);
    try {
      const data = await googleWorkspace.listDriveFolderContents(folderId, query);
      setBrowseData(data);
      setCurrentFolderId(folderId);
    } catch (e) {
      console.warn("Failed to browse folder", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFolder(currentFolderId, searchQuery);
    }
  }, [isOpen, currentFolderId, searchQuery]);

  if (!isOpen) return null;

  const handleSelectFolder = (folderId: string) => {
    setSearchQuery("");
    setCurrentFolderId(folderId);
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: true
    }));
  };

  const toggleExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleSelectFile = (file: any) => {
    setSelectedFile(file);
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/_/g, " ")
      .replace(/-/g, " ");

    setCustomTitle(file.matchedDocTitle || cleanName);
    setCustomDescription(`Imported from Google ${file.mimeType?.includes("document") ? "Docs" : "Drive"}: ${file.name}`);
    if (file.suggestedCategory) {
      setSelectedCategory(file.suggestedCategory);
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formattedSize = selectedFile.size 
      ? `${(Number(selectedFile.size) / (1024 * 1024)).toFixed(2)} MB` 
      : undefined;

    const isGDoc = selectedFile.mimeType === "application/vnd.google-apps.document";

    const newDoc: DocumentItem = {
      id: `doc-drive-${Date.now()}`,
      title: customTitle || selectedFile.name,
      category: selectedCategory,
      required: isRequired,
      status: "ready", // Directly ready since imported from user's Drive
      description: customDescription || `Verified document synced from Google Drive (${selectedFile.name})`,
      acceptedFormats: isGDoc ? "Google Doc" : "PDF",
      fileUrl: getSafeGoogleWorkspaceUrl(selectedFile.webViewLink, isGDoc ? "docs" : "drive"),
      driveFileId: selectedFile.id,
      driveMimeType: selectedFile.mimeType,
      driveWebViewLink: getSafeGoogleWorkspaceUrl(selectedFile.webViewLink, isGDoc ? "docs" : "drive"),
      importedFrom: isGDoc ? "google_docs" : "google_drive",
      importedAt: new Date().toISOString(),
      fileSizeFormatted: formattedSize
    };

    onImportDocument(newDoc);
    setImportedSuccessMsg(`Successfully imported "${newDoc.title}" to your Document Vault!`);
    setTimeout(() => {
      setImportedSuccessMsg(null);
      setSelectedFile(null);
      onClose();
    }, 1200);
  };

  const categories: DocumentItem["category"][] = [
    "Income & Taxes",
    "Assets & Bank",
    "Identification & Credit",
    "Property & Contract"
  ];

  // Up one level helper
  const handleGoUp = () => {
    if (!browseData || browseData.breadcrumbs.length <= 1) return;
    const parentIndex = browseData.breadcrumbs.length - 2;
    const parentFolder = browseData.breadcrumbs[parentIndex];
    if (parentFolder) {
      handleSelectFolder(parentFolder.id);
    }
  };

  // Render Recursive Folder Tree item
  const renderTreeFolder = (folder: DriveFolderNode, level: number = 0) => {
    if (!browseData) return null;
    const childFolders = browseData.allFoldersTree.filter(f => f.parentId === folder.id);
    const hasChildren = childFolders.length > 0;
    const isExpanded = expandedFolders[folder.id];
    const isCurrent = currentFolderId === folder.id;

    return (
      <div key={folder.id} className="space-y-0.5 select-none">
        <div
          onClick={() => handleSelectFolder(folder.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            isCurrent
              ? "bg-[#4A5D4E] text-white shadow-xs"
              : "hover:bg-[#F1EFE9] text-[#2D362E]"
          }`}
          style={{ paddingLeft: `${level * 14 + 10}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleExpand(folder.id, e)}
              className="p-0.5 hover:bg-black/10 rounded cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <div className="w-3.5 h-3.5" />
          )}

          {isCurrent || isExpanded ? (
            <FolderOpen className={`w-4 h-4 shrink-0 ${isCurrent ? "text-amber-200" : "text-amber-600"}`} />
          ) : (
            <Folder className={`w-4 h-4 shrink-0 ${isCurrent ? "text-amber-200" : "text-amber-600"}`} />
          )}

          <span className="truncate flex-1">{folder.name.replace(/^[📁📂]\s*/, "")}</span>

          {folder.itemCount !== undefined && folder.itemCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
              isCurrent ? "bg-white/20 text-white" : "bg-[#EAE7E0] text-[#606C5D]"
            }`}>
              {folder.itemCount}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {childFolders.map(child => renderTreeFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-[#EAE7E0] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F5] border-b border-[#EAE7E0] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200 shrink-0">
              <FolderPlus className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-serif font-bold text-[#2D362E]">
                  Google Drive Folder Browser
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Live Drive API
                </span>
              </div>
              <p className="text-xs text-[#606C5D]">
                Navigate your hierarchical Google Drive directories to pick tax returns, paystubs, and mortgage files.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9A9488] hover:text-[#2D362E] hover:bg-[#F1EFE9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Breadcrumb & Search Action Bar */}
        <div className="px-5 sm:px-6 py-3 bg-[#FAF9F5] border-b border-[#EAE7E0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Breadcrumb Path Trail */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto py-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectFolder("root")}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                currentFolderId === "root"
                  ? "bg-[#4A5D4E] text-white font-bold"
                  : "bg-white hover:bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
              }`}
              title="Drive Root"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="font-bold">My Drive</span>
            </button>

            {browseData?.breadcrumbs.filter(b => b.id !== "root").map((crumb, idx) => {
              const isLast = idx === (browseData.breadcrumbs.filter(b => b.id !== "root").length - 1);
              return (
                <React.Fragment key={crumb.id}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                  <button
                    type="button"
                    onClick={() => handleSelectFolder(crumb.id)}
                    className={`px-2.5 py-1.5 rounded-lg font-bold truncate max-w-[160px] transition-colors cursor-pointer ${
                      isLast
                        ? "bg-[#4A5D4E] text-white shadow-xs"
                        : "bg-white hover:bg-[#F1EFE9] text-[#2D362E] border border-[#EAE7E0]"
                    }`}
                  >
                    {crumb.name.replace(/^[📁📂]\s*/, "")}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Quick Search & Up Action */}
          <div className="flex items-center gap-2">
            {browseData && browseData.breadcrumbs.length > 1 && (
              <button
                type="button"
                onClick={handleGoUp}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#4A5D4E] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                title="Up One Level"
              >
                <CornerLeftUp className="w-3.5 h-3.5" />
                <span>Up Level</span>
              </button>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter current folder..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#EAE7E0] text-xs font-medium focus:outline-none focus:border-[#4A5D4E]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9488] hover:text-[#2D362E]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Dual-Pane Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#EAE7E0]">
          {/* LEFT PANE: Hierarchical Directory Sidebar */}
          <div className="w-full md:w-72 bg-[#FAF9F5] p-4 overflow-y-auto space-y-3 shrink-0 max-h-48 md:max-h-none border-b md:border-b-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] flex items-center gap-1.5">
                <HardDrive className="w-3 h-3" />
                Folder Hierarchy
              </span>
              <button
                type="button"
                onClick={() => loadFolder(currentFolderId, searchQuery)}
                className="text-[10px] text-[#4A5D4E] hover:underline font-bold flex items-center gap-1"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Sync</span>
              </button>
            </div>

            {/* Render Root and Subfolder Trees */}
            <div className="space-y-1">
              {browseData?.allFoldersTree
                .filter(f => f.id === "root")
                .map(rootNode => renderTreeFolder(rootNode, 0))}
            </div>

            {/* Quick Filter Tag Recommendations */}
            <div className="pt-3 border-t border-[#EAE7E0] space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">
                Mortgage Packages
              </span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectFolder("folder-income-tax")}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold transition-colors cursor-pointer"
                >
                  01. Income & Tax
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectFolder("folder-assets")}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold transition-colors cursor-pointer"
                >
                  02. Assets & Bank
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectFolder("folder-escrow-contract")}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold transition-colors cursor-pointer"
                >
                  03. Purchase Contract
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: Current Folder Contents (Subfolders + Files) */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 bg-white">
            {importedSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{importedSuccessMsg}</span>
              </div>
            )}

            {/* Current Folder Info Header */}
            {browseData && (
              <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200 shrink-0">
                    <FolderOpen className="w-4 h-4 text-amber-800" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2D362E]">
                      {browseData.currentFolder.name.replace(/^[📁📂]\s*/, "")}
                    </h4>
                    <p className="text-[11px] text-[#606C5D]">
                      {browseData.currentFolder.description || "Google Drive Folder directory"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#EAE7E0] text-[#2D362E]">
                    {browseData.subfolders.length} Folders
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#EAE7E0] text-[#4A5D4E]">
                    {browseData.files.length} Files
                  </span>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="py-16 text-center text-xs text-[#606C5D] space-y-2">
                <RefreshCw className="w-6 h-6 text-[#4A5D4E] animate-spin mx-auto" />
                <p>Loading files and folders from Google Drive API...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* 1. Subfolders Section (if present) */}
                {browseData && browseData.subfolders.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">
                      Subfolders in this Directory ({browseData.subfolders.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {browseData.subfolders.map((subfolder) => (
                        <div
                          key={subfolder.id}
                          onClick={() => handleSelectFolder(subfolder.id)}
                          className="p-3 bg-[#FAF9F5] hover:bg-amber-50/60 rounded-xl border border-[#EAE7E0] hover:border-amber-400 text-left cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                              <Folder className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-[#2D362E] truncate group-hover:text-amber-900">
                                {subfolder.name.replace(/^[📁📂]\s*/, "")}
                              </h5>
                              <p className="text-[10px] text-[#9A9488] truncate">
                                {subfolder.itemCount ? `${subfolder.itemCount} files inside` : "Click to view contents"}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#9A9488] group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Files Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                      Documents & Files ({browseData?.files.length || 0})
                    </span>
                    <span className="text-[10px] text-[#606C5D]">
                      Click to select for Document Vault import
                    </span>
                  </div>

                  {browseData && browseData.files.length === 0 ? (
                    <div className="p-8 text-center bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] text-xs text-[#606C5D] space-y-1">
                      <FolderOpen className="w-7 h-7 text-[#9A9488] mx-auto opacity-50" />
                      <p className="font-bold text-[#2D362E]">No files in this folder</p>
                      <p className="text-[11px]">Navigate into one of the subfolders above or choose a different directory from the sidebar.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                      {browseData?.files.map((file) => {
                        const isSelected = selectedFile?.id === file.id;
                        const isGDoc = file.mimeType?.includes("document");

                        return (
                          <div
                            key={file.id}
                            onClick={() => handleSelectFile(file)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                              isSelected
                                ? "bg-amber-50/90 border-amber-600 ring-2 ring-amber-500/20 shadow-xs"
                                : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-white hover:border-[#4A5D4E]"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isGDoc ? "bg-sky-100 text-sky-700" : "bg-red-100 text-red-700"
                            }`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-xs text-[#2D362E] truncate">
                                  {file.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const dummyDoc: DocumentItem = {
                                        id: file.id,
                                        title: file.matchedDocTitle || file.name,
                                        category: file.suggestedCategory || "Income & Taxes",
                                        required: true,
                                        status: "ready",
                                        description: `Google Drive file: ${file.name}`,
                                        acceptedFormats: isGDoc ? "Google Doc" : "PDF",
                                        driveFileId: file.id,
                                        driveMimeType: file.mimeType,
                                        driveWebViewLink: getSafeGoogleWorkspaceUrl(file.webViewLink, isGDoc ? "docs" : "drive"),
                                        importedFrom: isGDoc ? "google_docs" : "google_drive"
                                      };
                                      setPreviewingDriveDoc(dummyDoc);
                                    }}
                                    className="p-1 rounded-md text-[#9A9488] hover:text-[#4A5D4E] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                                    title="Quick Preview without download"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  {isSelected && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#9A9488]">
                                <span>{isGDoc ? "Google Doc" : "PDF File"}</span>
                                <span>•</span>
                                <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Selected File Import & Underwriting Configuration */}
                {selectedFile && (
                  <form onSubmit={handleImport} className="p-4 bg-[#FAF9F5] rounded-2xl border border-amber-300 ring-1 ring-amber-400/20 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E]">
                        <FileCheck className="w-4 h-4 text-[#4A5D4E]" />
                        <span>Ready to Import to Underwriting Vault</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        Selected: {selectedFile.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Vault Title */}
                      <div>
                        <label className="text-[11px] font-bold text-[#606C5D] block mb-1">
                          Checklist Document Title
                        </label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                        />
                      </div>

                      {/* Category */}
                      <div>
                        <label className="text-[11px] font-bold text-[#606C5D] block mb-1">
                          Underwriting Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-[11px] font-bold text-[#606C5D] block mb-1">
                        Underwriter Notes / Description
                      </label>
                      <input
                        type="text"
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] text-xs font-medium text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      />
                    </div>

                    {/* Required Switch & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#EAE7E0]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2D362E]">
                        <input
                          type="checkbox"
                          checked={isRequired}
                          onChange={(e) => setIsRequired(e.target.checked)}
                          className="rounded border-[#EAE7E0] text-[#4A5D4E] focus:ring-0"
                        />
                        <span>Mandatory for Underwriting Sign-Off</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const isGDoc = selectedFile.mimeType?.includes("document");
                            const dummyDoc: DocumentItem = {
                              id: selectedFile.id,
                              title: customTitle || selectedFile.name,
                              category: selectedCategory,
                              required: isRequired,
                              status: "ready",
                              description: customDescription,
                              acceptedFormats: isGDoc ? "Google Doc" : "PDF",
                              driveFileId: selectedFile.id,
                              driveMimeType: selectedFile.mimeType,
                              driveWebViewLink: getSafeGoogleWorkspaceUrl(selectedFile.webViewLink, isGDoc ? "docs" : "drive"),
                              importedFrom: isGDoc ? "google_docs" : "google_drive"
                            };
                            setPreviewingDriveDoc(dummyDoc);
                          }}
                          className="px-3 py-2 rounded-xl bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick Preview</span>
                        </button>

                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Import to Vault</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF9F5] border-t border-[#EAE7E0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#606C5D]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
            <span>Folder hierarchy synced live via Google Workspace OAuth 2.0.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Drive File Quick Preview Modal */}
      <DocumentQuickPreviewModal
        isOpen={!!previewingDriveDoc}
        onClose={() => setPreviewingDriveDoc(null)}
        document={previewingDriveDoc}
      />
    </div>
  );
};
