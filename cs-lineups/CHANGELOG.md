# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-02-07

### Added

- Integrated Tauri updater plugin in backend (`lib.rs`)
- Registered updater commands for frontend validation:
  - `check_for_updates`
  - `download_and_install_update`
  - `get_settings`
  - `update_setting`

### Changed

- Refactored `run` function builder chain to include updater initialization

## [0.1.2] - 2026-02-07

### Added

- Auto-updater functionality with Tauri updater plugin
  - GitHub releases integration for automatic updates
  - Custom `UpdateModal` component with update UI
  - `useUpdateChecker` hook for update checking logic
  - Passive installation mode for Windows
- Comprehensive Content Security Policy (CSP) configuration
  - Supabase and GitHub whitelisting for external resources
  - Script and style inline support for React
  - Image loading from Supabase storage
- Documentation files:
  - `UPDATER_SETUP.md` for updater configuration guide
  - `SECURITY.md` for security policies
  - `.env.example` for environment variable reference
- Key generation script (`generate_keys.ps1`) for updater signing
- Settings library (`src/lib/settings.ts`) for application configuration

### Changed

- Enhanced security configuration in `tauri.conf.json`
- Updated `.gitignore` to exclude sensitive updater keys
- Modified `App.tsx` to integrate update checking
- Updated Cargo dependencies

### Security

- Added cryptographic signing for application updates
- Implemented strict CSP to prevent XSS attacks
- Secured external resource loading to trusted domains only

## [0.1.1] - 2026-02-07

### Added

- New `VideoUploadZone` component for video upload functionality in lineup creation
- New migrations directory for database schema versioning

### Changed

- Updated `CreateLineupModal` component with improved UI consistency
- Enhanced `UploadZone` component for better file handling
- Improved `LineupDetailModal` component for viewing lineups
- Updated application types in `app.ts`
- Updated database schema in `schema.sql`
- Updated Cargo dependencies in `Cargo.toml` and `Cargo.lock`

### Fixed

- Modal UI regressions including button styling and spacing
- Delete buttons now properly display with white color and transparent background

## [0.1.0] - Initial Release

### Added

- Initial project setup
- Core lineup creation and viewing functionality
- Tauri desktop application structure
- React-based UI with TypeScript
