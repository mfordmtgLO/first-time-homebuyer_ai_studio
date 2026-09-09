export interface CountyPartner {
  county: string;
  agentName: string;
  agentBrokerage: string;
  agentPhone?: string;
  agentEmail?: string;
}

export const COUNTY_PARTNERS: CountyPartner[] = [
  {
    county: "Multnomah County",
    agentName: "Kanndice M.",
    agentBrokerage: "Top Local Brokerage",
  }
];
