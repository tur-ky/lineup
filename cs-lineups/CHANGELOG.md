# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
