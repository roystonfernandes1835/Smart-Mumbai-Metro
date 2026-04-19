import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Train } from "lucide-react";
import Heatmap from "@/components/metro/Heatmap";
import Legend from "@/components/metro/Legend";
import LineFilter from "@/components/metro/LineFilter";
import StationModal from "@/components/metro/StationModal";
import StatsBar from "@/components/metro/StatsBar";
import { generateStations, type MetroLine, type Station } from "@/data/metroData";

import { io } from "socket.io-client";

const ALL_LINES: MetroLine[] = ["line1", "line2", "line3", "line7"];
const socket = io("http://localhost:5000");

const Index = () => {
  const [stations, setStations] = useState<Station[]>(() => generateStations());
  const [activeLines, setActiveLines] = useState<MetroLine[]>(ALL_LINES);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    socket.on("crowd_update", (data: { stationId: string; level: CrowdLevel; ridership?: number }) => {
      setStations((prev) =>
        prev.map((s) =>
          s.id === data.stationId
            ? { 
                ...s, 
                crowdLevel: data.level, 
                currentRidership: data.ridership || s.currentRidership 
              }
            : s
        )
      );
    });

    return () => {
      socket.off("crowd_update");
    };
  }, []);

  const toggleLine = useCallback((line: MetroLine) => {
    setActiveLines((prev) =>
      prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]
    );
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Train className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">Mumbai Metro Heatmap</h1>
              <p className="text-xs text-muted-foreground">Real-time Crowd Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-crowd-low"
            />
            <span className="text-xs text-muted-foreground font-mono">LIVE</span>
          </div>
        </div>
      </header>

      <main className="w-full px-6 py-6 space-y-6">
        <StatsBar stations={stations} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <LineFilter activeLines={activeLines} onToggle={toggleLine} />
          <Legend />
        </div>

        <Heatmap
          stations={stations}
          activeLines={activeLines}
          onStationClick={setSelectedStation}
        />

        <p className="text-center text-xs text-muted-foreground">
          Click any station for details 
        </p>
      </main>

      <StationModal
        station={selectedStation}
        open={!!selectedStation}
        onClose={() => setSelectedStation(null)}
      />
    </div>
  );
};

export default Index;
