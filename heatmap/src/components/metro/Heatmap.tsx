import { getCrowdColor, type MetroLine, type Station } from "@/data/metroData";
import { motion } from "framer-motion";

interface HeatmapProps {
  stations: Station[];
  activeLines: MetroLine[];
  onStationClick: (station: Station) => void;
}

// Map geo coords to SVG viewbox (simplified projection)
const LAT_MIN = 19.00;
const LAT_MAX = 19.26;
const LNG_MIN = 72.81;
const LNG_MAX = 72.92;
const SVG_W = 800;
const SVG_H = 600;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_W;
  const y = SVG_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return { x, y };
}

const lineStrokeColors: Record<MetroLine, string> = {
  line1: "#3b82f6",
  line2: "#22c55e",
  line3: "#a855f7",
  line7: "#eab308",
};

const crowdFillColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

const Heatmap = ({ stations, activeLines, onStationClick }: HeatmapProps) => {
  const filtered = stations.filter((s) => activeLines.includes(s.line));

  // Group by line to draw connections
  const lineGroups: Record<string, Station[]> = {};
  filtered.forEach((s) => {
    if (!lineGroups[s.line]) lineGroups[s.line] = [];
    lineGroups[s.line].push(s);
  });

  return (
    <div className="relative w-full bg-secondary/30 rounded-xl border border-border overflow-hidden">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" style={{ minHeight: 400 }}>
        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i}>
            <line x1={0} y1={i * 60} x2={SVG_W} y2={i * 60} stroke="hsl(220 15% 15%)" strokeWidth={0.5} />
            <line x1={i * 80} y1={0} x2={i * 80} y2={SVG_H} stroke="hsl(220 15% 15%)" strokeWidth={0.5} />
          </g>
        ))}

        {/* Metro line paths */}
        {Object.entries(lineGroups).map(([line, stns]) => {
          const points = stns.map((s) => project(s.lat, s.lng));
          const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
          return (
            <path
              key={line}
              d={d}
              fill="none"
              stroke={lineStrokeColors[line as MetroLine]}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5}
            />
          );
        })}

        {/* Station dots */}
        {filtered.map((station, i) => {
          const { x, y } = project(station.lat, station.lng);
          const fill = crowdFillColors[station.crowdLevel];
          const r = station.crowdLevel === "critical" ? 10 : station.crowdLevel === "high" ? 8 : 7;
          return (
            <g key={station.id} onClick={() => onStationClick(station)} className="cursor-pointer">
              {/* Glow ring */}
              <motion.circle
                cx={x} cy={y} r={r + 6}
                fill={fill}
                opacity={0.15}
                animate={{ r: [r + 4, r + 10, r + 4], opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
              {/* Main dot */}
              <circle cx={x} cy={y} r={r} fill={fill} stroke="hsl(220 20% 7%)" strokeWidth={2} />
              {/* Label */}
              <text
                x={x}
                y={y - r - 6}
                textAnchor="middle"
                fill="hsl(190 60% 90%)"
                fontSize={9}
                fontFamily="Inter, sans-serif"
                fontWeight={500}
              >
                {station.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Heatmap;
