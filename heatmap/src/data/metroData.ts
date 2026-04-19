export type CrowdLevel = "low" | "medium" | "high" | "critical";

export interface Station {
  id: string;
  name: string;
  line: MetroLine;
  lat: number;
  lng: number;
  crowdLevel: CrowdLevel;
  currentRidership: number;
  capacity: number;
  avgWaitTime: number; // minutes
}

export type MetroLine = "line1" | "line2" | "line3" | "line7";

export const LINE_NAMES: Record<MetroLine, string> = {
  line1: "Line 1 — Versova–Ghatkopar",
  line2: "Line 2A — Dahisar–DN Nagar",
  line3: "Line 3 — Aarey–BKC",
  line7: "Line 7 — Dahisar E–Andheri E",
};

export const LINE_COLORS: Record<MetroLine, string> = {
  line1: "metro-line1",
  line2: "metro-line2",
  line3: "metro-line3",
  line7: "metro-line7",
};

function randomCrowd(): { level: CrowdLevel; ridership: number; capacity: number; wait: number } {
  const r = Math.random();
  if (r < 0.3) return { level: "low", ridership: 120 + Math.floor(Math.random() * 200), capacity: 800, wait: 2 + Math.random() * 2 };
  if (r < 0.6) return { level: "medium", ridership: 350 + Math.floor(Math.random() * 200), capacity: 800, wait: 4 + Math.random() * 3 };
  if (r < 0.85) return { level: "high", ridership: 550 + Math.floor(Math.random() * 150), capacity: 800, wait: 6 + Math.random() * 4 };
  return { level: "critical", ridership: 700 + Math.floor(Math.random() * 100), capacity: 800, wait: 10 + Math.random() * 5 };
}

const stationDefs: Omit<Station, "crowdLevel" | "currentRidership" | "capacity" | "avgWaitTime">[] = [
  // Line 1
  { id: "versova", name: "Versova", line: "line1", lat: 19.1310, lng: 72.8200 },
  { id: "andheri", name: "Andheri", line: "line1", lat: 19.1197, lng: 72.8464 },
  { id: "weh", name: "Western Express Highway", line: "line1", lat: 19.1085, lng: 72.8570 },
  { id: "chakala", name: "Chakala", line: "line1", lat: 19.1010, lng: 72.8630 },
  { id: "airport_rd", name: "Airport Road", line: "line1", lat: 19.0990, lng: 72.8740 },
  { id: "marol_naka", name: "Marol Naka", line: "line1", lat: 19.1020, lng: 72.8850 },
  { id: "saki_naka", name: "Saki Naka", line: "line1", lat: 19.1010, lng: 72.8930 },
  { id: "asalpha", name: "Asalpha", line: "line1", lat: 19.0970, lng: 72.9020 },
  { id: "jagruti_nagar", name: "Jagruti Nagar", line: "line1", lat: 19.0900, lng: 72.9090 },
  { id: "ghatkopar", name: "Ghatkopar", line: "line1", lat: 19.0868, lng: 72.9085 },
  // Line 2A
  { id: "dahisar", name: "Dahisar", line: "line2", lat: 19.2500, lng: 72.8600 },
  { id: "anand_nagar", name: "Anand Nagar", line: "line2", lat: 19.2380, lng: 72.8560 },
  { id: "ovaripada", name: "Ovaripada", line: "line2", lat: 19.2200, lng: 72.8500 },
  { id: "dnagar", name: "D.N. Nagar", line: "line2", lat: 19.1300, lng: 72.8280 },
  // Line 3
  { id: "aarey", name: "Aarey Colony", line: "line3", lat: 19.1550, lng: 72.8700 },
  { id: "seepz", name: "SEEPZ", line: "line3", lat: 19.1400, lng: 72.8750 },
  { id: "bkc", name: "BKC", line: "line3", lat: 19.0650, lng: 72.8650 },
  { id: "dharavi", name: "Dharavi", line: "line3", lat: 19.0430, lng: 72.8540 },
  { id: "dadar", name: "Dadar", line: "line3", lat: 19.0180, lng: 72.8430 },
  { id: "worli", name: "Worli", line: "line3", lat: 19.0100, lng: 72.8200 },
  // Line 7
  { id: "dahisar_e", name: "Dahisar East", line: "line7", lat: 19.2550, lng: 72.8750 },
  { id: "ovaripada_e", name: "Ovaripada East", line: "line7", lat: 19.2250, lng: 72.8700 },
  { id: "devipada", name: "Devipada", line: "line7", lat: 19.2050, lng: 72.8680 },
  { id: "magathane", name: "Magathane", line: "line7", lat: 19.1900, lng: 72.8650 },
  { id: "andheri_e", name: "Andheri East", line: "line7", lat: 19.1200, lng: 72.8700 },
];

export function generateStations(): Station[] {
  return stationDefs.map((s) => {
    const c = randomCrowd();
    return { ...s, crowdLevel: c.level, currentRidership: c.ridership, capacity: c.capacity, avgWaitTime: Math.round(c.wait * 10) / 10 };
  });
}

export function getCrowdColor(level: CrowdLevel): string {
  const map: Record<CrowdLevel, string> = {
    low: "bg-crowd-low",
    medium: "bg-crowd-medium",
    high: "bg-crowd-high",
    critical: "bg-crowd-critical",
  };
  return map[level];
}

export function getCrowdTextColor(level: CrowdLevel): string {
  const map: Record<CrowdLevel, string> = {
    low: "text-crowd-low",
    medium: "text-crowd-medium",
    high: "text-crowd-high",
    critical: "text-crowd-critical",
  };
  return map[level];
}
