# LifeLab Home Page Boundaries

## What the Home Page IS

The home page is an **insight layer** designed to help you understand your month at a glance.

### Core Purpose
- Explain the month in under 5 seconds
- Show temporal flow (how activity changes over time)
- Show distribution (where attention went across domains)
- Surface notable patterns through text observations
- Feel calm, not evaluative

### Design Philosophy
- **Observational not evaluative**: Describes what happened, not whether it was good or bad
- **Understanding before action**: Prioritizes insight over interaction
- **Visualizations over tables**: Uses graphs and heatmaps instead of data grids
- **Fast and responsive**: Loads quickly, works on all screen sizes

---

## What the Home Page DOES

### 1. Temporal Flow (Line Graph)
- Shows daily domain engagement across the month
- Visualizes rhythm and patterns over time
- Highlights today's position in the month
- No smoothing (preserves authentic patterns)
- No goal lines or targets

### 2. Distribution View (Heatmap)
- Shows which domains were active on which days
- Rows = days (1-31)
- Columns = domains (health, career, learning, etc.)
- Cell shading = presence (not success)
- Scrollable horizontally if many domains

### 3. Pattern Observations (Text Analytics)
- Auto-generated textual observations
- Describes clustering, gaps, consistency changes
- Maximum 3 observations per month
- Descriptive language only (no prescriptions)
- Collapsible section (subdued styling)

---

## What the Home Page DOES NOT DO

The home page intentionally excludes:

### ❌ No Data Entry
- Cannot add new entries from home page
- Cannot edit existing data
- Cannot mark days complete
- **Action**: Use `/notebook` page for all data entry

### ❌ No Scoring or Grading
- No success/failure metrics
- No percentages or ratings
- No "good month" vs "bad month" labels
- No performance comparisons

### ❌ No Streak Tracking
- No "consecutive days" counters
- No gamification elements
- No badges or achievements
- No motivational language

### ❌ No Goal Setting
- No targets or objectives
- No "should" language
- No recommendations or advice
- No future planning features

### ❌ No Month Navigation
- Home page ALWAYS shows current month
- Cannot view past or future months from home
- **Action**: Use `/notebook?month=YYYY-MM` to view other months

---

## Navigation Flow

```
Home (/)              → Insight view (read-only)
  ↓
Notebook (/notebook)  → Data entry (add/edit entries)
  ↓
Domain pages          → Domain-specific detail views
```

### Primary Actions
- **View insights**: Stay on home page
- **Add/edit entries**: Click "Edit in Notebook" link → `/notebook`
- **View different month**: Go to `/notebook?month=YYYY-MM`

---

## Technical Architecture

### Data Flow
1. Home page loads current month data from `localStorage`
2. `buildMonthlyInsight()` transforms stored data into `MonthlyInsight` structure
3. Components receive clean, domain-agnostic data
4. No UI components access storage directly

### Components Used
- `InsightLineGraph.svelte` - Temporal flow visualization
- `InsightHeatmap.svelte` - Domain distribution matrix
- `InsightObservations.svelte` - Text pattern observations

### Hydration Strategy
- All visualization components use `client:visible`
- Only hydrate when scrolled into view
- Keeps initial page load fast

---

## Future Extension Guidelines

### ✅ What CAN be Added
- New visualization types (e.g., domain timeline)
- Additional pattern observations
- Export insights to PDF/image
- Month comparison views (side-by-side, read-only)
- Customizable insight visibility

### ❌ What Should NEVER be Added
- Data entry forms
- Inline editing
- Scoring or rating systems
- Motivational prompts
- Achievement tracking
- Social comparison features
- Goal setting interfaces

---

## Design Constraints

### Visual Hierarchy
1. Line graph (primary insight - temporal flow)
2. Heatmap (secondary insight - distribution)
3. Text observations (tertiary - collapsible)

### Cognitive Load
- Maximum 3 text observations per month
- No more than 2 visualizations above the fold
- Clear "Edit in Notebook" action for next steps

### Performance
- Total JS < 100KB (current: ~70KB)
- Visualizations render in < 100ms
- Page load < 1 second on 3G

---

## Philosophical Foundation

The home page exists to answer one question:

> "What happened this month?"

Not:
- "Did I do well?"
- "Should I change something?"
- "Am I on track?"

**Home handles meaning. Notebook handles action.**
