// ─── FARE SLABS ─────────────────────────────────────────────────────────────

export const localTrainSlabs = [
  { max: 5,   fares: { second: 5,  first: 25,  ac: 35  } },
  { max: 10,  fares: { second: 10, first: 25,  ac: 35  } },
  { max: 15,  fares: { second: 10, first: 30,  ac: 50  } },
  { max: 20,  fares: { second: 15, first: 40,  ac: 60  } },
  { max: 25,  fares: { second: 15, first: 60,  ac: 70  } },
  { max: 30,  fares: { second: 15, first: 70,  ac: 85  } },
  { max: 35,  fares: { second: 20, first: 85,  ac: 95  } },
  { max: 40,  fares: { second: 20, first: 90,  ac: 100 } },
  { max: 45,  fares: { second: 20, first: 95,  ac: 105 } },
  { max: 50,  fares: { second: 25, first: 100, ac: 110 } },
  { max: 55,  fares: { second: 25, first: 100, ac: 105 } },
  { max: 60,  fares: { second: 25, first: 100, ac: 115 } },
  { max: 999, fares: { second: 30, first: 105, ac: 125 } },
];

export const metroSlabs = [
  { max: 3,   fare: 10 },
  { max: 12,  fare: 20 },
  { max: 18,  fare: 30 },
  { max: 24,  fare: 40 },
  { max: 30,  fare: 50 },
  { max: 36,  fare: 60 },
  { max: 42,  fare: 70 },
  { max: 999, fare: 80 },
];

export const monorailSlabs = [
  { max: 4,   fare: 10 },
  { max: 10,  fare: 20 },
  { max: 15,  fare: 30 },
  { max: 999, fare: 40 },
];

// ─── STATION DATA ────────────────────────────────────────────────────────────

