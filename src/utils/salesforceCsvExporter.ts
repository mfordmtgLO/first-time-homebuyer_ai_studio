/**
 * Backward compatibility re-export layer for CRM CSV Exporting.
 * Delegates to the unified enterprise CRM CSV service at /src/services/crmLeadExportService.ts
 */

export {
  // Types
  type CrmExportFormat,
  type SalesforceLeadRow,
  type TotalExpertLeadRow,
  type CrmColumnDefinition,
  type CrmExportResult,
  type NormalizedSourceMetadata,
  type ResolvedUserMetadata,

  // Columns & Schemas
  SALESFORCE_SCHEMA_COLUMNS,
  SALESFORCE_SCHEMA_COLUMNS as SALESFORCE_CSV_COLUMNS,
  TOTAL_EXPERT_SCHEMA_COLUMNS,

  // Date Formatting
  formatSalesforceDateTime,
  formatSalesforceDate,
  formatTotalExpertDateTime,
  formatTotalExpertDate,
  calculateEstimatedCloseDate,

  // Source & User Mapping
  normalizeSourceMetadata,
  resolveUserMetadata,
  splitFullName,
  extractCity,
  escapeCsvCell,
  mapToSalesforceStatus,
  mapToSalesforceRating,
  mapToTotalExpertStatus,
  mapToTotalExpertRating,

  // Transformers & Generators
  formatLeadToSalesforceRow,
  formatLeadToTotalExpertRow,
  transformLeadsToSalesforceRows,
  transformLeadsToTotalExpertRows,
  generateSalesforceCsv,
  generateSalesforceCsv as generateSalesforceLeadsCsv,
  generateTotalExpertCsv,
  generateCrmCsv,
  triggerCrmCsvDownload,
} from "../services/crmLeadExportService";

import {
  triggerCrmCsvDownload,
} from "../services/crmLeadExportService";
import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";

export function triggerSalesforceCsvDownload(
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): { fileName: string; rowCount: number } {
  const res = triggerCrmCsvDownload("salesforce", leads, loanOfficers, agents);
  return { fileName: res.fileName, rowCount: res.rowCount };
}

export function triggerTotalExpertCsvDownload(
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): { fileName: string; rowCount: number } {
  const res = triggerCrmCsvDownload("totalexpert", leads, loanOfficers, agents);
  return { fileName: res.fileName, rowCount: res.rowCount };
}
