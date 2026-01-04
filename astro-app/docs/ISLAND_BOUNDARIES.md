# LifeLab - Svelte Island Boundaries

**Phase M3.2 Documentation**

This document defines the exact boundaries for Svelte islands, specifying which components should be islands and their hydration strategies.

---

## Island Architecture

### Principle

**Astro owns structure → Svelte owns interaction**

Each island is:

- Self-contained
- Hydrates independently
- Communicates via props (down) and events (up)
- No global stores
- No prop drilling

---

## Defined Islands

### ✅ Island 1: NavigationMenu

**File**: `src/components/NavigationMenu.svelte`  
**Location**: Header navigation bar  
**Hydration**: `client:load`  
**Status**: ✅ **IMPLEMENTED**

**Props**:

```typescript
{
  currentPath: string;
}
```

**State**:

- Active route highlighting
- Hover states

**Interactions**:

- Click navigation items
- Visual active state

**Why client:load**:

- Immediately visible
- Core UX element
- Small bundle size

---

### 🔲 Island 2: QuickEntryForm

**File**: `src/components/QuickEntryForm.svelte`  
**Location**: Each domain page  
**Hydration**: `client:visible`  
**Status**: ⏳ **PENDING** (Phase M4.1)

**Props**:

```typescript
{
  domainId: string,
  domainConfig: Domain
}
```

**State**:

- `formData: { value: string, notes: string }`
- `errors: Record<string, string>`
- `isSubmitting: boolean`

**Interactions**:

- Form input
- Validation
- Submit
- Clear after submit

**Why client:visible**:

- Below fold
- Can lazy load
- User initiates interaction

---

### 🔲 Island 3: NotebookMonthNavigation

**File**: `src/components/NotebookMonthNavigation.svelte`  
**Location**: Notebook page header  
**Hydration**: `client:load`  
**Status**: ⏳ **PENDING** (Phase M4.3)

**Props**:

```typescript
{
  currentYear: number,
  currentMonth: number
}
```

**State**:

- `year: number`
- `month: number`

**Events**:

```typescript
dispatch("monthChange", { year, month });
```

**Interactions**:

- Previous/Next month buttons
- Month display

**Why client:load**:

- Core navigation
- Above fold
- Affects entire page

---

### 🔲 Island 4: DailyRowControls

**File**: `src/components/DailyRowControls.svelte`  
**Location**: Each day row in notebook  
**Hydration**: `client:visible`  
**Status**: ⏳ **PENDING** (Phase M4.2)

**Props**:

```typescript
{
  year: number,
  month: number,
  dayNumber: number,
  initialData: {
    intent?: string,
    quality?: string,
    outcome?: string
  }
}
```

**State**:

- `intent: string`
- `quality: string`
- `outcome: string`
- `isSaving: boolean`

**Interactions**:

- Dropdown selections
- Auto-save on change

**Why client:visible**:

- Many instances per page (31 days)
- Lazy load as scrolled into view
- Reduces initial hydration

**Special Consideration**:

- Each day is a separate island instance
- No shared state between days
- Each saves independently

---

### 🔲 Island 5: DomainPresenceBadges

**File**: `src/components/DomainPresenceBadges.svelte`  
**Location**: Each day row in notebook  
**Hydration**: `client:visible`  
**Status**: ⏳ **PENDING** (Phase M4.2)

**Props**:

```typescript
{
  dayNumber: number,
  activeDomains: string[],
  allDomains: Domain[]
}
```

**State**:

- `hoveredDomain: string | null`

**Interactions**:

- Display domain badges
- Hover tooltips
- Click to view entries (optional)

**Why client:visible**:

- Many instances
- Mostly visual
- Minimal interaction

---

### 🔲 Island 6: MonthlyReflectionEditor

**File**: `src/components/MonthlyReflectionEditor.svelte`  
**Location**: Notebook bottom  
**Hydration**: `client:visible`  
**Status**: ⏳ **PENDING** (Phase M4.3)

**Props**:

```typescript
{
  year: number,
  month: number,
  initialReflection: string
}
```

**State**:

- `reflection: string`
- `isSaving: boolean`
- `lastSaved: Date | null`

**Interactions**:

- Textarea input
- Auto-save (debounced 1000ms)
- Save status indicator

**Why client:visible**:

- Below fold
- Only loads when scrolled
- Large text input

---

