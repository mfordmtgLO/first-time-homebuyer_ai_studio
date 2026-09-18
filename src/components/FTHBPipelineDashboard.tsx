import React, { useState, useMemo, useRef } from 'react';
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
  Filter
} from 'lucide-react';
import { PropertyListing } from '../types';
import { getPropertyOhcsPriceLimit, normalizeOregonCounty } from '../utils/ohcsPurchaseLimits';
import { parseGeoSpherePayload } from '../data/geoSphereData';
import { formatUSD } from '../utils/mortgageMath';

// USDA Income Limits
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
  // Default
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
    // Handle commas inside quotes for basic CSV structures
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
      beds: parseInt(getValue(['bed']) || '0') || 0,
      baths: parseInt(getValue(['bath']) || '0') || 0,
      sqft: parseInt(getValue(['sqft', 'square', 'area']) || '0') || 0,
      yearBuilt: parseInt(getValue(['year', 'built']) || '0') || 0,
      propertyType: 'Single Family',
      status: 'saved',
      notes: 'Imported from CSV',
      daysOnMarket: parseInt(getValue(['dom', 'days']) || '0') || 0,
      hoaMonthly: parseInt(getValue(['hoa']) || '0') || 0,
      propertyTaxAnnual: parseInt(getValue(['tax']) || '0') || 0,
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

