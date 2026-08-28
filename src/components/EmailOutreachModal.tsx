import React, { useState, useEffect } from 'react';
import { 
  X, Search, Plus, Archive, ArchiveRestore, Mail, Copy, Send, Sparkles, 
  CheckSquare, Square, FileSpreadsheet, Tag as TagIcon, ExternalLink, 
  Paperclip, Download, FileText, Check, AlertCircle, Info, Save, RotateCcw, CheckCircle2,
  FileCheck, FilePlus, Image as ImageIcon, Eye, Filter, Upload, ChevronDown, ChevronUp,
  UserCheck, Building, MapPin, PhoneCall, Award
} from 'lucide-react';
import { PropertyListing, EmailTemplate, RealEstateAgentProfile, CapturedLead, LoanOfficerProfile } from '../types';
import { INITIAL_AGENT_ROSTER, INITIAL_LEADS, INITIAL_TEAM_LOAN_OFFICERS } from '../data/initialData';

interface EmailOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyListing[];
  agentRoster?: RealEstateAgentProfile[];
  leads?: CapturedLead[];
  loanOfficers?: LoanOfficerProfile[];
  initialSelectedLeadId?: string;
}

export interface MarketingFlyer {
  id: string;
  name: string;
  filename: string;
  category: string;
  fileType: 'pdf' | 'jpg' | 'png';
  size: string;
  description: string;
  thumbnailUrl?: string;
  isCustom?: boolean;
}

const PRESET_TAGS = ['Welcome', 'Follow-up', 'Promotion', 'USDA', 'Open House'];
const STORAGE_KEY_TEMPLATES = 'geosphere_email_templates';
const STORAGE_KEY_DRAFT = 'geosphere_email_editor_draft';