### 🔲 Island 7: MonthActionButtons

**File**: `src/components/MonthActionButtons.svelte`  
**Location**: Notebook header  
**Hydration**: `client:visible`  
**Status**: ⏳ **PENDING** (Phase M4.3)

**Props**:

```typescript
{
  year: number,
  month: number,
  isClosed: boolean
}
```

**State**:

- `showConfirmDialog: boolean`
- `isExporting: boolean`
- `isImporting: boolean`

**Interactions**:

- Close/Lock month
- Export notebooks
- Import notebooks
- File download/upload

**Why client:visible**:

- Secondary actions
- Not immediately needed
- Can defer

---

### 🔲 Island 8: EntryHistoryList

**File**: `src/components/EntryHistoryList.svelte`  
**Location**: Domain views  
**Hydration**: `client:visible`  
**Status**: ⏳ **PENDING** (Phase M4.1)

**Props**:

```typescript
{
  domainId: string,
  initialEntries: Entry[]
}
```

**State**:

- `entries: Entry[]`
- `editingId: string | null`
- `deleteConfirmId: string | null`

**Interactions**:

- Display entry cards
- Edit entry (inline)
- Delete entry (confirmation)
- Refresh after changes

**Why client:visible**:

- Below quick entry form
- Many entries possible
- Can lazy load

---

## Island Hydration Summary

| Island           | File                           | Hydration        | Priority |
| ---------------- | ------------------------------ | ---------------- | -------- |
| NavigationMenu   | NavigationMenu.svelte          | `client:load`    | ✅ Done  |
| QuickEntryForm   | QuickEntryForm.svelte          | `client:visible` | M4.1     |
| NotebookMonthNav | NotebookMonthNavigation.svelte | `client:load`    | M4.3     |
| DailyRowControls | DailyRowControls.svelte        | `client:visible` | M4.2     |
| DomainBadges     | DomainPresenceBadges.svelte    | `client:visible` | M4.2     |
| ReflectionEditor | MonthlyReflectionEditor.svelte | `client:visible` | M4.3     |
| MonthActions     | MonthActionButtons.svelte      | `client:visible` | M4.3     |
| EntryHistory     | EntryHistoryList.svelte        | `client:visible` | M4.1     |

---

## Data Flow Pattern

### 1. Page Load (Astro)

```astro
---
// Astro renders at build time or SSR
import { getEntries } from '../lib/storage';

// This won't work at build time (no localStorage)
// Will be handled client-side in islands
const entries = []; // Placeholder
---

<QuickEntryForm client:visible domainId="habits" />
<EntryHistoryList client:visible domainId="habits" initialEntries={entries} />
```

### 2. Island Mount (Svelte)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { getEntries } from '../lib/storage';

  export let domainId: string;
  export let initialEntries: Entry[] = [];

  let entries = initialEntries;

  onMount(() => {
    // Load from localStorage on client
    entries = getEntries(domainId);
  });
</script>
```

### 3. User Interaction (Svelte)

```svelte
<script>
  function handleSubmit(data) {
    const entry = createEntry(data.value, data.notes);
    saveEntry(domainId, entry);

    // Update local state
    entries = [...entries, entry];
  }
</script>
```

---

## Anti-Patterns (What NOT to Do)

### ❌ Don't Create Global Stores

```javascript
// BAD
import { writable } from "svelte/store";
export const notebookStore = writable(null);
```

### ❌ Don't Hydrate Entire Pages

```astro
<!-- BAD -->
<NotebookPage client:load data={allData} />
```

### ❌ Don't Re-fetch on Every Change

```svelte
<!-- BAD -->
$: entries = getEntries(domainId);
```

### ✅ DO: Use Local State + Explicit Updates

```svelte
let entries = getEntries(domainId);

function addEntry(entry) {
  saveEntry(domainId, entry);
  entries = [...entries, entry];
}
```

---

## Next Steps

1. **Phase M4.1**: Implement QuickEntryForm and EntryHistoryList islands
2. **Phase M4.2**: Implement DailyRowControls and DomainPresenceBadges
3. **Phase M4.3**: Implement Notebook-specific islands

Each phase will:

- Create the Svelte component
- Add to appropriate Astro page
- Verify behavior parity
- Test interaction speed
- Document any deviations

---

**Status**: Phase M3 Complete ✅  
**Next**: Phase M4 - Convert Interactive Components
