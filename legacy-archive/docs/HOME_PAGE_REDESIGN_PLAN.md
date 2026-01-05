# Home Page Redesign - Implementation Plan

## Overview

Transform the home page from a domain dashboard to a **monthly notebook view** representing the current month.

**Current Date Context**: January 4, 2026

---

## Architecture Changes

### Before (Current State)

- Home page (`/`) = Domain dashboard with cards
- Notebook page (`/notebook`) = Monthly notebook grid

### After (New Design)

- Home page (`/`) = Monthly notebook for current month (January 2026)
- Dashboard removed or moved to `/dashboard`
- Navigation focuses on temporal flow

---

## Implementation Phases

### ✅ Phase H1: Home Page Contract

**Status**: Planning

**Tasks**:

- [H1.1] Document home page responsibility

  - Home always shows current month (January 2026)
  - No global dashboards
  - No year-level summaries
  - All content scoped to single month

- [H1.2] Month resolution logic
  - Default: current system month (January 2026)
  - Allow: navigation to past months
  - Future months: read-only placeholders

---

### 🔄 Phase H2: Monthly Context + Line Graph

**Status**: Not Started

**Components to Create**:

1. **MonthlyHeader.svelte**

   - Month name (January)
   - Year (2026)
   - Previous/Next navigation
   - Subtle temporal navigation UI

2. **DailyActivityGraph.svelte**
   - X-axis: Days 1-31
   - Y-axis: Number of active domains per day
   - Line graph (no smoothing, no labels)
   - Data source: Daily row domain counts
   - Descriptive only, not evaluative

**Design Principles**:

- No goal lines
- No performance metrics
- Visual stability (static container in Astro)

---

### 🔄 Phase H3: Monthly Notebook (Primary Surface)

**Status**: Partially Complete

**Existing Components to Adapt**:

- ✅ DailyRowControls.svelte
- ✅ DomainPresenceBadges.svelte
- ✅ NotebookMonthNavigation.svelte (may need modification)

**Required Changes**:

1. Move notebook grid from `/notebook` to `/` (home)
2. One row per calendar day (31 rows for January)
3. Highlight today (January 4, 2026)
4. No pagination, no collapsing
5. Each row displays:
   - Date
   - Domain presence indicators
   - Day intent (Flow/Focus/Ease)
   - Outcome (Win/Neutral/Loss)
   - Quality (3-Excellent/2-Good/1-Fair)
   - Reflection note (optional)

**Svelte Island Strategy**:

- Each daily row = isolated Svelte island
- Local state only
- Storage writes on explicit user actions
- No cascading re-renders

---

### 🔄 Phase H4: Inline Analytics

**Status**: Not Started

**Components to Create**:

1. **MonthlyOutcomeSummary.svelte**

   - Count: Win days
   - Count: Neutral days
   - Count: Loss days
   - No percentages, no judgmental labels
   - Neutral visual tone

2. **DomainParticipationSummary.svelte**

   - Per domain: Number of active days
   - Visual: gaps or clusters
   - No ranking, no comparisons to other months

3. **TrendObservations.svelte**
   - Textual observations (auto-generated)
   - Examples:
     - "Health activity dipped after mid-month."
     - "Learning clustered on weekdays."
   - Observational language only
   - No advice, no judgment

**Placement**: Below notebook grid

---

### 🔄 Phase H5: Monthly Reflection & Closure

**Status**: Partially Complete (MonthlyReflectionEditor exists)

**Required Changes**:

1. **MonthlyReflectionEditor.svelte** (adapt existing)

   - Single sentence only
   - Starter prompt provided
   - Anchors memory

2. **MonthClosureButton.svelte** (new)
   - Explicit closure action
   - After closure: notebook becomes read-only
   - Analytics remain visible
   - Feels like archiving, not submitting

**Integration**: Bottom of home page

---

### 🔄 Phase H6: Visual & Cognitive Guardrails

**Status**: Not Started

**Tasks**:

1. **Visual Hierarchy Enforcement**

   - Priority order:
     1. Month context (header)
     2. Line graph
     3. Notebook (dominant)
     4. Analytics
     5. Reflection
   - Notebook must visually dominate

2. **Anti-Overload Audit**
   - Remove redundant numbers
   - Remove repeated labels
   - Remove decorative elements
   - Home page scannable in <10 seconds

---

## Non-Goals (Explicitly Excluded)

- ❌ No year comparisons on home page
- ❌ No goal tracking
- ❌ No performance scores
- ❌ No notifications
- ❌ No recommendations
- ❌ No cross-month analytics

---

## File Changes Required

### New Files

- `src/components/MonthlyHeader.svelte`
- `src/components/DailyActivityGraph.svelte`
- `src/components/MonthlyOutcomeSummary.svelte`
- `src/components/DomainParticipationSummary.svelte`
- `src/components/TrendObservations.svelte`
- `src/components/MonthClosureButton.svelte`
- `src/lib/monthResolution.ts` (month logic utility)
- `src/lib/analytics.ts` (analytics calculations)

### Modified Files

- `src/pages/index.astro` (complete redesign)
- `src/pages/notebook.astro` (may become redirect or archive view)
- `src/components/NavigationMenu.svelte` (remove dashboard link)
- `src/components/NotebookMonthNavigation.svelte` (adapt for home)
- `src/components/MonthlyReflectionEditor.svelte` (single sentence constraint)

### Potentially Removed

- `src/pages/index.astro` (current dashboard)
- Or moved to `src/pages/dashboard.astro`

---

## Design Principles

### Temporal Navigation, Not Feature Navigation

- Home page answers: "What did this month look like?"
- Not: "How am I doing overall?"

### Observational, Not Evaluative

- Describe patterns, don't judge them
- Show data, don't score performance

### Focus on Truth, Not Control

- Not a control panel
- A place to look at time honestly

---

## Implementation Strategy

1. **Phase H1 First** (Documentation & Logic)

   - Lock mental model
   - Prevent future drift
   - Document contracts

2. **Phase H2 Next** (Visual Orientation)

   - Month context clarity
   - Line graph for momentum

3. **Phase H3 Core** (Primary Interaction)

   - Move notebook to home
   - Main user surface

4. **Phase H4-H6** (Enhancement)
   - Analytics after observation
   - Reflection and closure
   - Visual refinement

---

## Current Month Context

**January 2026**

- Days in month: 31
- Today: January 4, 2026 (Day 4)
- Days completed: 3
- Days remaining: 27
- Week context: First week of month

---

## Success Criteria

- Home page loads with current month (January 2026)
- All 31 days visible in grid
- Today (Day 4) clearly highlighted
- Line graph shows daily domain activity
- No visual clutter
- Scannable in <10 seconds
- Notebook remains primary focus
- Analytics support, not dominate

---

## Next Steps

1. Implement Phase H1 (Documentation + Month Logic)
2. Create MonthlyHeader component
3. Create DailyActivityGraph component
4. Redesign index.astro to use notebook grid
5. Continue through remaining phases

---

**Last Updated**: January 4, 2026
**Status**: Planning Complete, Ready for Implementation
