use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_updater::UpdaterExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateInfo {
    version: String,
    date: Option<String>,
    body: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub auto_update_enabled: bool,
    pub last_update_check: Option<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            auto_update_enabled: false,
            last_update_check: None,
        }
    }
}

fn get_settings_path(app: &tauri::AppHandle) -> Option<PathBuf> {
    app.path()
        .app_config_dir()
        .ok()
        .map(|p| p.join("settings.json"))
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_settings(app: tauri::AppHandle) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(&app).ok_or("Failed to get settings path")?;

    if !settings_path.exists() {
        return Ok(AppSettings::default());
    }

    let content = fs::read_to_string(settings_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_setting(
    app: tauri::AppHandle,
    key: String,
    value: serde_json::Value,
) -> Result<AppSettings, String> {
    let settings_path = get_settings_path(&app).ok_or("Failed to get settings path")?;

    // Ensure directory exists
    if let Some(parent) = settings_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // Read current settings or default
    let mut settings = if settings_path.exists() {
        let content = fs::read_to_string(&settings_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        AppSettings::default()
    };

    // Update specific setting based on key
    match key.as_str() {
        "auto_update_enabled" => {
            if let Some(val) = value.as_bool() {
                settings.auto_update_enabled = val;
            }
        }
        "last_update_check" => {
            if let Some(val) = value.as_str() {
                settings.last_update_check = Some(val.to_string());
            }
        }
        _ => return Err(format!("Unknown setting key: {}", key)),
    }

    // Save back to file
    let content = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    fs::write(settings_path, content).map_err(|e| e.to_string())?;

    Ok(settings)
}

#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Option<UpdateInfo>, String> {
    match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => Ok(Some(UpdateInfo {
                version: update.version,
                date: update.date.map(|d| d.to_string()),
                body: update.body,
            })),
            Ok(None) => Ok(None),
            Err(e) => Err(format!("Failed to check for updates: {}", e)),
        },
        Err(e) => Err(format!("Failed to initialize updater: {}", e)),
    }
}

#[tauri::command]
async fn download_and_install_update(app: tauri::AppHandle) -> Result<(), String> {
    match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => {
                let mut downloaded = 0;
                let mut content_length = 0;
                let app_for_progress = app.clone();
                let app_for_finished = app.clone();
                update
                    .download_and_install(
                        move |chunk_length: usize, content_len: Option<u64>| {
                            downloaded += chunk_length;
                            if let Some(len) = content_len {
                                content_length = len;
                            }
                            let progress = if content_length > 0 {
                                (downloaded as f64 / content_length as f64) * 100.0
                            } else {
                                0.0
                            };
                            let _ = app_for_progress.emit("update-download-progress", progress);
                        },
                        move || {
                            let _ = app_for_finished.emit("update-ready-to-install", ());
                        },
                    )
                    .await
                    .map_err(|e| format!("Failed to download and install update: {}", e))
            }
            Ok(None) => Err("No update found".to_string()),
            Err(e) => Err(format!("Failed to check for updates: {}", e)),
        },
        Err(e) => Err(format!("Failed to initialize updater: {}", e)),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            println!("Single instance args received: {:?}", args);
            let _ = app.emit("deep-link://new-url", args);

            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            #[cfg(any(windows, target_os = "linux"))]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                app.deep_link().register("cslineups")?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            check_for_updates,
            download_and_install_update,
            get_settings,
            update_setting
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