export const stationsData = {
  "Local Train": {
    "Western Line": [
      { name: "Churchgate",    seq: 1,  dist: 0.0  },
      { name: "Marine Lines",  seq: 2,  dist: 1.4  },
      { name: "Charni Road",   seq: 3,  dist: 2.5  },
      { name: "Grant Road",    seq: 4,  dist: 3.6  },
      { name: "Mumbai Central",seq: 5,  dist: 4.6  },
      { name: "Mahalaxmi",     seq: 6,  dist: 6.0  },
      { name: "Lower Parel",   seq: 7,  dist: 8.0  },
      { name: "Prabhadevi",    seq: 8,  dist: 9.0  },
      { name: "Dadar",         seq: 9,  dist: 10.5 },
      { name: "Matunga Road",  seq: 10, dist: 12.0 },
      { name: "Mahim Junction",seq: 11, dist: 13.0 },
      { name: "Bandra",        seq: 12, dist: 14.7 },
      { name: "Khar Road",     seq: 13, dist: 16.5 },
      { name: "Santacruz",     seq: 14, dist: 18.0 },
      { name: "Vile Parle",    seq: 15, dist: 20.0 },
      { name: "Andheri",       seq: 16, dist: 21.8 },
      { name: "Jogeshwari",    seq: 17, dist: 24.0 },
      { name: "Ram Mandir",    seq: 18, dist: 25.0 },
      { name: "Goregaon",      seq: 19, dist: 26.6 },
      { name: "Malad",         seq: 20, dist: 29.0 },
      { name: "Kandivali",     seq: 21, dist: 31.0 },
      { name: "Borivali",      seq: 22, dist: 34.0 },
      { name: "Dahisar",       seq: 23, dist: 37.0 },
      { name: "Mira Road",     seq: 24, dist: 40.0 },
      { name: "Bhayandar",     seq: 25, dist: 43.0 },
      { name: "Naigaon",       seq: 26, dist: 48.0 },
      { name: "Vasai Road",    seq: 27, dist: 52.0 },
      { name: "Nallasopara",   seq: 28, dist: 56.0 },
      { name: "Virar",         seq: 29, dist: 60.0 },
      { name: "Vaitarna",      seq: 30, dist: 69.0 },
      { name: "Saphale",       seq: 31, dist: 76.0 },
      { name: "Kelve Road",    seq: 32, dist: 83.0 },
      { name: "Palghar",       seq: 33, dist: 91.0 },
      { name: "Umroli",        seq: 34, dist: 98.0 },
      { name: "Boisar",        seq: 35, dist: 103.0},
      { name: "Vangaon",       seq: 36, dist: 112.0},
      { name: "Dahanu Road",   seq: 37, dist: 124.0},
    ],
    "Central Line": [
      { name: "CSMT",           seq: 1,  dist: 0.0  },
      { name: "Masjid",         seq: 2,  dist: 1.0  },
      { name: "Sandhurst Road", seq: 3,  dist: 2.0  },
      { name: "Byculla",        seq: 4,  dist: 4.0  },
      { name: "Chinchpokli",    seq: 5,  dist: 5.0  },
      { name: "Currey Road",    seq: 6,  dist: 6.0  },
      { name: "Parel",          seq: 7,  dist: 8.0  },
      { name: "Dadar",          seq: 8,  dist: 9.0  },
      { name: "Matunga",        seq: 9,  dist: 11.0 },
      { name: "Sion",           seq: 10, dist: 13.0 },
      { name: "Kurla",          seq: 11, dist: 15.0 },
      { name: "Vidyavihar",     seq: 12, dist: 18.0 },
      { name: "Ghatkopar",      seq: 13, dist: 20.0 },
      { name: "Vikhroli",       seq: 14, dist: 23.0 },
      { name: "Kanjurmarg",     seq: 15, dist: 25.0 },
      { name: "Bhandup",        seq: 16, dist: 27.0 },
      { name: "Nahur",          seq: 17, dist: 29.0 },
      { name: "Mulund",         seq: 18, dist: 32.0 },
      { name: "Thane",          seq: 19, dist: 34.0 },
      { name: "Kalwa",          seq: 20, dist: 36.0 },
      { name: "Mumbra",         seq: 21, dist: 40.0 },
      { name: "Diva Junction",  seq: 22, dist: 43.0 },
      { name: "Kopar",          seq: 23, dist: 47.0 },
      { name: "Dombivli",       seq: 24, dist: 48.0 },
      { name: "Thakurli",       seq: 25, dist: 50.0 },
      { name: "Kalyan Junction",seq: 26, dist: 54.0 },
    ],
    "Kasara Branch": [
      { name: "Kalyan Junction",seq: 1,  dist: 0.0  },
      { name: "Shahad",         seq: 2,  dist: 4.0  },
      { name: "Ambivli",        seq: 3,  dist: 7.0  },
      { name: "Titwala",        seq: 4,  dist: 13.0 },
      { name: "Khadavli",       seq: 5,  dist: 20.0 },
      { name: "Vasind",         seq: 6,  dist: 25.0 },
      { name: "Asangaon",       seq: 7,  dist: 34.0 },
      { name: "Atgaon",         seq: 8,  dist: 39.0 },
      { name: "Thansit",        seq: 9,  dist: 44.0 },
      { name: "Khardi",         seq: 10, dist: 49.0 },
      { name: "Umbermali",      seq: 11, dist: 55.0 },
      { name: "Kasara",         seq: 12, dist: 62.0 },
    ],
    "Khopoli Branch": [
      { name: "Kalyan Junction",seq: 1,  dist: 0.0  },
      { name: "Vithalwadi",     seq: 2,  dist: 4.0  },
      { name: "Ulhasnagar",     seq: 3,  dist: 8.0  },
      { name: "Ambarnath",      seq: 4,  dist: 13.0 },
      { name: "Badlapur",       seq: 5,  dist: 19.0 },
      { name: "Vangani",        seq: 6,  dist: 27.0 },
      { name: "Shelu",          seq: 7,  dist: 33.0 },
      { name: "Neral Junction", seq: 8,  dist: 38.0 },
      { name: "Bhivpuri Road",  seq: 9,  dist: 42.0 },
      { name: "Karjat",         seq: 10, dist: 47.0 },
      { name: "Palasdari",      seq: 11, dist: 51.0 },
      { name: "Kelavli",        seq: 12, dist: 54.0 },
      { name: "Dolavli",        seq: 13, dist: 57.0 },
      { name: "Lowjee",         seq: 14, dist: 59.0 },
      { name: "Khopoli",        seq: 15, dist: 61.0 },
    ],
    "Harbour Line": [
      { name: "CSMT",            seq: 1,  dist: 0.0  },
      { name: "Masjid",          seq: 2,  dist: 1.0  },
      { name: "Sandhurst Road",  seq: 3,  dist: 2.0  },
      { name: "Dockyard Road",   seq: 4,  dist: 3.0  },
      { name: "Reay Road",       seq: 5,  dist: 4.0  },
      { name: "Cotton Green",    seq: 6,  dist: 5.0  },
      { name: "Sewri",           seq: 7,  dist: 7.0  },
      { name: "Vadala Road",     seq: 8,  dist: 9.0  },
      { name: "GTB Nagar",       seq: 9,  dist: 11.0 },
      { name: "Chunabhatti",     seq: 10, dist: 13.0 },
      { name: "Kurla",           seq: 11, dist: 15.0 },
      { name: "Tilak Nagar",     seq: 12, dist: 17.0 },
      { name: "Chembur",         seq: 13, dist: 18.0 },
      { name: "Govandi",         seq: 14, dist: 19.0 },
      { name: "Mankhurd",        seq: 15, dist: 22.0 },
      { name: "Vashi",           seq: 16, dist: 29.0 },
      { name: "Sanpada",         seq: 17, dist: 30.0 },
      { name: "Juinagar",        seq: 18, dist: 32.0 },
      { name: "Nerul",           seq: 19, dist: 34.0 },
      { name: "Seawoods-Darave", seq: 20, dist: 36.0 },
      { name: "CBD Belapur",     seq: 21, dist: 38.0 },
      { name: "Kharghar",        seq: 22, dist: 41.0 },
      { name: "Mansarovar",      seq: 23, dist: 44.0 },
      { name: "Khandeshwar",     seq: 24, dist: 46.0 },
      { name: "Panvel",          seq: 25, dist: 49.0 },
    ],
  },
  "Metro": {
    "Line 1 (Blue)": [
      { name: "Versova",                   seq: 1,  dist: 0.0  },
      { name: "D.N. Nagar",                seq: 2,  dist: 1.0  },
      { name: "Azad Nagar",                seq: 3,  dist: 1.8  },
      { name: "Andheri",                   seq: 4,  dist: 3.0  },
      { name: "Western Express Highway",   seq: 5,  dist: 4.1  },
      { name: "Chakala (J.B. Nagar)",      seq: 6,  dist: 5.3  },
      { name: "Airport Road",              seq: 7,  dist: 6.0  },
      { name: "Marol Naka",               seq: 8,  dist: 6.6  },
      { name: "Saki Naka",                seq: 9,  dist: 7.7  },
      { name: "Asalpha",                  seq: 10, dist: 8.8  },
      { name: "Jagruti Nagar",            seq: 11, dist: 9.7  },
      { name: "Ghatkopar",               seq: 12, dist: 11.4 },
    ],
    "Line 2A (Yellow)": [
      { name: "Dahisar East",    seq: 1,  dist: 0.0  },
      { name: "Anand Nagar",     seq: 2,  dist: 1.2  },
      { name: "Kandarpada",      seq: 3,  dist: 2.1  },
      { name: "Mandapeshwar",    seq: 4,  dist: 3.3  },
      { name: "Eksar",           seq: 5,  dist: 4.4  },
      { name: "Borivali West",   seq: 6,  dist: 5.5  },
      { name: "Pahadi Eksar",    seq: 7,  dist: 7.0  },
      { name: "Kandivali West",  seq: 8,  dist: 8.2  },
      { name: "Dahanukarwadi",   seq: 9,  dist: 9.3  },
      { name: "Valnai",          seq: 10, dist: 10.5 },
      { name: "Malad West",      seq: 11, dist: 11.4 },
      { name: "Lower Malad",     seq: 12, dist: 12.6 },
      { name: "Pahadi Goregaon", seq: 13, dist: 13.9 },
      { name: "Goregaon West",   seq: 14, dist: 15.0 },
      { name: "Oshiwara",        seq: 15, dist: 16.1 },
      { name: "Lower Oshiwara",  seq: 16, dist: 17.2 },
      { name: "Andheri West",    seq: 17, dist: 18.6 },
    ],
    "Line 7 (Red)": [
      { name: "Dahisar East",    seq: 1,  dist: 0.0  },
      { name: "Ovaripada",       seq: 2,  dist: 0.8  },
      { name: "Rashtriya Udyan", seq: 3,  dist: 1.7  },
      { name: "Devipada",        seq: 4,  dist: 2.6  },
      { name: "Magathane",       seq: 5,  dist: 4.0  },
      { name: "Poisar",          seq: 6,  dist: 5.4  },
      { name: "Akurli",          seq: 7,  dist: 6.5  },
      { name: "Kurar",           seq: 8,  dist: 7.6  },
      { name: "Dindoshi",        seq: 9,  dist: 8.8  },
      { name: "Aarey",           seq: 10, dist: 10.1 },
      { name: "Goregaon East",   seq: 11, dist: 11.5 },
      { name: "Jogeshwari East", seq: 12, dist: 13.0 },
      { name: "Mogra",           seq: 13, dist: 14.5 },
      { name: "Gundavali",       seq: 14, dist: 16.5 },
    ],
    // Line 3 (Aqua) – Fully operational Oct 2025 – 26 stations / 33.1 km
    "Line 3 (Aqua)": [
      { name: "Aarey JVLR",           seq: 1,  dist: 0.0  },
      { name: "SEEPZ",                 seq: 2,  dist: 1.2  },
      { name: "MIDC",                  seq: 3,  dist: 2.5  },
      { name: "Marol Naka",           seq: 4,  dist: 3.7  },
      { name: "CSMIA T2",             seq: 5,  dist: 5.0  },
      { name: "Sahar Road",           seq: 6,  dist: 6.2  },
      { name: "CSMIA T1",             seq: 7,  dist: 8.0  },
      { name: "Santacruz",            seq: 8,  dist: 9.3  },
      { name: "Vidyanagari",          seq: 9,  dist: 10.6 },
      { name: "BKC",                  seq: 10, dist: 12.4 },
      { name: "Dharavi",              seq: 11, dist: 14.0 },
      { name: "Shitladevi",           seq: 12, dist: 15.5 },
      { name: "Dadar",                seq: 13, dist: 17.3 },
      { name: "Siddhivinayak",        seq: 14, dist: 18.9 },
      { name: "Worli",                seq: 15, dist: 20.4 },
      { name: "Acharya Atre Chowk",  seq: 16, dist: 22.1 },
      { name: "Science Museum",       seq: 17, dist: 23.3 },
      { name: "Mahalaxmi",            seq: 18, dist: 24.6 },
      { name: "Grant Road",           seq: 19, dist: 25.8 },
      { name: "Girgaon",             seq: 20, dist: 26.9 },
      { name: "Kalbadevi",           seq: 21, dist: 28.0 },
      { name: "CSMT",                 seq: 22, dist: 29.2 },
      { name: "Hutatma Chowk",       seq: 23, dist: 30.3 },
      { name: "Churchgate",           seq: 24, dist: 31.4 },
      { name: "Vidhan Bhavan",        seq: 25, dist: 32.5 },
      { name: "Cuffe Parade",         seq: 26, dist: 33.1 },
    ],
  },
  "Monorail": {
    "Line 1": [
      { name: "Chembur",                    seq: 1,  dist: 0.0  },
      { name: "VNP and RC Marg",            seq: 2,  dist: 1.1  },
      { name: "Fertilizer Township",        seq: 3,  dist: 2.2  },
      { name: "Bharat Petroleum",           seq: 4,  dist: 3.1  },
      { name: "Mysore Colony",              seq: 5,  dist: 4.2  },
      { name: "Bhakti Park",               seq: 6,  dist: 5.5  },
      { name: "Wadala Depot",              seq: 7,  dist: 8.8  },
      { name: "GTB Nagar",                 seq: 8,  dist: 9.8  },
      { name: "Antop Hill",                seq: 9,  dist: 10.9 },
      { name: "Acharya Atre Nagar",        seq: 10, dist: 12.0 },
      { name: "Wadala Bridge",             seq: 11, dist: 13.0 },
      { name: "Dadar East",                seq: 12, dist: 14.5 },
      { name: "Naigaon",                   seq: 13, dist: 15.5 },
      { name: "Ambedkar Nagar",            seq: 14, dist: 16.6 },
      { name: "Mint Colony",               seq: 15, dist: 17.5 },
      { name: "Lower Parel",               seq: 16, dist: 18.5 },
      { name: "Sant Gadge Maharaj Chowk",  seq: 17, dist: 19.5 },
    ],
  },
};

