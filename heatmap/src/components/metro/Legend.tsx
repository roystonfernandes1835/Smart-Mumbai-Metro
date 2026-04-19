import { getCrowdColor, type CrowdLevel } from "@/data/metroData";

const levels: { level: CrowdLevel; label: string; desc: string }[] = [
  { level: "low", label: "Low", desc: "< 40% capacity" },
  { level: "medium", label: "Moderate", desc: "40–70%" },
  { level: "high", label: "High", desc: "70–90%" },
  { level: "critical", label: "Critical", desc: "> 90%" },
];

const Legend = () => (
  <div className="flex items-center gap-4 flex-wrap">
    {levels.map(({ level, label, desc }) => (
      <div key={level} className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getCrowdColor(level)}`} />
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
    ))}
  </div>
);

export default Legend;
