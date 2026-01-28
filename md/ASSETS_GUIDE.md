# ASSETS_GUIDE

## SVG radars
- Store map radars in the app bundle, e.g.:
  - `assets/radars/<map_slug>.svg`
- Each SVG should have a stable viewBox.
- Client should render SVG at any size and map clicks to normalized coords.

## Coordinate mapping
Store normalized coords:
- x = clickX / renderedWidth
- y = clickY / renderedHeight
Clamp to [0,1].

When rendering a pin:
- pixelX = x * renderedWidth
- pixelY = y * renderedHeight

## Utility icons
- Keep icons in:
  - `assets/icons/utility/`
- Recommended names:
  - smoke.svg
  - molly.svg
  - flash.svg
  - he.svg
  - decoy.svg

## Screenshot/image assets
Media should be stored in Supabase Storage:
- bucket: lineup-media
- path: lineups/<lineup_id>/<media_id>.<ext>