const CATEGORY_META: Record<string, { label: string; icon: string; badgeColor: string; bgTint: string }> = {
  'USDA': { label: 'USDA Financing Collateral', icon: '🌾', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', bgTint: 'border-l-4 border-l-emerald-600' },
  'Flex': { label: 'Flex & Down Payment Assistance', icon: '⚡', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', bgTint: 'border-l-4 border-l-amber-600' },
  'Rate Buydown': { label: 'Rate Buydown & Incentive Matrix', icon: '📈', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300', bgTint: 'border-l-4 border-l-indigo-600' },
  'General': { label: 'General & Specialty Loan Programs', icon: '📁', badgeColor: 'bg-[#4A5D4E]/15 text-[#2D362E] border-[#4A5D4E]/30', bgTint: 'border-l-4 border-l-[#4A5D4E]' },
  'Custom Uploads': { label: 'Custom Uploaded Documents', icon: '📎', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', bgTint: 'border-l-4 border-l-purple-600' }
};

const PRESET_MARKETING_FLYERS: MarketingFlyer[] = [
  {
    id: 'flyer-1',
    name: 'USDA Zero Down Direct Flyer',
    filename: 'USDA_100_Zero_Down_Program_Flyer.pdf',
    category: 'USDA',
    fileType: 'pdf',
    size: '1.4 MB',
    description: 'Highlights 100% financing eligibility, income caps, and zero down payment benefits.'
  },
  {
    id: 'flyer-1b',
    name: 'USDA Eligible Geographic Boundary Guide',
    filename: 'USDA_Eligible_Geographic_Tract_Guide.jpg',
    category: 'USDA',
    fileType: 'jpg',
    size: '1.1 MB',
    description: 'Visual map breakdown and property location rules for USDA rural & suburban tracts.'
  },
  {
    id: 'flyer-2',
    name: 'FirstHome $15K DPA Grant Guide',
    filename: 'FirstHome_15k_Down_Payment_Grant_Overview.pdf',
    category: 'Flex',
    fileType: 'pdf',
    size: '2.1 MB',
    description: 'Breakdown of first-time homebuyer grant qualification rules and closing cost credits.'
  },
  {
    id: 'flyer-2b',
    name: 'Flex 3.5% Assistance & Forgivable Second Lien',
    filename: 'Flex_Down_Payment_Assistance_Options.pdf',
    category: 'Flex',
    fileType: 'pdf',
    size: '1.6 MB',
    description: 'Flexible down payment assistance matrix featuring zero-interest forgivable options.'
  },
  {
    id: 'flyer-3',
    name: '2-1 Temporary Interest Rate Buydown Matrix',
    filename: '2_1_Temporary_Buydown_Rate_Sheet.jpg',
    category: 'Rate Buydown',
    fileType: 'jpg',
    size: '980 KB',
    description: 'Visual chart comparing Year 1, Year 2, and Year 3 monthly mortgage savings.'
  },
  {
    id: 'flyer-3b',
    name: '1-0 Seller-Paid Rate Buydown Agent Sheet',
    filename: '1_0_Seller_Buydown_Agent_Sheet.pdf',
    category: 'Rate Buydown',
    fileType: 'pdf',
    size: '890 KB',
    description: 'Co-branded listing flyer highlighting seller concessions for initial interest rate drops.'
  },
  {
    id: 'flyer-4',
    name: 'VA Military Zero-Down Benefits Flyer',
    filename: 'VA_Military_Loan_Benefits_Summary.pdf',
    category: 'General',
    fileType: 'pdf',
    size: '1.8 MB',
    description: 'Zero funding fee eligibility, competitive interest rates, and no PMI advantages.'
  },
  {
    id: 'flyer-5',
    name: 'FHA 203(k) Renovation Loan Flyer',
    filename: 'FHA_203k_Renovation_Mortgage_Guide.pdf',
    category: 'General',
    fileType: 'pdf',
    size: '1.2 MB',
    description: 'Single mortgage combining home purchase price with repair/renovation budget.'
  },
  {
    id: 'flyer-6',
    name: 'Medical Professional & Doctor Loan Flyer',
    filename: 'Doctor_Medical_Physician_0_Down_Flyer.jpg',
    category: 'General',
    fileType: 'jpg',
    size: '850 KB',
    description: 'Tailored zero down payment loans for MDs, DOs, Dentists, and Residents.'
  }
];

const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: "lead-outreach-1",
    title: "Website Chatbot Lead: Low/No Down Homes List + Co-Branded Guide Plug",
    subject: "Your Requested Low/No Down Payment Home List for [City] + First-Time Buyer Blueprint",
    body: `Hi [LeadName],

Thank you for completing your first-time homebuyer intake on our interactive website portal! Based on your target budget of [TargetBudget] and location preference for [City], we have prepared your customized pre-approval blueprint.

🤝 YOUR DEDICATED CO-BRANDED LOCAL GUIDE TEAM:
As part of your personalized homebuyer support team, [LoName] (Senior Loan Officer, NMLS #[LoNMLS]) and [AgentName] ([AgentTitle] at [AgentBrokerage], Phone: [AgentPhone], Email: [AgentEmail]) work together to guide you every step of the way! We coordinate both your 100% pre-approval financing and private home tours across [City] and surrounding cities with zero stress.

🏡 RECENT LOW & ZERO-DOWN HOMES FOR SALE IN & AROUND [City]:
[QualifyingPropertyListings]

💡 FINANCING ADVANTAGE:
Did you know that many buyers in [City] assume they need $40,000+ in cash for a down payment? In reality, properties in [City] qualify for 100% USDA Zero-Down Financing ($0 down required) or 3.5% Flex DPA Grants combined with seller concessions!

Next Steps:
Let's connect for 10 minutes at your preferred time ([PreferredTime]) to walk through your exact monthly numbers and schedule private tours for any listings you'd like to see.

Warm regards,

[LoName] | Senior Loan Officer | NMLS #[LoNMLS]
[AgentName] | Senior Real Estate Specialist | [AgentBrokerage]`,
    tags: ["Website Lead", "Chatbot", "Co-Branded", "USDA"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  },
  {
    id: "lead-outreach-2",
    title: "Website Lead: USDA 100% Zero-Down Listings in [City]",
    subject: "100% Financing ($0 Down) Recent Listings in [City] for [LeadName]",
    body: `Hi [LeadName],

Great news! We reviewed your chatbot intake response for [City]. Since your requested budget is [TargetBudget], you qualify for 100% USDA Zero-Down Financing where NO down payment is required out of pocket.

🤝 CO-BRANDED TEAM SUPPORT:
[LoName] (NMLS #[LoNMLS]) and [AgentName] ([AgentBrokerage]) are ready to help you tour these homes and get pre-approved in under 24 hours.

🏡 RECENT 100% ZERO-DOWN HOMES IN [City]:
[QualifyingPropertyListings]

Reply to this email or call us to set up your private walkthroughs!

Best,
[LoName] & [AgentName]`,
    tags: ["Website Lead", "USDA", "Co-Branded"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  },
  {
    id: "buyer-agent-attract-1",
    title: "Attract Buyer Agents - Zero-Down Property Partnership",
    subject: "Co-Marketing Partnership: Zero-Down & Flex DPA Pre-Screened Listings in [City]",
    body: "Hi [AgentName],\n\nAs a leading Buyer Agent in [City], I wanted to reach out regarding a massive opportunity to attract first-time buyers who think they need 20% down or $50k cash to buy a home.\n\nWe have pre-screened listings in [City] eligible for 100% USDA Rural Zero-Down Financing as well as 3.5% Flex DPA Grants and $15,000 Oregon FirstHome Grants. For example, listings like [Address] allow buyers to own for almost the exact same monthly payment as renting locally!\n\nI would love to partner up to provide you with:\n1. Co-branded landing pages for your zero-down property tours\n2. Open house flyers highlighting exact monthly payments & $0 down options\n3. Pre-qualification approvals within 24 hours\n\nLet's schedule a 10-minute call or coffee this week to discuss co-marketing to buyers looking to stop renting.\n\nBest regards,\n[MyName]",
    tags: ["Buyer Agent", "USDA", "Promotion"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  },
  {
    id: "buyer-agent-stop-renting",
    title: "Buyer Agent Outreach - Stop Renting Zero-Down Campaign",
    subject: "Help First-Time Buyers Stop Renting: 0% Down & Rate Buydown Options in [City]",
    body: "Hi [AgentName],\n\nMany renters in [City] are sitting on the sidelines assuming high interest rates and large down payments make homeownership impossible. \n\nWe are actively structuring zero-down USDA loans, 2-1 temporary rate buydowns, and DPA grants that lower buyer upfront cash to virtually zero and drop Year 1 mortgage payments by hundreds per month!\n\nI am looking to partner with dedicated Buyer's Agents to co-host webinars and co-brand open house marketing for properties like [Address].\n\nWould you be open to a quick call this week to co-market these high-converting loan solutions?\n\nWarm regards,\n[MyName]",
    tags: ["Buyer Agent", "Welcome", "Rate Buydown"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  },
  {
    id: "1",
    title: "USDA Zero-Down Buyer Inquiry",
    subject: "Pre-approved Buyer for your listing at [Address]",
    body: "Hi [AgentName],\n\nI have a pre-approved buyer looking in [City], and your listing at [Address] caught our eye. Our buyer is qualified for a USDA zero-down loan, and our GeoSphere checks indicate your listing is in an eligible zone!\n\nCan we set up a quick tour this week?\n\nThanks,\n[MyName]",
    tags: ["USDA", "Follow-up"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  },
  {
    id: "2",
    title: "New Agent Partnership Welcome",
    subject: "Co-Branding & Lead Generation Partnership for [City]",
    body: "Hi [AgentName],\n\nMy name is Mike Ford, Senior Loan Officer. I love your listings in [City] and wanted to connect! We offer customized co-branded landing pages, GIS zone mapping for buyer grants, and joint ad campaigns.\n\nLet's catch up over coffee this week to discuss co-marketing strategies.\n\nBest regards,\n[MyName]",
    tags: ["Welcome", "Promotion"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  },
  {
    id: "3",
    title: "Co-Op Rate Buydown Promotion",
    subject: "Boost buyer traffic on [Address] with 2-1 Buydown",
    body: "Hi [AgentName],\n\nBuyers are watching interest rates closely right now. We are offering a specialized 2-1 Temporary Interest Rate Buydown program for listings like [Address] that drops buyer monthly payments significantly in Year 1.\n\nWould you like a custom flyer for your open house highlighting the reduced monthly payment?\n\nBest,\n[MyName]",
    tags: ["Promotion"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  },
  {
    id: "4",
    title: "Weekend Open House Tour Follow-Up",
    subject: "Follow up regarding listing at [Address]",
    body: "Hi [AgentName],\n\nFollowing up on our buyers who viewed [Address] during the open house weekend. They loved the property layout and we are putting together their pre-approval details.\n\nDo you have any active competing offers on the table currently?\n\nThanks,\n[MyName]",
    tags: ["Follow-up", "Open House"],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ownerId: "me"
  }
];

export const EmailOutreachModal: React.FC<EmailOutreachModalProps> = ({ 
  isOpen, 
  onClose, 
  properties, 
  agentRoster,
  leads = INITIAL_LEADS,
  loanOfficers = INITIAL_TEAM_LOAN_OFFICERS,
  initialSelectedLeadId
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load saved templates", e);
    }
    return MOCK_TEMPLATES;
  });

  const [activeTemplateId, setActiveTemplateId] = useState<string>("lead-outreach-1");
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedAgentEmails, setSelectedAgentEmails] = useState<string[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(initialSelectedLeadId || null);

  useEffect(() => {
    if (initialSelectedLeadId) {
      setSelectedLeadId(initialSelectedLeadId);
      setRecipientTab('website_leads');
    }
  }, [initialSelectedLeadId]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("All");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [includePropertyLinks, setIncludePropertyLinks] = useState(true);
  const [downloadedAttachment, setDownloadedAttachment] = useState(false);

  // Marketing Material Flyers State
  const [flyers, setFlyers] = useState<MarketingFlyer[]>(PRESET_MARKETING_FLYERS);
  const [selectedFlyerIds, setSelectedFlyerIds] = useState<string[]>(['flyer-1', 'flyer-3']);
  const [flyerSearchQuery, setFlyerSearchQuery] = useState("");
  const [selectedFlyerCategory, setSelectedFlyerCategory] = useState<string>("All");
  const [previewingFlyer, setPreviewingFlyer] = useState<MarketingFlyer | null>(null);
  const [isFlyerSectionExpanded, setIsFlyerSectionExpanded] = useState(true);
  
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Auto-Save States
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);

  // Persist templates list to browser local state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error("Error saving templates to local state:", e);
    }
  }, [templates]);

  // Load full Agent Roster for Buyer Agent Outreach
  const effectiveAgentRoster = React.useMemo(() => {
    if (agentRoster && agentRoster.length > 0) return agentRoster;
    try {
      const raw = localStorage.getItem('guides_state_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.agentRoster) && parsed.agentRoster.length > 0) {
          return parsed.agentRoster as RealEstateAgentProfile[];
        }
      }
    } catch (e) {}
    return INITIAL_AGENT_ROSTER;
  }, [agentRoster]);

  // Buyer Agents from Roster
  const buyerAgentList = React.useMemo(() => {
    return effectiveAgentRoster.filter(a => a.agentType === 'buyer_agent' || a.agentType === 'dual_agent' || !a.agentType);
  }, [effectiveAgentRoster]);

  // Tab for recipient list selection: 'website_leads' | 'buyer' | 'listing' | 'all'
  const [recipientTab, setRecipientTab] = useState<'website_leads' | 'buyer' | 'listing' | 'all'>('website_leads');

  // AI Studio Website Chatbot Lead Email Generator
  const handleGenerateAiWebsiteLeadEmail = async (targetLeadId?: string) => {
    const leadId = targetLeadId || selectedLeadId;
    const lead = leads.find(l => l.id === leadId) || leads[0];
    if (!lead) return;

    setIsGenerating(true);
    try {
      const assignedLo = loanOfficers.find(l => l.id === lead.assignedLoId || l.name === lead.assignedLO) || loanOfficers[0];
      const assignedAgent = effectiveAgentRoster.find(a => a.id === lead.assignedAgentId || a.name === lead.assignedAgent) || effectiveAgentRoster[0];

      // Filter matching listings by lead location
      const city = lead.preferredLocations || "Albany";
      const matchingListings = properties.filter(p => 
        p.city.toLowerCase().includes(city.toLowerCase()) || p.overlayEligibility?.usda
      ).slice(0, 4);

      const res = await fetch("/api/gemini/website-lead-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead,
          lo: assignedLo,
          agent: assignedAgent,
          matchingListings
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.email) {
          setIsEditing(true);
          setEditTitle(`Outreach: ${lead.fullName} (${lead.preferredLocations})`);
          setEditSubject(data.email.subject);
          setEditBody(data.email.body);
          setEditTags(["Website Lead", "Chatbot", "Co-Branded", "USDA"]);
        }
      } else {
        // Fallback generator
        setIsEditing(true);
        setEditTitle(`Outreach: ${lead.fullName} (${lead.preferredLocations})`);
        setEditSubject(`Your Requested Low/No Down Payment Home List for ${lead.preferredLocations} + First-Time Buyer Blueprint`);
        setEditBody(`Hi ${lead.fullName},\n\nThank you for reaching out via our chatbot! We have prepared your custom homebuyer blueprint for ${lead.preferredLocations}.\n\n🤝 YOUR LOCAL CO-BRANDED GUIDE TEAM:\nMike Ford (Senior Loan Officer, NMLS #987654) and ${assignedAgent.name} (${assignedAgent.title} at ${assignedAgent.brokerage}, ${assignedAgent.phone}) are ready to help you every step of the way!\n\nNext Steps: Let's set up a 10-minute chat at ${lead.preferredContactTime || 'your convenience'}.\n\nBest,\nMike Ford & ${assignedAgent.name}`);
        setEditTags(["Website Lead", "Chatbot", "Co-Branded"]);
      }
    } catch (err) {
      console.error("AI Website Lead Email error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Studio Buyer Agent Email Draft Generator
  const handleGenerateAiBuyerEmail = async () => {
    setIsGenerating(true);
    try {
      const selectedBuyerAgents = buyerAgentList.filter(a => selectedAgentEmails.includes(a.email));
      const targetAgentNames = selectedBuyerAgents.map(a => a.name);
      
      const res = await fetch("/api/gemini/buyer-agent-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentNames: targetAgentNames.length > 0 ? targetAgentNames : ["Top Buyer Agent"],
          properties: properties,
          loName: "Mike Ford",
          campaignType: "Attract Buyer Agents - Stop Renting Zero Down & Flex DPA Push"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.email) {
          setIsEditing(true);
          setEditTitle("AI Studio: Buyer Agent Stop-Renting Campaign");
          setEditSubject(data.email.subject || "Co-Marketing Partnership: Stop Renting & 0% Down USDA Listings");
          setEditBody(data.email.body || "");
          setEditTags(["Buyer Agent", "USDA", "Promotion"]);
        }
      } else {
        // High quality fallback client generator
        setIsEditing(true);
        setEditTitle("AI Studio: Buyer Agent Stop-Renting Campaign");
        setEditSubject("Co-Marketing Partnership: Zero-Down & Flex DPA Pre-Screened Listings in Oregon");
        setEditBody(`Hi [AgentName],\n\nAs a premier Buyer's Agent, I wanted to reach out regarding a massive co-marketing opportunity to attract renters who want to stop renting and buy their first home.\n\nWe have pre-screened property listings eligible for 100% USDA Zero-Down Financing, 3.5% Flex DPA Grants, and 2-1 Temporary Rate Buydowns that lower buyer upfront cash to virtually $0!\n\nI would love to partner with you to co-market these listings with co-branded landing pages, open house flyer attachments, and 24-hour pre-approvals.\n\nLet's catch up over coffee or a brief call this week to align on our first-time homebuyer strategy.\n\nBest regards,\n[MyName]`);
        setEditTags(["Buyer Agent", "USDA", "Promotion"]);
      }
    } catch (err) {
      console.error("AI Email generation error:", err);
      setIsEditing(true);
      setEditTitle("AI Studio: Buyer Agent Stop-Renting Campaign");
      setEditSubject("Co-Marketing Partnership: Zero-Down & Flex DPA Pre-Screened Listings in Oregon");
      setEditBody(`Hi [AgentName],\n\nAs a premier Buyer's Agent, I wanted to reach out regarding a massive co-marketing opportunity to attract renters who want to stop renting and buy their first home.\n\nWe have pre-screened property listings eligible for 100% USDA Zero-Down Financing, 3.5% Flex DPA Grants, and 2-1 Temporary Rate Buydowns that lower buyer upfront cash to virtually $0!\n\nI would love to partner with you to co-market these listings with co-branded landing pages, open house flyer attachments, and 24-hour pre-approvals.\n\nLet's catch up over coffee or a brief call this week to align on our first-time homebuyer strategy.\n\nBest regards,\n[MyName]`);
      setEditTags(["Buyer Agent", "USDA", "Promotion"]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Group properties by listing agent email
  const agentProperties = React.useMemo(() => {
    const map = new Map<string, { agentName: string, properties: PropertyListing[] }>();
    properties.forEach(p => {
      if (p.listingAgent?.email) {
        const email = p.listingAgent.email;
        if (!map.has(email)) map.set(email, { agentName: p.listingAgent.name || email, properties: [] });
        map.get(email)!.properties.push(p);
      }
    });
    return Array.from(map.entries()).map(([email, data]) => ({ email, ...data }));
  }, [properties]);

  // Extract all unique tags across existing templates + presets
  const allAvailableTags = React.useMemo(() => {
    const set = new Set<string>(PRESET_TAGS);
    templates.forEach(t => t.tags?.forEach(tag => set.add(tag)));
    return Array.from(set);
  }, [templates]);

  // Load active template or check for an auto-saved draft in browser local state
  useEffect(() => {
    let loadedFromDraft = false;
    try {
      const draftRaw = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft && draft.templateId === activeTemplateId) {
          setIsEditing(true);
          setEditTitle(draft.editTitle ?? "");
          setEditSubject(draft.editSubject ?? "");
          setEditBody(draft.editBody ?? "");
          setEditTags(draft.editTags ?? []);
          if (Array.isArray(draft.selectedFlyerIds)) setSelectedFlyerIds(draft.selectedFlyerIds);
          setLastSavedTime(draft.savedAt ? new Date(draft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : null);
          setAutoSaveStatus('saved');
          setHasRestoredDraft(true);
          loadedFromDraft = true;
        }
      }
    } catch (e) {
      console.error("Error reading editor draft:", e);
    }

    if (!loadedFromDraft) {
      setHasRestoredDraft(false);
      if (activeTemplateId === "new") {
        setIsEditing(true);
        setEditTitle("New Template");
        setEditSubject("");
        setEditBody("");
        setEditTags(["Welcome"]);
      } else {
        const t = templates.find(t => t.id === activeTemplateId);
        if (t) {
          setIsEditing(false);
          setEditTitle(t.title);
          setEditSubject(t.subject);
          setEditBody(t.body);
          setEditTags(t.tags || []);
        }
      }
    }
  }, [activeTemplateId, templates]);

  // Auto-save draft progress to browser's local state every few seconds while editing
  useEffect(() => {
    if (!isEditing) return;

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const draftData = {
          templateId: activeTemplateId,
          editTitle,
          editSubject,
          editBody,
          editTags,
          selectedFlyerIds,
          savedAt: now.toISOString()
        };
        localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draftData));
        setLastSavedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAutoSaveStatus('saved');
      } catch (e) {
        console.error("Auto-save to local state failed:", e);
        setAutoSaveStatus('idle');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [editTitle, editSubject, editBody, editTags, selectedFlyerIds, activeTemplateId, isEditing]);

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } catch (e) {
      console.error(e);
    }
    setHasRestoredDraft(false);
    setAutoSaveStatus('idle');
    setLastSavedTime(null);
    if (activeTemplateId === "new") {
      setEditTitle("New Template");
      setEditSubject("");
      setEditBody("");
      setEditTags(["Welcome"]);
    } else {
      const t = templates.find(t => t.id === activeTemplateId);
      if (t) {
        setEditTitle(t.title);
        setEditSubject(t.subject);
        setEditBody(t.body);
        setEditTags(t.tags || []);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedAgentEmails(agentProperties.map(a => a.email));
      setDownloadedAttachment(false);
    }
  }, [isOpen, agentProperties]);

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(t => {
    if (!includeArchived && t.isArchived) return false;
    
    // Tag filter
    if (selectedTagFilter !== "All") {
      if (!t.tags || !t.tags.includes(selectedTagFilter)) return false;
    }

    // Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = t.title.toLowerCase().includes(q);
      const bodyMatch = t.body.toLowerCase().includes(q);
      const subjectMatch = t.subject.toLowerCase().includes(q);
      const tagMatch = t.tags?.some(tag => tag.toLowerCase().includes(q));
      return titleMatch || bodyMatch || subjectMatch || tagMatch;
    }
    return true;
  });

  const getPropertyLink = (p: PropertyListing) => {
    if (p.zillowUrl && p.zillowUrl.startsWith('http')) return p.zillowUrl;
    const query = `${p.address}, ${p.city}, ${p.state} ${p.zip}`;
    return `https://www.zillow.com/homes/${encodeURIComponent(query)}`;
  };

  const handleSave = () => {
    if (activeTemplateId === "new") {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        title: editTitle,
        subject: editSubject,
        body: editBody,
        tags: editTags,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: "me"
      };
      setTemplates(prev => [...prev, newTemplate]);
      setActiveTemplateId(newTemplate.id);
    } else {
      setTemplates(prev => prev.map(t => t.id === activeTemplateId ? { 
        ...t, 
        title: editTitle, 
        subject: editSubject, 
        body: editBody, 
        tags: editTags,
        updatedAt: new Date().toISOString() 
      } : t));
    }
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } catch (e) {
      console.error(e);
    }
    setHasRestoredDraft(false);
    setAutoSaveStatus('saved');
    setIsEditing(false);
  };

  const toggleTagInEditor = (tag: string) => {
    setEditTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags(prev => [...prev, trimmed]);
      setCustomTagInput("");
    }
  };

  const toggleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isArchived: !t.isArchived } : t));
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    setTimeout(() => {
      setEditBody(prev => prev + `\n\n[AI Suggestion based on "${aiPrompt}"]: \nHi [AgentName], noticed your listing is eligible for zero-down USDA financing! Would love to chat about bringing our pre-approved buyers.`);
      setIsGenerating(false);
      setAiPrompt("");
    }, 1500);
  };

  const generateBodyContent = (isHtml: boolean = false) => {
    let text = editBody;
    
    if (selectedAgentEmails.length === 1) {
      const agent = agentProperties.find(a => a.email === selectedAgentEmails[0]);
      if (agent) {
        text = text.replace(/\[AgentName\]/g, agent.agentName);
        if (agent.properties.length > 0) {
          text = text.replace(/\[Address\]/g, agent.properties[0].address);
          text = text.replace(/\[City\]/g, agent.properties[0].city);
        }
      }
    } else {
      text = text.replace(/\[AgentName\]/g, 'Valued Partner');
      text = text.replace(/\[Address\]/g, 'your active listings');
      text = text.replace(/\[City\]/g, 'our target area');
    }

    text = text.replace(/\[MyName\]/g, 'Mike Ford (Senior Loan Officer)');

    const targetProperties: PropertyListing[] = [];
    selectedAgentEmails.forEach(email => {
      const agent = agentProperties.find(a => a.email === email);
      if (agent) targetProperties.push(...agent.properties);
    });

    if (targetProperties.length === 0) return text;

    const selectedFlyers = flyers.filter(f => selectedFlyerIds.includes(f.id));

    if (isHtml) {
      let htmlOutput = text.replace(/\n/g, '<br/>');
      
      if (includePropertyLinks && targetProperties.length > 0) {
        htmlOutput += `<br/><br/><div style="border-top: 2px solid #0078D4; padding-top: 12px; margin-top: 16px;">`;
        htmlOutput += `<h4 style="color: #0078D4; margin: 0 0 10px 0; font-family: Arial, sans-serif;">📍 Featured Listing Overview & Direct Links</h4>`;
        htmlOutput += `<ul style="padding-left: 18px; margin: 0; font-family: Arial, sans-serif; font-size: 13px; color: #333;">`;
        targetProperties.forEach(p => {
          const link = getPropertyLink(p);
          const usdaTag = p.overlayEligibility?.usda ? `<span style="color: #2e7d32; font-weight: bold;">[USDA 100% Eligible]</span> ` : '';
          const firstHomeTag = p.overlayEligibility?.firstHomeEligible ? `<span style="color: #0288d1; font-weight: bold;">[FirstHome Grant Qualified]</span>` : '';
          htmlOutput += `<li style="margin-bottom: 12px;">`;
          htmlOutput += `<strong><a href="${link}" style="color: #0078D4; text-decoration: underline;">${p.address}, ${p.city}, ${p.state} ${p.zip}</a></strong><br/>`;
          htmlOutput += `<span style="color: #555;">Price: $${p.price.toLocaleString()} | ${p.beds} Bed / ${p.baths} Bath (${p.sqft.toLocaleString()} sq ft)</span><br/>`;
          htmlOutput += `<span style="color: #606C5D; font-size: 12px;">Financing Specs: ${usdaTag} ${firstHomeTag}</span><br/>`;
          htmlOutput += `<a href="${link}" style="color: #0078D4; font-size: 12px; text-decoration: underline;">View Live Listing Details ↗</a>`;
          htmlOutput += `</li>`;
        });
        htmlOutput += `</ul></div>`;
      }

      if (selectedFlyers.length > 0) {
        htmlOutput += `<br/><br/><div style="border-top: 2px dashed #4A5D4E; padding-top: 12px; margin-top: 16px; background-color: #FAF9F5; padding: 12px; border-radius: 8px;">`;
        htmlOutput += `<h4 style="color: #4A5D4E; margin: 0 0 8px 0; font-family: Arial, sans-serif; font-size: 13px; font-weight: bold;">📎 Attached Loan Program Marketing Flyers (${selectedFlyers.length})</h4>`;
        htmlOutput += `<ul style="padding-left: 18px; margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #2D362E;">`;
        selectedFlyers.forEach(f => {
          htmlOutput += `<li style="margin-bottom: 8px;">`;
          htmlOutput += `<strong style="color: #4A5D4E;">[${f.fileType.toUpperCase()}] ${f.name}</strong> (${f.filename} - ${f.size})<br/>`;
          htmlOutput += `<span style="color: #606C5D; font-size: 11px;">Category: ${f.category} — ${f.description}</span>`;
          htmlOutput += `</li>`;
        });
        htmlOutput += `</ul></div>`;
      }

      return htmlOutput;
    } else {
      let textOutput = text;
      if (includePropertyLinks && targetProperties.length > 0) {
        textOutput += `\n\n==============================================\n📍 FEATURED PROPERTY OVERVIEW & DIRECT LINKS:\n==============================================\n`;
        targetProperties.forEach((p, idx) => {
          const link = getPropertyLink(p);
          const usdaTag = p.overlayEligibility?.usda ? '[USDA 100% Eligible Zone]' : '[Standard Financing]';
          const firstHomeTag = p.overlayEligibility?.firstHomeEligible ? ' [FirstHome Grant Qualified]' : '';
          textOutput += `${idx + 1}. ${p.address}, ${p.city}, ${p.state} ${p.zip}\n`;
          textOutput += `   • Price: $${p.price.toLocaleString()} | ${p.beds} Beds / ${p.baths} Baths | ${p.sqft.toLocaleString()} sq ft\n`;
          textOutput += `   • Program Specs: ${usdaTag}${firstHomeTag}\n`;
          textOutput += `   • Direct Link: ${link}\n\n`;
        });
      }

      if (selectedFlyers.length > 0) {
        textOutput += `\n\n==============================================\n📎 ATTACHED MARKETING FLYERS & PROGRAM GUIDES (${selectedFlyers.length}):\n==============================================\n`;
        selectedFlyers.forEach((f, idx) => {
          textOutput += `${idx + 1}. [${f.fileType.toUpperCase()}] ${f.name} (${f.filename} - ${f.size})\n`;
          textOutput += `   • Category   : ${f.category}\n`;
          textOutput += `   • Description: ${f.description}\n\n`;
        });
      }

      return textOutput;
    }
  };

  const handleDownloadSelectedFlyers = () => {
    const selectedFlyers = flyers.filter(f => selectedFlyerIds.includes(f.id));
    if (selectedFlyers.length === 0) {
      alert("Please select at least one marketing flyer to download.");
      return;
    }

    selectedFlyers.forEach(flyer => {
      let content = `========================================================================\n`;
      content += `GEOSPHERE MORTGAGE MARKETING FLYER: ${flyer.name.toUpperCase()}\n`;
      content += `Filename : ${flyer.filename}\n`;
      content += `Category : ${flyer.category} | File Format: ${flyer.fileType.toUpperCase()} | Size: ${flyer.size}\n`;
      content += `========================================================================\n\n`;
      content += `PROGRAM HIGHLIGHTS & AGENT MARKETING SHEET:\n`;
      content += `${flyer.description}\n\n`;
      content += `LOAN OFFICER CONTACT & BRANDING:\n`;
      content += `Mike Ford, Senior Loan Officer\n`;
      content += `GeoSphere Mortgage & Zone Financing Solutions\n`;
      content += `Direct Phone: (555) 234-5678 | Email: m.ford@geospheremortgage.com\n`;
      content += `NMLS License ID: #987654\n`;
      content += `========================================================================\n`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = flyer.filename.replace(/\.(pdf|jpg|png)$/i, '') + '_Flyer.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleCustomFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, idx: number) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileType: 'pdf' | 'jpg' | 'png' = ext === 'pdf' ? 'pdf' : (ext === 'png' ? 'png' : 'jpg');
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const formattedSize = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;

      const newFlyer: MarketingFlyer = {
        id: `custom-flyer-${Date.now()}-${idx}`,
        name: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, ' '),
        filename: file.name,
        category: 'Custom Upload',
        fileType,
        size: formattedSize,
        description: 'Uploaded custom loan program flyer ready for agent outreach.',
        isCustom: true
      };

      setFlyers(prev => [newFlyer, ...prev]);
      setSelectedFlyerIds(prev => [...prev, newFlyer.id]);
    });
  };

  const launchInOutlook = () => {
    if (selectedAgentEmails.length === 0) {
      alert("Please select at least one agent first.");
      return;
    }
    
    const to = selectedAgentEmails.join(";");
    
    let subjectText = editSubject;
    if (selectedAgentEmails.length === 1) {
      const agent = agentProperties.find(a => a.email === selectedAgentEmails[0]);
      if (agent && agent.properties.length > 0) {
        subjectText = subjectText.replace(/\[Address\]/g, agent.properties[0].address);
        subjectText = subjectText.replace(/\[City\]/g, agent.properties[0].city);
        subjectText = subjectText.replace(/\[AgentName\]/g, agent.agentName);
      }
    } else {
      subjectText = subjectText.replace(/\[Address\]/g, 'Featured Listings');
      subjectText = subjectText.replace(/\[City\]/g, 'Target Area');
      subjectText = subjectText.replace(/\[AgentName\]/g, 'Agent Partners');
    }

    const plainBody = generateBodyContent(false);

    const encodedSubject = encodeURIComponent(subjectText);
    const encodedBody = encodeURIComponent(plainBody);

    if (selectedFlyerIds.length > 0) {
      handleDownloadSelectedFlyers();
    }

    // mailto URL protocol with pre-encoded subject line and body
    window.location.href = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  const handleDownloadAttachment = () => {
    const targetProperties: PropertyListing[] = [];
    selectedAgentEmails.forEach(email => {
      const agent = agentProperties.find(a => a.email === email);
      if (agent) targetProperties.push(...agent.properties);
    });

    let fileContent = `========================================================================\n`;
    fileContent += `LOAN OFFICER OUTREACH & PROPERTY FINANCING DATASHEET\n`;
    fileContent += `Prepared for: ${selectedAgentEmails.join('; ')}\n`;
    fileContent += `Date: ${new Date().toLocaleDateString()}\n`;
    fileContent += `========================================================================\n\n`;

    targetProperties.forEach((p, i) => {
      fileContent += `PROPERTY #${i + 1}: ${p.address}, ${p.city}, ${p.state} ${p.zip}\n`;
      fileContent += `------------------------------------------------------------------------\n`;
      fileContent += `MLS / Listing ID  : ${p.mlsNumber || p.id}\n`;
      fileContent += `Listing Price     : $${p.price.toLocaleString()}\n`;
      fileContent += `Property Specs    : ${p.beds} Beds | ${p.baths} Baths | ${p.sqft.toLocaleString()} sq ft | Built ${p.yearBuilt}\n`;
      fileContent += `Listing Agent     : ${p.listingAgent?.name || 'N/A'} (${p.listingAgent?.email || 'N/A'})\n`;
      fileContent += `USDA Financing    : ${p.overlayEligibility?.usda ? 'QUALIFIED (Zero Down Eligible Zone)' : 'Standard'}\n`;
      fileContent += `FirstHome Grant   : ${p.overlayEligibility?.firstHomeEligible ? 'QUALIFIED ($15,000 Assistance Cap)' : 'Standard'}\n`;
      fileContent += `Direct Web Link   : ${getPropertyLink(p)}\n\n`;
    });

    const selectedFlyers = flyers.filter(f => selectedFlyerIds.includes(f.id));
    if (selectedFlyers.length > 0) {
      fileContent += `========================================================================\n`;
      fileContent += `ATTACHED LOAN PROGRAM MARKETING FLYERS & GUIDES (${selectedFlyers.length})\n`;
      fileContent += `========================================================================\n`;
      selectedFlyers.forEach((f, i) => {
        fileContent += `FLYER #${i + 1}: ${f.name} [${f.fileType.toUpperCase()}]\n`;
        fileContent += `Filename   : ${f.filename} (${f.size})\n`;
        fileContent += `Category   : ${f.category}\n`;
        fileContent += `Description: ${f.description}\n\n`;
      });
    }

    fileContent += `========================================================================\n`;
    fileContent += `Loan Officer Contact: Mike Ford | Senior Mortgage Specialist\n`;
    fileContent += `Direct Email: fordmj@gmail.com\n`;
    fileContent += `========================================================================\n`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Outlook_Property_Flyer_Attachment_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedAttachment(true);
  };

  const handleCopyHtml = () => {
    const finalHtml = generateBodyContent(true);
    const plainText = generateBodyContent(false);
    
    const blobHtml = new Blob([finalHtml], { type: "text/html" });
    const blobText = new Blob([plainText], { type: "text/plain" });
    const data = [new ClipboardItem({ "text/html": blobHtml, "text/plain": blobText })];
    
    navigator.clipboard.write(data).then(() => {
      alert("Rich HTML email body copied to clipboard! You can paste this directly into Outlook.");
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#EAE7E0] rounded-3xl max-w-6xl w-full flex flex-col md:flex-row min-h-[600px] shadow-2xl animate-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Left Sidebar - Agent Selection & Templates */}
        <div className="w-full md:w-1/3 bg-[#FAF9F5] border-r border-[#EAE7E0] flex flex-col h-[600px] md:h-[800px]">
          {/* 1. Agent Selection */}
          <div className="p-4 border-b border-[#EAE7E0]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif font-bold text-lg text-[#2D362E]">Agent Outreach</h3>
              <span className="text-[10px] bg-[#EAE7E0] text-[#2D362E] px-2 py-0.5 rounded-full font-semibold">
                {selectedAgentEmails.length} Selected
              </span>
            </div>

            {/* Recipient Category Tabs */}
            <div className="flex bg-[#EAE7E0] p-1 rounded-xl gap-1 mb-2">
              <button
                type="button"
                onClick={() => setRecipientTab('website_leads')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  recipientTab === 'website_leads'
                    ? "bg-[#C18C5D] text-white shadow-xs"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <span>🌐 Website Leads</span>
                <span className="opacity-80">({leads.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientTab('buyer')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  recipientTab === 'buyer'
                    ? "bg-[#4A5D4E] text-white shadow-xs"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <span>🟢 Buyer Agents</span>
                <span className="opacity-80">({buyerAgentList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setRecipientTab('listing')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                  recipientTab === 'listing'
                    ? "bg-[#2D362E] text-white shadow-xs"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <span>🔵 Listing Agents</span>
                <span className="opacity-80">({agentProperties.length})</span>
              </button>
            </div>

            {/* Bulk Selection / Tab Action Quick Buttons */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {recipientTab === 'website_leads' ? (
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C18C5D] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                    Chatbot Intake Leads
                  </span>
                  {selectedLeadId && (
                    <button
                      type="button"
                      onClick={() => handleGenerateAiWebsiteLeadEmail(selectedLeadId)}
                      disabled={isGenerating}
                      className="text-[11px] font-bold bg-[#C18C5D] text-white px-2 py-0.5 rounded-lg hover:bg-[#a6764c] transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      Draft Selected Lead AI Email
                    </button>
                  )}
                </div>
              ) : recipientTab === 'buyer' ? (
                <button
                  type="button"
                  onClick={() => {
                    const buyerEmails = buyerAgentList.map(a => a.email).filter(Boolean);
                    const allSelected = buyerEmails.every(e => selectedAgentEmails.includes(e));
                    if (allSelected) {
                      setSelectedAgentEmails(prev => prev.filter(e => !buyerEmails.includes(e)));
                    } else {
                      setSelectedAgentEmails(prev => Array.from(new Set([...prev, ...buyerEmails])));
                    }
                  }}
                  className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 bg-[#4A5D4E]/10 px-2.5 py-1 rounded-lg"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>Select All Buyer Agents ({buyerAgentList.length})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const listingEmails = agentProperties.map(a => a.email).filter(Boolean);
                    const allSelected = listingEmails.every(e => selectedAgentEmails.includes(e));
                    if (allSelected) {
                      setSelectedAgentEmails(prev => prev.filter(e => !listingEmails.includes(e)));
                    } else {
                      setSelectedAgentEmails(prev => Array.from(new Set([...prev, ...listingEmails])));
                    }
                  }}
                  className="text-xs font-bold text-[#2D362E] hover:underline flex items-center gap-1 bg-[#2D362E]/10 px-2.5 py-1 rounded-lg"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-[#2D362E]" />
                  <span>Select All Listing Agents ({agentProperties.length})</span>
                </button>
              )}

              {recipientTab !== 'website_leads' && selectedAgentEmails.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAgentEmails([])}
                  className="text-[11px] font-semibold text-rose-600 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Recipient Checkbox / Selection List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#EAE7E0] rounded-xl p-2 bg-white">
              {recipientTab === 'website_leads' ? (
                leads.length === 0 ? (
                  <p className="text-xs text-[#9A9488] text-center p-2">No website chatbot leads captured yet.</p>
                ) : (
                  leads.map(lead => {
                    const isSelected = selectedLeadId === lead.id;
                    return (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLeadId(lead.id);
                          if (lead.email) setSelectedAgentEmails([lead.email]);
                          handleGenerateAiWebsiteLeadEmail(lead.id);
                        }}
                        className={`p-2 rounded-xl transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#C18C5D]/10 border-[#C18C5D] ring-1 ring-[#C18C5D]/40 shadow-xs"
                            : "bg-white border-[#EAE7E0] hover:border-[#C18C5D]/50 hover:bg-[#FAF9F5]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-[#2D362E]">{lead.fullName}</span>
                          <span className="text-[9px] font-bold bg-[#C18C5D]/15 text-[#C18C5D] px-1.5 py-0.5 rounded-md">
                            {lead.status || 'New Lead'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1 text-[10px] text-[#606C5D] mb-1">
                          <span className="flex items-center gap-0.5 bg-[#F4F1EA] px-1.5 py-0.5 rounded-md">
                            <MapPin className="w-2.5 h-2.5 text-[#C18C5D]" />
                            {lead.preferredLocations}
                          </span>
                          <span className="bg-[#F4F1EA] px-1.5 py-0.5 rounded-md font-medium">
                            Budget: {lead.targetPriceRange}
                          </span>
                        </div>

                        {lead.sendSampleHomes && (
                          <div className="flex items-center gap-1 text-[9.5px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md mb-1">
                            <span>🏠 Requested Low/No Down Homes List</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[9px] text-[#9A9488] pt-1 border-t border-[#EAE7E0]/60">
                          <span className="truncate">
                            Partner Agent: <strong>{effectiveAgentRoster.find(a => a.id === lead.assignedAgentId)?.name || lead.assignedAgent || 'Sarah Jenkins'}</strong>
                          </span>
                          <span className="font-bold text-[#C18C5D] flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Auto-Draft
                          </span>
                        </div>
                      </div>
                    );
                  })
                )
              ) : recipientTab === 'buyer' ? (
                buyerAgentList.length === 0 ? (
                  <p className="text-xs text-[#9A9488] text-center p-2">No buyer agents in roster.</p>
                ) : (
                  buyerAgentList.map(agent => {
                    const isChecked = selectedAgentEmails.includes(agent.email);
                    return (
                      <label key={agent.id || agent.email} className="flex items-center gap-2 text-xs text-[#2D362E] cursor-pointer hover:bg-[#F9F8F4] p-1.5 rounded-lg transition-colors border border-transparent hover:border-[#EAE7E0]">
                        {isChecked ? <CheckSquare className="w-4 h-4 text-[#4A5D4E] shrink-0" /> : <Square className="w-4 h-4 text-[#C18C5D] shrink-0" />}
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAgentEmails(prev => [...prev, agent.email]);
                            else setSelectedAgentEmails(prev => prev.filter(em => em !== agent.email));
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-[#2D362E] truncate">{agent.name}</span>
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full shrink-0">
                              Buyer Agent
                            </span>
                          </div>
                          <p className="text-[10px] text-[#606C5D] truncate">{agent.brokerage} • {agent.email}</p>
                        </div>
                      </label>
                    );
                  })
                )
              ) : (
                agentProperties.length === 0 ? (
                  <p className="text-xs text-[#9A9488] text-center p-2">No listing agents found for current properties.</p>
                ) : (
                  agentProperties.map(agent => {
                    const isChecked = selectedAgentEmails.includes(agent.email);
                    return (
                      <label key={agent.email} className="flex items-center gap-2 text-xs text-[#2D362E] cursor-pointer hover:bg-[#F9F8F4] p-1.5 rounded-lg transition-colors border border-transparent hover:border-[#EAE7E0]">
                        {isChecked ? <CheckSquare className="w-4 h-4 text-[#2D362E] shrink-0" /> : <Square className="w-4 h-4 text-[#C18C5D] shrink-0" />}
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAgentEmails(prev => [...prev, agent.email]);
                            else setSelectedAgentEmails(prev => prev.filter(em => em !== agent.email));
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-[#2D362E] truncate">{agent.agentName}</span>
                            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full shrink-0">
                              Listing Agent ({agent.properties.length} homes)
                            </span>
                          </div>
                          <p className="text-[10px] text-[#606C5D] truncate">{agent.email}</p>
                        </div>
                      </label>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* 2. Template Selection & Tag Filtering */}
          <div className="p-4 flex-1 flex flex-col min-h-0">
            <h4 className="text-xs font-bold text-[#606C5D] uppercase mb-2">2. Choose Template</h4>
            
            {/* Search Input */}
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
              <input 
                type="text" 
                placeholder="Search by title, body, or tag..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#EAE7E0] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20"
              />
            </div>

            {/* Tag Filter Selector */}
            <div className="mb-2.5">
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#606C5D] uppercase mb-1.5">
                <TagIcon className="w-3 h-3 text-[#C18C5D]" /> Filter by Category:
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedTagFilter("All")}
                  className={`px-2.5 py-1 text-[11px] rounded-full font-semibold transition-all ${
                    selectedTagFilter === "All"
                      ? "bg-[#2D362E] text-white shadow-xs"
                      : "bg-white border border-[#EAE7E0] text-[#606C5D] hover:bg-[#F1EFE9]"
                  }`}
                >
                  All ({templates.filter(t => includeArchived || !t.isArchived).length})
                </button>
                {allAvailableTags.map(tag => {
                  const count = templates.filter(t => (includeArchived || !t.isArchived) && t.tags?.includes(tag)).length;
                  const isSelected = selectedTagFilter === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTagFilter(tag)}
                      className={`px-2.5 py-1 text-[11px] rounded-full font-semibold transition-all ${
                        isSelected
                          ? "bg-[#4A5D4E] text-white shadow-xs"
                          : "bg-white border border-[#EAE7E0] text-[#606C5D] hover:bg-[#F1EFE9]"
                      }`}
                    >
                      {tag} {count > 0 && <span className="opacity-75">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#606C5D] mb-2.5 cursor-pointer">
              <input type="checkbox" checked={includeArchived} onChange={e => setIncludeArchived(e.target.checked)} className="rounded text-[#4A5D4E]" />
              Include Archived
            </label>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <button 
                onClick={() => setActiveTemplateId("new")}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2 ${activeTemplateId === "new" ? "bg-[#4A5D4E] text-white border-[#4A5D4E]" : "bg-white border-dashed border-[#C18C5D] text-[#606C5D] hover:bg-[#F1EFE9]"}`}
              >
                <Plus className="w-4 h-4" />
                <span className="font-semibold text-xs">Create New Template</span>
              </button>
              
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-6 px-4 bg-white rounded-xl border border-[#EAE7E0]">
                  <p className="text-xs text-[#9A9488]">No templates match the active filter or tag.</p>
                </div>
              ) : (
                filteredTemplates.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setActiveTemplateId(t.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group ${
                      activeTemplateId === t.id 
                        ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm" 
                        : "bg-white border-[#EAE7E0] text-[#2D362E] hover:border-[#4A5D4E]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-xs truncate pr-2">{t.title}</span>
                      <button 
                        onClick={(e) => toggleArchive(t.id, e)}
                        className={`shrink-0 p-1 rounded hover:bg-black/10 ${activeTemplateId === t.id ? "text-white/80 hover:text-white" : "text-[#9A9488] hover:text-[#2D362E]"}`}
                        title={t.isArchived ? "Restore" : "Archive"}
                      >
                        {t.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${activeTemplateId === t.id ? "text-white/80" : "text-[#9A9488]"}`}>{t.subject}</p>
                    
                    {/* Tags Badges */}
                    {t.tags && t.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {t.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              activeTemplateId === t.id 
                                ? "bg-white/20 text-white" 
                                : "bg-[#FAF9F5] border border-[#EAE7E0] text-[#606C5D]"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Editor & Launch in Outlook Controls */}
        <div className="w-full md:w-2/3 bg-white flex flex-col h-[600px] md:h-[800px] relative">
          <button onClick={onClose} className="absolute right-4 top-4 p-2 text-[#9A9488] hover:bg-[#F1EFE9] rounded-full z-10 transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6 md:p-8 flex-1 flex flex-col border-b border-[#EAE7E0] min-h-0 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pr-8">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-serif font-bold text-2xl text-[#2D362E]">Draft Email Builder</h3>
                  <button
                    type="button"
                    onClick={handleGenerateAiBuyerEmail}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-[#4A5D4E] to-[#2D362E] hover:opacity-95 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>{isGenerating ? "AI Generating..." : "✨ AI Studio: Attract Buyer Agents"}</span>
                  </button>
                  {isEditing && autoSaveStatus === 'saving' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 animate-pulse">
                      <Save className="w-3 h-3 text-amber-600" />
                      Auto-saving...
                    </span>
                  )}
                  {isEditing && autoSaveStatus === 'saved' && lastSavedTime && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Auto-saved to local state at {lastSavedTime}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#606C5D]">Pre-encoded for Microsoft Outlook & Desktop Email Clients</p>
              </div>
              {!isEditing && activeTemplateId !== "new" && (
                <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-[#C18C5D] hover:underline">Edit Template</button>
              )}
            </div>

            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#606C5D] uppercase mb-1">Template Title</label>
                    <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-[#EAE7E0] focus:outline-none focus:border-[#4A5D4E] text-sm" placeholder="e.g. USDA Outreach" />
                  </div>
                  
                  {/* Category Tags Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#606C5D] uppercase mb-1.5">Categorize Tags</label>
                    <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl p-3 space-y-2.5">
                      {/* Active Edit Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                        {editTags.length === 0 ? (
                          <span className="text-xs text-[#9A9488] italic">No tags selected. Click standard tags below or add custom tag.</span>
                        ) : (
                          editTags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4A5D4E] text-white">
                              {tag}
                              <button onClick={() => toggleTagInEditor(tag)} className="hover:text-rose-200">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Quick Toggle Presets */}
                      <div className="pt-2 border-t border-[#EAE7E0] flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-[#606C5D] font-semibold">Quick Presets:</span>
                        {PRESET_TAGS.map(tag => {
                          const isSelected = editTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTagInEditor(tag)}
                              className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all ${
                                isSelected 
                                  ? "bg-[#C18C5D] text-white" 
                                  : "bg-white border border-[#EAE7E0] text-[#606C5D] hover:bg-[#F1EFE9]"
                              }`}
                            >
                              {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Tag Input */}
                      <div className="pt-2 border-t border-[#EAE7E0] flex items-center gap-2">
                        <input 
                          type="text" 
                          value={customTagInput} 
                          onChange={e => setCustomTagInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomTag();
                            }
                          }}
                          placeholder="Type custom tag (e.g. Rate Buydown)..." 
                          className="flex-1 px-3 py-1 text-xs rounded-lg border border-[#EAE7E0] bg-white focus:outline-none focus:border-[#4A5D4E]"
                        />
                        <button 
                          type="button"
                          onClick={handleAddCustomTag}
                          className="px-3 py-1 bg-[#2D362E] text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#606C5D] uppercase mb-1">Subject Line</label>
                    <input type="text" value={editSubject} onChange={e => setEditSubject(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-[#EAE7E0] focus:outline-none focus:border-[#4A5D4E] text-sm" />
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="block text-xs font-bold text-[#606C5D] uppercase mb-1">Email Body (Plain Text / Light HTML)</label>
                    <textarea 
                      value={editBody} 
                      onChange={e => setEditBody(e.target.value)} 
                      className="w-full flex-1 p-4 rounded-xl border border-[#EAE7E0] focus:outline-none focus:border-[#4A5D4E] resize-none font-sans text-sm text-[#2D362E] min-h-[120px]"
                      placeholder="Type your email here..."
                    />
                  </div>

                  {/* Attach Marketing Material Section */}
                  <div className="border border-[#EAE7E0] bg-[#FAF9F5] rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-[#4A5D4E]" />
                        <h4 className="font-bold text-xs uppercase text-[#2D362E] tracking-wide">
                          Attach Loan Program Marketing Flyers
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#4A5D4E] text-white">
                          {selectedFlyerIds.length} flyer(s) selected
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#4A5D4E] hover:bg-[#3B4A3E] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs">
                          <Upload className="w-3 h-3" />
                          <span>+ Upload Flyer</span>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleCustomFlyerUpload} />
                        </label>
                        <button 
                          type="button" 
                          onClick={() => setIsFlyerSectionExpanded(!isFlyerSectionExpanded)}
                          className="p-1 text-[#606C5D] hover:text-[#2D362E]"
                        >
                          {isFlyerSectionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isFlyerSectionExpanded && (
                      <>
                        {/* Search & Category Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                            <input 
                              type="text" 
                              placeholder="Search flyers by title, category, or keyword..." 
                              value={flyerSearchQuery}
                              onChange={e => setFlyerSearchQuery(e.target.value)}
                              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-[#EAE7E0] bg-white focus:outline-none focus:border-[#4A5D4E]"
                            />
                          </div>
                          
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                            {['All', 'USDA', 'Flex', 'Rate Buydown', 'General', 'Custom Uploads'].map(cat => {
                              const isCatSelected = selectedFlyerCategory === cat;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setSelectedFlyerCategory(cat)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                                    isCatSelected 
                                      ? "bg-[#2D362E] text-white shadow-xs" 
                                      : "bg-white border border-[#EAE7E0] text-[#606C5D] hover:bg-[#F1EFE9]"
                                  }`}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Grouped Flyers Grid */}
                        {(() => {
                          const filtered = flyers.filter(f => {
                            if (selectedFlyerCategory !== 'All' && f.category !== selectedFlyerCategory) return false;
                            if (flyerSearchQuery) {
                              const q = flyerSearchQuery.toLowerCase();
                              return f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || f.filename.toLowerCase().includes(q);
                            }
                            return true;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="bg-white rounded-xl border border-dashed border-[#EAE7E0] p-6 text-center">
                                <p className="text-xs text-[#606C5D]">No marketing flyers found matching your filter.</p>
                                <button 
                                  type="button"
                                  onClick={() => { setFlyerSearchQuery(""); setSelectedFlyerCategory("All"); }}
                                  className="mt-2 text-xs font-semibold text-[#C18C5D] underline hover:text-[#A87447]"
                                >
                                  Reset filters
                                </button>
                              </div>
                            );
                          }

                          // Group filtered flyers by category
                          const grouped: Record<string, MarketingFlyer[]> = {};
                          const categoryOrder = ['USDA', 'Flex', 'Rate Buydown', 'General', 'Custom Uploads'];
                          
                          filtered.forEach(f => {
                            const catKey = f.category || 'General';
                            if (!grouped[catKey]) grouped[catKey] = [];
                            grouped[catKey].push(f);
                          });

                          // Sort category keys according to explicit categoryOrder
                          const sortedCategories = Object.keys(grouped).sort((a, b) => {
                            const idxA = categoryOrder.indexOf(a);
                            const idxB = categoryOrder.indexOf(b);
                            return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
                          });

                          return (
                            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                              {sortedCategories.map(category => {
                                const items = grouped[category];
                                const meta = CATEGORY_META[category] || { 
                                  label: `${category} Collateral`, 
                                  icon: '📁', 
                                  badgeColor: 'bg-gray-100 text-gray-800 border-gray-300', 
                                  bgTint: 'border-l-4 border-l-gray-500' 
                                };
                                const selectedCount = items.filter(f => selectedFlyerIds.includes(f.id)).length;

                                return (
                                  <div key={category} className={`bg-white rounded-xl border border-[#EAE7E0] p-3 shadow-2xs ${meta.bgTint}`}>
                                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#EAE7E0]">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{meta.icon}</span>
                                        <h5 className="font-bold text-xs text-[#2D362E] uppercase tracking-wider">{meta.label}</h5>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${meta.badgeColor}`}>
                                          {items.length} flyer{items.length > 1 ? 's' : ''}
                                        </span>
                                      </div>
                                      {selectedCount > 0 && (
                                        <span className="text-[10px] font-bold text-[#4A5D4E] bg-[#4A5D4E]/10 px-2 py-0.5 rounded-md border border-[#4A5D4E]/20">
                                          ✓ {selectedCount} attached
                                        </span>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                      {items.map(flyer => {
                                        const isSelected = selectedFlyerIds.includes(flyer.id);
                                        return (
                                          <div 
                                            key={flyer.id}
                                            onClick={() => {
                                              setSelectedFlyerIds(prev => 
                                                isSelected ? prev.filter(id => id !== flyer.id) : [...prev, flyer.id]
                                              );
                                            }}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                                              isSelected 
                                                ? "bg-[#FAF9F5] border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20 shadow-xs" 
                                                : "bg-white border-[#EAE7E0] hover:border-[#9A9488]"
                                            }`}
                                          >
                                            <div>
                                              <div className="flex items-center justify-between mb-1.5">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                                  flyer.fileType === 'pdf' 
                                                    ? "bg-rose-100 text-rose-800 border border-rose-200" 
                                                    : "bg-sky-100 text-sky-800 border border-sky-200"
                                                }`}>
                                                  {flyer.fileType === 'pdf' ? <FileText className="w-3 h-3 text-rose-600" /> : <ImageIcon className="w-3 h-3 text-sky-600" />}
                                                  <span>{flyer.fileType.toUpperCase()}</span>
                                                </span>
                                                
                                                <div className="flex items-center gap-1.5">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setPreviewingFlyer(flyer);
                                                    }}
                                                    title={`Preview ${flyer.fileType.toUpperCase()} flyer content`}
                                                    className="p-1 rounded-md bg-white text-[#C18C5D] hover:bg-[#C18C5D] hover:text-white border border-[#EAE7E0] transition-all flex items-center gap-1 text-[10px] font-semibold"
                                                  >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Preview</span>
                                                  </button>
                                                  {isSelected ? (
                                                    <CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />
                                                  ) : (
                                                    <Square className="w-4 h-4 text-[#9A9488] group-hover:text-[#4A5D4E]" />
                                                  )}
                                                </div>
                                              </div>

                                              <h5 className="font-bold text-xs text-[#2D362E] line-clamp-1">{flyer.name}</h5>
                                              <p className="text-[10px] text-[#606C5D] font-medium mt-0.5">{flyer.category} • {flyer.size}</p>
                                              <p className="text-[11px] text-[#9A9488] line-clamp-2 mt-1 leading-snug">{flyer.description}</p>
                                            </div>

                                            <div className="mt-2.5 pt-2 border-t border-[#EAE7E0] flex items-center justify-between">
                                              <span className="text-[10px] font-mono text-[#9A9488] truncate max-w-[120px]" title={flyer.filename}>
                                                {flyer.filename}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setPreviewingFlyer(flyer);
                                                }}
                                                className="text-[11px] font-semibold text-[#C18C5D] hover:text-[#A87447] inline-flex items-center gap-0.5"
                                              >
                                                <Eye className="w-3 h-3" />
                                                <span>Preview</span>
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>

                  {/* AI Assistant Box */}
                  <div className="bg-gradient-to-r from-[#F1EFE9] to-white border border-[#EAE7E0] p-4 rounded-xl flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#C18C5D] uppercase mb-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Template Assistant
                      </label>
                      <input 
                        type="text" 
                        value={aiPrompt}
                        onChange={e => setAiPrompt(e.target.value)}
                        placeholder="e.g. Write a professional follow up about their Open House..."
                        className="w-full px-3 py-2 rounded-lg border border-[#EAE7E0] text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
                      />
                    </div>
                    <button 
                      onClick={handleGenerateAI}
                      disabled={isGenerating || !aiPrompt}
                      className="px-4 py-2 bg-[#C18C5D] hover:bg-[#A87447] text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? "Thinking..." : "Generate"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {hasRestoredDraft && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#C18C5D] font-medium bg-[#C18C5D]/10 px-2.5 py-1 rounded-lg">
                            ⚡ Draft auto-restored from previous session
                          </span>
                          <button 
                            type="button" 
                            onClick={handleDiscardDraft} 
                            className="inline-flex items-center gap-1 text-xs text-[#9A9488] hover:text-[#2D362E] underline"
                            title="Discard un-saved local draft and revert to original template"
                          >
                            <RotateCcw className="w-3 h-3" /> Revert
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {isEditing && !hasRestoredDraft && autoSaveStatus === 'saved' && lastSavedTime && (
                        <span className="text-xs text-[#9A9488]">
                          Auto-saved locally ({lastSavedTime})
                        </span>
                      )}
                      <button onClick={handleSave} className="px-6 py-2.5 bg-[#4A5D4E] text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-sm">Save Template</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#EAE7E0] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm font-semibold text-[#606C5D]">Subject: <span className="text-[#2D362E] font-bold">{editSubject}</span></p>
                      {editTags && editTags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <TagIcon className="w-3 h-3 text-[#C18C5D]" />
                          {editTags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#4A5D4E]/10 text-[#4A5D4E]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Format Options Checkboxes */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE7E0] text-xs text-[#606C5D]">
                      <label className="flex items-center gap-2 cursor-pointer font-medium hover:text-[#2D362E]">
                        <input 
                          type="checkbox" 
                          checked={includePropertyLinks} 
                          onChange={e => setIncludePropertyLinks(e.target.checked)} 
                          className="rounded text-[#0078D4] focus:ring-[#0078D4]" 
                        />
                        Include Live Property Web Links & Specs Overview
                      </label>

                      {downloadedAttachment ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3" /> Datasheet Attachment Downloaded
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#9A9488]">
                          Attachment ready for Outlook
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Real-time Email Preview */}
                  <div className="flex-1 bg-white border border-[#EAE7E0] rounded-xl p-6 overflow-y-auto font-sans text-sm text-[#2D362E] leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: generateBodyContent(true) }} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 bg-[#FAF9F5] border-t border-[#EAE7E0] flex flex-col gap-3">
            {/* Outlook Tip Callout */}
            <div className="flex items-center gap-2 text-xs text-[#0078D4] bg-blue-50/80 border border-blue-200/60 p-2.5 rounded-xl">
              <Info className="w-4 h-4 shrink-0 text-[#0078D4]" />
              <span>
                <strong>Outlook Integration:</strong> Clicking <strong>Launch in Outlook</strong> uses pre-encoded <code className="bg-white/80 px-1 py-0.5 rounded border border-blue-200 font-mono text-[11px]">mailto:</code> parameters. Download the property datasheet below to attach directly to your draft.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#606C5D]">
                <span className="font-bold text-[#2D362E]">{selectedAgentEmails.length}</span> agent(s) targeted
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Download Attachment Sheet */}
                <button 
                  onClick={handleDownloadAttachment}
                  title="Download formatted property datasheet file to attach in Outlook"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-white text-[#2D362E] font-semibold text-xs hover:bg-[#F1EFE9] transition-all shadow-xs"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#C18C5D]" />
                  <span>Download Datasheet (.txt)</span>
                </button>

                {/* Download Selected Flyers Button */}
                {selectedFlyerIds.length > 0 && (
                  <button 
                    onClick={handleDownloadSelectedFlyers}
                    title="Download selected loan program flyers for email attachment"
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#4A5D4E]/30 bg-[#4A5D4E]/10 text-[#4A5D4E] font-semibold text-xs hover:bg-[#4A5D4E]/20 transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Download Flyers ({selectedFlyerIds.length})</span>
                  </button>
                )}

                {/* Copy HTML for Outlook */}
                <button 
                  onClick={handleCopyHtml}
                  title="Copy rich HTML body with clickable property links to clipboard"
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#4A5D4E] text-[#4A5D4E] font-semibold text-xs hover:bg-[#4A5D4E]/5 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy HTML Body</span>
                </button>

                {/* Launch in Outlook Primary Action Button */}
                <button 
                  onClick={launchInOutlook}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0078D4] hover:bg-[#005A9E] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Mail className="w-4 h-4" />
                  <span>Launch in Outlook</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Flyer Preview Modal */}
      {previewingFlyer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE7E0] relative flex flex-col gap-4">
            <button 
              onClick={() => setPreviewingFlyer(null)}
              className="absolute right-4 top-4 p-1.5 text-[#9A9488] hover:bg-[#F1EFE9] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className={`p-3 rounded-xl ${previewingFlyer.fileType === 'pdf' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'}`}>
                {previewingFlyer.fileType === 'pdf' ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C18C5D]">{previewingFlyer.category}</span>
                <h3 className="font-serif font-bold text-lg text-[#2D362E]">{previewingFlyer.name}</h3>
                <p className="text-xs font-mono text-[#9A9488]">{previewingFlyer.filename} ({previewingFlyer.size})</p>
              </div>
            </div>

            {/* Flyer Mock Visual Container */}
            <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                <span className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> Official Loan Officer Marketing Sheet
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  Ready for Agent Email
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#2D362E] uppercase tracking-wide">Program Highlights</h4>
                <p className="text-xs text-[#606C5D] leading-relaxed bg-white p-3 rounded-lg border border-[#EAE7E0]">
                  {previewingFlyer.description}
                </p>
              </div>

              <div className="text-[11px] text-[#9A9488] pt-1 flex items-center justify-between">
                <span>Format: {previewingFlyer.fileType.toUpperCase()} Datasheet</span>
                <span>GeoSphere Mortgage License #987654</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const flyer = previewingFlyer;
                  const isSelected = selectedFlyerIds.includes(flyer.id);
                  setSelectedFlyerIds(prev => 
                    isSelected ? prev.filter(id => id !== flyer.id) : [...prev, flyer.id]
                  );
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  selectedFlyerIds.includes(previewingFlyer.id)
                    ? "bg-[#4A5D4E] text-white"
                    : "bg-white border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#4A5D4E]/5"
                }`}
              >
                {selectedFlyerIds.includes(previewingFlyer.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Attached to Outreach</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Attach to Outreach</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const flyer = previewingFlyer;
                  let content = `========================================================================\n`;
                  content += `GEOSPHERE MORTGAGE MARKETING FLYER: ${flyer.name.toUpperCase()}\n`;
                  content += `Filename : ${flyer.filename}\n`;
                  content += `Category : ${flyer.category} | File Format: ${flyer.fileType.toUpperCase()} | Size: ${flyer.size}\n`;
                  content += `========================================================================\n\n`;
                  content += `PROGRAM HIGHLIGHTS & AGENT MARKETING SHEET:\n`;
                  content += `${flyer.description}\n\n`;
                  content += `LOAN OFFICER CONTACT & BRANDING:\n`;
                  content += `Mike Ford, Senior Loan Officer\n`;
                  content += `GeoSphere Mortgage & Zone Financing Solutions\n`;
                  content += `Direct Phone: (555) 234-5678 | Email: m.ford@geospheremortgage.com\n`;
                  content += `NMLS License ID: #987654\n`;
                  content += `========================================================================\n`;

                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = flyer.filename.replace(/\.(pdf|jpg|png)$/i, '') + '_Flyer.txt';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-[#2D362E] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Sample Flyer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
