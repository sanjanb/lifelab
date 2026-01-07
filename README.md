# LifeLab

A thinking surface for self-tracking. A minimal, analytical dashboard built with Vite + Vanilla JavaScript.

## Core Principles

- No framework abstractions
- No hidden state
- Deterministic rendering
- SVG for graphs (not canvas)
- Data-first, visuals second
- Everything works identically in localhost and GitHub Pages

## Project Structure

```
lifelab/
├── index.html              # Main HTML entry point
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
├── public/
│   └── data/
│       └── months/        # Monthly JSON data files
│           └── 2026-01.json
├── src/
│   ├── styles/           # CSS files
│   │   ├── base.css      # Base styles & typography
│   │   ├── layout.css    # Layout & sections
│   │   └── components.css # Component-specific styles
│   ├── data/             # Data management
│   │   ├── schema.js     # Data model definitions
│   │   ├── store.js      # In-memory data store
│   │   └── loader.js     # Data loading logic
│   ├── graphs/           # Visualization modules
│   │   ├── lineGraph.js  # Monthly trend line graph
│   │   └── heatmap.js    # Yearly heatmap
│   ├── insights/         # Analytics
│   │   └── analytics.js  # Pattern analysis
│   └── main.js           # Application entry point
```

## Data Format

Each day is tracked in a JSON file located at `/public/data/months/YYYY-MM.json`:

```json
[
  {
    "date": "2026-01-01",
    "domains": {
      "health": 0.7,
      "skills": 0.6,
      "finance": 0.5,
      "academics": 0.8
    },
    "notes": "Good start to the year"
  }
]
```

### Domain Scoring

- Each domain uses a 0-1 scale (0 = no activity, 1 = full engagement)
- Domains are extensible - add new ones without breaking old data
- Daily score = average of all active domains

## Getting Started

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Deploying to GitHub Pages

1. Update `vite.config.js` with your repository name:

   ```js
   base: "/your-repo-name/";
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## Features

### Home Dashboard

- **Monthly Line Graph** - Pure SVG rendering of daily score trends
- **Yearly Heatmap** - GitHub-style visualization with neutral colors
- **Automated Insights** - Pattern detection and trend analysis
- **Quick Navigation** - Access all features from the home page

### Notebook

- **Daily Entry Table** - View and edit all entries for any month
- **Quick Entry Widget** - Fast data entry with sliders
- **Inline Editing** - Edit individual days with full form
- **Export Options** - Download month data as JSON or CSV

### Year Review

- **Full Year Heatmap** - Complete annual visualization
- **Year Statistics** - Total days, coverage, averages, streaks
- **Monthly Comparison** - Bar chart comparing all months
- **Domain Trends** - Track performance across all domains
- **Yearly Insights** - Automated pattern detection for the year

### Settings

- **Domain Configuration** - Enable/disable domains, add custom domains
- **Data Management** - Export, import, and backup all data
- **Preferences** - Customize display settings
- **Privacy Controls** - Clear data, manage storage

### Data Management

- **LocalStorage Persistence** - Data saved locally in your browser
- **Export/Import** - JSON and CSV export, JSON import
- **Full Backup** - Download all data in one file
- **Data Merging** - Import data without overwriting existing entries

## Philosophy

This project is not a dashboard.  
It is a **thinking surface**.

If anything feels flashy, clever, or impressive — remove it.  
If it feels boring but clear — you're doing it right.

## License

MIT
