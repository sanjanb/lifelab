# LifeLab

A lightweight personal metrics dashboard for tracking and visualizing your life across multiple domains.

## Active Development: Astro + Svelte

This is a modern web application built with:

- **Astro** - Static site generation and optimal performance
- **Svelte** - Interactive components with minimal JavaScript
- **TypeScript** - Type-safe utilities and configuration

### Quick Start

```bash
cd astro-app
npm install
npm run dev
```

Visit `http://localhost:4321`

### Project Structure

```
astro-app/              # Modern Astro + Svelte application
├── src/
│   ├── components/    # Interactive Svelte islands
│   ├── layouts/       # Astro page layouts
│   ├── lib/          # Framework-agnostic utilities
│   └── pages/        # Astro pages (routes)
├── docs/             # Migration docs & specifications
└── public/           # Static assets

legacy-archive/        # Original vanilla JS version (preserved for reference)
```

## Documentation

- **[Migration Progress](./astro-app/docs/MIGRATION_PROGRESS.md)** - Current status and completed phases
- **[Island Boundaries](./astro-app/docs/ISLAND_BOUNDARIES.md)** - Svelte component specifications
- **[Migration Summary](./astro-app/docs/MIGRATION_SUMMARY.md)** - Architecture overview

## Features

LifeLab helps you monitor and improve different areas of your life with a unified dashboard:

- **Daily Notebook** - Monthly view with daily intent, quality, and outcome tracking
- **Habits Tracker** - Log and monitor habit formation
- **Learning Log** - Document learning activities and progress
- **Career Journal** - Record milestones and achievements
- **Health Metrics** - Track wellness and fitness activities

## Deployment

Automatically deploys to GitHub Pages via GitHub Actions when pushing to `main` branch.

## Legacy Code

The original vanilla JavaScript version is preserved in `legacy-archive/` for reference and historical context.

All data is stored locally in your browser, giving you complete privacy and control.

## Features

### Multi-Domain Tracking

- **Habits**: Track daily habits with streak calculation
- **Learning**: Log what you're learning with notes
- **Career**: Record professional achievements and goals
- **Health**: Monitor health-related activities and metrics

### Dashboard Overview

- Monthly summaries for each domain
- At-a-glance statistics showing entries this month
- Active days tracking to see your consistency

### Timeline View

- Unified timeline across all domains
- See all your entries in chronological order
- Filter and review your progress over time

### Local Storage

- All data saved in your browser's localStorage
- No server required, no accounts needed
- Complete privacy—your data never leaves your device

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for running the local server)

### Running the Dashboard

1. **Clone or download this repository**

   ```bash
   cd lifelab
   ```

2. **Start a local HTTP server**

   ```bash
   python -m http.server 8000
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000`

That's it! Your personal dashboard is ready to use.

## How to Use

### Adding Entries

1. Click on any domain card from the dashboard
2. Fill in the quick entry form:
   - **Value**: What you did (e.g., "Morning run", "Read Chapter 5")
   - **Notes**: Optional details or reflections
3. Click "Add Entry"

### Viewing History

Each domain shows:

- **Recent History**: Your latest entries with timestamps
- **Trends**: Statistics like current streak (for Habits) or total entries
- Delete option for each entry

### Timeline

Click "Timeline" in the navigation to see entries from all domains combined in chronological order.

### Dashboard

The main dashboard displays:

- All available domains
- Monthly entry count for each domain
- Active days in the current month
- Quick navigation to each domain

## Project Structure

```
lifelab/
├── index.html              # Main application entry point
├── styles/
│   └── main.css           # Global styles and theme
├── scripts/
│   ├── config.js          # Domain configuration
│   ├── store.js           # localStorage abstraction
│   ├── utils.js           # Utility functions
│   └── app.js             # Main application logic
└── modules/
    ├── habits/            # Habits tracking module
    ├── learning/          # Learning tracking module
    ├── career/            # Career tracking module
    └── health/            # Health tracking module
```

## Technical Details

### Architecture

- **Modular Design**: Each domain is a self-contained module
- **Universal Entry Model**: All entries share the same data structure
- **Configuration-Driven**: Easy to add new domains via `config.js`
- **Storage Abstraction**: Centralized localStorage management

### Data Model

Each entry follows this structure:

```javascript
{
  id: "unique-identifier",
  timestamp: 1704326400000,
  value: "What you tracked",
  notes: "Optional notes"
}
```

### Browser Compatibility

Works in all modern browsers that support:

- ES6 JavaScript
- localStorage API
- CSS Grid and Flexbox

## Privacy & Data

- **100% Local**: All data stored in browser localStorage
- **No Tracking**: No analytics, no external requests
- **Export/Import**: Not yet implemented (coming soon)
- **Data Persistence**: Data persists until you clear browser data

## Future Enhancements

Potential features for future development:

- Data export/import functionality
- Charts and visualizations
- Goal setting and progress tracking
- Custom domain creation
- Dark mode
- Mobile-responsive improvements

## License

This is a personal project. Feel free to fork and modify for your own use.

## Contributing

This is primarily a personal tracking tool, but suggestions and improvements are welcome!

---

**Built with simplicity in mind—track your life, your way.**
