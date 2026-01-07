# LifeLab — Vite + Vanilla JS Build Plan

## Core principles (do NOT skip)

- No framework abstractions
- No hidden state
- Deterministic rendering
- SVG for graphs (not canvas)
- Data-first, visuals second
- Everything must work identically in `localhost` and GitHub Pages

---

## Phase 0: Project reset & mental cleanup

### Goal

Start from a clean, boring, predictable base.

### Todo

- Create a new repo: `lifelab`
- Remove Astro, Svelte, all framework files
- Commit a clean slate

### Copilot prompt

```text
Create a clean Vite project using vanilla JavaScript.
No frameworks, no TypeScript.
Output should be fully static and compatible with GitHub Pages.
```

---

## Phase 1: File & responsibility structure

### Goal

Establish a structure that scales without becoming chaotic.

### Final structure

```
lifelab/
├── index.html
├── vite.config.js
├── public/
│   └── data/
│       └── months/
├── src/
│   ├── styles/
│   │   ├── base.css
│   │   ├── layout.css
│   │   └── components.css
│   ├── data/
│   │   ├── schema.js
│   │   ├── store.js
│   │   └── loader.js
│   ├── graphs/
│   │   ├── lineGraph.js
│   │   └── heatmap.js
│   ├── insights/
│   │   └── analytics.js
│   └── main.js
└── README.md
```

### Copilot prompt

```text
Create a clear folder structure for a vanilla JS analytical dashboard.
Separate styles, data logic, graph rendering, and analytics.
Do not add unnecessary files.
```

---

## Phase 2: Data model (this is the backbone)

### Goal

Define **truth**, not UI.

### Concepts

- One day = one record
- A month = array of days
- Each day tracks multiple domains
- Domains are extensible

### Example day record

```js
{
  date: "2026-01-12",
  domains: {
    health: 0.7,
    skills: 0.5,
    finance: 0.3,
    academics: 0.6
  },
  notes: "Low energy, still showed up"
}
```

### Copilot prompt

```text
Define a flexible data schema for daily self-tracking.
Each day should support multiple numeric domains (0–1 scale).
Design it so new domains can be added without breaking old data.
```

---

## Phase 3: GitHub-backed storage (free, honest, simple)

### Goal

Store data in GitHub without databases or APIs.

### Approach

- Monthly JSON files inside `/public/data/months`
- Manual edits via GitHub UI
- Read-only from the site

### Example

```
/public/data/months/2026-01.json
```

### Copilot prompt

```text
Implement a data loader that fetches monthly JSON files from the public folder.
Ensure it works in both localhost and GitHub Pages.
Handle missing months gracefully.
```

---

## Phase 4: Page layout (home page only)

### Goal

Everything important visible immediately.

### Home page sections (top to bottom)

1. Monthly line graph
2. Heatmap matrix (year overview)
3. Key insights (textual)
4. Navigation links (Notebook, Archive, About)

### Copilot prompt

```text
Create a minimal analytical homepage layout using semantic HTML.
Prioritize clarity and vertical flow.
Avoid decorative elements.
```

---

## Phase 5: Line graph (exact math, no fluff)

### Goal

Show _trend_, not vanity metrics.

### Math definition

- X axis: days of month (1–30/31)
- Y axis: weighted daily score
- Daily score = average of all active domains
- Missing days interpolate visually but not numerically

### SVG only

No canvas. No chart libraries.

### Copilot prompt

```text
Create an SVG line graph renderer in vanilla JS.
Input: array of daily scores.
Output: clean, readable trend line.
No external libraries.
```

---

## Phase 6: Heatmap (psychologically safe)

### Goal

Insight without guilt.

### Rules

- Rows = weeks
- Columns = days
- Color intensity based on consistency, not perfection
- Neutral palette (no red/green shame)

### Inspired by GitHub, but calmer.

### Copilot prompt

```text
Implement a yearly heatmap visualization using SVG.
Design it to emphasize consistency over streaks.
Avoid aggressive or judgmental colors.
```

---

## Phase 7: Analytics & insights (words matter)

### Goal

Turn data into reflection, not dopamine.

### Examples

- “Energy dips after day 20”
- “Finance habits lag on weekends”
- “Health correlates with skill growth”

### Copilot prompt

```text
Analyze monthly data and generate short textual insights.
Focus on patterns, not scores.
Avoid motivational language.
```

---

## Phase 8: Notebook page (separate, detailed)

### Goal

Raw truth lives here, not on the home page.

### Features

- 30-day table
- One row per day
- Inline notes
- Editable offline, committed manually

### Copilot prompt

```text
Create a notebook-style page showing daily entries in a table.
Optimize for readability and reflection.
No charts here.
```

---

## Phase 9: Styling philosophy

### Rules

- System fonts only
- No animations
- No gradients
- White space over color
- Everything printable

### Copilot prompt

```text
Write clean, minimal CSS focused on readability.
Avoid trends.
Optimize for long-term use.
```

---

## Phase 10: GitHub Pages deployment (no surprises)

### Goal

Local === Deployed

### Requirements

- Relative paths only
- Correct `base` in `vite.config.js`
- No environment branching

### Copilot prompt

```text
Configure Vite for GitHub Pages deployment.
Ensure asset paths and data loading work identically in production.
```

---

## Phase 11: Long-term extensibility (future you)

### Prepare for

- New domains
- New analytics
- Yearly rollups
- Comparative months

### Copilot prompt

```text
Refactor code to make adding new domains and analytics easy.
Avoid rewrites.
Keep responsibilities isolated.
```

---

## Final thought (important)

This project is not a dashboard.
It is a **thinking surface**.

If anything feels flashy, clever, or impressive — remove it.

If it feels boring but clear — you’re doing it right.

---
