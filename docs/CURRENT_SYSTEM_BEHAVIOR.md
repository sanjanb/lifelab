# LifeLab - Current System Behavior Documentation

**Purpose**: Baseline documentation for migration safety - no changes allowed during migration.

## Interactive Elements

### 1. Navigation System

- **Header Title Click**: Returns to dashboard view
- **Navigation Items**: Click to navigate between domain views (Habits, Learning, Career, Health)
- **Special Navigation**: Timeline, Notebook, Year views
- **Dynamic Generation**: Navigation items generated from `DOMAINS` config array

### 2. Domain Quick Entry Forms

Each domain (Habits, Learning, Career, Health) has a quick entry form with:

- **Input Fields**: Domain-specific fields (e.g., habit name, value, notes)
- **Submit Button**: Logs entry to localStorage
- **Form Validation**: Required field checking
- **Auto-timestamp**: Entries automatically timestamped on creation

### 3. Monthly Notebook Interface

**Core Interactions**:

- **Month Navigation**: Previous/Next month buttons
- **Monthly Trends**: Visual trend display (icons: 📈↗️➡️↘️📉)
- **Daily Rows**:
  - Intent dropdown (✨, 🎯, 🌊)
  - Quality dropdown (⭐⭐⭐, ⭐⭐, ⭐, -)
  - Outcome dropdown (✓, ÷, ✗, -)
  - Domain presence indicators (clickable badges)
- **Month Actions**:
  - Close/Lock month button
  - Export all notebooks button
  - Import notebooks button
- **Monthly Reflection**:
  - Textarea for reflection notes
  - Save button
  - Auto-save on input (debounced)

### 4. Year View

- **Year Selection**: Dropdown to select year
- **Week Grid**: Interactive week cells showing activity levels
- **Domain Filtering**: Toggle domains to view their activity

### 5. Timeline View

- **Chronological Entry List**: All entries across all domains
- **Entry Cards**: Display entry details with edit/delete buttons
- **Date Grouping**: Entries grouped by date

## Data Storage Keys and Formats

### Domain Storage Keys

```javascript
// From config.js DOMAINS array
"lifelab_habits"    - Array of habit entries
"lifelab_learning"  - Array of learning entries
"lifelab_career"    - Array of career entries
"lifelab_health"    - Array of health entries
```

### Entry Format (All Domains)

```javascript
{
  id: "unique-id-timestamp-based",
  timestamp: "ISO-8601 datetime string",
  date: "YYYY-MM-DD",
  value: "Entry content/description",
  notes: "Optional notes",
  // Domain-specific fields vary
}
```

### Monthly Notebook Format

```javascript
// Storage key: "lifelab_notebook_YYYY_MM"
{
  year: 2026,
  month: 1,
  _closed: boolean,
  reflection: "Monthly reflection text",
  days: {
    "1": {
      intent: "✨" | "🎯" | "🌊" | "",
      quality: "⭐⭐⭐" | "⭐⭐" | "⭐" | "-" | "",
      outcome: "✓" | "÷" | "✗" | "-" | "",
      domains: ["habits", "learning"] // Array of active domain IDs
    },
    // ... days 2-31
  }
}
```

## User Flows (Must Remain Unchanged)

### Flow 1: Log a New Entry

1. User clicks domain in navigation
2. Domain view loads with quick entry form
3. User fills form fields
4. User clicks submit button
5. Entry saved to localStorage under domain's storage key
6. Form clears
7. History view refreshes to show new entry

### Flow 2: Navigate to Notebook

1. User clicks "Notebook" in navigation
2. System performs non-destructive sync (merges domain entries into notebook days)
3. Current month's notebook loads
4. Daily rows render with intent/quality/outcome dropdowns
5. Domain presence badges show active domains per day
6. User can modify daily metadata (intent, quality, outcome)
7. Changes auto-save to notebook storage

### Flow 3: Month Navigation

1. User clicks Previous/Next Month buttons
2. System syncs target month's data
3. New month's notebook loads
4. UI updates with new month's data

### Flow 4: Close/Lock Month

1. User clicks "Close Month" button
2. Confirmation dialog appears
3. On confirm, notebook.\_closed = true
4. UI shows lock badge
5. Daily controls become read-only (if implemented)