// ─── INTERCHANGE MAP ──────────────────────────────────────────────────────────
// Format: "Line Key|Station Name"  (line key matches the key in stationsData.<system>)

const transfers = [
  // Local ↔ Metro Line 1
  { s1: "Western Line|Andheri",       s2: "Line 1 (Blue)|Andheri",             note: "Direct Skywalk" },
  { s1: "Harbour Line|Andheri",       s2: "Line 1 (Blue)|Andheri",             note: "Direct Skywalk" },
  { s1: "Central Line|Ghatkopar",     s2: "Line 1 (Blue)|Ghatkopar",           note: "Direct Skywalk" },
  // Local ↔ Metro Line 2A / 7
  { s1: "Western Line|Dahisar",       s2: "Line 2A (Yellow)|Dahisar East",     note: "Skywalk" },
  { s1: "Western Line|Dahisar",       s2: "Line 7 (Red)|Dahisar East",         note: "Skywalk" },
  // Metro Line 1 ↔ Metro Line 2A / 7
  { s1: "Line 1 (Blue)|D.N. Nagar",              s2: "Line 2A (Yellow)|Andheri West",   note: "FOB" },
  { s1: "Line 1 (Blue)|Western Express Highway",  s2: "Line 7 (Red)|Gundavali",          note: "FOB" },
  // Metro Line 1 ↔ Metro Line 3
  { s1: "Line 1 (Blue)|Marol Naka",  s2: "Line 3 (Aqua)|Marol Naka",          note: "Direct interchange" },
  // Metro Line 2A ↔ Metro Line 7
  { s1: "Line 2A (Yellow)|Dahisar East", s2: "Line 7 (Red)|Dahisar East",      note: "Shared platform" },
  // Local ↔ Monorail
  { s1: "Harbour Line|Chembur",       s2: "Monorail Line 1|Chembur",           note: "Skywalk" },
  { s1: "Western Line|Lower Parel",   s2: "Monorail Line 1|Lower Parel",       note: "Short walk" },
  { s1: "Western Line|Mahalaxmi",     s2: "Monorail Line 1|Sant Gadge Maharaj Chowk", note: "Short walk" },
  { s1: "Harbour Line|Vadala Road",   s2: "Monorail Line 1|Wadala Bridge",     note: "Short walk" },
  // Local ↔ Local cross-line
  { s1: "Western Line|Dadar",         s2: "Central Line|Dadar",                note: "FOB" },
  { s1: "Central Line|Kurla",         s2: "Harbour Line|Kurla",                note: "FOB" },
  { s1: "Central Line|CSMT",          s2: "Harbour Line|CSMT",                 note: "Same terminus" },
  { s1: "Central Line|Sandhurst Road",s2: "Harbour Line|Sandhurst Road",       note: "Multi-level station" },
  { s1: "Western Line|Bandra",        s2: "Harbour Line|Bandra",               note: "FOB" },
  { s1: "Western Line|Goregaon",      s2: "Harbour Line|Goregaon",             note: "FOB" },
  { s1: "Central Line|Masjid",        s2: "Harbour Line|Masjid",               note: "FOB (shared complex)" },
  // Central Line ↔ Branches
  { s1: "Central Line|Kalyan Junction",   s2: "Kasara Branch|Kalyan Junction",  note: "Branch platform" },
  { s1: "Central Line|Kalyan Junction",   s2: "Khopoli Branch|Kalyan Junction", note: "Branch platform" },
  // Metro Line 3 ↔ Local (key surface interchanges)
  { s1: "Line 3 (Aqua)|CSMT",        s2: "Central Line|CSMT",                 note: "Underground walkway" },
  { s1: "Line 3 (Aqua)|CSMT",        s2: "Harbour Line|CSMT",                 note: "Underground walkway" },
  { s1: "Line 3 (Aqua)|Dadar",       s2: "Western Line|Dadar",                note: "Short walk" },
  { s1: "Line 3 (Aqua)|Dadar",       s2: "Central Line|Dadar",                note: "Short walk" },
  { s1: "Line 3 (Aqua)|Grant Road",  s2: "Western Line|Grant Road",           note: "Short walk" },
  { s1: "Line 3 (Aqua)|Mahalaxmi",   s2: "Western Line|Mahalaxmi",            note: "Short walk" },
  { s1: "Line 3 (Aqua)|Santacruz",   s2: "Western Line|Santacruz",            note: "Short walk" },
  { s1: "Line 3 (Aqua)|Churchgate",  s2: "Western Line|Churchgate",           note: "Underground walkway" },
];

