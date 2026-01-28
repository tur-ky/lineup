# DATA_MODEL

## Entities

### map
Represents a CS2 map.
- id (uuid)
- slug (text, unique) e.g. `mirage`
- display_name (text) e.g. `Mirage`
- svg_radar_path (text) e.g. `radars/mirage.svg` (in app bundle)
- width, height (int) for coordinate mapping reference
- created_at

### lineup
A single utility lineup.
- id (uuid)
- map_id (uuid -> map)
- utility_type (enum text): smoke, molly, flash, he, decoy
- title (text) short label
- land_pin (jsonb): {x: float, y: float} normalized 0..1 relative to radar
- throw_pin (jsonb nullable): {x, y} normalized 0..1
- screenshots (player throw position, lineup as indicated by in-game crosshair, and final landing position preview)
- video_url (text nullable)
- created_by (uuid -> auth.users)
- status (enum text): pending, approved, rejected
- created_at, updated_at

### lineup_media
Media files attached to a lineup (stored in Supabase Storage).
- id (uuid)
- lineup_id (uuid -> lineup)
- kind (enum text): throw_pos, aim_ref, result, other
- storage_path (text) e.g. `lineups/<lineup_id>/<uuid>.png`
- width, height (int nullable)
- created_at

### tag + lineup_tag (optional but useful)
- tag: id, name unique
- lineup_tag: lineup_id, tag_id

## Coordinate convention (important)
Store radar pins as **normalized coordinates** to make SVG size irrelevant:
- x in [0,1] where 0 = left, 1 = right
- y in [0,1] where 0 = top, 1 = bottom
Client converts between pixel space and normalized.

## Duplicate detection (baseline heuristic)
- Same map_id + utility_type + side
- throw_pin within epsilon distance (e.g. 0.01)
- title similarity (optional)

## Realtime strategy
Subscribe to:
- `lineup` table changes (insert/update) filtered by map_id currently viewed
- `lineup_media` changes for open lineup detail

## MVP fields required to submit
- map_id
- utility_type
- land_pin
- at least 3 media items: throw_pos + aim_ref + land_pos (enforce in UI; server can optionally validate later)
