import { useState, useEffect, useRef } from "react";
// import { invoke } from "@tauri-apps/api/core";
// import { onOpenUrl } from "@tauri-apps/plugin-deep-link"; // Uncomment when deep-link is fully setup
import { MapSwitcher } from "./components/Sidebar/MapSwitcher";
import { MapCanvas } from "./components/Map/MapCanvas";
import { FilterPanel } from "./components/Overlays/FilterPanel";

import "./App.css";

import { CreateLineupModal } from "./components/Creation/CreateLineupModal";
import { Pin } from "./components/Map/Pin";
import { useLineups } from "./hooks/useLineups";
import { useClusters } from "./hooks/useClusters";
import { Lineup } from "./types/app";
import { LineupDetailModal } from "./components/Viewing/LineupDetailModal";
import { supabase } from "./lib/supabase";
import { Session, AuthChangeEvent, AuthError } from "@supabase/supabase-js";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { LoginScreen } from "./components/Overlays/LoginScreen";

function App() {
  const [activeMap, setActiveMap] = useState("Mirage");
  const [filters, setFilters] = useState({
    side: { t: true, ct: true },
    utility: { smoke: true, flash: true, molotov: true, he: true },
  });

  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  // Data Fetching
  const { lineups, loading, refreshLineups } = useLineups(activeMap, filters);
  // Radius of 30px ensures generous grouping for nearby pins.
  const clusters = useClusters(lineups, 30);
  const [selectedLineup, setSelectedLineup] = useState<Lineup | null>(null);
  // State for visualizing vectors (can be multiple if cluster is selected)
  const [visibleVectors, setVisibleVectors] = useState<Lineup[]>([]);

  // Creation Flow State
  const [isCreating, setIsCreating] = useState(false);
  const [selectionStep, setSelectionStep] = useState<'landing' | 'throwing' | null>(null);
  const [tempLanding, setTempLanding] = useState<{ x: number, y: number } | undefined>(undefined);
  const [tempOrigin, setTempOrigin] = useState<{ x: number, y: number } | undefined>(undefined);
  const mapCanvasRef = useRef<{ confirmSelection: () => void } | null>(null);

  // Initialize Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync visibleVectors with lineups (handle deletions/updates)
  useEffect(() => {
    setVisibleVectors(prev =>
      prev
        .map(v => lineups.find(l => l.id === v.id))
        .filter((l): l is Lineup => !!l)
    );
  }, [lineups]);

  // Deep link handling - Listen for auth callbacks
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log("Processing deep link:", url);
      // alert("Deep link received!\n" + url); // Debug

      // Handle both hash (#) and query (?) based fragments
      const relevantPart = url.includes('#') ? url.split('#')[1] : url.split('?')[1];

      if (relevantPart) {
        const params = new URLSearchParams(relevantPart);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          console.log("Tokens found, setting session...");
          supabase.auth.setSession({ access_token, refresh_token }).then(({ error }: { error: AuthError | null }) => {
            if (error) console.error("Error setting session:", error);
            else {
              console.log("Session set successfully");
              setShowLogin(false);
            }
          });
        } else {
          console.warn("No tokens found in URL fragment:", relevantPart);
        }
      }
    };

    // 1. Listen to the official plugin event (First launch or supported platforms)
    let unlistenPlugin: (() => void) | undefined;
    onOpenUrl((urls) => {
      console.log("Deep link received (plugin):", urls);
      urls.forEach(handleDeepLink);
    }).then((unlisten) => {
      unlistenPlugin = unlisten;
    });

    // 2. Listen to custom single-instance event (Already running instance on Windows/Linux)
    let unlistenSingleInstance: (() => void) | undefined;
    import("@tauri-apps/api/event").then(({ listen }) => {
      listen<string[]>("deep-link://new-url", (event) => {
        console.log("Deep link received (single-instance):", event.payload);
        event.payload.forEach((arg) => {
          if (arg.startsWith("cslineups://")) {
            handleDeepLink(arg);
          }
        });
      }).then((unlisten) => {
        unlistenSingleInstance = unlisten;
      });
    });

    return () => {
      if (unlistenPlugin) unlistenPlugin();
      if (unlistenSingleInstance) unlistenSingleInstance();
    };
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

  const handleMapClick = (pos: { x: number, y: number }) => {
    // Auth Guard
    if (!session) {
      setShowLogin(true);
      return;
    }

    if (selectionStep === 'landing') {
      setTempLanding(pos);
      setSelectionStep('throwing'); // Move to step 2
    } else if (selectionStep === 'throwing') {
      setTempOrigin(pos);
      setSelectionStep(null); // Finish selection
      setIsCreating(true); // Open Modal
    }
  };

  const startCreation = () => {
    if (session) {
      setTempLanding(undefined);
      setTempOrigin(undefined);
      setSelectionStep('landing');
    } else {
      setShowLogin(true);
    }
  };

  const cancelSelection = () => {
    setSelectionStep(null);
    setTempLanding(undefined);
    setTempOrigin(undefined);
  };

  return (
    <div className="flex w-full h-full bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar */}
      <MapSwitcher activeMap={activeMap} onSelectMap={setActiveMap} />

      {/* Main Content */}
      <div className="flex-1 relative h-full">
        {/* Map Layer */}
        <MapCanvas
          ref={mapCanvasRef}
          activeMap={activeMap}
          onMapClick={handleMapClick}
          isSelecting={selectionStep !== null}
          selectionMode={selectionStep === 'throwing' ? 'throwing' : 'landing'}
          onCancelSelection={cancelSelection}
          activeVectors={visibleVectors.map(l => ({
            id: l.id,
            landing: { x: l.landing_x, y: l.landing_y },
            origin: { x: l.origin_x || 0, y: l.origin_y || 0 }
          }))}
          onVectorClick={(id) => {
            const lineup = lineups.find(l => l.id === id);
            if (lineup) setSelectedLineup(lineup);
          }}
        >
          {/* Render Clusters */}
          {!loading && clusters.map((item, i) => {
            if (item.type === 'cluster') {
              return <Pin
                key={`cluster-${i}`}
                x={item.x}
                y={item.y}
                type={item.utility_type}
                side={item.items[0].side} // Assume same side for cluster
                count={item.items.length}
                onClick={() => {
                  // Show all vectors for this cluster
                  setVisibleVectors(item.items);
                  setSelectedLineup(null);
                }}
                opacity={1} // Clusters always full opacity
              />;
            } else {
              const lineup = item.data;
              // Check if this pin is part of the currently visible set (e.e. if we clicked a single pin)
              const isVisible = visibleVectors.some(v => v.id === lineup.id);

              return (
                <Pin
                  key={lineup.id}
                  x={lineup.landing_x}
                  y={lineup.landing_y}
                  type={lineup.utility_type}
                  side={lineup.side}
                  onClick={() => {
                    setVisibleVectors([lineup]);
                    setSelectedLineup(lineup); // Open modal immediately for singular pins
                  }}
                  opacity={isVisible || visibleVectors.length === 0 ? 1 : 0.4}
                  scale={isVisible ? 1.2 : 1}
                />
              );
            }
          })}

          {/* Temporary Pin during creation */}
          {tempLanding && (
            <Pin x={tempLanding.x} y={tempLanding.y} type="smoke" side="t" opacity={0.5} />
          )}
          {tempOrigin && (
            <div
              className="absolute w-3 h-3 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md border border-black/20"
              style={{ left: tempOrigin.x, top: tempOrigin.y }}
            />
          )}
        </MapCanvas>

        {/* UI Overlay Layer (Pointer events handled by children) */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Auth Button (Top Right) */}
          {!isCreating && selectionStep === null && (
            <div className="absolute top-4 right-4 pointer-events-auto flex gap-2">
              {session ? (
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-bold text-white/80">Logged In</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="btn btn-primary text-xs py-1.5 px-3 shadow-lg"
                >
                  Login
                </button>
              )}
            </div>
          )}

          {/* Filter Overlay (Top Center) */}
          {!isCreating && (
            <div className="pointer-events-auto">
              <FilterPanel
                filters={filters}
                toggleSide={toggleSide}
                toggleUtility={toggleUtility}
                isSelecting={selectionStep !== null}
                instructionText={selectionStep === 'landing' ? 'Select utility landing position' : 'Select throwing position'}
                onCreate={startCreation}
                onConfirm={() => mapCanvasRef.current?.confirmSelection()}
                onCancel={cancelSelection}
              />
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs text-white/30 animate-pulse">
              Syncing...
            </div>
          )}
        </div>

        {/* Overlays (Modals) */}
        {showLogin && <LoginScreen onClose={() => setShowLogin(false)} />}

        {isCreating && (
          <CreateLineupModal
            activeMap={activeMap}
            initialLanding={tempLanding}
            initialOrigin={tempOrigin}
            onClose={() => {
              setIsCreating(false);
              setTempLanding(undefined);
              setTempOrigin(undefined);
            }}
            onSuccess={() => {
              refreshLineups();
            }}
          />
        )}

        {selectedLineup && (
          <LineupDetailModal
            lineup={selectedLineup}
            onClose={() => setSelectedLineup(null)}
            onDelete={() => {
              refreshLineups();
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
