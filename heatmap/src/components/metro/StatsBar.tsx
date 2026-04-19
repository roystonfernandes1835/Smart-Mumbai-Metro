import { type Station } from "@/data/metroData";
import { Activity, AlertTriangle, Train, Users } from "lucide-react";

interface StatsBarProps {
  stations: Station[];
}

const StatsBar = ({ stations }: StatsBarProps) => {
  const total = stations.reduce((a, s) => a + s.currentRidership, 0);
  const critical = stations.filter((s) => s.crowdLevel === "critical").length;
  const avgWait = stations.length
    ? Math.round((stations.reduce((a, s) => a + s.avgWaitTime, 0) / stations.length) * 10) / 10
    : 0;

  const stats = [
    { icon: <Users className="w-4 h-4" />, label: "Total Riders", value: total.toLocaleString(), color: "text-primary" },
    { icon: <Train className="w-4 h-4" />, label: "Active Stations", value: stations.length, color: "text-primary" },
    { icon: <AlertTriangle className="w-4 h-4" />, label: "Critical", value: critical, color: "text-crowd-critical" },
    { icon: <Activity className="w-4 h-4" />, label: "Avg Wait", value: `${avgWait} min`, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className={s.color}>{s.icon}</div>
          <div>
            <p className="text-lg font-bold font-mono text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
