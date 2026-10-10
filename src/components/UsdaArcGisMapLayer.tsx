import React, { useEffect, useState, useMemo } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { Layers, ShieldAlert, CheckCircle2, Sliders, Info, Eye, EyeOff } from "lucide-react";

declare const google: any;

interface UsdaArcGisMapLayerProps {
  visible: boolean;
  opacity?: number;
  onToggleVisible?: (visible: boolean) => void;
  onOpacityChange?: (opacity: number) => void;
  stateCode?: string;
}

/**
 * Converts Google Maps tile coordinates (x, y, zoom) to Web Mercator EPSG:3857 Bounding Box
 */
function tileToEPSG3857Bbox(x: number, y: number, zoom: number): { minX: number; minY: number; maxX: number; maxY: number } {
  const initialResolution = 2 * Math.PI * 6378137 / 256;
  const originShift = 2 * Math.PI * 6378137 / 2.0;

  const resolution = initialResolution / Math.pow(2, zoom);
  const minX = x * 256 * resolution - originShift;
  const maxX = (x + 1) * 256 * resolution - originShift;

  const maxY = originShift - y * 256 * resolution;
  const minY = originShift - (y + 1) * 256 * resolution;

  return { minX, minY, maxX, maxY };
}

/**
 * Official USDA Rural Development (RD) Single Family Housing Guaranteed Loan
 * Property Eligibility ArcGIS MapServer Layer
 * Layer 0: Ineligible Areas (Shaded Polygons)
 */
const USDA_ARCGIS_EXPORT_BASE = "https://eligibility.sc.egov.usda.gov/arcgis/rest/services/Eligibility/Property_Eligibility/MapServer/export";

export const UsdaArcGisMapLayer: React.FC<UsdaArcGisMapLayerProps> = ({
  visible,
  opacity = 0.55,
  onToggleVisible,
  onOpacityChange,
  stateCode = "OR"
}) => {
  const map = useMap();
  const [activeOpacity, setActiveOpacity] = useState(opacity);
  const [layerLoaded, setLayerLoaded] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);

  // Sync internal opacity if prop changes
  useEffect(() => {
    setActiveOpacity(opacity);
  }, [opacity]);

  useEffect(() => {
    if (!map || !(window as any).google || !(window as any).google.maps) return;

    // Create the ArcGIS MapServer ImageMapType
    const gMaps = (window as any).google.maps;
    const usdaMapType = new gMaps.ImageMapType({
      name: "USDA Ineligible Areas",
      tileSize: new google.maps.Size(256, 256),
      opacity: activeOpacity,
      getTileUrl: (coord, zoom) => {
        if (!visible) return "";
        try {
          const bbox = tileToEPSG3857Bbox(coord.x, coord.y, zoom);
          // Query official USDA RD Property Eligibility MapServer layer 0
          return `${USDA_ARCGIS_EXPORT_BASE}?bbox=${bbox.minX},${bbox.minY},${bbox.maxX},${bbox.maxY}&bboxSR=3857&imageSR=3857&size=256,256&f=image&format=png32&transparent=true&layers=show:0`;
        } catch {
          return "";
        }
      }
    });

    // Check if layer already exists on map
    const overlayMapTypes = map.overlayMapTypes;
    let existingIndex = -1;
    for (let i = 0; i < overlayMapTypes.getLength(); i++) {
      const layer = overlayMapTypes.getAt(i);
      if (layer && (layer as any).name === "USDA Ineligible Areas") {
        existingIndex = i;
        break;
      }
    }

    if (visible) {
      if (existingIndex !== -1) {
        overlayMapTypes.removeAt(existingIndex);
      }
      overlayMapTypes.push(usdaMapType);
      setLayerLoaded(true);
    } else {
      if (existingIndex !== -1) {
        overlayMapTypes.removeAt(existingIndex);
      }
      setLayerLoaded(false);
    }

    return () => {
      for (let i = overlayMapTypes.getLength() - 1; i >= 0; i--) {
        const layer = overlayMapTypes.getAt(i);
        if (layer && (layer as any).name === "USDA Ineligible Areas") {
          overlayMapTypes.removeAt(i);
        }
      }
    };
  }, [map, visible, activeOpacity]);

  return null;
};

/**
 * Dedicated visual overlay controls toolbar component to place on map headers
 */
export const UsdaArcGisLayerControlWidget: React.FC<{
  visible: boolean;
  onToggle: () => void;
  opacity: number;
  onOpacityChange: (val: number) => void;
  selectedState?: string;
}> = ({ visible, onToggle, opacity, onOpacityChange, selectedState = "OR" }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative inline-block z-10">
      <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs border border-[#C18C5D]/40 rounded-xl px-2.5 py-1.5 shadow-md">
        <button
          onClick={onToggle}
          type="button"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
            visible
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-stone-100 text-stone-700 hover:bg-stone-200"
          }`}
          title="Toggle official USDA RD Ineligible Areas shaded polygon layer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>USDA RD Ineligible Layer</span>
          {visible ? (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          ) : (
            <span className="text-[10px] text-stone-400">OFF</span>
          )}
        </button>

        {visible && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded-md text-stone-600 hover:bg-stone-100 transition-colors"
            title="Adjust layer transparency & legend"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {visible && showSettings && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-3.5 space-y-3 z-50 text-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="font-bold text-stone-900 flex items-center gap-1.5">
              <span>🌾</span> USDA RD Layer Legend
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
              Live ArcGIS REST
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm bg-amber-500/60 border border-amber-600 shadow-2xs" />
              <span className="text-stone-800 font-medium">Shaded Orange: Ineligible Urban Cluster</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-sm bg-emerald-500/20 border border-emerald-500 shadow-2xs" />
              <span className="text-stone-800 font-medium">Clear / Unshaded: 100% USDA 0% Down Eligible</span>
            </div>
          </div>

          <div className="space-y-1 pt-1 border-t border-stone-100">
            <div className="flex justify-between text-[11px] text-stone-600">
              <span>Polygon Shading Opacity</span>
              <span className="font-bold">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="0.9"
              step="0.05"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <p className="text-[10px] text-stone-500 leading-tight">
            Source: Official USDA Rural Housing Service (RHS) Property Eligibility ArcGIS Server for {selectedState}.
          </p>
        </div>
      )}
    </div>
  );
};
