import React, { useState } from 'react';
import type { OceanLocation } from '../../types/ocean';
import { locations, argoLocations } from '../../data/mockData';

interface OceanMapProps {
  onLocationSelect?: (loc: OceanLocation) => void;
  selectedLocation?: OceanLocation;
  showArgo?: boolean;
  showAnomalies?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Map viewport: lat 0–25°N, lng 55–95°E → SVG 800×500
const MAP_W = 800;
const MAP_H = 500;
const LAT_MIN = -2, LAT_MAX = 27;
const LNG_MIN = 55, LNG_MAX = 97;

function toSvg(lat: number, lng: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * MAP_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_H;
  return [x, y];
}

// Simplified India coastline polygon (approximate lat/lng points)
const indiaPolygon: [number, number][] = [
  [23.5, 68.5], [24.5, 70.5], [23.0, 72.0], [22.5, 73.5], [21.0, 72.5],
  [20.5, 73.0], [19.5, 72.8], [18.5, 73.0], [17.5, 73.2], [16.5, 73.5],
  [15.5, 73.8], [14.5, 74.2], [13.5, 74.7], [12.5, 75.0], [11.5, 75.3],
  [10.5, 76.0], [9.5, 76.5], [8.5, 77.0], [8.2, 77.5], [8.0, 78.2],
  [8.5, 79.0], [9.5, 79.5], [10.5, 80.0], [11.0, 79.8], [12.0, 80.2],
  [13.0, 80.5], [14.0, 80.2], [15.0, 80.0], [16.0, 80.3], [17.0, 82.0],
  [18.0, 84.0], [19.0, 85.0], [20.0, 86.5], [21.0, 87.0], [21.5, 87.5],
  [22.0, 88.0], [22.5, 88.5], [23.0, 88.0], [23.5, 87.0], [24.0, 88.5],
  [24.5, 89.0], [25.0, 89.5], [26.0, 90.0], [26.5, 89.0], [27.0, 88.5],
  [27.0, 86.0], [27.0, 84.0], [27.0, 82.0], [28.0, 80.0], [28.0, 78.0],
  [27.5, 76.0], [27.5, 74.0], [26.0, 72.0], [25.0, 70.0], [24.0, 68.0], [23.5, 68.5],
];

// Sri Lanka
const sriLankaPolygon: [number, number][] = [
  [9.8, 80.0], [10.5, 80.4], [9.5, 81.5], [8.5, 81.3], [7.5, 81.0],
  [6.5, 80.5], [6.0, 79.8], [7.0, 79.5], [8.0, 79.8], [9.0, 80.0], [9.8, 80.0],
];

function polygonPoints(coords: [number, number][]): string {
  return coords.map(([lat, lng]) => {
    const [x, y] = toSvg(lat, lng);
    return `${x},${y}`;
  }).join(' ');
}

// Anomaly region circles
const anomalyRegions = [
  { lat: 12.0, lng: 85.0, r: 40, label: '+1.8°C', color: '#F59E0B' },
  { lat: 18.0, lng: 66.0, r: 50, label: '+2.1°C', color: '#EF4444' },
  { lat: 10.0, lng: 72.0, r: 45, label: '+2.8°C', color: '#EF4444' },
];

// Grid lines
const latLines = [0, 5, 10, 15, 20, 25];
const lngLines = [60, 65, 70, 75, 80, 85, 90, 95];

export default function OceanMap({ onLocationSelect, selectedLocation, showArgo = true, showAnomalies = false, className = '', style }: OceanMapProps) {
  const [hovered, setHovered] = useState<{ loc: OceanLocation; x: number; y: number } | null>(null);

  return (
    <div className={`relative w-full ${className}`} style={{ background: '#071B33', borderRadius: 8, ...style }}>
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="w-full h-full"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0A2A4A" />
            <stop offset="60%" stopColor="#0866C6" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#18BFEF" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="anomalyGradAmber" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="anomalyGradRed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ocean background */}
        <rect width={MAP_W} height={MAP_H} fill="url(#oceanGrad)" />

        {/* Grid lines */}
        {latLines.map(lat => {
          const [, y] = toSvg(lat, LNG_MIN);
          const [, y2] = toSvg(lat, LNG_MAX);
          return (
            <g key={`lat${lat}`}>
              <line x1={0} y1={y} x2={MAP_W} y2={y2} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="4 8" />
              <text x={4} y={y - 3} fill="white" fillOpacity="0.25" fontSize="9" fontFamily="monospace">{lat}°N</text>
            </g>
          );
        })}
        {lngLines.map(lng => {
          const [x] = toSvg(LAT_MAX, lng);
          const [x2] = toSvg(LAT_MIN, lng);
          return (
            <g key={`lng${lng}`}>
              <line x1={x} y1={0} x2={x2} y2={MAP_H} stroke="white" strokeOpacity="0.08" strokeWidth="0.5" strokeDasharray="4 8" />
              <text x={x + 2} y={MAP_H - 4} fill="white" fillOpacity="0.25" fontSize="9" fontFamily="monospace">{lng}°E</text>
            </g>
          );
        })}

        {/* Anomaly regions */}
        {showAnomalies && anomalyRegions.map((a, i) => {
          const [cx, cy] = toSvg(a.lat, a.lng);
          const gradId = a.color === '#F59E0B' ? 'anomalyGradAmber' : 'anomalyGradRed';
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={a.r} fill={`url(#${gradId})`} />
              <circle cx={cx} cy={cy} r={a.r} fill="none" stroke={a.color} strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 3" />
            </g>
          );
        })}

        {/* India polygon */}
        <polygon
          points={polygonPoints(indiaPolygon)}
          fill="#1a3a52"
          stroke="#2a5a7a"
          strokeWidth="0.8"
        />
        {/* Sri Lanka */}
        <polygon
          points={polygonPoints(sriLankaPolygon)}
          fill="#1a3a52"
          stroke="#2a5a7a"
          strokeWidth="0.6"
        />

        {/* Region labels */}
        {(() => { const [x, y] = toSvg(15, 64); return <text x={x} y={y} fill="#45D6C8" fillOpacity="0.7" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">Arabian Sea</text>; })()}
        {(() => { const [x, y] = toSvg(13, 87); return <text x={x} y={y} fill="#45D6C8" fillOpacity="0.7" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="Inter, sans-serif">Bay of Bengal</text>; })()}
        {(() => { const [x, y] = toSvg(3, 74); return <text x={x} y={y} fill="#18BFEF" fillOpacity="0.5" fontSize="11" fontWeight="500" textAnchor="middle" fontFamily="Inter, sans-serif">Indian Ocean</text>; })()}

        {/* Observation locations */}
        {locations.map((loc, i) => {
          const [cx, cy] = toSvg(loc.lat, loc.lng);
          const isSelected = selectedLocation?.name === loc.name;
          return (
            <g
              key={i}
              style={{ cursor: 'pointer' }}
              onClick={() => onLocationSelect?.(loc)}
              onMouseEnter={() => setHovered({ loc, x: cx, y: cy })}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Pulse ring */}
              <circle cx={cx} cy={cy} r={isSelected ? 14 : 10} fill="#0866C6" fillOpacity="0.15">
                {!isSelected && (
                  <animate attributeName="r" values="8;14;8" dur="2.5s" repeatCount="indefinite" />
                )}
                {!isSelected && (
                  <animate attributeName="fill-opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite" />
                )}
              </circle>
              <circle cx={cx} cy={cy} r={isSelected ? 6 : 4} fill={isSelected ? '#18BFEF' : '#0866C6'} stroke="white" strokeWidth="1.5" />
            </g>
          );
        })}

        {/* ARGO float locations */}
        {showArgo && argoLocations.map((loc, i) => {
          const [cx, cy] = toSvg(loc.lat, loc.lng);
          return (
            <g
              key={`argo-${i}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered({ loc, x: cx, y: cy })}
              onMouseLeave={() => setHovered(null)}
            >
              <rect x={cx - 5} y={cy - 5} width={10} height={10} fill="#45D6C8" stroke="white" strokeWidth="1.2" rx="1" transform={`rotate(45,${cx},${cy})`} />
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hovered && (() => {
          const px = Math.min(hovered.x, MAP_W - 130);
          const py = Math.max(hovered.y - 52, 4);
          return (
            <g>
              <rect x={px} y={py} width={125} height={44} rx={4} fill="#071B33" fillOpacity="0.92" />
              <text x={px + 8} y={py + 14} fill="white" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">{hovered.loc.name}</text>
              <text x={px + 8} y={py + 28} fill="#18BFEF" fontSize="9" fontFamily="monospace">{hovered.loc.lat.toFixed(1)}°N, {hovered.loc.lng.toFixed(1)}°E</text>
              <text x={px + 8} y={py + 40} fill="#45D6C8" fontSize="9" fontFamily="monospace">{hovered.loc.region}</text>
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded px-3 py-1.5 text-xs text-white/80">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
          Observation
        </span>
        {showArgo && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-[#45D6C8] border-2 border-white rotate-45 inline-block" />
            ARGO Float
          </span>
        )}
        {showAnomalies && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 opacity-70" />
            Anomaly
          </span>
        )}
      </div>
    </div>
  );
}
