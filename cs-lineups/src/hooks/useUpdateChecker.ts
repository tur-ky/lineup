import { useEffect, useRef, useState } from "react";
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
  const restartTriggeredRef = useRef(false);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

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

          if (settings?.auto_update_enabled) {
            void downloadAndInstall();
          }
        } else {
          setUpdateState({ status: "no-update" });
        }
      } catch (error: any) {
        console.error("Update check failed:", error);

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

    if (settings !== null) {
      void checkForUpdates();
    }
  }, [settings?.auto_update_enabled]);

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

  useEffect(() => {
    if (updateState.status === "ready" && settings?.auto_update_enabled && !restartTriggeredRef.current) {
      void restartToInstall();
    }
  }, [updateState.status, settings?.auto_update_enabled]);

  const downloadAndInstall = async () => {
    try {
      setUpdateState({ status: "downloading", progress: 0 });
      await invoke("download_and_install_update");
    } catch (error: any) {
      console.error("Download failed:", error);
      setUpdateState({
        status: "error",
        message: typeof error === "string" ? error : "Failed to download update",
      });
    }
  };

  const restartToInstall = async () => {
    restartTriggeredRef.current = true;

    try {
      await invoke("restart_app");
    } catch (error: any) {
      restartTriggeredRef.current = false;
      console.error("Restart failed:", error);
      setUpdateState({
        status: "error",
        message: typeof error === "string" ? error : "Failed to restart app for update",
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
    restartToInstall,
    dismissUpdate,
    manualCheck,
  };
}
