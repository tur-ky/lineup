# UI_BEHAVIOR

## Core screens
1) Map browser
- map selector
- filters (smokes, molotovs, flashbangs, he-nades)
- results mapped over the 2d overview of the map at the location they land at in-game

2) Map radar view
- shows pins for filtered lineups
- click a pin to open detail
- zoom/pan
- optional “pin clustering” if dense (upon clicking, clusters with several throwing locations will have lines drawn to each one, and the user can then go through the different throw positions for any utility that can be thrown from multiple.)

3) Lineup detail
- title, utility, throw-type
- radar preview with throw/land pins
- steps panel
- media gallery (throw position, aim reference, result)
- optional video link button

4) create new lineup flow (wizard style)
Step 1: select map + utility
Step 2: place land pin (required)
Step 3: place throw pin (optional)
Step 4: upload media (require throw_pos + aim_ref + landing_preview)
Step 5: add steps + throw type (normal, jump-throw, w+jump-throw, crouch throw, etc.) + video link


## Pin placement UX
- Crosshair cursor while placing (static crosshair, map moves underneath)
- Show live coordinates (x,y normalized) in a small debug panel
- Undo/redo for pin placement 

## Filtering UX
- Filters should apply instantly client-side
- Prefer server-side filters for large datasets (>= 10k lineups)

## Performance guidelines
- On map browse: fetch minimal lineup fields; lazy-load media only on detail
- Cache maps list + last-viewed map in local storage


