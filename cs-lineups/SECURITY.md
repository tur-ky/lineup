# Security Policy

## Environment Variables

This application requires environment variables for sensitive configuration. **Never commit actual credentials to version control.**

### Required Variables

Create a `.env` file in the project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

See `.env.example` for a template.

### Protection

- All `.env` files are excluded from git via `.gitignore`
- The application will fail gracefully if credentials are missing
- Never hardcode API keys or secrets in source code

## Tauri Security Architecture

### Content Security Policy (CSP)

The application implements a strict Content Security Policy to prevent XSS attacks:

- **Scripts**: Only from the application itself (`'self'`), inline scripts allowed for Vite
- **Styles**: Only from the application itself and inline styles
- **Images**: Application, data URIs, and Supabase storage domains
- **Connections**: Only to Supabase API and GitHub (for updates)
- **Objects/Embeds**: Blocked entirely to prevent plugin-based attacks

### Plugin Usage

The application uses the following Tauri plugins with elevated permissions:

1. **tauri-plugin-fs**: File system access for:
   - Reading/writing user settings to app data directory
   - Future: Managing lineup screenshots and videos

2. **tauri-plugin-shell**: Shell access for:
   - Opening external URLs (Supabase OAuth flow)
   - Opening lineup share links

3. **tauri-plugin-updater**: Automatic updates:
   - Checks GitHub releases for new versions
   - Downloads and installs updates with user permission
   - Uses cryptographic signatures for verification

### Asset Protocol

The asset protocol allows the frontend to access local files. Currently scoped to all directories (`["**"]`) to support:

- Loading lineup screenshots from user storage
- Accessing video files for lineup demos

## Dependency Management

### NPM Dependencies

Run regular security audits:

```bash
npm audit
npm audit fix
```

### Rust Dependencies

Run cargo-audit to check for vulnerabilities:

```bash
cd src-tauri
cargo audit
```

Install cargo-audit if not present:

```bash
cargo install cargo-audit
```

### Update Schedule

- Check for dependency updates monthly
- Apply security patches immediately
- Test thoroughly before deploying updates

## React Security

The codebase follows these security best practices:

- ✅ No use of `dangerouslySetInnerHTML`
- ✅ No use of `eval()` or `new Function()`
- ✅ URL parameters are handled safely in OAuth flow
- ✅ User input is validated before processing

## Backend Security (Rust)

### File System Access

The Rust backend restricts file operations to:

- App data directory for settings storage
- User-selected directories for lineup media (future)

Path validation prevents directory traversal attacks.

### Command Exposure

Only necessary Tauri commands are exposed to the frontend:

- `get_settings` / `update_setting`: User preferences
- `check_for_updates` / `download_and_install_update`: Update management

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Email: [Your security contact email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will respond within 48 hours and work with you to address the issue.

## Security Checklist for Contributors

Before submitting code:

- [ ] No hardcoded secrets or API keys
- [ ] Environment variables used for sensitive data
- [ ] No use of `dangerouslySetInnerHTML` or `eval()`
- [ ] User input is validated and sanitized
- [ ] File paths are validated to prevent traversal
- [ ] `npm audit` shows no vulnerabilities
- [ ] `cargo audit` shows no vulnerabilities (or documented exceptions)
- [ ] CSP policy remains strict

## Update History

- **2026-02-07**: Initial security documentation created
  - Implemented strict CSP policy
  - Documented environment variable usage
  - Added dependency audit procedures
