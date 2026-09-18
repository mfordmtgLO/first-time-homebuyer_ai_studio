import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Inbox, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Users, 
  Upload, 
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  Share2,
  Send,
  Layers,
  Sliders,
  Eye,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  Flame,
  Zap,
  ChevronRight,
  Info,
  Home,
  ArrowUpRight,
  BarChart2,
  TrendingUp,
  CheckSquare,
  Square,
  ShieldCheck,
  Video,
  X
} from 'lucide-react';
import { 
  PropertyListing, 
  ProfessionalGuidesState, 
  LoanOfficerProfile, 
  RealEstateAgentProfile 
} from '../types';
import { getPropertyOhcsPriceLimit, normalizeOregonCounty } from '../utils/ohcsPurchaseLimits';
import { parseGeoSpherePayload, GEOSPHERE_MOCK_LISTINGS } from '../data/geoSphereData';
import { formatUSD } from '../utils/mortgageMath';
import { 
  buildFthbVantageAdPackage, 
  pushFthbBatchToVantageStudio, 
  FthbVantageAdPackage, 
  FthbPropertyEval, 
  BuyerFinancials 
} from '../utils/fthbAdStudioBridge';
import { 
  UsdaProgramBadge, 
  OhcsProgramBadge, 
  LakeviewProgramBadge 
} from './fthb/ProgramBadgeWithTooltip';
import { launchLocalOutlookDraft } from '../utils/outlookEmailService';

// USDA Income Limits (2026 Oregon & Pacific Northwest Tiers)
const getUsdaIncomeLimit = (county: string, householdSize: number) => {
  const isLarge = householdSize > 4;
  const pdxMetro = ['Multnomah', 'Washington', 'Clackamas', 'Yamhill', 'Columbia'];
  const seaMetro = ['King', 'Snohomish', 'Pierce'];
  
  if (pdxMetro.includes(county)) {
    return isLarge ? 178850 : 135500;
  }
  if (seaMetro.includes(county)) {
    return isLarge ? 229100 : 173550;
  }
  // Default Oregon Counties
  return isLarge ? 148450 : 112450;
};

// Lakeview AMI 140% Limits
const getLakeviewLimit = (county: string) => {
  const pdxMetro = ['Multnomah', 'Washington', 'Clackamas', 'Yamhill', 'Columbia'];
  const seaMetro = ['King', 'Snohomish', 'Pierce'];
  
  if (pdxMetro.includes(county)) return 160160;
  if (seaMetro.includes(county)) return 206360;
  return 124600;
};

const parseCSV = (text: string): PropertyListing[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  
  const listings: PropertyListing[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
    const values = row.map(v => v.trim().replace(/^"|"$/g, ''));
    
    if (values.length === 0 || values.join('') === '') continue;

    const getValue = (keyAliases: string[]) => {
      for (const alias of keyAliases) {
        const index = headers.findIndex(h => h.includes(alias));
        if (index !== -1 && values[index]) return values[index];
      }
      return undefined;
    };

    const priceStr = getValue(['price', 'amount', 'cost']) || '0';
    const price = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    const isTruthy = (val: any) => ['true', 'yes', 'y', '1'].includes(String(val).toLowerCase());

    const listing: PropertyListing = {
      id: `csv-${Date.now()}-${i}`,
      title: getValue(['title', 'name']) || getValue(['address']) || 'Imported Property',
      address: getValue(['address', 'street']) || 'Unknown Address',
      city: getValue(['city']) || 'Unknown City',
      state: getValue(['state']) || 'OR',
      zip: getValue(['zip', 'postal']) || '00000',
      price,
      beds: parseInt(getValue(['bed']) || '0') || 3,
      baths: parseInt(getValue(['bath']) || '0') || 2,
      sqft: parseInt(getValue(['sqft', 'square', 'area']) || '0') || 1600,
      yearBuilt: parseInt(getValue(['year', 'built']) || '0') || 1995,
      propertyType: 'Single Family',
      status: 'saved',
      notes: 'Imported from CSV',
      daysOnMarket: parseInt(getValue(['dom', 'days']) || '0') || 7,
      hoaMonthly: parseInt(getValue(['hoa']) || '0') || 0,
      propertyTaxAnnual: parseInt(getValue(['tax']) || '0') || Math.round(price * 0.011),
      isFavorite: false,
      overlayEligibility: {
        usdaEligible: isTruthy(getValue(['usda'])),
        lmiEligible: isTruthy(getValue(['lmi', 'firsthome', 'ohcs'])),
        lakeviewNationalEligible: isTruthy(getValue(['lakeview'])),
      }
    };
    listings.push(listing);
  }
  return listings;
};

export interface FTHBPipelineDashboardProps {
  guidesState?: ProfessionalGuidesState;
  onUpdateGuidesState?: (newState: ProfessionalGuidesState) => void;
  currentLo?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  properties?: PropertyListing[];
  setProperties?: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  onTriggerToast?: (msg: string) => void;
  onNavigateToAdsPortal?: () => void;
}

