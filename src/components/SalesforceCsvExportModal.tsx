import React, { useState, useMemo } from "react";
import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import {
  CrmExportFormat,
  triggerCrmCsvDownload,
  generateCrmCsv,
  formatLeadToSalesforceRow,
  formatLeadToTotalExpertRow,
  SALESFORCE_SCHEMA_COLUMNS,
  TOTAL_EXPERT_SCHEMA_COLUMNS,
} from "../services/crmLeadExportService";
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
  Copy,
  Check,
  X,
  Database,
  Search,
  ShieldCheck,
  HelpCircle,
  Table,
  Layers,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SalesforceCsvExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: CapturedLead[];
  loanOfficers: LoanOfficerProfile[];
  agents: RealEstateAgentProfile[];
  defaultFormat?: CrmExportFormat;
  onTriggerToast?: (msg: string) => void;
}

export const SalesforceCsvExportModal: React.FC<SalesforceCsvExportModalProps> = ({
  isOpen,
  onClose,
  leads,
  loanOfficers,
  agents,
  defaultFormat = "salesforce",
  onTriggerToast,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<CrmExportFormat>(defaultFormat);
  const [selectedLoId, setSelectedLoId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedIntent, setSelectedIntent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"preview" | "schema" | "guide">("preview");
  const [copied, setCopied] = useState<boolean>(false);

  // Filter leads based on user selection
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (selectedLoId !== "all" && lead.assignedLoId !== selectedLoId) return false;
      if (selectedStatus !== "all" && lead.status !== selectedStatus) return false;
      if (selectedIntent !== "all" && lead.intentScore !== selectedIntent) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (lead.fullName || "").toLowerCase().includes(query);
        const matchesEmail = (lead.email || "").toLowerCase().includes(query);
        const matchesPhone = (lead.phone || "").toLowerCase().includes(query);
        const matchesCity = (lead.preferredLocations || lead.taggedCityArea || "").toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCity) return false;
      }
      return true;
    });
  }, [leads, selectedLoId, selectedStatus, selectedIntent, searchQuery]);

  // Formatted preview rows based on current format
  const previewSalesforceRows = useMemo(() => {
    return filteredLeads.slice(0, 8).map(lead => formatLeadToSalesforceRow(lead, loanOfficers, agents));
  }, [filteredLeads, loanOfficers, agents]);

  const previewTotalExpertRows = useMemo(() => {
    return filteredLeads.slice(0, 8).map(lead => formatLeadToTotalExpertRow(lead, loanOfficers, agents));
  }, [filteredLeads, loanOfficers, agents]);

  if (!isOpen) return null;

  const currentColumns = selectedFormat === "totalexpert" ? TOTAL_EXPERT_SCHEMA_COLUMNS : SALESFORCE_SCHEMA_COLUMNS;
  const currentFormatName = selectedFormat === "totalexpert" ? "Total Expert CRM" : "Salesforce CRM";

  const handleDownload = () => {
    if (filteredLeads.length === 0) {
      if (onTriggerToast) onTriggerToast("No leads match the selected filters.");
      return;
    }
    const result = triggerCrmCsvDownload(selectedFormat, filteredLeads, loanOfficers, agents);
    if (onTriggerToast) {
      onTriggerToast(`Downloaded ${result.rowCount} leads formatted for ${currentFormatName} (${result.fileName})`);
    }
  };

  const handleCopyCsv = () => {
    if (filteredLeads.length === 0) {
      if (onTriggerToast) onTriggerToast("No leads to copy.");
      return;
    }
    const result = generateCrmCsv(selectedFormat, filteredLeads, loanOfficers, agents);
    navigator.clipboard.writeText(result.csvString).then(() => {
      setCopied(true);
      if (onTriggerToast) onTriggerToast(`Copied ${result.rowCount} ${currentFormatName} formatted lead rows to clipboard!`);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-[#EAE7E0] w-full max-w-5xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1B365D] via-[#244572] to-[#1B365D] text-white p-5 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shrink-0">
              <Database className="w-7 h-7 text-[#00A1E0]" />
            </div>
            <div className="pr-8">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
                  Enterprise Lead CSV Exporter
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#00A1E0]/20 text-[#00A1E0] border border-[#00A1E0]/40 uppercase tracking-wider">
                  RFC 4180 UTF-8 BOM
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  Total Expert &amp; Salesforce Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1.5 max-w-3xl leading-relaxed">
                Transforms captured leads state into enterprise-compliant CSV structures with field mappings for dates, marketing sources, originator credentials, and borrower financial metadata.
              </p>
            </div>
          </div>

          {/* CRM Engine Format Selector */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-blue-200 mr-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00A1E0]" />
              Target CRM Schema:
            </span>
            <div className="inline-flex p-1 bg-black/30 rounded-2xl border border-white/15">
              <button
                onClick={() => setSelectedFormat("salesforce")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedFormat === "salesforce"
                    ? "bg-[#00A1E0] text-white shadow-sm"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>Salesforce Lead / Jungo CRM</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono">
                  {SALESFORCE_SCHEMA_COLUMNS.length} cols
                </span>
              </button>
              <button
                onClick={() => setSelectedFormat("totalexpert")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedFormat === "totalexpert"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-blue-100 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>Total Expert CRM</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-mono">
                  {TOTAL_EXPERT_SCHEMA_COLUMNS.length} cols
                </span>
              </button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mt-4 border-t border-white/15 pt-3.5 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "preview"
                  ? "bg-white text-[#1B365D] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              Live Data Preview ({filteredLeads.length})
            </button>
            <button
              onClick={() => setActiveTab("schema")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "schema"
                  ? "bg-white text-[#1B365D] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Field Schema Mapping ({currentColumns.length} Columns)
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "guide"
                  ? "bg-white text-[#1B365D] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {selectedFormat === "totalexpert" ? "Total Expert" : "Salesforce"} Ingestion Guide
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-[#F9F8F4] border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap flex-1">
            {/* Search */}
            <div className="relative min-w-[190px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-[#EAE7E0] rounded-xl w-full text-xs focus:outline-none focus:ring-2 focus:ring-[#1B365D]"
              />
            </div>

            {/* LO Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#606C5D] font-medium">Loan Officer:</span>
              <select
                value={selectedLoId}
                onChange={e => setSelectedLoId(e.target.value)}
                className="bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] font-medium outline-none focus:ring-2 focus:ring-[#1B365D]"
              >
                <option value="all">All Loan Officers ({leads.length})</option>
                {loanOfficers.map(lo => {
                  const count = leads.filter(l => l.assignedLoId === lo.id).length;
                  return (
                    <option key={lo.id} value={lo.id}>
                      {lo.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#606C5D] font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] font-medium outline-none focus:ring-2 focus:ring-[#1B365D]"
              >
                <option value="all">All Statuses</option>
                <option value="new">New / Open</option>
                <option value="contacted">Contacted</option>
                <option value="pre_approved">Pre-Approved</option>
                <option value="in_escrow">In Escrow</option>
                <option value="closed">Closed / Funded</option>
              </select>
            </div>

            {/* Intent Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[#606C5D] font-medium">Intent:</span>
              <select
                value={selectedIntent}
                onChange={e => setSelectedIntent(e.target.value)}
                className="bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] font-medium outline-none focus:ring-2 focus:ring-[#1B365D]"
              >
                <option value="all">All Ratings</option>
                <option value="hot">Hot (Ready 30-60d)</option>
                <option value="warm">Warm (3-6 mo)</option>
                <option value="exploring">Exploring (6+ mo)</option>
              </select>
            </div>
          </div>

          {/* Quick Count Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg border border-blue-200">
              {filteredLeads.length} {filteredLeads.length === 1 ? "Lead" : "Leads"} Selected
            </span>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-[#2D362E]">
          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
                    <span>{currentFormatName} Data Preview</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono">
                      {currentColumns.length} Columns
                    </span>
                  </h3>
                  <p className="text-xs text-[#606C5D]">
                    Displaying first {filteredLeads.slice(0, 8).length} transformed rows matching the {selectedFormat === "totalexpert" ? "Total Expert" : "Salesforce"} schema.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCsv}
                    className="px-3 py-1.5 bg-white border border-[#EAE7E0] hover:bg-gray-50 text-[#2D362E] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                    {copied ? "Copied!" : "Copy CSV"}
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`px-4 py-1.5 ${
                      selectedFormat === "totalexpert" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#00A1E0] hover:bg-[#0089BE]"
                    } text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download {selectedFormat === "totalexpert" ? "Total Expert" : "Salesforce"} CSV
                  </button>
                </div>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="p-12 text-center bg-[#F9F8F4] rounded-2xl border border-dashed border-[#EAE7E0]">
                  <Filter className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#2D362E]">No leads found matching criteria</p>
                  <p className="text-xs text-[#606C5D] mt-1">Try resetting filters to show all branch leads.</p>
                </div>
              ) : selectedFormat === "totalexpert" ? (
                /* Total Expert Table Preview */
                <div className="overflow-x-auto rounded-2xl border border-[#EAE7E0] bg-white shadow-xs">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-[#F9F8F4] text-[#606C5D] font-bold border-b border-[#EAE7E0] whitespace-nowrap">
                      <tr>
                        <th className="px-3 py-2.5">First_Name</th>
                        <th className="px-3 py-2.5">Last_Name</th>
                        <th className="px-3 py-2.5">Email</th>
                        <th className="px-3 py-2.5">Mobile_Phone</th>
                        <th className="px-3 py-2.5">Lead_Source</th>
                        <th className="px-3 py-2.5">Contact_Status</th>
                        <th className="px-3 py-2.5">Lead_Rating</th>
                        <th className="px-3 py-2.5">Owner_Email</th>
                        <th className="px-3 py-2.5">Owner_NMLS</th>
                        <th className="px-3 py-2.5">Created_Date</th>
                        <th className="px-3 py-2.5">Target_Purchase_Date</th>
                        <th className="px-3 py-2.5">Co_Marketing_Partner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE7E0]">
                      {previewTotalExpertRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="px-3 py-2 font-medium text-[#2D362E]">{row.First_Name}</td>
                          <td className="px-3 py-2 font-bold text-[#2D362E]">{row.Last_Name}</td>
                          <td className="px-3 py-2 text-blue-600 font-mono text-[10px]">{row.Email}</td>
                          <td className="px-3 py-2 font-mono text-[10px]">{row.Mobile_Phone}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[10px]">
                              {row.Lead_Source}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                row.Contact_Status.includes("Pre-Approved")
                                  ? "bg-emerald-100 text-emerald-800"
                                  : row.Contact_Status.includes("Contract")
                                  ? "bg-purple-100 text-purple-800"
                                  : row.Contact_Status.includes("Contacted")
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {row.Contact_Status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                row.Lead_Rating === "Hot"
                                  ? "bg-red-100 text-red-800"
                                  : row.Lead_Rating === "Warm"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {row.Lead_Rating}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-[#1B365D] font-medium">{row.Owner_Email || "N/A"}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-gray-600">{row.Owner_NMLS || "N/A"}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-gray-600">{row.Created_Date}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-emerald-700 font-semibold">{row.Target_Purchase_Date}</td>
                          <td className="px-3 py-2 text-gray-600">{row.Co_Marketing_Partner_Name || "None"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Salesforce Table Preview */
                <div className="overflow-x-auto rounded-2xl border border-[#EAE7E0] bg-white shadow-xs">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-[#F9F8F4] text-[#606C5D] font-bold border-b border-[#EAE7E0] whitespace-nowrap">
                      <tr>
                        <th className="px-3 py-2.5">FirstName</th>
                        <th className="px-3 py-2.5">LastName</th>
                        <th className="px-3 py-2.5">Company</th>
                        <th className="px-3 py-2.5">Email</th>
                        <th className="px-3 py-2.5">Phone</th>
                        <th className="px-3 py-2.5">LeadSource</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Rating</th>
                        <th className="px-3 py-2.5">Loan_Officer__c</th>
                        <th className="px-3 py-2.5">Target_Close_Date__c</th>
                        <th className="px-3 py-2.5">Target_Price__c</th>
                        <th className="px-3 py-2.5">TCPA_Consent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE7E0]">
                      {previewSalesforceRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-3 py-2 font-medium text-[#2D362E]">{row.FirstName}</td>
                          <td className="px-3 py-2 font-bold text-[#2D362E]">{row.LastName}</td>
                          <td className="px-3 py-2 text-gray-500">{row.Company}</td>
                          <td className="px-3 py-2 text-blue-600 font-mono text-[10px]">{row.Email}</td>
                          <td className="px-3 py-2 font-mono text-[10px]">{row.Phone}</td>
                          <td className="px-3 py-2">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[10px]">
                              {row.LeadSource}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                row.Status.includes("Pre-Approved")
                                  ? "bg-emerald-100 text-emerald-800"
                                  : row.Status.includes("Contract")
                                  ? "bg-purple-100 text-purple-800"
                                  : row.Status.includes("Working")
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {row.Status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                row.Rating === "Hot"
                                  ? "bg-red-100 text-red-800"
                                  : row.Rating === "Warm"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {row.Rating}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-medium text-[#2D362E]">{row.Assigned_LO_Name__c}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-emerald-700 font-semibold">{row.Target_Close_Date__c}</td>
                          <td className="px-3 py-2 text-emerald-700 font-semibold">{row.Target_Price__c || "N/A"}</td>
                          <td className="px-3 py-2 font-mono text-[10px] text-gray-500">{row.TCPA_Consent_Authorized__c === "TRUE" ? "CONSENTED" : "NONE"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#2D362E]">
                    {currentFormatName} Field Schema Dictionary
                  </h3>
                  <p className="text-xs text-[#606C5D]">
                    Standardized schema of {currentColumns.length} fields configured for {selectedFormat === "totalexpert" ? "Total Expert Contact Ingestion" : "Salesforce Lead Object & Jungo FSC"}.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-semibold">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Date</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Source</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">User Meta</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Mortgage</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {currentColumns.map((col, idx) => {
                  let badgeBg = "bg-gray-100 text-gray-700";
                  if (col.category === "date") badgeBg = "bg-blue-100 text-blue-800";
                  else if (col.category === "source") badgeBg = "bg-emerald-100 text-emerald-800";
                  else if (col.category === "user") badgeBg = "bg-purple-100 text-purple-800";
                  else if (col.category === "mortgage") badgeBg = "bg-amber-100 text-amber-800";
                  else if (col.category === "compliance") badgeBg = "bg-red-100 text-red-800";

                  return (
                    <div
                      key={String(col.key)}
                      className="p-2.5 rounded-xl border border-[#EAE7E0] bg-[#F9F8F4] flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono text-gray-400 font-bold">#{idx + 1}</span>
                          <code className="text-xs font-bold text-[#1B365D] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                            {col.label}
                          </code>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider ${badgeBg}`}>
                            {col.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#606C5D] mt-1">{col.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-5 text-xs text-[#2D362E] max-w-3xl">
              <div>
                <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {selectedFormat === "totalexpert" ? "Total Expert CRM Ingestion Guide" : "Salesforce CRM Ingestion Guide"}
                </h3>
                <p className="text-xs text-[#606C5D] mt-0.5">
                  Follow these enterprise steps to import leads into {selectedFormat === "totalexpert" ? "Total Expert Contact Engine" : "Salesforce Sales Cloud or Jungo CRM"}:
                </p>
              </div>

              {selectedFormat === "totalexpert" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-[#EAE7E0] shadow-xs">
                    <div className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">1</span>
                      Total Expert Ingestion
                    </div>
                    <p className="text-[11px] text-[#606C5D] leading-relaxed">
                      Navigate to <strong>Total Expert &gt; Contacts &gt; Import Contacts</strong>. Upload the exported CSV file. Total Expert will recognize the column headers automatically.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#EAE7E0] shadow-xs">
                    <div className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">2</span>
                      Owner Email Routing
                    </div>
                    <p className="text-[11px] text-[#606C5D] leading-relaxed">
                      The service automatically embeds <code>Owner_Email</code> and <code>Owner_NMLS</code> so contacts route directly to the designated Loan Officer's pipeline.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#EAE7E0] shadow-xs">
                    <div className="font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">3</span>
                      Campaign Triggers
                    </div>
                    <p className="text-[11px] text-[#606C5D] leading-relaxed">
                      Select target marketing journey (e.g. First-Time Buyer Journey, DPA Assistance Sequence). Opted-in leads trigger automated multi-channel sequences.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-[#EAE7E0] shadow-xs">
                    <div className="font-bold text-[#1B365D] mb-1.5 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">1</span>
                      Salesforce Data Loader
                    </div>
                    <p className="text-[11px] text-[#606C5D] leading-relaxed">
                      Open Data Loader &gt; Insert &gt; Lead. Upload the downloaded file. Click <strong>Auto-Match Fields to Columns</strong>; column headers match Salesforce API names 1:1.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#EAE7E0] shadow-xs">
                    <div className="font-bold text-[#1B365D] mb-1.5 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">2</span>
                      Jungo Mortgage CRM
                    </div>
                    <p className="text-[11px] text-[#606C5D] leading-relaxed">
                      The schema includes Jungo's <code>RecordTypeId</code> (<code>012Hn000001CekSIAS</code>) and <code>MtgPlanner_CRM__Group__c</code>, mapping leads directly to loan pipelines.
                    </p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-[#EAE7E0] shadow-xs">
                    <div className="font-bold text-[#1B365D] mb-1.5 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">3</span>
                      Data Import Wizard
                    </div>
                    <p className="text-[11px] text-[#606C5D] leading-relaxed">
                      In Salesforce Setup, navigate to Data Import Wizard &gt; Standard Objects &gt; Leads. Choose UTF-8 encoding (BOM header is pre-injected to prevent character glitching).
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  Enterprise Compliance &amp; Field Integrity Guarantees
                </h4>
                <ul className="list-disc list-inside space-y-1 text-blue-900/90 text-[11px]">
                  <li><strong>Standardized Dates:</strong> Dates are formatted specifically per platform (<code>YYYY-MM-DD HH:mm:ss</code> for Total Expert; ISO 8601 for Salesforce).</li>
                  <li><strong>Attribution Preservation:</strong> Marketing source path (<code>grant_finder</code>, <code>property_scorecard</code>) and referring campaign names are preserved.</li>
                  <li><strong>TCPA Audit Verification:</strong> SMS consent status, timestamps, and opt-in URLs are cleanly mapped for telephone consumer protection compliance.</li>
                  <li><strong>Co-Marketing Partnerships:</strong> Paired real estate agent information is bundled for dual-branded mortgage marketing.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F9F8F4] border-t border-[#EAE7E0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#606C5D]">
            <span className="font-bold text-[#2D362E]">{filteredLeads.length}</span> leads selected for export &bull; {currentFormatName} ({currentColumns.length} fields) &bull; RFC 4180 UTF-8 BOM
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] bg-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleCopyCsv}
              className="px-4 py-2 bg-white border border-[#EAE7E0] hover:bg-gray-50 text-[#2D362E] rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
              {copied ? "Copied" : "Copy CSV"}
            </button>
            <button
              onClick={handleDownload}
              className={`flex-1 sm:flex-initial px-5 py-2 ${
                selectedFormat === "totalexpert" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#00A1E0] hover:bg-[#0089BE]"
              } text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm`}
            >
              <Download className="w-4 h-4" />
              Download {selectedFormat === "totalexpert" ? "Total Expert" : "Salesforce"} CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