// ─── GRAPH BUILDER (Dijkstra) ─────────────────────────────────────────────────

export function buildGraph() {
  const nodes = {};

  const addNode = (id, system, line, name, dist, seq) => {
    if (!nodes[id]) nodes[id] = { id, system, line, name, dist, seq, edges: [] };
  };

  const addEdge = (id1, id2, weight, isTransfer, note = '') => {
    if (!nodes[id1] || !nodes[id2]) return;
    nodes[id1].edges.push({ to: id2, weight, isTransfer, note });
    nodes[id2].edges.push({ to: id1, weight, isTransfer, note });
  };

  // 1. Build line nodes + sequential edges
  Object.entries(stationsData).forEach(([system, lines]) => {
    Object.entries(lines).forEach(([line, stations]) => {
      // Monorail key for graph uses prefix "Monorail Line 1"
      const lineKey = system === 'Monorail' ? 'Monorail Line 1' : line;
      for (let i = 0; i < stations.length; i++) {
        const s = stations[i];
        const id = `${lineKey}|${s.name}`;
        addNode(id, system, lineKey, s.name, s.dist, s.seq);
        if (i > 0) {
          const prev = stations[i - 1];
          const prevId = `${lineKey}|${prev.name}`;
          const weight = system === 'Monorail' ? 1 : Math.abs(s.dist - prev.dist);
          addEdge(prevId, id, weight, false);
        }
      }
    });
  });

  // 2. Add transfer edges
  transfers.forEach(({ s1, s2, note }) => addEdge(s1, s2, 0.5, true, note));

  return nodes;
}

