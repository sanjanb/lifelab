# LifeLab - Astro + Svelte Application

Modern rebuild of LifeLab using Astro for structure and Svelte for interactivity.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit: http://localhost:3000/lifelab

## 📖 Documentation

All migration documentation is in the `docs/` folder:

- **[MIGRATION_PROGRESS.md](./docs/MIGRATION_PROGRESS.md)** - Detailed progress and status
- **[ISLAND_BOUNDARIES.md](./docs/ISLAND_BOUNDARIES.md)** - Svelte island specifications
- **[Original Behavior Docs](../docs/CURRENT_SYSTEM_BEHAVIOR.md)** - Original system baseline

## 📁 Project Structure

```
src/
├── components/          # Svelte islands (interactive)
│   ├── NavigationMenu.svelte
│   ├── QuickEntryForm.svelte
│   └── EntryHistoryList.svelte
├── layouts/            # Astro layouts
│   └── BaseLayout.astro
├── lib/               # Framework-agnostic utilities
│   ├── config.ts      # Domain configuration
│   ├── storage.ts     # localStorage abstraction
│   └── utils.ts       # Helper functions
└── pages/             # Astro pages (routes)
    ├── index.astro    # Dashboard
    ├── habits.astro
    ├── learning.astro
    ├── career.astro
    └── health.astro
```

## 🎯 Migration Status

**Current Phase**: M4 (Partially Complete)  
**Overall Progress**: ~50%

### ✅ What Works
- Dashboard with domain cards
- All domain pages (Habits, Learning, Career, Health)
- Quick entry forms with validation
- Entry history with delete functionality
- Interactive navigation
- localStorage persistence

### 🔲 Still TODO
- Notebook monthly view
- Daily row controls
- Year view
- Timeline view

## 🏗️ Architecture

**Astro** = Structure (static rendering)  
**Svelte** = Interaction (islands)  
**TypeScript** = Utilities (framework-agnostic)

## 📚 References

- [Astro Docs](https://docs.astro.build)
- [Svelte Docs](https://svelte.dev)
- [Migration Plan](../docs/ASTRO_MIGRATION.md)

---

**Status**: ~50% complete, ready for Phase M4.2
