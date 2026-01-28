Goal (1–2 sentences)

Build a Windows desktop, map-first CS utility lineup app where users browse SVG maps with landing pins, filter pin visibility by side + utility type, open lineup details in a modal overlay, and create/edit lineups with required screenshots. Supabase is the source of truth for database + auth + storage (and optional realtime), with public read and authenticated create/edit.

Locked Product Rules

Desktop app (Windows only).

Backend: Supabase (Postgres DB + Auth + Storage + optional Realtime) is locked.

Browse is a single-page map experience (no page navigation during browse).

Map selection is primary navigation and always available; map selection is app state (not a filter).

Pins represent landing spots, not list entries. No search in MVP.

Filters are visibility gates only (pins disappear, never dim); defaults are all ON.

Required filters: Side (T/CT), Utility type (smoke/flash/molotov/HE).

No regions (deprecate entirely).

Pin hover = minimal tooltip (icon + short label).

Pin click opens modal overlay (no side panel, no new page) and preserves map state on close (filters + zoom/pan).

Create flow is pin-first:

place landing pin (crosshair fixed; map moves underneath)

fill form + upload required media

landing always stored; optional throw origin stored; if present draw landing→origin line.

Lineup modal mandatory fields: Title, utility type, side, 3 screenshots (position/aim/result), copy share link. Optional steps text + optional video/GIF (supplemental only).

Soft realtime: toast “New lineup available” → user chooses refresh.

Favorites/bookmarks included and per-user.

Auth rules locked: public read; authenticated create/edit; no approval queue; any authenticated user can edit.

Desktop Packaging Decisions (locked by user)

Framework: Tauri + React + TypeScript (default) on Windows.

Updates: manual for MVP (no auto-updater).

Auth UX: external browser login + deep-link back into the app.

Deep link protocol: cslineups:// (default).

Session storage: Windows Credential Manager (OS keychain via Tauri plugin).

Offline: online-only MVP.

Storage bucket: private (media served via signed URLs).

File upload: file picker + drag/drop.

Crash logs: basic crash reporting (e.g., Sentry) for debugging.

MVP Modules & UX Spec (implementation-ready)
1) App screens / states

Auth Gate

If no valid session: show a simple login screen with “Log in / Sign up”.

Clicking opens system browser to Supabase-hosted auth flow; on success browser redirects to cslineups://auth-callback?... and app stores session securely.

Main Browse Shell

Left: always-available map switcher (sidebar list of maps).

Center: SVG map canvas with zoom/pan.

Floating: filters overlay panel, collapsible:

Side toggles: T, CT

Utility toggles: smoke, flash, molotov, HE

Bottom-right: Create new lineup FAB.

Right-click on map: context menu → “Create lineup here”.

Lineup Detail Modal (overlay)

Opens over the map, map remains visible underneath.

Close returns to identical map state (zoom/pan/filters).

Create Lineup Flow (modal-ish overlay)

Step 1 landing placement mode (crosshair fixed; map moves underneath).

Step 2 form + uploads.

Optional origin placement mode.

2) Map interactions

Pan: click-drag

Zoom: mouse wheel

Pin placement: free, no snapping.

3) Filter behavior (strict visibility gates)

Pins that do not match active toggles are not rendered.

Default on map entry: all toggles ON.

4) Pin behaviors (single vs multi-lineup landing spot)

Hover: tooltip (utility icon + short label).

Click landing pin:

If landing pin has exactly one lineup → open that lineup modal.

If landing pin has multiple lineups:

Draw landing→origin lines for each lineup that has an origin.

Render origin markers at each origin point.

Clicking an origin marker opens the corresponding lineup modal.

Edge case: some lineups have no origin

Show a small anchored overlay near the landing pin titled e.g. “Other lineups here” listing those lineups by title; clicking opens modal.

Closing modal returns to the same “multi-lineup reveal” state the user had (lines/markers still shown) unless user clicks elsewhere to dismiss.

5) Create mode entry points

FAB → start landing placement at current view center.

Right-click “Create lineup here” → start landing placement centered on click position (or pre-set landing to clicked coord then allow adjust before confirm—pick one; see defaults below).

Recommended default: right-click sets an initial landing coordinate but user still clicks to confirm placement.

6) Favorites

Favorite/unfavorite button inside lineup modal.

Favorites are tied to the authenticated user (Supabase row per favorite).

7) Soft realtime

When new lineups are inserted for the currently selected map: show toast “New lineup available” with action “Refresh”.

No auto-refresh.