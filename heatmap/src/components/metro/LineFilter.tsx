import { LINE_NAMES, type MetroLine } from "@/data/metroData";

interface LineFilterProps {
  activeLines: MetroLine[];
  onToggle: (line: MetroLine) => void;
}

const lineColorClasses: Record<MetroLine, string> = {
  line1: "border-metro-line1 data-[active=true]:bg-metro-line1",
  line2: "border-metro-line2 data-[active=true]:bg-metro-line2",
  line3: "border-metro-line3 data-[active=true]:bg-metro-line3",
  line7: "border-metro-line7 data-[active=true]:bg-metro-line7",
};

const LineFilter = ({ activeLines, onToggle }: LineFilterProps) => (
  <div className="flex flex-wrap gap-2">
    {(Object.keys(LINE_NAMES) as MetroLine[]).map((line) => {
      const active = activeLines.includes(line);
      return (
        <button
          key={line}
          data-active={active}
          onClick={() => onToggle(line)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200
            ${lineColorClasses[line]}
            ${active ? "text-primary-foreground shadow-lg" : "text-muted-foreground bg-secondary/50 hover:bg-secondary"}`}
        >
          {LINE_NAMES[line]}
        </button>
      );
    })}
  </div>
);

export default LineFilter;
