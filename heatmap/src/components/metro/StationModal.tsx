import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCrowdColor, getCrowdTextColor, LINE_NAMES, type Station } from "@/data/metroData";
import { motion } from "framer-motion";
import { Clock, TrendingUp, Users } from "lucide-react";

interface StationModalProps {
  station: Station | null;
  open: boolean;
  onClose: () => void;
}

const StationModal = ({ station, open, onClose }: StationModalProps) => {
  if (!station) return null;
  const pct = Math.round((station.currentRidership / station.capacity) * 100);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className={`w-3 h-3 rounded-full ${getCrowdColor(station.crowdLevel)}`} />
            {station.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">{LINE_NAMES[station.line]}</p>

          {/* Capacity bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Platform Capacity</span>
              <span className={getCrowdTextColor(station.crowdLevel)}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`h-full rounded-full ${getCrowdColor(station.crowdLevel)}`}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={<Users className="w-4 h-4" />} label="Riders" value={station.currentRidership.toLocaleString()} />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Capacity" value={station.capacity.toLocaleString()} />
            <StatCard icon={<Clock className="w-4 h-4" />} label="Wait" value={`${station.avgWaitTime} min`} />
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Data refreshes every 30 seconds • Simulated for demonstration
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-secondary/50 rounded-lg p-3 text-center space-y-1">
    <div className="flex justify-center text-primary">{icon}</div>
    <p className="text-sm font-semibold text-foreground font-mono">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default StationModal;
