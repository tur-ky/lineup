import { useState, useEffect } from "react";
// import { invoke } from "@tauri-apps/api/core";
// import { onOpenUrl } from "@tauri-apps/plugin-deep-link"; // Uncomment when deep-link is fully setup
import { MapSwitcher } from "./components/Sidebar/MapSwitcher";
import { MapCanvas } from "./components/Map/MapCanvas";
import { FilterPanel } from "./components/Overlays/FilterPanel";
import { Plus } from "lucide-react";

import "./App.css";

function App() {
  const [activeMap, setActiveMap] = useState("Mirage");
  const [filters, setFilters] = useState({
    side: { t: true, ct: true },
    utility: { smoke: true, flash: true, molotov: true, he: true },
  });

  // Deep link handling (Placeholder until Rust is ready)
  useEffect(() => {
    console.log("Deep link listener would start here");
    // onOpenUrl((urls) => {
    //   console.log("Deep link:", urls);
    // });
  }, []);

  const toggleSide = (side: "t" | "ct") => {
    setFilters((prev) => ({
      ...prev,
      side: { ...prev.side, [side]: !prev.side[side] },
    }));
  };

  const toggleUtility = (type: "smoke" | "flash" | "molotov" | "he") => {
    setFilters((prev) => ({
      ...prev,
      utility: { ...prev.utility, [type]: !prev.utility[type] },
    }));
  };

  return (
    <div className="flex w-full h-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <MapSwitcher activeMap={activeMap} onSelectMap={setActiveMap} />

      {/* Main Content */}
      <div className="flex-1 relative h-full">
        {/* Filter Overlay */}
        <FilterPanel
          filters={filters}
          toggleSide={toggleSide}
          toggleUtility={toggleUtility}
        />

        {/* Map */}
        <MapCanvas activeMap={activeMap} />

        {/* FAB: Create Lineup */}
        <button
          className="absolute bottom-8 right-8 w-14 h-14 rounded-full bg-accent-primary hover:bg-accent-hover 
            text-white shadow-lg shadow-accent-primary/40 flex items-center justify-center 
            transition-all duration-300 hover:scale-110 z-20"
          title="Create New Lineup"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
}

export default App;
