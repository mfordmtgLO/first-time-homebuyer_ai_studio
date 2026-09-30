import React, { useState, useMemo, useEffect, useCallback } from "react";
import { MarkerClusterer, type Marker } from "@googlemaps/markerclusterer";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Circle,
  useMap,
} from "@vis.gl/react-google-maps";
import {
  MapPin,
  SlidersHorizontal,
  Compass,
  GraduationCap,
  Train,
  ShoppingCart,
  Trees,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Eye,
  Building,
  KeyRound,
  ExternalLink,
  X,
  Flame,
  Bed,
  Bath,
  Maximize,
  MessageSquare,
  PersonStanding,
  Clock,
} from "lucide-react";
import { PropertyListing, FinancialProfile, PropertyConversation } from "../types";
import { subscribeToPropertyConversation } from "../services/propertyConversationService";
import { formatUSD } from "../utils/mortgageMath";
import {
  getListingCoordinates,
  getListingSchoolDistrict,
  getNearbyAmenities,
  calculateHomebuyingReadiness,
  calculateHaversineDistance,
  OREGON_CITY_COORDINATES,
  OREGON_SCHOOL_DISTRICTS,
  KEY_OREGON_AMENITIES,
} from "../utils/propertyMapUtils";
import { getZillowUrl } from "../utils/overlayClassification";
import { UsdaArcGisMapLayer, UsdaArcGisLayerControlWidget } from "./UsdaArcGisMapLayer";

interface PropertyMapOverlayProps {
  properties: PropertyListing[];
  profile?: FinancialProfile;
  onOpenScorecard?: (property: PropertyListing) => void;
  onAskAiAboutProperty?: (property: PropertyListing) => void;
  compareIds?: string[];
  onToggleCompare?: (propertyId: string) => void;
  onSelectProperty?: (property: PropertyListing) => void;
  onCloseMap?: () => void;
}

const MAP_LIBRARIES: any = ["visualization"];

const GeosphereHeatmap: React.FC<{
  properties: PropertyListing[];
  amenities: any[];
  visible: boolean;
}> = ({ properties, amenities, visible }) => {
  const map = useMap();
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps || !window.google.maps.visualization) return;

    // Utilize Geosphere logic conceptually: cluster properties and amenities
    const heatmapData: any[] = [];

    // Add properties with weight based on readiness score (higher score = more intense heat)
    properties.forEach((p) => {
      heatmapData.push({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: (p.readiness?.score || 50) / 10,
      });
    });

    // Add amenities as high-density anchors to show clustering
    amenities.forEach((a) => {
      heatmapData.push({
        location: new google.maps.LatLng(a.lat, a.lng),
        weight: 15, // High weight for amenities to form strong cluster centers
      });
    });

    const layer = new (google.maps.visualization as any).HeatmapLayer({
      data: heatmapData,
      map: visible ? map : null,
      radius: 40,
      opacity: 0.6,
      gradient: [
        "rgba(0, 255, 255, 0)",
        "rgba(0, 255, 255, 1)",
        "rgba(89, 193, 115, 1)",
        "rgba(205, 220, 57, 1)",
        "rgba(255, 193, 7, 1)",
        "rgba(255, 87, 34, 1)",
        "rgba(211, 47, 47, 1)",
      ],
    });

    setHeatmap(layer);

    return () => {
      (layer as any).setMap(null);
    };
  }, [map, properties, amenities]);

  useEffect(() => {
    if (heatmap) {
      (heatmap as any).setMap(visible ? map : null);
    }
  }, [visible, heatmap, map]);

  return null;
};