### Flow 5: Export/Import Notebooks

1. User clicks "Export Data" button
2. All monthly notebooks serialized to JSON
3. Download triggered with filename `lifelab-notebooks-YYYY-MM-DD.json`
4. For import: User clicks "Import Data"
5. File picker opens
6. User selects JSON file
7. Data merges into localStorage (non-destructive)

## JavaScript Interaction Hotspots

### High Interaction (Requires Client-Side JS)

1. **Form Submissions**: All domain quick entry forms
2. **Navigation**: Click handlers for all navigation items
3. **Dropdowns**: Daily intent/quality/outcome selectors
4. **Month Controls**: Previous/Next month buttons
5. **Export/Import**: File download/upload functionality
6. **Notebook Sync**: Merging domain entries into notebook days
7. **Domain Badges**: Clickable indicators in daily rows

### Medium Interaction (User Input)

1. **Reflection Textarea**: Monthly reflection input with auto-save
2. **Entry Edit Forms**: Inline editing of existing entries
3. **Date Pickers**: Date selection for entries
4. **Search/Filter**: Timeline and domain view filtering

### Low/No Interaction (Can Be Static or Computed)

1. **Trend Indicators**: Calculated from data (📈↗️➡️↘️📉)
2. **Streak Counters**: Computed from entry history
3. **Statistics Cards**: Aggregated counts and percentages
4. **Calendar Grid**: Month day layout (structure only)

## Critical Business Logic (DO NOT CHANGE)

### 1. Non-Destructive Sync

```javascript
// Located in: scripts/notebookSync.js
// Function: performNonDestructiveSync(year, month)
// Behavior: Merges domain entries into notebook.days without overwriting manual metadata
```

### 2. Storage Abstraction

```javascript
// Located in: scripts/store.js
// Functions: saveEntry(), getEntries(), deleteEntry(), clearDomain()
// Behavior: Wraps localStorage with domain-aware CRUD operations
```

### 3. Entry ID Generation

```javascript
// Pattern: domainId_timestamp_randomSuffix
// Example: "habits_1704326400000_xyz"
// Must remain unique across all entries
```

### 4. Date Normalization

```javascript
// All dates stored as "YYYY-MM-DD" strings
// Timestamps stored as ISO-8601 strings
// Timezone: Local browser timezone
```

## Dependency Map

### External Dependencies

- **None** (Pure vanilla JavaScript)

### Internal Module Dependencies

```
index.html
  └─ app.js (orchestrator)
      ├─ config.js (DOMAINS configuration)
      ├─ utils.js (date, ID generation helpers)
      ├─ store.js (localStorage abstraction)
      ├─ monthlyNotebook.js (notebook data structure)
      └─ notebookSync.js (domain → notebook sync)
          └─ modules/
              ├─ habits/habits.js
              ├─ learning/learning.js
              ├─ career/career.js
              ├─ health/health.js
              ├─ notebook/notebook.js
              └─ year/year.js
```

## Browser Compatibility Requirements

- **localStorage API**: Required for all data persistence
- **ES6+ Features**: Template literals, arrow functions, destructuring
- **DOM APIs**: querySelector, addEventListener, fetch (for future)
- **Date APIs**: Date object, toLocaleDateString, ISO string formatting

## Performance Characteristics (Current Baseline)

### Perceived Slowness Areas

1. **Notebook Sync**: Can take 200-500ms for months with many entries
2. **DOM Rendering**: Large month grids (31 days × multiple domains) rebuild entire DOM
3. **Event Listener Overhead**: Each daily dropdown attaches separate listeners
4. **Storage Access**: Multiple localStorage reads/writes per interaction

### Fast Areas

1. **Navigation**: Simple DOM swapping
2. **Form Input**: Direct input handling
3. **Static Content**: Dashboard cards, headers

---

## Migration Safety Checklist

✅ All interactive elements documented  
✅ Storage formats frozen  
✅ User flows mapped  
✅ JavaScript hotspots identified  
✅ Critical business logic isolated  
✅ Dependency graph created

**Next Step**: Proceed to M1.2 - Identify interaction hotspots classification
