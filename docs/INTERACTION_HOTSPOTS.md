# LifeLab - Interaction Hotspot Classification

**Purpose**: Classify components as Static (Astro) vs Interactive (Svelte) vs Computed (Hybrid)

## Classification Rules

- **Static**: No JavaScript needed, pure HTML/CSS
- **Interactive**: User input, state changes, event handlers → **Svelte Island**
- **Computed**: Derived view from data, no user interaction → **Astro with props**

---

## Component Classification

### 🟢 STATIC (Pure Astro, No Hydration)

#### 1. Page Layouts
- **Header Structure**: Logo, title, static branding
- **Navigation Container**: Nav structure (items are interactive, but container is static)
- **Footer**: Copyright, links

#### 2. Content Wrappers
- **Main Container**: `<main>` wrapper
- **Dashboard Grid Container**: Layout grid
- **Module Containers**: Section wrappers

#### 3. Typography & Labels
- **Headings**: H1, H2, H3 titles
- **Descriptive Text**: Instructions, help text
- **Labels**: Form labels (static text)

---

## 🔵 INTERACTIVE (Svelte Islands with client:* directives)

### Priority 1: Core Interaction Islands

#### Island 1: NavigationMenu
**Location**: Header navigation bar  
**Interactions**:
- Click navigation items
- Highlight active route
- Navigate between views

**Hydration**: `client:load` (immediately visible)  
**Props**: `domains` array, `currentView`  
**State**: `activeRoute`  

---

#### Island 2: QuickEntryForm
**Location**: Each domain view  
**Interactions**:
- Form input (text, textarea, date)
- Form validation
- Submit entry
- Clear form after submit

**Hydration**: `client:visible` (below fold)  
**Props**: `domainId`, `domainConfig`  
**State**: `formData`, `errors`, `isSubmitting`  

---

#### Island 3: NotebookMonthNavigation
**Location**: Notebook header  
**Interactions**:
- Previous/Next month buttons
- Month/Year display
- Navigate to different months

**Hydration**: `client:load`  
**Props**: `currentYear`, `currentMonth`  
**State**: `year`, `month`  
**Events**: `onMonthChange(year, month)`  

---

#### Island 4: DailyRowControls
**Location**: Each day row in notebook  
**Interactions**:
- Intent dropdown (✨, 🎯, 🌊)
- Quality dropdown (⭐⭐⭐, ⭐⭐, ⭐, -)
- Outcome dropdown (✓, ÷, ✗, -)
- Auto-save on change

**Hydration**: `client:visible`  
**Props**: `dayNumber`, `year`, `month`, `initialData`  
**State**: `intent`, `quality`, `outcome`  

---

#### Island 5: DomainPresenceBadges
**Location**: Each day row in notebook  
**Interactions**:
- Display domain badges
- Click badge to view entries
- Visual indication of activity

**Hydration**: `client:visible`  
**Props**: `dayNumber`, `activeDomains`, `allDomains`  
**State**: None (or minimal hover state)  

---

#### Island 6: MonthlyReflectionEditor
**Location**: Notebook bottom  
**Interactions**:
- Textarea input
- Auto-save (debounced)
- Character count (optional)
- Save confirmation

**Hydration**: `client:visible`  
**Props**: `year`, `month`, `initialReflection`  
**State**: `reflection`, `isSaving`, `lastSaved`  

---

#### Island 7: MonthActionButtons
**Location**: Notebook header  
**Interactions**:
- Close/Lock month button
- Export notebooks button
- Import notebooks button
- File download/upload

**Hydration**: `client:visible`  
**Props**: `year`, `month`, `isClosed`  
**State**: `confirmDialog`, `isExporting`, `isImporting`  

---

#### Island 8: EntryHistoryList
**Location**: Domain views (below quick entry)  
**Interactions**:
- Display entry cards
- Edit entry (inline or modal)
- Delete entry (with confirmation)
- Pagination (if needed)

**Hydration**: `client:visible`  
**Props**: `domainId`, `entries`  
**State**: `editingId`, `deleteConfirm`, `currentPage`  

---

### Priority 2: Secondary Islands

#### Island 9: YearViewGrid
**Location**: Year view page  
**Interactions**:
- Week cell clicks
- Domain filter toggles
- Year selector dropdown

**Hydration**: `client:idle`  
**Props**: `year`, `domains`, `activityData`  
**State**: `selectedYear`, `activeDomains`, `hoveredWeek`  

---

#### Island 10: TimelineFilters
**Location**: Timeline view  
**Interactions**:
- Domain filter checkboxes
- Date range picker
- Search input

**Hydration**: `client:idle`  
**Props**: `domains`  
**State**: `filters`, `searchQuery`, `dateRange`  

---

## 🟡 COMPUTED (Hybrid: Astro Renders, Optional Svelte for Interactivity)

### Computed 1: DashboardDomainCards
**Computation**: Aggregate stats (total entries, streaks, last activity)  
**Rendering**: Astro can compute at build/request time  
**Interactivity**: Click to navigate (NavigationMenu handles this)  
**Verdict**: **Pure Astro with computed props**