export const graph = buildGraph();

// ─── SEARCHABLE STATION LIST ─────────────────────────────────────────────────

export const allStationsList = Object.values(graph)
  .map(n => ({
    id: n.id,
    system: n.system,
    line: n.line,
    name: n.name,
    label: `${n.name} (${n.system} – ${n.line})`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ─── PATHFINDING ─────────────────────────────────────────────────────────────

/** Dijkstra on a subgraph with optionally banned edges and nodes */
function dijkstraSubgraph(startId, endId, bannedEdges, bannedNodes) {
  const dist = {};
  const prev = {};
  const unvisited = new Set();

  for (const id in graph) {
    if (bannedNodes.has(id)) continue;
    dist[id] = Infinity;
    unvisited.add(id);
  }
  if (!(startId in dist) || !(endId in dist)) return null;
  dist[startId] = 0;

  while (unvisited.size > 0) {
    let u = null;
    for (const id of unvisited) {
      if (u === null || dist[id] < dist[u]) u = id;
    }
    if (!u || dist[u] === Infinity) break;
    if (u === endId) break;
    unvisited.delete(u);

    for (const edge of graph[u].edges) {
      if (!unvisited.has(edge.to)) continue;
      if (bannedEdges.has(`${u}~~${edge.to}`) || bannedEdges.has(`${edge.to}~~${u}`)) continue;
      const alt = dist[u] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = { from: u, ...edge };
      }
    }
  }

  if (!prev[endId] && startId !== endId) return null;
  if (dist[endId] === Infinity) return null;

  const path = [];
  const conns = [];
  let curr = endId;
  while (curr) {
    path.unshift(graph[curr]);
    if (prev[curr]) conns.unshift(prev[curr]);
    curr = prev[curr]?.from ?? null;
  }
  if (!path.length || path[0].id !== startId) return null;
  return { path, conns, cost: dist[endId] };
}

/** Convert flat path + connection arrays into typed journey legs */
function buildLegs(path, conns) {
  if (!path || path.length === 0) return [];
  const legs = [];
  let leg = {
    system: path[0].system,
    lines: new Set([path[0].line]),
    stationsCount: 0,
    distSum: 0,
    nodes: [path[0]],
    fromNode: path[0],
    toNode: path[0],
  };
  for (let i = 0; i < conns.length; i++) {
    const conn = conns[i];
    const toNode = path[i + 1];
    // Split leg on ANY transfer — system change OR line change (e.g. Western → Central still requires a platform change)
    const lineChange = conn.isTransfer && !leg.lines.has(toNode.line);
    if (conn.isTransfer && (leg.system !== toNode.system || lineChange)) {
      legs.push({ ...leg, toNode: path[i] });
      leg = {
        system: toNode.system,
        lines: new Set([toNode.line]),
        stationsCount: 0,
        distSum: 0,
        nodes: [toNode],
        fromNode: toNode,
        toNode: toNode,
      };
    } else {
      leg.lines.add(toNode.line);
      leg.toNode = toNode;
      leg.nodes.push(toNode);
      if (!conn.isTransfer) {
        leg.stationsCount += 1;
        leg.distSum += conn.weight;
      }
    }
  }

  legs.push(leg);
  
  // Filter out any zero-travel legs caused by ending the journey on a transfer connection
  return legs.filter(l => l.fromNode.name !== l.toNode.name);
}

/**
 * Check whether any specific line appears in more than one leg.
 * (Indicates the route doubles back on the same physical line.)
 */
function hasLineReuse(legs) {
  const seen = new Set();
  for (const leg of legs) {
    for (const ln of leg.lines) {
      if (seen.has(ln)) return true;
      seen.add(ln);
    }
  }
  return false;
}

/**
 * Yen's K-Shortest Paths algorithm.
 * Returns up to K distinct routes, preferring those without line reuse.
 */
export function findKShortestPaths(startId, endId, K = 3) {
  if (startId === endId) return [];

  const A = []; // finalized paths (ranked)
  const B = []; // candidate spur paths

  const pathKey = p => p.path.map(n => n.id).join('→');

  const first = dijkstraSubgraph(startId, endId, new Set(), new Set());
  if (!first) return [];
  A.push({ ...first, key: pathKey(first) });

  for (let k = 1; k < K + 4; k++) { // search a few extra to fill K after filtering
    if (A.length === 0) break;
    const prevPath = A[Math.min(k - 1, A.length - 1)];

    for (let i = 0; i < prevPath.path.length - 1; i++) {
      const spurNode = prevPath.path[i].id;
      const rootPath = prevPath.path.slice(0, i + 1);
      const rootConns = prevPath.conns.slice(0, i);

      const bannedEdges = new Set();
      const bannedNodes = new Set();

      // Ban edges that share the same root in already-found paths
      for (const p of [...A, ...B]) {
        if (p.path.length <= i) continue;
        let rootMatch = true;
        for (let j = 0; j <= i; j++) {
          if (p.path[j]?.id !== rootPath[j]?.id) { rootMatch = false; break; }
        }
        if (rootMatch && p.path[i + 1]) {
          bannedEdges.add(`${p.path[i].id}~~${p.path[i + 1].id}`);
        }
      }
      // Ban intermediate root nodes to prevent backtracking
      for (let j = 0; j < i; j++) bannedNodes.add(rootPath[j].id);

      const spur = dijkstraSubgraph(spurNode, endId, bannedEdges, bannedNodes);
      if (!spur) continue;

      const fullPath = [...rootPath, ...spur.path.slice(1)];
      const fullConns = [...rootConns, ...spur.conns];
      const key = pathKey({ path: fullPath });
      const rootCost = rootConns.reduce((s, c) => s + c.weight, 0);
      const totalCost = rootCost + spur.cost;

      if (!A.some(p => p.key === key) && !B.some(p => p.key === key)) {
        B.push({ path: fullPath, conns: fullConns, cost: totalCost, key });
        B.sort((a, b) => a.cost - b.cost);
      }
    }

    if (B.length === 0) break;
    A.push(B.shift());
    if (A.length >= K + 4) break;
  }

  // Build leg objects, label each route, prefer no-line-reuse
  const routes = A.map((p, idx) => {
    const legs = buildLegs(p.path, p.conns);
    return { path: p.path, legs, cost: p.cost, lineReuse: hasLineReuse(legs) };
  }).filter(r => r.legs.length > 0);

  // Sort: no-line-reuse first, then by cost
  routes.sort((a, b) => {
    if (a.lineReuse !== b.lineReuse) return a.lineReuse ? 1 : -1;
    return a.cost - b.cost;
  });

  return routes.slice(0, K);
}

// Keep old single-path export for backward compatibility
export function findShortestPath(startId, endId) {
  const results = findKShortestPaths(startId, endId, 1);
  return results[0] ?? null;
}

// ─── FARE CALCULATION ─────────────────────────────────────────────────────────

export function calculateFareForLeg(leg, localClass = 'second') {
  if (leg.system === 'Local Train') {
    const slab = localTrainSlabs.find(s => leg.distSum <= s.max) ?? localTrainSlabs.at(-1);
    return slab.fares[localClass];
  }
  if (leg.system === 'Metro') {
    const slab = metroSlabs.find(s => leg.distSum <= s.max) ?? metroSlabs.at(-1);
    return slab.fare;
  }
  if (leg.system === 'Monorail') {
    const slab = monorailSlabs.find(s => leg.stationsCount <= s.max) ?? monorailSlabs.at(-1);
    return slab.fare;
  }
  return 0;
}

/**
 * Child fare (ages 5–12):
 *   Local Train: ceil(adult / 2), minimum ₹5
 *   Metro / Monorail: ceil(adult / 2)
 * Children under 5 travel FREE — caller should not count them.
 */
export function calculateChildFareForLeg(leg, localClass = 'second') {
  const adult = calculateFareForLeg(leg, localClass);
  const half = Math.ceil(adult / 2);
  if (leg.system === 'Local Train') return Math.max(half, 5);
  return half;
}





