import { invoke } from "@tauri-apps/api/core";

export interface AppSettings {
  auto_update_enabled: boolean;
  last_update_check?: string;
}

/**
 * Get all app settings from persistent storage
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    return await invoke<AppSettings>("get_settings");
  } catch (error) {
    console.error("Failed to get settings:", error);
    // Return defaults on error
    return {
      auto_update_enabled: false,
    };
  }
}

/**
 * Update a specific setting
 */
export async function updateSetting(
  key: keyof AppSettings,
  value: boolean | string
): Promise<AppSettings> {
  try {
    return await invoke<AppSettings>("update_setting", {
      key,
      value,
    });
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error);
    throw error;
  }
}

/**
 * Toggle auto-update preference
 */
export async function toggleAutoUpdate(enabled: boolean): Promise<void> {
  await updateSetting("auto_update_enabled", enabled);
}
