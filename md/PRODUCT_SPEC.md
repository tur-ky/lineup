# PRODUCT_SPEC — Collaborative Utility Lineup App (Supabase-backed)

## One-sentence purpose
A collaborative lineup library where multiple users can add / browse / search utility lineups, and every client updates automatically via Supabase Realtime.

## Target platform (flexible)
- **Primary**: Desktop wrapper (Electron/Tauri/react)

## Core user stories
1) Browse lineups by map + utility type  
2) Open a lineup detail: radar pin, throw steps, lineup photos, optional video link  
3) Add a new lineup:
   - choose map
   - choose utility type
   - place **throw pin** + **landing pin** on radar (optional throw pin, only necessary if landing pin is already used by a lineup of the same utility type)
   - upload required screenshots (throw position, aim reference, final result)
   - add throw type (jump throw, crouch throw, w+jumpthrow, normal etc.)
4) Realtime collaboration:
   - new lineups appear without restart
   - updates to a lineup propagate


## UX requirements
- Fast map switching
- Basic Filters (toggleable smokes, he-nades, molotovs, flashes, etc.)
- Good pin placement UX (zoom/pan, snap-to-grid optional)
- Offline-ish behavior:
  - cache most recent map + search results locally
  - graceful fallback if realtime disconnects

## Data requirements (high-level)
- Map metadata + SVG radar assets
- Lineup records with stable IDs
- Media storage via Supabase Storage buckets

## Collaboration model (baseline)
- Public read (anyone with app can read)
- Auth required to submit
- Optional: “pending approval” mode for new submissions

## Security / moderation (baseline)
- RLS enabled on all tables
- Storage bucket policies restrict write to authenticated users
- Optionally store `status` on lineups: pending/approved/rejected

## Success criteria (MVP)
- Two users on separate machines see new lineup appear within seconds
- Add flow takes < 60 seconds once familiar
- Searching is instant for typical dataset sizes (hundreds–thousands)