```astro
---
// Computed at render time
const stats = computeDomainStats(domainId);
---
<div class="domain-card">
  <h3>{domain.displayName}</h3>
  <p>Total: {stats.total}</p>
  <p>Streak: {stats.streak}</p>
</div>
```

---

### Computed 2: NotebookTrendIndicator
**Computation**: Calculate trend from month data (📈↗️➡️↘️📉)  
**Rendering**: Astro computes trend, renders static icon  
**Interactivity**: None (display only)  
**Verdict**: **Pure Astro with computed trend**

```astro
---
const trend = calculateMonthTrend(notebook);
---
<div class="trend-indicator">
  <span class="trend-icon">{trend.icon}</span>
  <span class="trend-label">{trend.label}</span>
</div>
```

---

### Computed 3: EntryStatistics
**Computation**: Count entries, calculate percentages, streaks  
**Rendering**: Astro computes at render  
**Interactivity**: None  
**Verdict**: **Pure Astro**

---

## Island Hydration Strategy

| Island | Directive | Reason |
|--------|-----------|--------|
| NavigationMenu | `client:load` | Immediately visible, core UX |
| QuickEntryForm | `client:visible` | Below fold, can lazy load |
| NotebookMonthNavigation | `client:load` | Core interaction, above fold |
| DailyRowControls | `client:visible` | Many instances, lazy load |
| DomainPresenceBadges | `client:visible` | Many instances, lazy load |
| MonthlyReflectionEditor | `client:visible` | Below fold |
| MonthActionButtons | `client:visible` | Secondary actions |
| EntryHistoryList | `client:visible` | Below quick entry |
| YearViewGrid | `client:idle` | Separate view, can defer |
| TimelineFilters | `client:idle` | Secondary controls |

---

## Data Flow Architecture

### Principle: Astro Owns Structure, Svelte Owns Interaction

```
┌─────────────────────────────────────────┐
│ Astro Page (.astro)                     │
│ - Fetches data from storage layer       │
│ - Computes derived values               │
│ - Renders static structure              │
│ - Passes props to Svelte islands        │
└─────────────┬───────────────────────────┘
              │
              ├──> Static HTML (no JS)
              │
              └──> Svelte Islands (hydrated)
                   ├─ Receive initial props
                   ├─ Manage local UI state
                   ├─ Call storage utilities
                   └─ Emit events (if needed)
```

### Storage Access Pattern

**RULE**: Keep storage logic framework-agnostic.

```javascript
// ✅ Correct: Framework-agnostic utility
// src/lib/storage.js (plain JS)
export function saveEntry(domainId, entry) {
  const key = getStorageKey(domainId);
  const entries = getEntries(domainId);
  entries.push(entry);
  localStorage.setItem(key, JSON.stringify(entries));
}

// Svelte component calls utility
<script>
  import { saveEntry } from '$lib/storage';
  
  function handleSubmit() {
    saveEntry('habits', formData);
  }
</script>

// Astro page calls utility
---
import { getEntries } from '../lib/storage';
const entries = getEntries('habits');
---
```

**❌ Avoid**: Svelte stores tied to storage
```javascript
// Don't do this - creates tight coupling
import { writable } from 'svelte/store';
export const habitsStore = writable(getEntries('habits'));
```

---

## Anti-Patterns to Avoid

### ❌ Don't Hydrate Entire Pages
```astro
<!-- BAD: Entire notebook as one island -->
<NotebookPage client:load {data} />
```

```astro
<!-- GOOD: Targeted islands -->
<div class="notebook-view">
  <NotebookMonthNav client:load {year} {month} />
  
  {#each days as day}
    <div class="day-row">
      <DailyRowControls client:visible {day} />
      <DomainBadges client:visible {day.domains} />
    </div>
  {/each}
  
  <ReflectionEditor client:visible {reflection} />
</div>
```

---

### ❌ Don't Create Global Stores
```javascript
// BAD: Global reactive store
import { writable } from 'svelte/store';
export const globalNotebook = writable(null);
```

```javascript
// GOOD: Each island manages its own state
<script>
  let intent = props.initialIntent;
  
  function updateIntent(newIntent) {
    intent = newIntent;
    saveToStorage(dayId, { intent });
  }
</script>
```

---

### ❌ Don't Re-fetch on Every State Change
```javascript
// BAD: Reactive over-fetching
$: entries = getEntries(domainId); // Re-reads localStorage constantly
```

```javascript
// GOOD: Load once, update explicitly
let entries = getEntries(domainId);

function addEntry(entry) {
  saveEntry(domainId, entry);
  entries = [...entries, entry]; // Update local state
}
```

---

## Success Metrics

After migration, verify:

✅ **Speed**: Dropdowns respond in <50ms  
✅ **Lighthouse**: Performance score >90  
✅ **Bundle**: JS payload <100KB (excluding storage data)  
✅ **Hydration**: <10 islands per page  
✅ **Behavior**: All user flows unchanged  
✅ **Data**: No storage format changes  

---

**Next Step**: Proceed to M2.1 - Create Astro project shell
