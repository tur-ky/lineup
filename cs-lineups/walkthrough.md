# CS Lineups Scaffolding Walkthrough

## Completed Work
I have successfully scaffolded the application structure in the `cs-lineups` folder.

### 1. Project Initialization
- Created Tauri v2 project using **React** and **TypeScript**.
- Installed dependencies:
    - `@supabase/supabase-js`: Backend client.
    - `lucide-react`: UI Icons.
    - `@tauri-apps/plugin-shell` & `@tauri-apps/plugin-deep-link`: For Auth handling.

### 2. Configuration (Manual)
Since Rust was unavailable, I manually configured the Tauri backend files so they are ready when you install Rust.
- **`manifest.json` / `tauri.conf.json`**:
    - Set window title to "CS Lineups".
    - Set default size to 1280x800.
    - Added `cslineups` protocol identifier.
- **`src-tauri/capabilities/default.json`**:
    - Added permissions for `shell:open` (external auth) and `deep-link`.
- **`src-tauri/Cargo.toml`**:
    - Added `tauri-plugin-shell` and `tauri-plugin-deep-link` dependencies.
- **`src-tauri/src/lib.rs`**:
    - Registered plugins in the builder.
    
### 3. Frontend Implementation
- **Design System**: Implemented a "Premium Dark Mode" with Glassmorphism in `App.css`.
- **Architecture**:
    - `components/Map`: Map canvas with placeholder pan/zoom.
    - `components/Sidebar`: Map switcher.
    - `components/Overlays`: Floating filter panel.
    - `App.tsx`: Layout integration and deep link listener setup.

## Next Steps
1. **Install Rust**: Download from [rust-lang.org](https://www.rust-lang.org/) to run the desktop app.
2. **Setup Supabase**: Create a Supabase project and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to a `.env` file.
3. **Run App**:
   ```bash
   cd cs-lineups
   npm run tauri dev
   ```