export const FTHBPipelineDashboard: React.FC<FTHBPipelineDashboardProps> = ({
  guidesState,
  onUpdateGuidesState,
  currentLo,
  activeAgent,
  properties,
  setProperties,
  onTriggerToast,
  onNavigateToAdsPortal
}) => {
  // Initialize with passed properties or default sample listings
  const [pipeline, setPipeline] = useState<PropertyListing[]>(() => {
    if (properties && properties.length > 0) return properties;
    if (guidesState?.syncedProperties && guidesState.syncedProperties.length > 0) return guidesState.syncedProperties;
    return GEOSPHERE_MOCK_LISTINGS.slice(0, 8);
  });

  // Re-sync pipeline reactively whenever properties or guidesState.syncedProperties changes from GeoSphere Map
  useEffect(() => {
    if (properties && properties.length > 0) {
      setPipeline(properties);
    } else if (guidesState?.syncedProperties && guidesState.syncedProperties.length > 0) {
      setPipeline(guidesState.syncedProperties);
    }
  }, [properties, guidesState?.syncedProperties]);

  // Interactive Program Qualifier Panel States
  const [householdIncome, setHouseholdIncome] = useState<number>(95000);
  const [householdSize, setHouseholdSize] = useState<number>(3); // 1-8
  const [borrowerIncome, setBorrowerIncome] = useState<number>(85000);
  const [buyerMonthlyDebt, setBuyerMonthlyDebt] = useState<number>(450);
  const [targetDti, setTargetDti] = useState<number>(43); // 36% - 50%
  
  // Program Filtering
  const [programFilter, setProgramFilter] = useState<'all' | 'qualified_only' | 'usda' | 'lakeview' | 'ohcs' | 'stacked'>('all');
  const [hideIneligible, setHideIneligible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Multi-Selection State
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());

  // Vantage AI Ad Studio Modal & Curation Drawer
  const [isVantageStudioOpen, setIsVantageStudioOpen] = useState<boolean>(false);
  const [activeStudioIndex, setActiveStudioIndex] = useState<number>(0);
  const [studioActiveTab, setStudioActiveTab] = useState<'creative' | 'adbrain' | 'stacking' | 'outreach'>('creative');
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  // File Upload & Drag-and-Drop
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let importedListings: PropertyListing[] = [];
        
        if (file.name.toLowerCase().endsWith('.json')) {
          const parsed = JSON.parse(text);
          importedListings = parseGeoSpherePayload(parsed);
        } else if (file.name.toLowerCase().endsWith('.csv')) {
          importedListings = parseCSV(text);
        }
        
        if (importedListings.length > 0) {
          setPipeline(prev => {
            const newMap = new Map<string, PropertyListing>();
            prev.forEach(p => newMap.set(p.id, p));
            importedListings.forEach(p => newMap.set(p.id, p));
            const updated = Array.from(newMap.values());
            if (setProperties) {
              setProperties(updated);
            }
            return updated;
          });
          if (onTriggerToast) {
            onTriggerToast(`✓ Successfully imported ${importedListings.length} properties from ${file.name}`);
          }
        } else {
          alert("No properties found in the file.");
        }
      } catch (err) {
        console.error("Failed to parse file", err);
        alert("Failed to parse file. Make sure it's a valid GeoSphere CSV or JSON export.");
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Direct sync from GeoSphere Oregon GIS Map catalog into FTHB Pipeline
  const syncFromGeoSphereMap = () => {
    setIsImporting(true);
    setTimeout(() => {
      const sourceListings = (guidesState?.syncedProperties && guidesState.syncedProperties.length > 0)
        ? guidesState.syncedProperties
        : (properties && properties.length > 0)
          ? properties
          : GEOSPHERE_MOCK_LISTINGS;

      setPipeline(sourceListings);
      if (setProperties) {
        setProperties(sourceListings);
      }
      setIsImporting(false);
      if (onTriggerToast) {
        onTriggerToast(`⚡ Synced all ${sourceListings.length} GeoSphere Map GIS listings into FTHB Property Receiver Queue!`);
      }
    }, 400);
  };

  const simulateSyncPush = () => {
    setIsImporting(true);
    setTimeout(() => {
      const cities = ["Junction City", "Coos Bay", "Bend", "Eugene", "Salem", "Portland"];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomPrice = 365000 + Math.floor(Math.random() * 180000);
      
      const newListing: PropertyListing = {
        id: `geosync-${Date.now()}`,
        title: `${randomCity} FTHB Opportunity`,
        address: `${100 + Math.floor(Math.random() * 899)} Pacific Highway`,
        city: randomCity,
        state: "OR",
        zip: "97448",
        price: randomPrice,
        beds: 3,
        baths: 2,
        sqft: 1650,
        yearBuilt: 2004,
        propertyType: "Single Family",
        status: "saved",
        notes: "Real-time push from GeoSphere Map webhook with full GIS layer tagging",
        daysOnMarket: 3,
        hoaMonthly: 0,
        propertyTaxAnnual: Math.round(randomPrice * 0.011),
        isFavorite: false,
        overlayEligibility: {
          usdaEligible: true,
          lmiEligible: true,
          lakeviewNationalEligible: true,
          firstHomeEligible: true
        }
      };
      
      setPipeline(prev => {
        const next = [newListing, ...prev];
        if (setProperties) setProperties(next);
        return next;
      });
      setIsImporting(false);
      if (onTriggerToast) {
        onTriggerToast(`⚡ Received real-time GeoSphere push: ${newListing.address}, ${newListing.city}`);
      }
    }, 900);
  };

  const resetToSamplePipeline = () => {
    const samples = GEOSPHERE_MOCK_LISTINGS.slice(0, 10);
    setPipeline(samples);
    if (setProperties) setProperties(samples);
    if (onTriggerToast) onTriggerToast("Loaded 10 pre-screened Oregon FTHB sample properties.");
  };

  // Buyer Financial State calculation
  const buyerFinancials: BuyerFinancials = useMemo(() => ({
    householdIncome,
    householdSize,
    borrowerIncome,
    monthlyDebt: buyerMonthlyDebt,
    targetDti
  }), [householdIncome, householdSize, borrowerIncome, buyerMonthlyDebt, targetDti]);

  // Max housing budget & estimated purchasing power
  const maxHousingBudget = useMemo(() => {
    const grossMonthly = borrowerIncome > 0 ? borrowerIncome / 12 : 1;
    return Math.max(0, (grossMonthly * (targetDti / 100)) - buyerMonthlyDebt);
  }, [borrowerIncome, targetDti, buyerMonthlyDebt]);

  // Process and evaluate each listing against program requirements
  const evaluatedListings = useMemo(() => {
    return pipeline.map(listing => {
      const county = normalizeOregonCounty(listing.county, listing.city);
      
      // USDA RD Logic
      const usdaLimit = getUsdaIncomeLimit(county, householdSize);
      const isUsdaArea = Boolean(listing.overlayEligibility?.usdaEligible || listing.overlayEligibility?.usda);
      const meetsUsdaIncome = householdIncome <= usdaLimit;
      const usdaQualifies = isUsdaArea && meetsUsdaIncome;
      const usdaZoneName = listing.overlayEligibility?.usdaZoneName || (isUsdaArea ? 'USDA RD Rural Standard Zone' : 'Ineligible Urban Cluster');
      const usdaHeadroom = usdaLimit - householdIncome;
      const usdaReason = usdaQualifies
        ? `Household income (${formatUSD(householdIncome)}) is below the ${county} County limit (${formatUSD(usdaLimit)}) for ${householdSize} person(s), and the property is situated in an eligible USDA Rural Area.`
        : !isUsdaArea
          ? `Property is located in an ineligible urban/suburban zone outside the designated USDA Rural boundary.`
          : `Household income (${formatUSD(householdIncome)}) exceeds the ${county} County limit (${formatUSD(usdaLimit)}) for a ${householdSize}-person household.`;

      // Lakeview 140% AMI Logic
      const lakeviewLimit = getLakeviewLimit(county);
      const meetsLakeviewIncome = borrowerIncome <= lakeviewLimit;
      const lakeviewQualifies = meetsLakeviewIncome;
      const lakeviewHeadroom = lakeviewLimit - borrowerIncome;
      const lakeviewReason = lakeviewQualifies
        ? `Borrower qualifying income (${formatUSD(borrowerIncome)}) is within the ${county} County 140% AMI limit (${formatUSD(lakeviewLimit)}). No first-time homebuyer restriction.`
        : `Borrower qualifying income (${formatUSD(borrowerIncome)}) exceeds the 140% AMI limit of ${formatUSD(lakeviewLimit)}.`;

      // OHCS FirstHome Logic
      const censusTract = listing.overlayEligibility?.lmiCensusTract || 
        listing.overlayEligibility?.geoid || 
        (listing.mlsNumber ? `Tract 4101100${listing.mlsNumber.slice(-2)}` : `Tract 410110010`);

      const ohcs = getPropertyOhcsPriceLimit(
        listing.price, 
        county, 
        listing.city, 
        censusTract,
        listing.overlayEligibility?.targetedArea
      );
      const isLmiArea = Boolean(listing.overlayEligibility?.lmiEligible || listing.overlayEligibility?.lmi);
      const isTargeted = Boolean(listing.overlayEligibility?.targetedArea || ohcs.isTargeted);
      const ohcsQualifies = (isLmiArea || isTargeted) && ohcs.isPriceEligible;
      const lmiPercentage = listing.overlayEligibility?.lmiPercentage ?? (isLmiArea ? 74 : (isTargeted ? 82 : 94));
      const ohcsHeadroom = ohcs.applicablePriceLimit - listing.price;
      const ohcsReason = ohcsQualifies
        ? `Listing price (${formatUSD(listing.price)}) is below the ${isTargeted ? 'Targeted' : 'Non-Targeted'} cap (${formatUSD(ohcs.applicablePriceLimit)}) and census tract (${censusTract}) qualifies for $15k DPA.`
        : !ohcs.isPriceEligible
          ? `Listing price (${formatUSD(listing.price)}) exceeds the OHCS ${county} County ${isTargeted ? 'Targeted' : 'Standard'} limit of ${formatUSD(ohcs.applicablePriceLimit)}.`
          : `Census tract (${censusTract}) is not designated as an LMI tract (≤80% AMI) or Targeted Census Area.`;

      // Benefit-Stacked: qualifies for 2 or more programs
      const qualifiesCount = (usdaQualifies ? 1 : 0) + (lakeviewQualifies ? 1 : 0) + (ohcsQualifies ? 1 : 0);
      const stackedQualifies = qualifiesCount >= 2;

      // Mortgage Math & RentCast Comps
      const downPayment = usdaQualifies ? 0 : Math.round(listing.price * 0.035);
      const loanAmount = Math.max(0, listing.price - downPayment);
      
      // 30-year fixed estimate at 6.375%
      const r = 0.06375 / 12;
      const n = 360;
      const pi = loanAmount > 0 
        ? Math.round(loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
        : 0;
      
      const taxMonthly = listing.propertyTaxAnnual 
        ? Math.round(listing.propertyTaxAnnual / 12) 
        : Math.round((listing.price * 0.011) / 12);
      
      const insMonthly = 115;
      const pmiMonthly = usdaQualifies ? 0 : Math.round((loanAmount * 0.005) / 12);
      const estimatedMonthlyPayment = pi + taxMonthly + insMonthly + pmiMonthly + (listing.hoaMonthly || 0);

      // RentCast Comps
      const rentcastEstRent = Math.round(listing.price * 0.0054);
      const monthlyRentSavings = rentcastEstRent - estimatedMonthlyPayment;

      // DTI Calculation
      const grossMonthly = borrowerIncome > 0 ? borrowerIncome / 12 : 1;
      const totalDebt = estimatedMonthlyPayment + buyerMonthlyDebt;
      const buyerDtiPct = Math.round((totalDebt / grossMonthly) * 1000) / 10;
      const dtiStatus: 'pass' | 'caution' | 'fail' = 
        buyerDtiPct <= targetDti ? 'pass' : (buyerDtiPct <= targetDti + 3 ? 'caution' : 'fail');

      const evalData: FthbPropertyEval = {
        county,
        usdaQualifies,
        lakeviewQualifies,
        ohcsQualifies,
        stackedQualifies,
        usdaLimit,
        lakeviewLimit,
        ohcsPriceLimit: ohcs.applicablePriceLimit,
        isLmiArea,
        estimatedMonthlyPayment,
        rentcastEstRent,
        monthlyRentSavings,
        buyerDtiPct,
        dtiStatus,
        maxAllowableBudget: maxHousingBudget,

        // USDA Metadata
        usdaHouseholdIncome: householdIncome,
        usdaHouseholdSize: householdSize,
        usdaIsRuralArea: isUsdaArea,
        usdaZoneName,
        usdaHeadroom,
        usdaReason,

        // OHCS Metadata
        ohcsCensusTract: censusTract,
        ohcsIsTargeted: isTargeted,
        ohcsLmiPercentage: lmiPercentage,
        ohcsLmiEligible: isLmiArea,
        ohcsApplicablePriceLimit: ohcs.applicablePriceLimit,
        ohcsNonTargetedLimit: ohcs.nonTargetedLimit,
        ohcsTargetedLimit: ohcs.targetedLimit,
        ohcsHeadroom,
        ohcsReason,
        ohcsDpaGrantAmount: 15000,

        // Lakeview Metadata
        borrowerIncomeUsed: borrowerIncome,
        lakeviewHeadroom,
        lakeviewReason
      };

      return {
        ...listing,
        eval: evalData
      };
    });
  }, [pipeline, householdIncome, householdSize, borrowerIncome, buyerMonthlyDebt, targetDti, maxHousingBudget]);

  // Filter listings based on active filter pills, search, and toggle
  const filteredListings = useMemo(() => {
    return evaluatedListings.filter(item => {
      // Search matching
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesSearch = 
          item.address.toLowerCase().includes(query) || 
          item.city.toLowerCase().includes(query) ||
          (item.zip && item.zip.includes(query)) ||
          item.eval.county.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      const anyQualified = item.eval.usdaQualifies || item.eval.lakeviewQualifies || item.eval.ohcsQualifies;

      // Ineligibility toggle
      if (hideIneligible && !anyQualified) {
        return false;
      }

      // Program filter pills
      if (programFilter === 'qualified_only') {
        return anyQualified;
      }
      if (programFilter === 'usda') {
        return item.eval.usdaQualifies;
      }
      if (programFilter === 'lakeview') {
        return item.eval.lakeviewQualifies;
      }
      if (programFilter === 'ohcs') {
        return item.eval.ohcsQualifies;
      }
      if (programFilter === 'stacked') {
        return item.eval.stackedQualifies;
      }

      return true;
    });
  }, [evaluatedListings, searchTerm, hideIneligible, programFilter]);

  // Statistics counters
  const programCounts = useMemo(() => {
    let usda = 0;
    let lakeview = 0;
    let ohcs = 0;
    let stacked = 0;
    let qualified = 0;

    evaluatedListings.forEach(l => {
      const any = l.eval.usdaQualifies || l.eval.lakeviewQualifies || l.eval.ohcsQualifies;
      if (any) qualified++;
      if (l.eval.usdaQualifies) usda++;
      if (l.eval.lakeviewQualifies) lakeview++;
      if (l.eval.ohcsQualifies) ohcs++;
      if (l.eval.stackedQualifies) stacked++;
    });

    return { total: evaluatedListings.length, qualified, usda, lakeview, ohcs, stacked };
  }, [evaluatedListings]);

  // Selection Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedPropertyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    if (selectedPropertyIds.size === filteredListings.length && filteredListings.length > 0) {
      setSelectedPropertyIds(new Set());
    } else {
      setSelectedPropertyIds(new Set(filteredListings.map(l => l.id)));
    }
  };

  const handleSelectAllQualified = () => {
    const qualifiedIds = evaluatedListings
      .filter(l => l.eval.usdaQualifies || l.eval.lakeviewQualifies || l.eval.ohcsQualifies)
      .map(l => l.id);
    setSelectedPropertyIds(new Set(qualifiedIds));
  };

  // Build Ad Packages for all selected properties
  const selectedPackages = useMemo(() => {
    const selected = evaluatedListings.filter(l => selectedPropertyIds.has(l.id));
    return selected.map(listing => 
      buildFthbVantageAdPackage(
        listing, 
        listing.eval, 
        buyerFinancials, 
        currentLo, 
        activeAgent
      )
    );
  }, [evaluatedListings, selectedPropertyIds, buyerFinancials, currentLo, activeAgent]);

  // Trigger push to Vantage AI Ad Studio for selected items
  const handlePushToVantageStudio = async (customSelectedPackages?: FthbVantageAdPackage[]) => {
    const packagesToPush = customSelectedPackages || selectedPackages;
    if (packagesToPush.length === 0) {
      alert("Please select at least one property to push to Vantage AI Ad Studio.");
      return;
    }

    const result = await pushFthbBatchToVantageStudio(
      packagesToPush, 
      guidesState, 
      onUpdateGuidesState
    );

    setActiveStudioIndex(0);
    setIsVantageStudioOpen(true);

    if (onTriggerToast) {
      onTriggerToast(`🚀 Pushed ${result.pushedCount} properties to Vantage AI Ad Studio with persistent Low/No Down Payment focus!`);
    }
  };

  // Push single property directly from card
  const handlePushSingleProperty = (listing: typeof evaluatedListings[0]) => {
    const pkg = buildFthbVantageAdPackage(
      listing,
      listing.eval,
      buyerFinancials,
      currentLo,
      activeAgent
    );
    setSelectedPropertyIds(new Set([listing.id]));
    handlePushToVantageStudio([pkg]);
  };

  // Active package for the modal
  const activePackage: FthbVantageAdPackage | undefined = selectedPackages[activeStudioIndex] || selectedPackages[0];

  const handleCopyPrompt = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(key);
    setTimeout(() => setCopiedPromptKey(null), 2500);
    if (onTriggerToast) onTriggerToast("📋 Prompt copied to clipboard!");
  };

  const handleLaunchEmail = (pkg: FthbVantageAdPackage) => {
    launchLocalOutlookDraft({
      to: pkg.agent.email || "partner@brokerage.com",
      subject: pkg.emailOutreach.subject,
      body: pkg.emailOutreach.body,
      loanOfficer: currentLo,
      onTriggerToast
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Microservices Suite Bridge
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAE7E0] text-[#606C5D] text-[10px] font-bold tracking-wider">
              GeoSphere GIS ➔ Qualifier Engine ➔ Vantage AI
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#2D362E] mt-1">
            FTHB Pipeline & Program Qualifier
          </h1>
          <p className="text-xs md:text-sm text-[#606C5D] mt-0.5">
            Real-time screening for USDA 0% Down, Lakeview 140% AMI, and OHCS FirstHome with instant push to Vantage AI Ad Studio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input 
            type="file" 
            accept=".json,.csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#EAE7E0] shadow-xs text-xs font-bold text-[#2D362E] hover:bg-[#FAF9F5] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            Upload CSV/JSON
          </button>

          <button 
            onClick={syncFromGeoSphereMap}
            disabled={isImporting}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Import all listings directly from GeoSphere Map GIS database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isImporting ? "animate-spin" : ""}`} />
            <span>Sync GeoSphere Map ({guidesState?.syncedProperties?.length || 249})</span>
          </button>
          
          <button 
            onClick={simulateSyncPush}
            disabled={isImporting}
            className="px-3.5 py-2 rounded-xl bg-[#2D362E] text-white shadow-xs text-xs font-bold hover:bg-[#1E241F] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isImporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-400" />}
            Simulate Webhook Sync
          </button>

          <button 
            onClick={resetToSamplePipeline}
            className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            title="Reload 10 Oregon FTHB properties"
          >
            Reset Sample Data
          </button>
        </div>
      </div>

      {/* Enterprise 3-Point Microservices Ecosphere Architecture Banner */}
      <div className="bg-gradient-to-br from-[#2D362E] to-[#1E241F] text-white rounded-3xl p-6 shadow-md border border-[#4A5D4E]/30 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Enterprise Software Suite Architecture</span>
              <h2 className="text-lg font-bold text-white">3-Point Microservices Ecosphere & CRM Overlay</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-300">Feeds Salesforce, Total Expert & Encompass Seamlessly</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300">Microservice 1</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Top-of-Funnel</span>
            </div>
            <h3 className="font-bold text-white text-sm">Spatial GIS & Lead Generation</h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              GeoSphere spatial parcel mapping, USDA 0% down zones, OHCS FirstHome grants, and long-form affordability Q&A capturing high-intent buyers 60 days earlier.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-300">Microservice 2</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">Capture & Nurture</span>
            </div>
            <h3 className="font-bold text-white text-sm">Intent Scoring & Buyer Engagement</h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Deterministic AI intent scoring (Hot/Warm/Nurture), zero-PII storage with full masking, and direct pathways to guide ready buyers to the loan officer's official company portal to apply.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">Microservice 3</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">CRM Conversion Feed</span>
            </div>
            <h3 className="font-bold text-white text-sm">Traditional CRM Overlay Feed</h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Sits on top of existing enterprise mortgage CRMs (Salesforce, Total Expert, Encompass) via bidirectional webhooks with SHA-256 zero-trust audit ledgers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Program Qualifier Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-xs p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#F1EFE9] pb-3">
              <h2 className="text-base font-bold text-[#2D362E] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Program Qualifier Panel
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live Dynamic Sync
              </span>
            </div>

            {/* Slider 1: Household Income (USDA RD) */}
            <div className="space-y-2 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>🚜</span> Household Income (USDA RD)
                </span>
                <span className="font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                  {formatUSD(householdIncome)}
                </span>
              </div>
              <input 
                type="range" 
                min="40000" max="250000" step="1000"
                value={householdIncome}
                onChange={(e) => setHouseholdIncome(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-emerald-800">
                <span>$40k</span>
                <div className="flex gap-1">
                  {[75000, 95000, 125000, 150000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setHouseholdIncome(val)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${householdIncome === val ? 'bg-emerald-700 text-white' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'}`}
                    >
                      ${val / 1000}k
                    </button>
                  ))}
                </div>
                <span>$250k</span>
              </div>
              <p className="text-[10px] text-emerald-700 leading-tight">
                Controls USDA RD 100% Zero-Down price limits by county tier & household size.
              </p>
            </div>

            {/* Slider 2: Household Size */}
            <div className="space-y-2 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-stone-600" /> Household Size
                </span>
                <span className="font-extrabold text-stone-800 bg-white px-2.5 py-0.5 rounded-lg border border-stone-300 shadow-2xs">
                  {householdSize} {householdSize === 1 ? 'Member' : 'Members'}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1 pt-1">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => setHouseholdSize(num)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      householdSize === num 
                        ? 'bg-[#2D362E] text-white shadow-2xs' 
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {num}{num === 6 ? '+' : ''}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-stone-600 flex justify-between items-center pt-0.5">
                <span>{householdSize <= 4 ? "Standard Bracket (1–4 members)" : "Expanded Bracket (5+ members +$35k limit)"}</span>
              </div>
            </div>

            {/* Slider 3: Borrower Income (Lakeview 140% AMI) */}
            <div className="space-y-2 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-blue-950 flex items-center gap-1.5">
                  <span>🌊</span> Borrower Qualifying Income
                </span>
                <span className="font-extrabold text-blue-800 bg-white px-2 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                  {formatUSD(borrowerIncome)}
                </span>
              </div>
              <input 
                type="range" 
                min="40000" max="350000" step="1000"
                value={borrowerIncome}
                onChange={(e) => setBorrowerIncome(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between items-center text-[10px] text-blue-800">
                <span>$40k</span>
                <div className="flex gap-1">
                  {[65000, 85000, 110000, 140000].map(val => (
                    <button 
                      key={val}
                      onClick={() => setBorrowerIncome(val)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors ${borrowerIncome === val ? 'bg-blue-700 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-900'}`}
                    >
                      ${val / 1000}k
                    </button>
                  ))}
                </div>
                <span>$350k</span>
              </div>
              <p className="text-[10px] text-blue-700 leading-tight">
                Evaluated against 140% Area Median Income (AMI) with no first-time buyer restriction.
              </p>
            </div>

            {/* Slider 4: Monthly Debts & DTI Benchmark */}
            <div className="space-y-3 p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-amber-600" /> Buyer Monthly Debts & DTI
                </span>
                <span className="font-bold text-amber-900 bg-white px-2 py-0.5 rounded-lg border border-amber-300 text-[11px]">
                  {formatUSD(buyerMonthlyDebt)}/mo debt
                </span>
              </div>
              
              <input 
                type="range" 
                min="0" max="2500" step="50"
                value={buyerMonthlyDebt}
                onChange={(e) => setBuyerMonthlyDebt(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />

              <div className="flex justify-between items-center text-[10px] text-amber-900 pt-1 border-t border-amber-200/60">
                <span>Max Target DTI: <strong>{targetDti}%</strong></span>
                <span>Max Housing Pmt: <strong>{formatUSD(maxHousingBudget)}/mo</strong></span>
              </div>
            </div>

            {/* OHCS FirstHome Overview Box */}
            <div className="p-3.5 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-1.5">
              <h3 className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                <span>🏠</span> OHCS FirstHome 2026 Limits
              </h3>
              <p className="text-[11px] text-orange-800 leading-relaxed">
                Automatically checks purchase price vs 2026 county price caps ($562k–$692k) and LMI/Targeted Census tracts for $15,000 DPA cash grants.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Property Receiver Queue & Filter Suite */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Pills & Search Bar */}
          <div className="bg-white p-4 rounded-3xl border border-[#EAE7E0] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setProgramFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    programFilter === 'all' 
                      ? 'bg-[#2D362E] text-white shadow-2xs' 
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All ({programCounts.total})
                </button>
                <button
                  onClick={() => setProgramFilter('qualified_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    programFilter === 'qualified_only' 
                      ? 'bg-emerald-700 text-white shadow-2xs' 
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  Qualifies for Any ({programCounts.qualified})
                </button>
                <button
                  onClick={() => setProgramFilter('usda')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    programFilter === 'usda' 
                      ? 'bg-emerald-800 text-white shadow-2xs' 
                      : 'bg-stone-50 text-stone-700 hover:bg-emerald-50 border border-stone-200'
                  }`}
                >
                  🚜 USDA RD ({programCounts.usda})
                </button>
                <button
                  onClick={() => setProgramFilter('lakeview')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    programFilter === 'lakeview' 
                      ? 'bg-blue-700 text-white shadow-2xs' 
                      : 'bg-stone-50 text-stone-700 hover:bg-blue-50 border border-stone-200'
                  }`}
                >
                  🌊 Lakeview ({programCounts.lakeview})
                </button>
                <button
                  onClick={() => setProgramFilter('ohcs')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    programFilter === 'ohcs' 
                      ? 'bg-orange-700 text-white shadow-2xs' 
                      : 'bg-stone-50 text-stone-700 hover:bg-orange-50 border border-stone-200'
                  }`}
                >
                  🏠 OHCS ({programCounts.ohcs})
                </button>
                <button
                  onClick={() => setProgramFilter('stacked')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    programFilter === 'stacked' 
                      ? 'bg-purple-800 text-white shadow-2xs' 
                      : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  ✨ Stacked ({programCounts.stacked})
                </button>
              </div>

              {/* Hide Ineligible Toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-[#606C5D] cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={hideIneligible}
                  onChange={(e) => setHideIneligible(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                Hide Ineligible
              </label>
            </div>

            {/* Search and Selection Actions Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-2 border-t border-stone-100">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Filter by city, address, zip, or county..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#4A5D4E] focus:bg-white outline-hidden transition-all"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSelectAllFiltered}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {selectedPropertyIds.size === filteredListings.length && filteredListings.length > 0 ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5 text-stone-400" />
                      Select All ({filteredListings.length})
                    </>
                  )}
                </button>

                <button
                  onClick={handleSelectAllQualified}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Select All Qualified ({programCounts.qualified})
                </button>
              </div>
            </div>
          </div>

          {/* Sticky Push-to-Vantage Dock when 1 or more selected */}
          {selectedPropertyIds.size > 0 && (
            <div className="bg-[#2D362E] text-white p-4 rounded-2xl shadow-lg border border-emerald-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">
                    {selectedPropertyIds.size} {selectedPropertyIds.size === 1 ? 'Property' : 'Properties'} Selected for Vantage AI Ad Studio
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Persistent Low/No Down Payment Moniker
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  Ready to auto-populate Meta Ad scripts, Google PMax assets, 9:16 Video storyboards, and RentCast rent-vs-own comps.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handlePushToVantageStudio()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:from-emerald-600 hover:to-teal-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Push to Vantage AI Ad Studio ({selectedPropertyIds.size})
                </button>
              </div>
            </div>
          )}

          {/* Main Receiver Queue Container with Drag & Drop */}
          <div 
            className={`bg-white rounded-3xl border ${isDragging ? 'border-emerald-500 bg-emerald-50/20' : 'border-[#EAE7E0]'} shadow-xs flex flex-col h-[calc(100vh-320px)] min-h-[550px] transition-colors relative`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 z-20 rounded-3xl bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center border-2 border-dashed border-emerald-500">
                <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-emerald-600 animate-bounce" />
                  <h3 className="font-bold text-emerald-900 text-lg">Drop CSV or JSON here</h3>
                  <p className="text-xs text-emerald-700">Instant parsing into FTHB pipeline</p>
                </div>
              </div>
            )}

            {/* Queue Header */}
            <div className="p-4 border-b border-[#EAE7E0] flex justify-between items-center bg-[#FAF9F5] rounded-t-3xl">
              <h3 className="font-bold text-[#2D362E] text-sm flex items-center gap-2">
                <Inbox className="w-4 h-4 text-[#C18C5D]" />
                Receiver Queue
                <span className="bg-[#EAE7E0] text-[#606C5D] text-xs px-2 py-0.5 rounded-full ml-1">
                  {filteredListings.length}
                </span>
              </h3>
              <div className="text-[11px] text-stone-500 font-medium">
                Live Evaluated against Household: <strong>{formatUSD(householdIncome)}</strong> ({householdSize} persons)
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7F4]">
              {filteredListings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#EAE7E0] flex items-center justify-center shadow-xs">
                    <Inbox className="w-8 h-8 text-[#C18C5D] opacity-40" />
                  </div>
                  <div>
                    <h4 className="text-[#2D362E] font-bold text-sm">No properties match current filters</h4>
                    <p className="text-[#606C5D] text-xs mt-1 max-w-sm">
                      Try adjusting the Household Income slider, switching filter pills, or uploading new properties.
                    </p>
                  </div>
                  <button 
                    onClick={() => { setProgramFilter('all'); setHideIneligible(false); setSearchTerm(''); }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredListings.map(listing => {
                  const isSelected = selectedPropertyIds.has(listing.id);
                  const isStacked = listing.eval.stackedQualifies;
                  const anyMatch = listing.eval.usdaQualifies || listing.eval.lakeviewQualifies || listing.eval.ohcsQualifies;

                  return (
                    <div 
                      key={listing.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-emerald-50/40 border-emerald-400 shadow-sm' 
                          : 'bg-white border-[#EAE7E0] hover:border-stone-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Checkbox & Visual */}
                        <div className="flex items-start gap-3">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(listing.id)}
                            className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />

                          <div className="relative w-28 sm:w-32 h-24 shrink-0 rounded-xl overflow-hidden bg-stone-100">
                            {listing.imageUrl ? (
                              <img src={listing.imageUrl} alt={listing.address} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-stone-100">
                                <Home className="w-6 h-6 text-stone-400" />
                              </div>
                            )}
                            
                            {/* Persistent Moniker Floating Badge */}
                            {listing.eval.usdaQualifies && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-emerald-900/90 text-emerald-200 text-[8px] font-extrabold tracking-tight">
                                🚜 0% DOWN
                              </div>
                            )}
                            {listing.eval.ohcsQualifies && !listing.eval.usdaQualifies && (
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-orange-900/90 text-orange-200 text-[8px] font-extrabold tracking-tight">
                                🏠 $15K DPA
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Property Details & Financial Stacking */}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-[#2D362E] text-sm flex items-center gap-1.5">
                                {listing.address}
                                {isStacked && (
                                  <span className="px-2 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[9px] font-extrabold border border-purple-200">
                                    ✨ Benefit-Stacked
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-[#606C5D]">
                                {listing.city}, OR {listing.zip} • {listing.eval.county} County
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-[#2D362E] text-base">
                                {formatUSD(listing.price)}
                              </span>
                              <div className="text-[10px] text-stone-500">
                                Est. Pmt: <strong>{formatUSD(listing.eval.estimatedMonthlyPayment)}/mo</strong>
                              </div>
                            </div>
                          </div>

                          {/* Quick Specs */}
                          <div className="flex gap-4 text-xs text-[#606C5D]">
                            <span>{listing.beds} Beds</span>
                            <span>{listing.baths} Baths</span>
                            <span>{listing.sqft} SqFt</span>
                            <span>Built {listing.yearBuilt}</span>
                            <span>{listing.daysOnMarket || 12} DOM</span>
                          </div>

                          {/* RentCast Comparison Strip */}
                          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 flex flex-wrap justify-between items-center text-[11px] gap-2">
                            <div className="flex items-center gap-1.5 text-stone-700">
                              <span className="font-bold text-stone-900">RentCast Market Rent:</span>
                              <span>{formatUSD(listing.eval.rentcastEstRent)}/mo</span>
                              <span className="text-emerald-700 font-semibold">
                                ({listing.eval.monthlyRentSavings >= 0 ? `+$${listing.eval.monthlyRentSavings}/mo less to own` : `${formatUSD(Math.abs(listing.eval.monthlyRentSavings))}/mo rent delta`})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-stone-500">Qualifying DTI:</span>
                              <span className={`font-bold px-1.5 py-0.2 rounded ${
                                listing.eval.dtiStatus === 'pass' 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : (listing.eval.dtiStatus === 'caution' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
                              }`}>
                                {listing.eval.buyerDtiPct}%
                              </span>
                            </div>
                          </div>

                          {/* Real-Time Program Eligibility Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1EFE9]">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <UsdaProgramBadge evalData={listing.eval} propertyPrice={listing.price} />
                              <LakeviewProgramBadge evalData={listing.eval} propertyPrice={listing.price} />
                              <OhcsProgramBadge evalData={listing.eval} propertyPrice={listing.price} />
                            </div>

                            <button
                              onClick={() => handlePushSingleProperty(listing)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              Push to Vantage Studio
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vantage AI Ad Studio Modal & Batch Curation Drawer */}
      {isVantageStudioOpen && activePackage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 bg-[#FAF9F5] flex justify-between items-start gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wide">
                    Vantage AI Ad Studio
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">
                    {activePackage.persistentMoniker}
                  </span>
                </div>
                <h2 className="text-xl font-display font-bold text-[#2D362E] mt-1">
                  Co-Branded FTHB Ad Suite: {activePackage.listing.address}, {activePackage.listing.city}
                </h2>
                <p className="text-xs text-[#606C5D] mt-0.5">
                  Microservice Bridge: Borrower Financials + RentCast Comps + Agent Co-Brand + Prompt Engineering Suggestions
                </p>
              </div>

              <button 
                onClick={() => setIsVantageStudioOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If multiple properties selected, show tabs for each property */}
            {selectedPackages.length > 1 && (
              <div className="px-5 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-stone-600 shrink-0">Pushed Properties:</span>
                {selectedPackages.map((pkg, idx) => (
                  <button
                    key={pkg.id}
                    onClick={() => setActiveStudioIndex(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeStudioIndex === idx 
                        ? 'bg-emerald-700 text-white shadow-xs' 
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {pkg.listing.address} ({pkg.shortTag.split('(')[0]})
                  </button>
                ))}
              </div>
            )}

            {/* Studio Navigation Sub-Tabs */}
            <div className="px-5 border-b border-stone-200 flex gap-4 text-xs font-bold bg-white">
              <button
                onClick={() => setStudioActiveTab('creative')}
                className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioActiveTab === 'creative' 
                    ? 'border-emerald-600 text-emerald-800' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Ad Copy & Video Storyboard
              </button>
              <button
                onClick={() => setStudioActiveTab('adbrain')}
                className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioActiveTab === 'adbrain' 
                    ? 'border-emerald-600 text-emerald-800' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Vantage AI Ad Brain & Prompts
              </button>
              <button
                onClick={() => setStudioActiveTab('stacking')}
                className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioActiveTab === 'stacking' 
                    ? 'border-emerald-600 text-emerald-800' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" /> Benefit Stacking & RentCast
              </button>
              <button
                onClick={() => setStudioActiveTab('outreach')}
                className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioActiveTab === 'outreach' 
                    ? 'border-emerald-600 text-emerald-800' 
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" /> Agent Co-Brand & Outreach
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FBFBFA]">
              {/* TAB 1: Ad Creative & 9:16 Video Storyboard */}
              {studioActiveTab === 'creative' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Meta & Google Creative */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <span>📘</span> Meta Ad Copy (Facebook & Instagram Feed)
                        </span>
                        <button
                          onClick={() => handleCopyPrompt('meta_copy', activePackage.metaPrimaryText)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                        >
                          {copiedPromptKey === 'meta_copy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy Ad Copy
                        </button>
                      </div>

                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 font-mono whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                        {activePackage.metaPrimaryText}
                      </div>

                      <div className="text-[11px] text-stone-500 flex justify-between">
                        <span>Headline: <strong>{activePackage.metaHeadline}</strong></span>
                      </div>
                    </div>

                    {/* Google Ads Assets */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                      <div className="text-xs font-bold text-stone-800 border-b border-stone-100 pb-2">
                        <span>🔍</span> Google Performance Max Responsive Headlines
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {activePackage.googleHeadlines.map((h, i) => (
                          <div key={i} className="p-2 bg-stone-50 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 truncate">
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 9:16 Video Storyboard (TikTok / Reels) */}
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-purple-600" /> 9:16 Vertical Video Storyboard (30s)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                          TikTok / IG Reels / YouTube Shorts
                        </span>
                      </div>

                      <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-200 text-xs text-purple-950 font-bold">
                        Hook: "{activePackage.videoStoryboard.hook}"
                      </div>

                      <div className="space-y-2">
                        {activePackage.videoStoryboard.scenes.map((scene) => (
                          <div key={scene.sceneNumber} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-stone-800">Scene {scene.sceneNumber} ({scene.durationSec}s)</span>
                              <span className="text-stone-500 font-medium">Text: {scene.onScreenText.split('\n')[0]}</span>
                            </div>
                            <p className="text-xs text-stone-600 italic">
                              Visual: {scene.visual}
                            </p>
                            <p className="text-xs text-stone-800 font-semibold bg-white p-2 rounded-lg border border-stone-200">
                              Voiceover: "{scene.narration}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Vantage AI Ad Brain & Prompt Suggestions */}
              {studioActiveTab === 'adbrain' && (
                <div className="space-y-6">
                  {/* Strategy Box */}
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Vantage AI Ad Brain Strategic Blueprint
                      </h4>
                    </div>
                    <p className="text-xs text-emerald-900 whitespace-pre-line leading-relaxed font-medium">
                      {activePackage.adBrainStrategy}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2.5">
                    <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" /> Auto-Populated Build Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {activePackage.aiRecommendations.map((rec, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ready-to-Run Prompt Engineering Suggestions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-800">
                      Copyable AI Prompt Engineering Suggestions (Gemini 2.5 / Claude / GPT-4o):
                    </h4>

                    {/* Prompt 1 */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-800">
                          1. Meta Ads Prompt (First-Time Buyer Lead Form Generator)
                        </span>
                        <button
                          onClick={() => handleCopyPrompt('p1', activePackage.promptSuggestions.metaLeadGenPrompt)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPromptKey === 'p1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy Prompt
                        </button>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-700 font-mono leading-relaxed max-h-36 overflow-y-auto">
                        {activePackage.promptSuggestions.metaLeadGenPrompt}
                      </div>
                    </div>

                    {/* Prompt 2 */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-800">
                          2. TikTok / Reels Video Generator Prompt (CapCut / Runway / Pika)
                        </span>
                        <button
                          onClick={() => handleCopyPrompt('p2', activePackage.promptSuggestions.videoReelsPrompt)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedPromptKey === 'p2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy Prompt
                        </button>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-700 font-mono leading-relaxed max-h-36 overflow-y-auto">
                        {activePackage.promptSuggestions.videoReelsPrompt}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Benefit Stacking & RentCast Data */}
              {studioActiveTab === 'stacking' && (
                <div className="space-y-6">
                  {/* Financial Comparison Table */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-emerald-600" />
                      Rent vs Own Comparison (RentCast Analytics Integration)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                        <span className="text-xs text-stone-500 font-semibold">RentCast Est. Rent</span>
                        <div className="text-2xl font-bold text-stone-800 mt-1">
                          {formatUSD(activePackage.eval.rentcastEstRent)}/mo
                        </div>
                        <span className="text-[11px] text-stone-400">100% money lost to landlord</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <span className="text-xs text-emerald-800 font-semibold">Homeowner Payment</span>
                        <div className="text-2xl font-bold text-emerald-900 mt-1">
                          {formatUSD(activePackage.eval.estimatedMonthlyPayment)}/mo
                        </div>
                        <span className="text-[11px] text-emerald-700">P&I + Taxes + Insurance + PMI</span>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                        <span className="text-xs text-blue-800 font-semibold">Down Payment Required</span>
                        <div className="text-2xl font-bold text-blue-900 mt-1">
                          {activePackage.downPaymentBadge}
                        </div>
                        <span className="text-[11px] text-blue-700">{activePackage.grantBadge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Eligibility Verification */}
                  <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-stone-900">
                        Income, Census Tract & DTI Qualification Verification
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <UsdaProgramBadge evalData={activePackage.eval} propertyPrice={activePackage.listing.price} />
                        <LakeviewProgramBadge evalData={activePackage.eval} propertyPrice={activePackage.listing.price} />
                        <OhcsProgramBadge evalData={activePackage.eval} propertyPrice={activePackage.listing.price} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                        <div className="flex justify-between font-bold text-stone-800">
                          <span>Household Income Evaluated:</span>
                          <span>{formatUSD(activePackage.buyerFinancials.householdIncome)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>USDA County Income Limit:</span>
                          <span>{formatUSD(activePackage.eval.usdaLimit)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>USDA Rural Area Match:</span>
                          <span className={activePackage.eval.usdaQualifies ? "text-emerald-700 font-bold" : "text-stone-400"}>
                            {activePackage.eval.usdaQualifies ? "Qualified (0% Down)" : "Not Qualified"}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-500 text-[11px] pt-1 border-t border-stone-200/60">
                          <span>USDA Headroom:</span>
                          <span className={activePackage.eval.usdaHeadroom >= 0 ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                            {activePackage.eval.usdaHeadroom >= 0 
                              ? `+$${activePackage.eval.usdaHeadroom.toLocaleString()} under limit`
                              : `-$${Math.abs(activePackage.eval.usdaHeadroom).toLocaleString()} over limit`}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                        <div className="flex justify-between font-bold text-stone-800">
                          <span>OHCS Census Tract:</span>
                          <span className="font-mono text-stone-900 font-semibold">{activePackage.eval.ohcsCensusTract}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>Tract Designation:</span>
                          <span className="font-medium text-stone-700">
                            {activePackage.eval.ohcsIsTargeted ? 'OHCS Targeted Area' : (activePackage.eval.ohcsLmiEligible ? 'LMI Census Tract' : 'Standard Area')}
                          </span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>OHCS 2026 Price Cap:</span>
                          <span>{formatUSD(activePackage.eval.ohcsPriceLimit)}</span>
                        </div>
                        <div className="flex justify-between text-stone-500 text-[11px] pt-1 border-t border-stone-200/60">
                          <span>OHCS Headroom:</span>
                          <span className={activePackage.eval.ohcsHeadroom >= 0 ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
                            {activePackage.eval.ohcsHeadroom >= 0 
                              ? `+$${activePackage.eval.ohcsHeadroom.toLocaleString()} under cap`
                              : `-$${Math.abs(activePackage.eval.ohcsHeadroom).toLocaleString()} over cap`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Agent Co-Brand & Outreach */}
              {studioActiveTab === 'outreach' && (
                <div className="space-y-6">
                  {/* Co-Branded Advisory Team Card */}
                  <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        RESPA Safe-Harbor Co-Branded Advisory Team
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                        50/50 Co-Marketing Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* LO */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase">Senior Mortgage Advisor</span>
                        <h5 className="font-bold text-stone-900 text-sm">{activePackage.loanOfficer.name}</h5>
                        <p className="text-xs text-stone-600">{activePackage.loanOfficer.company} • {activePackage.loanOfficer.nmls}</p>
                        <p className="text-xs text-stone-500 font-mono">{activePackage.loanOfficer.phone} • {activePackage.loanOfficer.email}</p>
                      </div>

                      {/* Agent */}
                      <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                        <span className="text-[10px] font-bold text-blue-800 uppercase">Co-Listing Real Estate Specialist</span>
                        <h5 className="font-bold text-stone-900 text-sm">{activePackage.agent.name}</h5>
                        <p className="text-xs text-stone-600">{activePackage.agent.brokerage} • {activePackage.agent.license}</p>
                        <p className="text-xs text-stone-500 font-mono">{activePackage.agent.phone} • {activePackage.agent.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Outreach Tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SMS */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Co-Branded SMS Script
                        </span>
                        <button
                          onClick={() => handleCopyPrompt('sms_outreach', activePackage.smsOutreach)}
                          className="text-[11px] text-emerald-700 font-bold flex items-center gap-1"
                        >
                          {copiedPromptKey === 'sms_outreach' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copy Text
                        </button>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-800 font-mono leading-relaxed">
                        {activePackage.smsOutreach}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-600" /> Co-Branded Email Outreach
                        </span>
                        <button
                          onClick={() => handleLaunchEmail(activePackage)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          Launch in Outlook
                        </button>
                      </div>
                      <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-800 font-mono leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line">
                        {activePackage.emailOutreach.body}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-stone-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-xs text-stone-500">
                Pushed to Vantage AI Ads Queue and synced to campaign drafts.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const jsonPayload = JSON.stringify(selectedPackages, null, 2);
                    const blob = new Blob([jsonPayload], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `vantage_ad_suite_${activePackage.listing.city}_${Date.now()}.json`;
                    a.click();
                    if (onTriggerToast) onTriggerToast("Downloaded Vantage Co-Branded Ad Package!");
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>

                {onNavigateToAdsPortal && (
                  <button
                    onClick={() => {
                      setIsVantageStudioOpen(false);
                      onNavigateToAdsPortal();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    Open Live Ad Campaigns Tab
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