export const FTHBPipelineDashboard: React.FC = () => {
  const [pipeline, setPipeline] = useState<PropertyListing[]>([]);
  const [householdIncome, setHouseholdIncome] = useState<number>(95000);
  const [householdSize, setHouseholdSize] = useState<number>(3); // 1-4 or 5-8
  const [borrowerIncome, setBorrowerIncome] = useState<number>(85000);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
            const newMap = new Map();
            prev.forEach(p => newMap.set(p.id, p));
            importedListings.forEach(p => newMap.set(p.id, p));
            return Array.from(newMap.values());
          });
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

  const simulateSyncPush = () => {
    // Simulate receiving a webhook push from GeoSphere map
    setIsImporting(true);
    setTimeout(() => {
      // Create a mock incoming listing
      const newListing: PropertyListing = {
        id: `geosync-${Date.now()}`,
        title: "Pushed from GeoSphere Map",
        address: "123 Oregon Trail",
        city: "Portland",
        state: "OR",
        zip: "97204",
        price: 450000,
        beds: 3,
        baths: 2,
        sqft: 1500,
        yearBuilt: 1990,
        propertyType: "Single Family",
        status: "saved",
        notes: "Real-time push from GeoSphere webhook",
        daysOnMarket: 2,
        hoaMonthly: 0,
        propertyTaxAnnual: 4500,
        isFavorite: false,
        overlayEligibility: {
          usdaEligible: true,
          lmiEligible: true,
          lakeviewNationalEligible: true
        }
      };
      
      setPipeline(prev => [newListing, ...prev]);
      setIsImporting(false);
    }, 1500);
  };

  const processedListings = useMemo(() => {
    return pipeline
      .filter(p => p.address.toLowerCase().includes(searchTerm.toLowerCase()) || p.city.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(listing => {
        const county = normalizeOregonCounty(listing.county, listing.city);
        
        // USDA Logic
        const usdaLimit = getUsdaIncomeLimit(county, householdSize);
        const meetsUsdaIncome = householdIncome <= usdaLimit;
        const isUsdaArea = listing.overlayEligibility?.usdaEligible || listing.overlayEligibility?.usda;
        const usdaQualifies = isUsdaArea && meetsUsdaIncome;

        // Lakeview Logic
        const lakeviewLimit = getLakeviewLimit(county);
        const meetsLakeviewIncome = borrowerIncome <= lakeviewLimit;
        const lakeviewQualifies = meetsLakeviewIncome; // Usually available statewide, bounded by AMI

        // OHCS FirstHome Logic
        const ohcs = getPropertyOhcsPriceLimit(listing.price, county, listing.city, listing.overlayEligibility?.lmiCensusTract);
        const isLmiArea = listing.overlayEligibility?.lmiEligible || listing.overlayEligibility?.lmi;
        const ohcsQualifies = isLmiArea && ohcs.isPriceEligible;

        return {
          ...listing,
          eval: {
            county,
            usdaQualifies,
            lakeviewQualifies,
            ohcsQualifies,
            usdaLimit,
            lakeviewLimit,
            ohcs
          }
        };
      });
  }, [pipeline, householdIncome, householdSize, borrowerIncome, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-[#2D362E]">FTHB Pipeline Dashboard</h1>
          <p className="text-sm text-[#606C5D] mt-1">Real-time receiver queue for GeoSphere Map pushed properties.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".json,.csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl bg-white border border-[#EAE7E0] shadow-sm text-xs font-bold text-[#2D362E] hover:bg-[#FAF9F5] flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload CSV/JSON
          </button>
          <button 
            onClick={simulateSyncPush}
            disabled={isImporting}
            className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white shadow-sm text-xs font-bold hover:bg-[#38463B] flex items-center gap-2"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Inbox className="w-4 h-4" />}
            Simulate Webhook Sync
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Program Qualifier Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-xs p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#2D362E] flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              Program Qualifier Panel
            </h2>

            {/* USDA Inputs */}
            <div className="space-y-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                <span className="text-lg">🚜</span> USDA RD Guaranteed
              </h3>
              <div>
                <label className="text-xs font-bold text-emerald-800 flex justify-between">
                  Household Income
                  <span>{formatUSD(householdIncome)}</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="250000" step="1000"
                  value={householdIncome}
                  onChange={(e) => setHouseholdIncome(Number(e.target.value))}
                  className="w-full mt-2 accent-emerald-600"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-emerald-800 block mb-1">
                  Household Size
                </label>
                <select 
                  value={householdSize} 
                  onChange={(e) => setHouseholdSize(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-xs text-emerald-900"
                >
                  <option value={3}>1 to 4 Members</option>
                  <option value={6}>5 to 8 Members</option>
                </select>
              </div>
            </div>

            {/* Lakeview Inputs */}
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <span className="text-lg">🌊</span> Lakeview National
              </h3>
              <div>
                <label className="text-xs font-bold text-blue-800 flex justify-between">
                  Borrower Income
                  <span>{formatUSD(borrowerIncome)}</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="350000" step="1000"
                  value={borrowerIncome}
                  onChange={(e) => setBorrowerIncome(Number(e.target.value))}
                  className="w-full mt-2 accent-blue-600"
                />
              </div>
            </div>

            {/* OHCS Summary */}
            <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
              <h3 className="text-sm font-bold text-orange-900 flex items-center gap-2">
                <span className="text-lg">🏠</span> OHCS FirstHome
              </h3>
              <p className="text-xs text-orange-800 mt-2 leading-relaxed">
                Automatically screened against 2026 OHCS Purchase Price Limits by County and LMI census tract location.
              </p>
            </div>
          </div>
        </div>

        {/* Right Col: Property Receiver Queue */}
        <div className="lg:col-span-8">
          <div 
            className={`bg-white rounded-3xl border ${isDragging ? 'border-emerald-500 bg-emerald-50/20' : 'border-[#EAE7E0]'} shadow-xs flex flex-col h-[calc(100vh-200px)] min-h-[600px] transition-colors relative`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 z-10 rounded-3xl bg-emerald-500/10 backdrop-blur-[2px] flex items-center justify-center border-2 border-dashed border-emerald-500">
                <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-3">
                  <Upload className="w-10 h-10 text-emerald-600 animate-bounce" />
                  <h3 className="font-bold text-emerald-900 text-lg">Drop CSV or JSON here</h3>
                  <p className="text-xs text-emerald-700">Release to import properties</p>
                </div>
              </div>
            )}
            <div className="p-4 border-b border-[#EAE7E0] flex justify-between items-center bg-[#FAF9F5] rounded-t-3xl">
              <h3 className="font-bold text-[#2D362E] flex items-center gap-2">
                <Inbox className="w-5 h-5 text-[#C18C5D]" />
                Receiver Queue
                <span className="bg-[#EAE7E0] text-[#606C5D] text-xs px-2 py-0.5 rounded-full ml-2">
                  {processedListings.length}
                </span>
              </h3>
              <div className="relative w-64">
                <Search className="w-4 h-4 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search by address or city..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE7E0] rounded-xl text-xs focus:ring-2 focus:ring-[#4A5D4E] outline-hidden"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7F4]">
              {processedListings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#EAE7E0] flex items-center justify-center shadow-sm">
                    <Inbox className="w-8 h-8 text-[#C18C5D] opacity-50" />
                  </div>
                  <div>
                    <h4 className="text-[#2D362E] font-bold">Queue is empty</h4>
                    <p className="text-[#606C5D] text-xs mt-1">Upload a GeoSphere Map payload or simulate a push to begin.</p>
                  </div>
                </div>
              ) : (
                processedListings.map(listing => (
                  <div key={listing.id} className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-sm flex flex-col sm:flex-row gap-4">
                    {/* Visual */}
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt={listing.address} className="w-full sm:w-32 h-24 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full sm:w-32 h-24 bg-[#F1EFE9] rounded-xl flex items-center justify-center">
                        <Home className="w-8 h-8 text-[#9A9488]" />
                      </div>
                    )}
                    
                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-[#2D362E] text-sm">{listing.address}</h4>
                          <p className="text-xs text-[#606C5D]">{listing.city}, OR {listing.zip}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#2D362E] text-sm">{formatUSD(listing.price)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-xs text-[#606C5D]">
                        <span>{listing.beds} Beds</span>
                        <span>{listing.baths} Baths</span>
                        <span>{listing.sqft} SqFt</span>
                        <span>{listing.eval.county} County</span>
                      </div>
                      
                      {/* Real-time Eligibility Badges */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F1EFE9]">
                        {listing.eval.usdaQualifies && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold tracking-wide">
                            <span className="text-sm">🚜</span> USDA RD
                          </span>
                        )}
                        {listing.eval.lakeviewQualifies && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold tracking-wide">
                            <span className="text-sm">🌊</span> Lakeview
                          </span>
                        )}
                        {listing.eval.ohcsQualifies && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-200 text-orange-800 text-[10px] font-bold tracking-wide">
                            <span className="text-sm">🏠</span> FirstHome
                          </span>
                        )}
                        
                        {(!listing.eval.usdaQualifies && !listing.eval.lakeviewQualifies && !listing.eval.ohcsQualifies) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-stone-500 text-[10px] font-bold tracking-wide">
                            No Standard DPA Match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
