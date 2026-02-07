import { useState } from "react";
import { X, Download, Clock, ToggleLeft, ToggleRight, AlertCircle, Loader } from "lucide-react";
import { UpdateInfo } from "../../hooks/useUpdateChecker";
import { toggleAutoUpdate } from "../../lib/settings";
import "./UpdateModal.css";

interface UpdateModalProps {
  updateInfo: UpdateInfo;
  onInstall: () => void;
  onDismiss: () => void;
  downloadProgress?: number;
  isDownloading?: boolean;
  isReady?: boolean;
  error?: string;
  autoUpdateEnabled: boolean;
}

export function UpdateModal({
  updateInfo,
  onInstall,
  onDismiss,
  downloadProgress = 0,
  isDownloading = false,
  isReady = false,
  error,
  autoUpdateEnabled,
}: UpdateModalProps) {
  const [isAutoUpdateToggled, setIsAutoUpdateToggled] = useState(autoUpdateEnabled);
  const [isTogglingAutoUpdate, setIsTogglingAutoUpdate] = useState(false);

  const handleAutoUpdateToggle = async () => {
    setIsTogglingAutoUpdate(true);
    try {
      await toggleAutoUpdate(!isAutoUpdateToggled);
      setIsAutoUpdateToggled(!isAutoUpdateToggled);
    } catch (error) {
      console.error("Failed to toggle auto-update:", error);
    } finally {
      setIsTogglingAutoUpdate(false);
    }
  };

  return (
    <div className="update-modal-overlay">
      <div className="update-modal">
        {/* Header */}
        <div className="update-modal-header">
          <div className="update-modal-title-section">
            <Download className="update-icon" size={24} />
            <div>
              <h2 className="update-modal-title">
                {isReady ? "Update Ready" : "Update Available"}
              </h2>
              <p className="update-modal-version">Version {updateInfo.version}</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="update-modal-close"
            aria-label="Close"
            disabled={isDownloading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="update-modal-content">
          {error ? (
            <div className="update-error">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          ) : isReady ? (
            <div className="update-ready-message">
              <p>
                The update has been downloaded and is ready to install. 
                The app will restart to complete the installation.
              </p>
            </div>
          ) : isDownloading ? (
            <div className="update-downloading">
              <div className="download-progress-container">
                <div className="download-progress-bar">
                  <div
                    className="download-progress-fill"
                    style={{ '--progress': downloadProgress } as React.CSSProperties}
                  />
                </div>
                <p className="download-progress-text">{downloadProgress}%</p>
              </div>
              <p className="download-status">
                <Loader className="spinner" size={16} />
                Downloading update...
              </p>
            </div>
          ) : (
            <>
              {updateInfo.body && (
                <div className="update-release-notes">
                  <h3>What's New</h3>
                  <div className="release-notes-content">
                    {updateInfo.body.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
              {!updateInfo.body && (
                <p className="update-description">
                  A new version of CS Lineups is available. Update now to get the latest features and improvements.
                </p>
              )}
            </>
          )}

          {/* Auto-Update Toggle */}
          <div className="update-auto-toggle-section">
            <button
              className="update-auto-toggle"
              onClick={handleAutoUpdateToggle}
              disabled={isTogglingAutoUpdate || isDownloading}
            >
              {isAutoUpdateToggled ? (
                <ToggleRight className="toggle-icon active" size={24} />
              ) : (
                <ToggleLeft className="toggle-icon" size={24} />
              )}
              <span>Enable Automatic Updates</span>
            </button>
            <p className="update-auto-toggle-description">
              {isAutoUpdateToggled 
                ? "Updates will download automatically in the background"
                : "You'll be notified when updates are available"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="update-modal-actions">
          {isReady ? (
            <button
              className="btn-update-primary"
              onClick={onInstall}
            >
              Restart and Install
            </button>
          ) : error ? (
            <button
              className="btn-update-secondary"
              onClick={onDismiss}
            >
              Close
            </button>
          ) : isDownloading ? (
            <button
              className="btn-update-secondary"
              disabled
            >
              Downloading...
            </button>
          ) : (
            <>
              <button
                className="btn-update-secondary"
                onClick={onDismiss}
              >
                <Clock size={16} />
                Remind Me Later
              </button>
              <button
                className="btn-update-primary"
                onClick={onInstall}
              >
                <Download size={16} />
                Install Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
