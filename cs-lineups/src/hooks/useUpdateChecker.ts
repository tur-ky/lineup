import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getSettings, AppSettings } from "../lib/settings";

export interface UpdateInfo {
  version: string;
  date: string;
  body?: string;
}

export type UpdateState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available"; info: UpdateInfo }
  | { status: "downloading"; progress: number }
  | { status: "ready" }
  | { status: "error"; message: string }
  | { status: "no-update" };

export function useUpdateChecker() {
  const [updateState, setUpdateState] = useState<UpdateState>({ status: "idle" });
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Load settings on mount
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Check for updates on startup
  useEffect(() => {
    const checkForUpdates = async () => {
      setUpdateState({ status: "checking" });

      try {
        const update = await invoke<any>("check_for_updates");

        if (update) {
          setUpdateState({
            status: "available",
            info: {
              version: update.version || "Unknown",
              date: update.date || new Date().toISOString(),
              body: update.body,
            },
          });

          // If auto-update is enabled, start download immediately
          if (settings?.auto_update_enabled) {
            downloadAndInstall();
          }
        } else {
          setUpdateState({ status: "no-update" });
        }
      } catch (error: any) {
        console.error("Update check failed:", error);
        
        // Parse error message for better UX
        let errorMessage = "Failed to check for updates";
        if (typeof error === "string") {
          if (error.toLowerCase().includes("network") || error.toLowerCase().includes("connection")) {
            errorMessage = "No internet connection";
          } else if (error.toLowerCase().includes("disk") || error.toLowerCase().includes("space")) {
            errorMessage = "Insufficient disk space";
          } else {
            errorMessage = error;
          }
        }
        
        setUpdateState({ status: "error", message: errorMessage });
      }
    };

    // Only check on mount, not every time settings change
    if (settings !== null) {
      checkForUpdates();
    }
  }, [settings?.auto_update_enabled]); // Only depends on auto_update_enabled

  // Listen for download progress
  useEffect(() => {
    let unlistenProgress: (() => void) | undefined;
    let unlistenReady: (() => void) | undefined;

    listen<number>("update-download-progress", (event) => {
      setUpdateState({ status: "downloading", progress: event.payload });
    }).then((unlisten) => {
      unlistenProgress = unlisten;
    });

    listen("update-ready-to-install", () => {
      setUpdateState({ status: "ready" });
    }).then((unlisten) => {
      unlistenReady = unlisten;
    });

    return () => {
      if (unlistenProgress) unlistenProgress();
      if (unlistenReady) unlistenReady();
    };
  }, []);

  const downloadAndInstall = async () => {
    try {
      setUpdateState({ status: "downloading", progress: 0 });
      await invoke("download_and_install_update");
      // State will be updated to "ready" via event listener
    } catch (error: any) {
      console.error("Download failed:", error);
      setUpdateState({
        status: "error",
        message: typeof error === "string" ? error : "Failed to download update",
      });
    }
  };

  const dismissUpdate = () => {
    setUpdateState({ status: "idle" });
  };

  const manualCheck = async () => {
    setUpdateState({ status: "checking" });
    
    try {
      const update = await invoke<any>("check_for_updates");
      
      if (update) {
        setUpdateState({
          status: "available",
          info: {
            version: update.version || "Unknown",
            date: update.date || new Date().toISOString(),
            body: update.body,
          },
        });
      } else {
        setUpdateState({ status: "no-update" });
      }
    } catch (error: any) {
      setUpdateState({
        status: "error",
        message: typeof error === "string" ? error : "Failed to check for updates",
      });
    }
  };

  return {
    updateState,
    settings,
    downloadAndInstall,
    dismissUpdate,
    manualCheck,
  };
}