export const ClusteredPropertyMarkers = ({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  setSelectedPropertyId,
  setHoveredPropertyId,
}: any) => {
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, property: any } | null>(null);
  const map = useMap();

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const clusterer = useMemo(() => {
    if (!map) return null;
    return new MarkerClusterer({ map });
  }, [map]);

  const setMarkerRef = useCallback((marker: Marker | null, key: string) => {
    setMarkers((currentMarkers) => {
      if ((marker && currentMarkers[key]) || (!marker && !currentMarkers[key])) return currentMarkers;
      if (marker) {
        return { ...currentMarkers, [key]: marker };
      } else {
        const { [key]: _, ...newMarkers } = currentMarkers;
        return newMarkers;
      }
    });
  }, []);

  useEffect(() => {
    if (!clusterer) return;
    try {
      clusterer.clearMarkers();
      const validMarkers = Object.values(markers).filter(
        (m) => m && typeof (m as any).getPosition === "function"
      );
      if (validMarkers.length > 0) {
        clusterer.addMarkers(validMarkers);
      }
    } catch (err) {
      console.warn("MarkerClusterer notice:", err);
    }
  }, [clusterer, markers]);

  return (
    <>
      {properties.map((property: any) => {
        const isSelected = selectedPropertyId === property.id;
        const isHovered = hoveredPropertyId === property.id;

        const pinBg =
          property.readiness.tier === "High"
            ? "#15803d" // emerald-700
            : property.readiness.tier === "Moderate"
              ? "#b45309" // amber-700
              : "#475569"; // slate-600

        return (
          <AdvancedMarker
            key={property.id}
            position={{ lat: property.lat, lng: property.lng }}
            onClick={() => setSelectedPropertyId(property.id)}
            zIndex={isSelected ? 100 : isHovered ? 90 : 50}
            ref={(marker) => setMarkerRef(marker, property.id)}
          >
            <div
              onMouseEnter={() => setHoveredPropertyId(property.id)}
              onMouseLeave={() => setHoveredPropertyId(null)}
              className={`flex flex-col items-center cursor-pointer transition-all transform ${
                isSelected ? "scale-115" : isHovered ? "scale-110" : "scale-100"
              }`}
            >
              {/* Price Tag Chip */}
              <div
                style={{ backgroundColor: pinBg }}
                className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-md border-2 border-white flex items-center gap-1 whitespace-nowrap`}
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>${Math.round(property.price / 1000)}k</span>
              </div>
              {/* Indicator triangle */}
              <div
                style={{ backgroundColor: pinBg }}
                className="w-2 h-2 rotate-45 -mt-1 border-r border-b border-white"
              ></div>
            </div>
          </AdvancedMarker>
        );
      })}
      
      {/* Custom Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-stone-200 py-1.5 min-w-[180px] overflow-hidden"
          style={{ 
            top: Math.min(contextMenu.y, window.innerHeight - 100), 
            left: Math.min(contextMenu.x, window.innerWidth - 200) 
          }}
          onClick={(e) => e.stopPropagation()}
        >
           <button
             className="w-full text-left px-4 py-2 hover:bg-stone-50 text-[#2D362E] text-xs font-semibold flex items-center gap-2"
             onClick={(e) => {
               e.stopPropagation();
               if (map) {
                 const sv = map.getStreetView();
                 sv.setPosition({ lat: contextMenu.property.lat, lng: contextMenu.property.lng });
                 sv.setVisible(true);
               }
               setContextMenu(null);
             }}
           >
             <PersonStanding className="w-3.5 h-3.5 text-blue-600"/>
             View Street Level
           </button>
           <button
             className="w-full text-left px-4 py-2 hover:bg-stone-50 text-[#2D362E] text-xs font-semibold flex items-center gap-2"
             onClick={(e) => {
               e.stopPropagation();
               setSelectedPropertyId(contextMenu.property.id);
               setContextMenu(null);
             }}
           >
             <Eye className="w-3.5 h-3.5 text-[#4A5D4E]"/>
             View Details
           </button>
        </div>
      )}
    </>
  );
};


const SmsShareButton = ({ property }: { property: any }) => {
  const shareViaSMS = (e: React.MouseEvent) => {
    e.stopPropagation();
    const propertyLink = `${window.location.origin}${window.location.pathname}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const separator = isIOS ? '&' : '?';
    const message = `Check out this property: ${property.address}, ${property.city}.\n\nView here: ${propertyLink}?property=${property.id}`;
    window.location.href = `sms:${separator}body=${encodeURIComponent(message)}`;
  };

  return (
    <button
      onClick={shareViaSMS}
      className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-[#606C5D]"
      title="Share via SMS"
    >
      <MessageSquare className="w-3 h-3" />
    </button>
  );
};

const StreetViewButton = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  return (
    <button
      onClick={() => {
        if (map) {
          const sv = map.getStreetView();
          sv.setPosition({ lat, lng });
          sv.setVisible(true);
        }
      }}
      className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-[#606C5D]"
      title="Open Google Street View"
    >
      <PersonStanding className="w-3 h-3" />
    </button>
  );
};

export const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> = ({
  properties,
  profile,
  onOpenScorecard,
  onAskAiAboutProperty,
  compareIds,
  onToggleCompare,
  onCloseMap,
}) => {
  // Read Google Maps API Key from environment
  const envApiKey = ((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "";
  const [apiKey, setApiKey] = useState<string>(() => {
    return envApiKey || localStorage.getItem("temp_gmp_api_key") || "";
  });
  const [tempKeyInput, setTempKeyInput] = useState<string>("");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  // Search Origin / Anchor Point
  const [selectedCityAnchor, setSelectedCityAnchor] = useState<string>("portland");
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number }>(() => {
    return OREGON_CITY_COORDINATES["portland"];
  });

  // Search Radius in statute miles (default: 5 miles)
  const [searchRadiusMiles, setSearchRadiusMiles] = useState<number>(5);

  // Filters
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("all");
  const [readinessTierFilter, setReadinessTierFilter] = useState<string>("all");
  const [filterTransitOnly, setFilterTransitOnly] = useState<boolean>(false);
  const [filterTopSchoolsOnly, setFilterTopSchoolsOnly] = useState<boolean>(false);
  const [filterGroceryOnly, setFilterGroceryOnly] = useState<boolean>(false);
  const [filterParksOnly, setFilterParksOnly] = useState<boolean>(false);
  const [showAmenitiesOnMap, setShowAmenitiesOnMap] = useState<boolean>(true);

  // Interactive Marker Selection
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showUsdaArcGisLayer, setShowUsdaArcGisLayer] = useState<boolean>(true);
  const [usdaLayerOpacity, setUsdaLayerOpacity] = useState<number>(0.55);

  // Map view type: 'google' or 'fallback_vector'
  const isGoogleMapsReady = Boolean(apiKey && apiKey.trim().length > 10);

  // Handle Find Me using geolocation
  const handleFindMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedCityAnchor("custom");
          setSearchCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Could not get your location. Please check browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  // Synchronize search center when city anchor changes
  const handleCityAnchorChange = (cityKey: string) => {
    setSelectedCityAnchor(cityKey);
    const coords = OREGON_CITY_COORDINATES[cityKey] || OREGON_CITY_COORDINATES["portland"];
    setSearchCenter(coords);
  };

  // Save manual key input
  const handleApplyApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKeyInput.trim()) {
      setApiKey(tempKeyInput.trim());
      localStorage.setItem("temp_gmp_api_key", tempKeyInput.trim());
      setShowKeyInput(false);
    }
  };

  // Pre-process all properties with geocodes, school districts, amenities, and homebuying readiness
  const enrichedProperties = useMemo(() => {
    return properties.map((property) => {
      const coords = getListingCoordinates(property);
      const { district, assignedSchools } = getListingSchoolDistrict(
        property,
        coords.lat,
        coords.lng
      );
      const amenities = getNearbyAmenities(coords.lat, coords.lng, 8);
      const defaultProfile = { downPaymentSavings: 0, interestRate: 6.5, loanTermYears: 30, annualHomeInsurance: 1200, targetMonthlyPayment: 2500, dtiLimit: 43 };
      const readiness = profile ? calculateHomebuyingReadiness(property, profile) : calculateHomebuyingReadiness(property, defaultProfile as any);
      const distanceFromCenter = calculateHaversineDistance(
        searchCenter.lat,
        searchCenter.lng,
        coords.lat,
        coords.lng
      );

      return {
        ...property,
        lat: coords.lat,
        lng: coords.lng,
        schoolDistrict: district.name,
        districtInfo: district,
        assignedSchools,
        amenities,
        readiness,
        distanceFromCenter,
      };
    });
  }, [properties, profile, searchCenter]);

  // Filter properties based on radius, school district, amenity proximity, and readiness tier
  const filteredProperties = useMemo(() => {
    return enrichedProperties
      .filter((item) => {
        // 1. Radius Check
        if (item.distanceFromCenter > searchRadiusMiles) {
          return false;
        }

        // 2. School District Check
        if (selectedDistrictId !== "all" && item.districtInfo.id !== selectedDistrictId) {
          return false;
        }

        // 3. Readiness Tier Check
        if (readinessTierFilter !== "all" && item.readiness.tier !== readinessTierFilter) {
          return false;
        }

        // 4. Transit Proximity Check (< 1.5 miles to transit)
        if (filterTransitOnly) {
          const hasCloseTransit = item.amenities.some(
            (a) => a.amenity.category === "transit" && a.distanceMiles <= 1.5
          );
          if (!hasCloseTransit) return false;
        }

        // 5. Top Schools Proximity Check (< 1.5 miles to high rated school)
        if (filterTopSchoolsOnly) {
          const hasCloseSchool = item.assignedSchools.some(
            (s) => s.rating >= 8 && s.distanceMiles <= 1.5
          );
          if (!hasCloseSchool) return false;
        }

        // 6. Grocery Proximity Check (< 1.2 miles)
        if (filterGroceryOnly) {
          const hasCloseGrocery = item.amenities.some(
            (a) => a.amenity.category === "grocery" && a.distanceMiles <= 1.2
          );
          if (!hasCloseGrocery) return false;
        }

        // 7. Parks Proximity Check (< 1.0 mile)
        if (filterParksOnly) {
          const hasClosePark = item.amenities.some(
            (a) => a.amenity.category === "park" && a.distanceMiles <= 1.0
          );
          if (!hasClosePark) return false;
        }

        return true;
      })
      .sort((a, b) => b.readiness.score - a.readiness.score);
  }, [
    enrichedProperties,
    searchRadiusMiles,
    selectedDistrictId,
    readinessTierFilter,
    filterTransitOnly,
    filterTopSchoolsOnly,
    filterGroceryOnly,
    filterParksOnly,
  ]);

  // Currently selected property object
  const activeSelectedProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return enrichedProperties.find((p) => p.id === selectedPropertyId) || null;
  }, [selectedPropertyId, enrichedProperties]);

  // Radius summary statistics
  const radiusStats = useMemo(() => {
    const totalCount = filteredProperties.length;
    const highReadinessCount = filteredProperties.filter((p) => p.readiness.tier === "High").length;
    const avgPrice =
      totalCount > 0
        ? Math.round(filteredProperties.reduce((acc, p) => acc + p.price, 0) / totalCount)
        : 0;
    const avgScore =
      totalCount > 0
        ? Math.round(filteredProperties.reduce((acc, p) => acc + p.readiness.score, 0) / totalCount)
        : 0;

    return { totalCount, highReadinessCount, avgPrice, avgScore };
  }, [filteredProperties]);

  // Preset Radius Buttons
  const RADIUS_PRESETS = [
    { miles: 1, label: "1 mi (Hyperlocal)" },
    { miles: 3, label: "3 mi (Neighborhood)" },
    { miles: 5, label: "5 mi (Suburban)" },
    { miles: 10, label: "10 mi (Metro Area)" },
    { miles: 15, label: "15 mi (District)" },
    { miles: 25, label: "25 mi (Regional)" },
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7E0] overflow-hidden shadow-sm space-y-0">
      {/* Top Banner & Radius Summary Bar */}
      <div className="p-5 sm:p-6 bg-[#FAF9F5] border-b border-[#EAE7E0] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE7E0]/60 text-[#4A5D4E] text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>Google Maps Platform Overlay & Radius Search</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E] flex items-center gap-2">
            <span>Homebuying Readiness Radius Explorer</span>
          </h3>
          <div className="mt-4 p-3 bg-white border border-[#EAE7E0] rounded-xl shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-[#2D362E]">Ask GeoSphere AI</span>
              </div>
              <span className="text-[10px] text-white bg-indigo-500 px-2 py-0.5 rounded-full font-bold">
                New
              </span>
            </div>
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements[0] as HTMLInputElement;
                const query = input.value;
                if (!query) return;

                let parsed: any = null;
                try {
                  const res = await fetch("/api/gemini/parse-property-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query })
                  });
                  if (res.ok) {
                    parsed = await res.json();
                  }
                } catch (err) {
                  console.error("Failed to parse via Gemini", err);
                }

                let city = (parsed?.city || "portland").toLowerCase();
                
                // Fallback normalizations for common OR cities
                if (!OREGON_CITY_COORDINATES[city] && city !== "veneta") {
                   city = "portland";
                }

                setSelectedCityAnchor(city);
                const coords = OREGON_CITY_COORDINATES[city] || OREGON_CITY_COORDINATES["portland"];
                
                // If it's a specific custom area not in standard keys, manually set coordinates
                if (city === "veneta") {
                   setSearchCenter({ lat: 44.0492, lng: -123.3486 });
                } else {
                   setSearchCenter(coords);
                }
              }}
            >
              <input
                type="text"
                placeholder="e.g., Show me homes under $450k near St. Johns that qualify for the DevNW 0% down grant..."
                className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
              >
                Search Map
              </button>
            </form>
          </div>
          <p className="text-xs sm:text-sm text-[#606C5D]">
            Inspect real properties within tailored radii, evaluate assigned Oregon school
            districts, and gauge walk/drive proximity to essential amenities.
          </p>
        </div>

        {/* Quick Radius Statistics Box */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#EAE7E0] shadow-2xs">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-[#9A9488]">
              Homes in Radius
            </span>
            <span className="text-base font-serif font-bold text-[#2D362E]">
              {radiusStats.totalCount}{" "}
              <span className="text-xs font-sans font-normal text-[#606C5D]">
                ({radiusStats.highReadinessCount} High Readiness)
              </span>
            </span>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#EAE7E0] shadow-2xs">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-[#9A9488]">
              Average Value
            </span>
            <span className="text-base font-serif font-bold text-[#4A5D4E]">
              {radiusStats.totalCount > 0 ? formatUSD(radiusStats.avgPrice) : "—"}
            </span>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-xl border border-[#EAE7E0] shadow-2xs">
            <span className="block text-[10px] uppercase tracking-wider font-bold text-[#9A9488]">
              Readiness Index
            </span>
            <span className="text-base font-serif font-bold text-[#C18C5D]">
              {radiusStats.totalCount > 0 ? `${radiusStats.avgScore} / 100` : "—"}
            </span>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              showHeatmap
                ? "bg-rose-100 text-rose-700 border-rose-200"
                : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#FAF9F5]"
            } border shadow-2xs`}
          >
            <Flame className="w-3.5 h-3.5" />
            Geosphere Heatmap
          </button>

          {onCloseMap && (
            <button
              onClick={onCloseMap}
              className="p-2.5 rounded-xl border border-[#EAE7E0] bg-white hover:bg-stone-100 text-[#606C5D] cursor-pointer transition-all"
              title="Return to Grid View"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* API Key Connect & Quickstart Guide Banner */}
      {!isGoogleMapsReady && (
        <div className="p-4 bg-[#F5F2EB] border-b border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] shrink-0 mt-0.5">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#2D362E]">
                Active Google Maps Platform Integration Available
              </p>
              <p className="text-[#606C5D] mt-0.5">
                The interactive map overlay is rendering in high-precision vector mode. To activate
                live Google satellite & street base layers, provide a Google Maps API Key or free
                Maps Demo Key.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#FAF9F5] font-semibold transition-all text-xs"
            >
              <span>Get Free Demo Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setShowKeyInput((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-[#4A5D4E] text-white hover:bg-[#38463B] font-semibold transition-all text-xs"
            >
              {showKeyInput ? "Close Key Bar" : "Enter API Key"}
            </button>
          </div>
        </div>
      )}

      {/* Manual API Key Input Dropdown */}
      {showKeyInput && (
        <form
          onSubmit={handleApplyApiKey}
          className="p-4 bg-white border-b border-[#EAE7E0] flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Paste Google Maps Platform API Key (AIzaSy...)"
              value={tempKeyInput}
              onChange={(e) => setTempKeyInput(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#EAE7E0] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white font-semibold text-xs hover:bg-[#38463B] transition-all shrink-0 cursor-pointer"
          >
            Activate Live Map
          </button>
        </form>
      )}

      {/* Search Controls & Filter Drawer Row */}
      <div className="p-4 sm:p-5 border-b border-[#EAE7E0] bg-white space-y-4">
        {/* Row 1: Search Origin & Radius Selection */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Origin / City Anchor */}
          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>Search Center Origin</span>
              </label>
              <button 
                onClick={handleFindMe}
                className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] hover:bg-[#4A5D4E]/20 transition-colors font-bold cursor-pointer"
                title="Center map on my current location"
              >
                Find Me
              </button>
            </div>
            <select
              value={selectedCityAnchor}
              onChange={(e) => handleCityAnchorChange(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              <option value="custom" className="font-bold text-[#4A5D4E] hidden">📍 My Current Location</option>
              <option value="junction city">Junction City (Lane County / RentCast Live Pull)</option>
              <option value="veneta">Veneta (Lane County Rural / USDA 0% Down)</option>
              <option value="eugene">Eugene / Springfield (Willamette Valley / 4J)</option>
              <option value="coos bay">Coos Bay / North Bend / Bandon (Coastal / USDA 100%)</option>
              <option value="bend">Bend / Redmond / Sisters (Central Oregon Cascades)</option>
              <option value="portland">Portland Metro (Division / Multnomah)</option>
              <option value="beaverton">Beaverton (Silicon Forest / MAX)</option>
              <option value="lake oswego">Lake Oswego (Top Ranked Schools)</option>
              <option value="hillsboro">Hillsboro (Tech Corridor / Orenco)</option>
              <option value="salem">Salem / Marion County (Capital / Keizer)</option>
              <option value="corvallis">Corvallis / Albany (Linn-Benton)</option>
              <option value="roseburg">Roseburg / Douglas County</option>
              <option value="medford">Medford / Grants Pass (Southern OR)</option>
            </select>
          </div>

          {/* Radius Selector Presets & Slider */}
          <div className="md:col-span-8 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#606C5D] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Search Radius Visualization</span>
              </span>
              <span className="font-serif font-bold text-[#4A5D4E] text-xs lowercase">
                <span className="font-bold text-sm text-[#2D362E]">{searchRadiusMiles}</span> miles
                circle
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.miles}
                  onClick={() => setSearchRadiusMiles(preset.miles)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    searchRadiusMiles === preset.miles
                      ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                      : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}

              <button
                onClick={() => setShowHeatmap((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ml-auto ${
                  showHeatmap
                    ? "bg-purple-700 text-white shadow-md font-bold"
                    : "bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100"
                }`}
                title="Toggle Google Maps heatmap overlay for market hotspots and readiness density"
              >
                <Flame className="w-3.5 h-3.5 text-purple-300" />
                <span>{showHeatmap ? "Hide Heatmap" : "Market Heatmap"}</span>
              </button>

              <UsdaArcGisLayerControlWidget
                visible={showUsdaArcGisLayer}
                onToggle={() => setShowUsdaArcGisLayer((prev) => !prev)}
                opacity={usdaLayerOpacity}
                onOpacityChange={setUsdaLayerOpacity}
                selectedState="OR"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Filters: School District, Readiness Tier, and Amenity Proximity */}
        <div className="pt-3 border-t border-[#EAE7E0]/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* School District Dropdown */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>School District Filter</span>
            </label>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="w-full text-xs font-medium px-2.5 py-1.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              <option value="all">All Oregon School Districts</option>
              {OREGON_SCHOOL_DISTRICTS.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name} (Rated {district.averageRating}/10)
                </option>
              ))}
            </select>
          </div>

          {/* Readiness Tier Filter */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Homebuying Readiness Tier</span>
            </label>
            <div className="flex items-center gap-1">
              {[
                { id: "all", label: "All Readiness" },
                { id: "High", label: "High (85+)" },
                { id: "Moderate", label: "Moderate (70+)" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setReadinessTierFilter(tier.id)}
                  className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer truncate text-center ${
                    readinessTierFilter === tier.id
                      ? "bg-[#4A5D4E] text-white font-bold shadow-2xs"
                      : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amenity Proximity Toggles */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Train className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>Proximity to Key Amenities</span>
              </span>
              <button
                onClick={() => setShowAmenitiesOnMap((prev) => !prev)}
                className={`text-[10px] font-semibold underline cursor-pointer ${
                  showAmenitiesOnMap ? "text-[#4A5D4E]" : "text-[#9A9488]"
                }`}
              >
                {showAmenitiesOnMap ? "Amenities Visible" : "Amenities Hidden"}
              </button>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterTransitOnly((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterTransitOnly
                    ? "bg-[#4A5D4E] text-white"
                    : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
                title="Only show homes within 1.5 mi of MAX or Transit"
              >
                <Train className="w-3 h-3" />
                <span>Transit &lt;1.5mi</span>
              </button>

              <button
                onClick={() => setFilterTopSchoolsOnly((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterTopSchoolsOnly
                    ? "bg-[#4A5D4E] text-white"
                    : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
                title="Only show homes near top-rated (8+) schools"
              >
                <GraduationCap className="w-3 h-3" />
                <span>Schools &lt;1.5mi</span>
              </button>

              <button
                onClick={() => setFilterGroceryOnly((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterGroceryOnly
                    ? "bg-[#4A5D4E] text-white"
                    : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
                title="Only show homes near Trader Joe's, Whole Foods, New Seasons, etc."
              >
                <ShoppingCart className="w-3 h-3" />
                <span>Groceries &lt;1.2mi</span>
              </button>

              <button
                onClick={() => setFilterParksOnly((prev) => !prev)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  filterParksOnly
                    ? "bg-[#4A5D4E] text-white"
                    : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
                title="Only show homes near scenic parks and trails"
              >
                <Trees className="w-3 h-3" />
                <span>Parks &lt;1mi</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Synchronized Properties Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        {/* Left / Sidebar Drawer: Matching Homes within the Active Radius (4 cols) */}
        <div className="lg:col-span-4 border-r border-[#EAE7E0] bg-[#FAF9F5] p-4 flex flex-col max-h-[640px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#EAE7E0]">
            <div className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#4A5D4E]" />
              <span className="font-serif font-bold text-sm text-[#2D362E]">
                Homes In Radius ({filteredProperties.length})
              </span>
            </div>
            <span className="text-[10px] font-bold text-[#606C5D] bg-white px-2 py-0.5 rounded-full border border-[#EAE7E0]">
              Sorted by Readiness
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredProperties.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#606C5D] bg-white rounded-2xl border border-dashed border-[#EAE7E0] space-y-2 my-4">
                <Compass className="w-8 h-8 text-[#9A9488] mx-auto opacity-50" />
                <p className="font-semibold text-[#2D362E]">
                  No properties match within {searchRadiusMiles} miles.
                </p>
                <p>
                  Expand your search radius slider or choose another city origin to discover more
                  homes.
                </p>
                <button
                  onClick={() => setSearchRadiusMiles(15)}
                  className="px-3 py-1.5 rounded-lg bg-[#4A5D4E] text-white font-semibold text-xs mt-2"
                >
                  Expand to 15 Miles
                </button>
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isSelected = selectedPropertyId === property.id;
                const isHovered = hoveredPropertyId === property.id;
                const isCompared = compareIds?.includes(property.id) || false;

                return (
                  <div
                    key={property.id}
                    onMouseEnter={() => setHoveredPropertyId(property.id)}
                    onMouseLeave={() => setHoveredPropertyId(null)}
                    onClick={() => setSelectedPropertyId(property.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white space-y-2.5 ${
                      isSelected
                        ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20 shadow-md"
                        : isHovered
                          ? "border-[#C18C5D] shadow-sm"
                          : "border-[#EAE7E0] hover:border-[#C18C5D]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${property.readiness.badgeColor}`}
                          >
                            {property.readiness.score}/100 • {property.readiness.tier}
                          </span>
                          <span className="text-[10px] font-medium text-[#606C5D] bg-[#FAF9F5] px-1.5 py-0.5 rounded">
                            {property.distanceFromCenter} mi away
                          </span>
                        </div>
                        <h4
                          className="font-serif font-bold text-xs text-[#2D362E] truncate"
                          title={property.title}
                        >
                          {property.title}
                        </h4>
                        <p className="text-[11px] text-[#606C5D] truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#9A9488] shrink-0" />
                          <span>
                            {property.address}, {property.city}
                          </span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-serif font-bold text-sm text-[#4A5D4E] block">
                          {formatUSD(property.price)}
                        </span>
                        <span className="text-[10px] text-[#606C5D]">
                          est. ${property.readiness.monthlyPaymentEstimate.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>

                    {/* School District & Top School Tag */}
                    <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[10px] text-[#2D362E] space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1 text-[#4A5D4E]">
                          <GraduationCap className="w-3 h-3" />
                          <span className="truncate max-w-[170px]">
                            {property.districtInfo.name}
                          </span>
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                          Rating {property.districtInfo.averageRating}/10
                        </span>
                      </div>
                      {property.assignedSchools[0] && (
                        <p className="text-[10px] text-[#606C5D] truncate">
                          Nearest: <strong>{property.assignedSchools[0].name}</strong> (
                          {property.assignedSchools[0].rating}/10) •{" "}
                          {property.assignedSchools[0].distanceMiles} mi
                        </p>
                      )}
                    </div>

                    {/* Key Proximity Amenities Highlights */}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-[#606C5D]">
                      {property.amenities.slice(0, 2).map((am, idx) => (
                        <span
                          key={idx}
                          className="bg-white border border-[#EAE7E0] px-1.5 py-0.5 rounded flex items-center gap-1"
                        >
                          {am.amenity.category === "transit" && (
                            <Train className="w-2.5 h-2.5 text-[#C18C5D]" />
                          )}
                          {am.amenity.category === "grocery" && (
                            <ShoppingCart className="w-2.5 h-2.5 text-[#4A5D4E]" />
                          )}
                          {am.amenity.category === "park" && (
                            <Trees className="w-2.5 h-2.5 text-emerald-600" />
                          )}
                          {am.amenity.category === "health" && (
                            <HeartPulse className="w-2.5 h-2.5 text-red-500" />
                          )}
                          <span className="truncate max-w-[120px]">{am.amenity.name}</span> (
                          {am.distanceMiles}m)
                        </span>
                      ))}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-[#EAE7E0]/60 flex items-center justify-between gap-1 text-[11px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenScorecard) onOpenScorecard(property);
                        }}
                        className="text-[#4A5D4E] hover:text-[#38463B] font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Tour Audit</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAskAiAboutProperty) onAskAiAboutProperty(property);
                        }}
                        className="text-[#C18C5D] hover:text-[#A87447] font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Readiness</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleCompare) onToggleCompare(property.id);
                        }}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-all ${
                          isCompared
                            ? "bg-[#C18C5D] text-white"
                            : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                        }`}
                      >
                        {isCompared ? "Compared" : "+ Compare"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Interactive Google Map / Vector Canvas (8 cols) */}
        <div className="lg:col-span-8 relative h-[560px] sm:h-[640px] w-full bg-[#E5E9E5]">
          {isGoogleMapsReady ? (
            <APIProvider apiKey={apiKey} libraries={MAP_LIBRARIES}>
              <div className="w-full h-full relative" style={{ minHeight: "560px" }}>
                <Map
                  defaultCenter={searchCenter}
                  center={searchCenter}
                  defaultZoom={searchRadiusMiles <= 3 ? 13 : searchRadiusMiles <= 8 ? 12 : 10}
                  zoom={searchRadiusMiles <= 3 ? 13 : searchRadiusMiles <= 8 ? 12 : 10}
                  gestureHandling={"greedy"}
                  disableDefaultUI={false}
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                  style={{ width: "100%", height: "100%", minHeight: "560px" }}
                >
                  <GeosphereHeatmap
                    properties={filteredProperties}
                    amenities={KEY_OREGON_AMENITIES}
                    visible={showHeatmap}
                  />
                  <UsdaArcGisMapLayer
                    visible={showUsdaArcGisLayer}
                    opacity={usdaLayerOpacity}
                    stateCode="OR"
                  />
                  {/* Visual Search Radius Circle */}
                  <Circle
                    center={searchCenter}
                    radius={searchRadiusMiles * 1609.34} // Statute miles to meters
                    strokeColor="#4A5D4E"
                    strokeOpacity={0.85}
                    strokeWeight={2}
                    fillColor="#4A5D4E"
                    fillOpacity={0.12}
                    clickable={false}
                  />

                  {/* Search Origin Pin */}
                  <AdvancedMarker
                    position={searchCenter}
                    title={`Search Center: ${selectedCityAnchor.toUpperCase()}`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="px-2.5 py-1 rounded-full bg-[#2D362E] text-white text-[10px] font-bold shadow-md whitespace-nowrap border border-white flex items-center gap-1">
                        <Compass className="w-3 h-3 text-[#C18C5D]" />
                        <span>Radius Center ({searchRadiusMiles} mi)</span>
                      </div>
                      <div className="w-3 h-3 bg-[#2D362E] rotate-45 -mt-1.5 border-r border-b border-white"></div>
                    </div>
                  </AdvancedMarker>

                  {/* Amenity Markers (when toggled on) */}
                  {showAmenitiesOnMap &&
                    KEY_OREGON_AMENITIES.map((amenity) => {
                      const distFromCenter = calculateHaversineDistance(
                        searchCenter.lat,
                        searchCenter.lng,
                        amenity.lat,
                        amenity.lng
                      );
                      if (distFromCenter > searchRadiusMiles * 1.3) return null;

                      return (
                        <AdvancedMarker
                          key={amenity.id}
                          position={{ lat: amenity.lat, lng: amenity.lng }}
                          title={`${amenity.name} (${amenity.label})`}
                        >
                          <div className="p-1 rounded-full bg-white shadow-sm border border-[#EAE7E0] hover:scale-125 transition-transform cursor-pointer">
                            {amenity.category === "transit" && (
                              <Train className="w-3.5 h-3.5 text-[#C18C5D]" />
                            )}
                            {amenity.category === "school" && (
                              <GraduationCap className="w-3.5 h-3.5 text-[#4A5D4E]" />
                            )}
                            {amenity.category === "grocery" && (
                              <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                            {amenity.category === "park" && (
                              <Trees className="w-3.5 h-3.5 text-green-600" />
                            )}
                            {amenity.category === "health" && (
                              <HeartPulse className="w-3.5 h-3.5 text-red-500" />
                            )}
                          </div>
                        </AdvancedMarker>
                      );
                    })}

                  
                  {/* Clustered Property Markers */}
                  <ClusteredPropertyMarkers
                    properties={filteredProperties}
                    selectedPropertyId={selectedPropertyId}
                    hoveredPropertyId={hoveredPropertyId}
                    setSelectedPropertyId={setSelectedPropertyId}
                    setHoveredPropertyId={setHoveredPropertyId}
                  />
{/* Active Selected Property InfoWindow */}
                  {activeSelectedProperty && (
                    <InfoWindow
                      position={{
                        lat: activeSelectedProperty.lat,
                        lng: activeSelectedProperty.lng,
                      }}
                      onCloseClick={() => setSelectedPropertyId(null)}
                    >
                      <div className="p-1 max-w-[280px] space-y-2 text-[#2D362E]">
                        <div className="relative rounded-xl overflow-hidden h-28 w-full bg-stone-100">
                          <img
                            src={activeSelectedProperty.imageUrl}
                            alt={activeSelectedProperty.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span
                            className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${activeSelectedProperty.readiness.badgeColor}`}
                          >
                            {activeSelectedProperty.readiness.score}/100 •{" "}
                            {activeSelectedProperty.readiness.tier}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-sm text-[#4A5D4E]">
                              {formatUSD(activeSelectedProperty.price)}
                            </span>
                            <span className="text-[10px] text-[#606C5D]">
                              est. $
                              {activeSelectedProperty.readiness.monthlyPaymentEstimate.toLocaleString()}
                              /mo
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-xs leading-tight">
                            {activeSelectedProperty.title}
                          </h4>
                          <p className="text-[10px] text-[#606C5D]">
                            {activeSelectedProperty.address}, {activeSelectedProperty.city}
                          </p>
                        </div>

                        {/* Beds, Baths, Sqft, DOM */}
                        <div className="flex items-center gap-3 text-[10px] text-[#5C6F60] font-medium py-0.5">
                          <div className="flex items-center gap-1" title="Bedrooms">
                            <Bed className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.beds}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Bathrooms">
                            <Bath className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.baths}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Square Feet">
                            <Maximize className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.sqft.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto" title="Days on Market">
                            <Clock className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.daysOnMarket || 1} DOM</span>
                          </div>
                        </div>

                        
                        {/* LO & Cobrand Agent Contacts */}
                        <div className="bg-sky-50 p-1.5 rounded-lg border border-sky-100 flex items-center justify-between text-[9px] font-medium text-sky-800">
                           <div className="flex items-center gap-1">
                             <div className="w-4 h-4 rounded-full bg-sky-200 flex items-center justify-center font-bold">LO</div>
                             <span>Mike Ford (Mortgage)</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <div className="w-4 h-4 rounded-full bg-sky-200 flex items-center justify-center font-bold">RE</div>
                             <span>Kanndice M. (Agent)</span>
                           </div>
                        </div>

                        {/* GeoSphere Sync & Loan Flags */}
                        <div className="flex flex-wrap gap-1">
                           <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-bold border border-emerald-200">
                             GEO-SYNC: RENTCAST
                           </span>
                           <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[8px] font-bold border border-purple-200">
                             $0 DPA ELIGIBLE
                           </span>
                           <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[8px] font-bold border border-amber-200">
                             SELLER CREDIT 2-1
                           </span>
                        </div>

                        {/* Dynamic Q&A Notes */}
                        <div className="bg-[#FAF9F5] p-2 rounded-xl border border-[#EAE7E0] text-[10px] space-y-1">
                          <div className="font-bold text-[#4A5D4E] flex items-center justify-between">
                            <span>Live Property Q&A</span>
                            {propertyConversation?.hasPendingActionItem && (
                              <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded animate-pulse">Pending LO</span>
                            )}
                          </div>
                          <p className="text-[9px] text-[#606C5D] italic line-clamp-2">
                            {propertyConversation?.notes 
                              ? `"${propertyConversation.notes}"` 
                              : "No questions asked yet. Ask Mike about this property!"}
                          </p>
                        </div>

                        {/* Readiness & School District Snippet */}
                        <div className="bg-[#FAF9F5] p-2 rounded-xl border border-[#EAE7E0] text-[10px] space-y-1">
                          <div className="flex items-center justify-between text-[#4A5D4E] font-semibold">
                            <span className="flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              <span className="truncate">
                                {activeSelectedProperty.districtInfo.name}
                              </span>
                            </span>
                            <span className="font-bold">
                              {activeSelectedProperty.districtInfo.averageRating}/10
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            ✓{" "}
                            {activeSelectedProperty.readiness.positiveFactors[0] ||
                              "Turnkey Move-in Ready"}
                          </p>
                        </div>

                        <div className="pt-1 flex items-center justify-between gap-1">
                          <button
                            onClick={() => onOpenScorecard && onOpenScorecard(activeSelectedProperty)}
                            className="px-2 py-1 rounded bg-[#4A5D4E] text-white font-semibold text-[10px] hover:bg-[#38463B]"
                          >
                            Scorecard
                          </button>
                          <button
                            onClick={() => onAskAiAboutProperty && onAskAiAboutProperty(activeSelectedProperty)}
                            className="px-2 py-1 rounded bg-[#C18C5D] text-white font-semibold text-[10px] hover:bg-[#A87447]"
                          >
                            Ask AI
                          </button>
                          <StreetViewButton lat={activeSelectedProperty.lat} lng={activeSelectedProperty.lng} />
                          <SmsShareButton property={activeSelectedProperty} />
                          {getZillowUrl(activeSelectedProperty) && (
                            <a
                              href={getZillowUrl(activeSelectedProperty)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-[#606C5D]"
                              title="View on Zillow"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${activeSelectedProperty.lat},${activeSelectedProperty.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-blue-600 ml-auto flex items-center gap-1 px-1.5"
                            title="Save to My Google Maps"
                            onClick={() => {
                              // Optional: Fire telemetry event to track that visitor saved this to their personal maps
                              console.log('Visitor saved property to their personal Google Maps', activeSelectedProperty.id);
                            }}
                          >
                            <MapPin className="w-3 h-3" /> <span className="text-[9px] font-bold">Save</span>
                          </a>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </div>
            </APIProvider>
          ) : (
            /* High-Precision Interactive Vector Canvas Fallback Mode */
            <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-6 select-none bg-radial from-[#F1EFE9] via-[#E8ECE6] to-[#DCE3DA]">
              {/* Decorative Subtle Geographic Grid Lines */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4A5D4E_1px,transparent_1px)] [background-size:24px_24px]"></div>

              {/* Central Radius Visualization Circle */}
              <div
                className="absolute rounded-full border-2 border-dashed border-[#4A5D4E]/80 bg-[#4A5D4E]/10 pointer-events-none flex items-center justify-center transition-all duration-300"
                style={{
                  width: `${Math.min(540, Math.max(160, searchRadiusMiles * 30))}px`,
                  height: `${Math.min(540, Math.max(160, searchRadiusMiles * 30))}px`,
                }}
              >
                <div className="absolute top-2 px-2.5 py-0.5 rounded-full bg-[#4A5D4E] text-white text-[10px] font-bold shadow-sm">
                  {searchRadiusMiles} Mile Radius Boundary
                </div>
              </div>

              {/* Radius Center Origin Marker */}
              <div className="absolute z-20 flex flex-col items-center pointer-events-auto">
                <div className="px-2.5 py-1 rounded-full bg-[#2D362E] text-white text-[10px] font-bold shadow-md border border-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C18C5D]" />
                  <span>Center: {selectedCityAnchor.toUpperCase()}</span>
                </div>
                <div className="w-3 h-3 bg-[#2D362E] rotate-45 -mt-1.5 border-r border-b border-white"></div>
              </div>

              {/* Render Properties as Interactive Visual Pins on Canvas */}
              {filteredProperties.map((property, idx) => {
                const isSelected = selectedPropertyId === property.id;
                // Distribute pins organically relative to canvas center
                const angle =
                  (idx * (360 / Math.max(1, filteredProperties.length)) + 45) * (Math.PI / 180);
                const distanceFactor = Math.min(
                  180,
                  (property.distanceFromCenter / Math.max(1, searchRadiusMiles)) * 140
                );
                const xOffset = Math.cos(angle) * distanceFactor;
                const yOffset = Math.sin(angle) * distanceFactor;

                const pinBg =
                  property.readiness.tier === "High"
                    ? "bg-emerald-700"
                    : property.readiness.tier === "Moderate"
                      ? "bg-amber-600"
                      : "bg-slate-600";

                return (
                  <div
                    key={property.id}
                    onClick={() => setSelectedPropertyId(property.id)}
                    style={{
                      transform: `translate(${xOffset}px, ${yOffset}px)`,
                    }}
                    className={`absolute z-30 flex flex-col items-center cursor-pointer transition-all transform hover:scale-125 ${
                      isSelected ? "scale-125 z-40" : ""
                    }`}
                  >
                    <div
                      className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-md border-2 border-white flex items-center gap-1 whitespace-nowrap ${pinBg}`}
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span>${Math.round(property.price / 1000)}k</span>
                    </div>
                    <div
                      className={`w-2 h-2 rotate-45 -mt-1 border-r border-b border-white ${pinBg}`}
                    ></div>
                  </div>
                );
              })}

              {/* Selected Property Overlay Popover in Vector Mode */}
              {activeSelectedProperty && (
                <div className="absolute bottom-4 left-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-2xl border border-[#EAE7E0] p-4 shadow-xl max-w-md mx-auto space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeSelectedProperty.readiness.badgeColor}`}
                        >
                          Readiness {activeSelectedProperty.readiness.score}/100 •{" "}
                          {activeSelectedProperty.readiness.tier}
                        </span>
                        <span className="text-[10px] text-[#606C5D] font-medium">
                          {activeSelectedProperty.distanceFromCenter} mi from center
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#2D362E] truncate">
                        {activeSelectedProperty.title}
                      </h4>
                      <p className="text-xs text-[#606C5D]">
                        {activeSelectedProperty.address}, {activeSelectedProperty.city}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedPropertyId(null)}
                      className="p-1 rounded-lg hover:bg-stone-100 text-[#606C5D]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* School District and Amenity Proximity */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1">
                      <div className="flex items-center gap-1 text-[#4A5D4E] font-bold text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span className="truncate">{activeSelectedProperty.districtInfo.name}</span>
                      </div>
                      <p className="text-[10px] text-[#606C5D]">
                        District Rating:{" "}
                        <strong className="text-[#2D362E]">
                          {activeSelectedProperty.districtInfo.averageRating}/10
                        </strong>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1">
                      <div className="flex items-center gap-1 text-[#C18C5D] font-bold text-[11px]">
                        <Train className="w-3.5 h-3.5" />
                        <span>Nearby Amenity</span>
                      </div>
                      <p className="text-[10px] text-[#606C5D] truncate">
                        {activeSelectedProperty.amenities[0]?.amenity.name ||
                          "Transit / Parks Nearby"}{" "}
                        ({activeSelectedProperty.amenities[0]?.distanceMiles || 0.8}m)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenScorecard && onOpenScorecard(activeSelectedProperty)}
                        className="px-3 py-1.5 rounded-xl bg-[#4A5D4E] text-white font-semibold text-xs hover:bg-[#38463B] transition-all"
                      >
                        Inspect Scorecard
                      </button>
                      <button
                        onClick={() => onAskAiAboutProperty && onAskAiAboutProperty(activeSelectedProperty)}
                        className="px-3 py-1.5 rounded-xl bg-[#C18C5D] text-white font-semibold text-xs hover:bg-[#A87447] transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Ask AI</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onToggleCompare && onToggleCompare(activeSelectedProperty.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        (compareIds?.includes(activeSelectedProperty.id) || false)
                          ? "bg-[#C18C5D] text-white border-[#C18C5D]"
                          : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#FAF9F5]"
                      }`}
                    >
                      {(compareIds?.includes(activeSelectedProperty.id) || false) ? "Compared" : "+ Compare"}
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Canvas Mode Switch Pill */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-[#EAE7E0] text-[11px] font-semibold text-[#606C5D] shadow-sm flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>Vector Radius Canvas Active</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
