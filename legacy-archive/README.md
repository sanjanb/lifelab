# Legacy Archive

This folder contains the original vanilla JavaScript version of LifeLab.

## Archived Code

These files are preserved for historical reference and are no longer actively maintained.

**For current development, see the main `astro-app/` directory.**

## Contents

- **index.html** - Original single-page HTML entry point
- **modules/** - Domain-specific HTML/CSS/JS modules (habits, learning, career, health, notebook, year)
- **scripts/** - Shared utilities and storage logic
- **styles/** - Global CSS styling
- **docs/** - Original planning and design documents

## Original Architecture

Simple vanilla JavaScript with no build tools:

- Direct browser execution
- localStorage for data persistence
- Module-based organization
- No framework dependencies

## Migration

This codebase was migrated to Astro + Svelte in January 2026. See `astro-app/docs/MIGRATION_SUMMARY.md` for details.
