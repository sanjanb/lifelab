# Phase M5: Storage & State Integration - Validation Guide

## Overview
This phase focuses on validating that the migrated system maintains data integrity, storage isolation, and proper state management across all interactive islands.

## 1. Storage Isolation Verification

### Objective
Ensure framework-agnostic storage utilities work correctly and maintain data independence.

### Tests

#### 1.1 Storage Key Uniqueness
- [ ] Verify each domain uses unique storage keys:
  - `lifelab_habits`
  - `lifelab_learning`
  - `lifelab_career`
  - `lifelab_health`
  - `lifelab_notebook_YYYY_MM`
- [ ] Confirm no key collisions between domains

#### 1.2 Data Format Compatibility
- [ ] Create entries in original vanilla JS version
- [ ] Verify entries load correctly in Astro/Svelte version
- [ ] Confirm bidirectional compatibility
- [ ] Test with existing localStorage data

#### 1.3 CRUD Operations
For each domain (Habits, Learning, Career, Health):
- [ ] Create new entry → verify saved to localStorage
- [ ] Read entries → verify all entries load
- [ ] Delete entry → verify removed from localStorage
- [ ] Verify entry IDs are unique and timestamps accurate

### Implementation Check

```typescript
// ✅ Verified: src/lib/storage.ts
export function saveEntry(domainId: string, entry: DomainEntry): boolean
export function getEntries(domainId: string): DomainEntry[]
export function deleteEntry(domainId: string, entryId: string): boolean
```

**Status**: Storage utilities are framework-agnostic and don't import any Astro/Svelte code ✅

---

## 2. Notebook Sync Validation

### Objective
Test `performNonDestructiveSync()` properly aggregates domain entries into monthly notebook.

### Tests

#### 2.1 Basic Sync
- [ ] Create entries in multiple domains for same date
- [ ] Trigger notebook sync (manually or via component)
- [ ] Verify all domains appear in day's `domains` array
- [ ] Confirm intent/quality/outcome remain untouched

#### 2.2 Non-Destructive Behavior
- [ ] Set manual intent/quality/outcome for a day
- [ ] Add new domain entry for that day
- [ ] Run sync
- [ ] Verify manual values NOT overwritten
- [ ] Confirm only `domains` array updated

#### 2.3 Date Aggregation
- [ ] Create entries with different timestamps on same day
- [ ] Verify all entries from same day aggregate correctly
- [ ] Test across timezone boundaries (midnight edge cases)

### Implementation Check

```typescript
// ✅ Verified: src/lib/notebookSync.ts
export function performNonDestructiveSync(year: number, month: number): void
export function aggregateDomainToNotebook(domainId: string, year: number, month: number): void
```

**Critical Logic**:
```typescript
// Only update domains array, never touch intent/quality/outcome
if (day.domains && !day.domains.includes(domainId)) {
  day.domains.push(domainId);
}
```

---

## 3. Island State Management

### Objective
Verify each island manages its own state without global stores.

### Tests

#### 3.1 QuickEntryForm Component
- [ ] Form state isolated per domain page
- [ ] Input validation works correctly
- [ ] Success/error states display properly
- [ ] Form resets after submission

#### 3.2 EntryHistoryList Component
- [ ] Loads entries independently on each domain page
- [ ] Delete operation updates list reactively
- [ ] No cross-domain interference

#### 3.3 DailyRowControls Component
- [ ] Each row's dropdown state isolated
- [ ] Changes save immediately to correct day
- [ ] No state leakage between days
- [ ] Works correctly for all 31 days

#### 3.4 MonthlyReflectionEditor Component
- [ ] Auto-save debounce works (1000ms)
- [ ] Save status updates correctly
- [ ] Multiple typing sessions don't cause conflicts
- [ ] Character count accurate

### State Flow Verification

```
User Action → Component Local State → localStorage → Re-fetch → Component Update
```

**Anti-pattern Check**: No `stores.ts` or global Svelte stores should exist ✅

---

## 4. Month Navigation & URL State

### Objective
Verify URL query parameters correctly control notebook view.

### Tests

#### 4.1 URL Parameter Handling
- [ ] Navigate to `/notebook` → defaults to current month
- [ ] Navigate to `/notebook?year=2025&month=1` → shows January 2025
- [ ] Invalid params → fallback to current month
- [ ] Browser back/forward works correctly

#### 4.2 Month Navigation Buttons
- [ ] Previous month button updates URL
- [ ] Next month button updates URL
- [ ] "Go to Current Month" navigates correctly
- [ ] Month/year display matches URL params

#### 4.3 Page Refresh Behavior
- [ ] Refresh on `/notebook?year=2024&month=12` → stays on December 2024
- [ ] Month data persists across refreshes
- [ ] Components re-hydrate with correct month data

---

## 5. Month Actions Validation

### Objective
Test export, import, and close month functionality.

### Tests

#### 5.1 Export Month
- [ ] Downloads JSON file with correct filename format
- [ ] JSON contains complete notebook structure
- [ ] File includes all days, domains, reflection
- [ ] Empty months export correctly (no errors)

#### 5.2 Import Month
- [ ] Valid JSON imports successfully
- [ ] Confirmation dialog appears before overwrite
- [ ] Page refreshes after import
- [ ] Imported data displays correctly
- [ ] Invalid JSON shows error message

#### 5.3 Close Month
- [ ] Confirmation modal displays warnings
- [ ] Sets `_closed: true` in notebook
- [ ] Button changes to "Month Closed" badge
- [ ] Page refreshes after close
- [ ] Verify intended read-only behavior (if implemented)

---

## 6. Cross-Island Communication

### Objective
Verify islands that need to communicate do so via CustomEvents or URL state.

### Current Communication Patterns

**No direct cross-island communication needed** ✓  
Each island operates independently:
- Domain pages: QuickEntryForm + EntryHistoryList (same domain, share localStorage)
- Notebook page: Each row isolated, no cross-talk needed
- Month actions: Reload page after changes (simplest pattern)

### Future Enhancement (Optional)
If real-time updates needed without page reload:
```javascript
// Dispatch custom event after save
window.dispatchEvent(new CustomEvent('lifelab:entry-saved', { 
  detail: { domainId, entryId } 
}));

// Listen in other component
window.addEventListener('lifelab:entry-saved', handleUpdate);
```

**Current Status**: Not needed, page refreshes acceptable ✅

---

## 7. Performance Validation

### Objective
Measure interaction latency and bundle size.

### Metrics

#### 7.1 Interaction Latency
Target: <50ms for dropdown interactions

Test:
- [ ] Open DevTools Performance tab
- [ ] Record while changing dropdown
- [ ] Measure time from click to visual update
- [ ] Verify <50ms on average hardware

#### 7.2 JavaScript Bundle Size
Target: <100KB total JS

Current build output:
```
MonthActionButtons: 6.45 kB (3.05 kB gzipped)
DailyRowControls: 3.80 kB (1.61 kB gzipped)
QuickEntryForm: 3.29 kB (1.55 kB gzipped)
EntryHistoryList: 2.89 kB (1.27 kB gzipped)
MonthlyReflectionEditor: 2.20 kB (1.19 kB gzipped)
...
Total: ~28 kB for render + ~25 kB for components = ~53 kB
```

✅ **Well under 100KB target**

#### 7.3 Lighthouse Score
Target: >90

Test:
- [ ] Run production build
- [ ] Serve from `dist/` folder
- [ ] Run Lighthouse audit
- [ ] Check Performance, Accessibility, Best Practices, SEO scores

---

## 8. Data Flow Documentation

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser                             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │             localStorage                         │  │
│  │  lifelab_habits                                 │  │
│  │  lifelab_learning                               │  │
│  │  lifelab_career                                 │  │
│  │  lifelab_health                                 │  │
│  │  lifelab_notebook_2025_01                       │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↕                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │       Framework-Agnostic Utilities               │  │
│  │       src/lib/storage.ts                        │  │
│  │       src/lib/notebookSync.ts                   │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↕                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Svelte Islands (Client-Side)             │  │
│  │                                                   │  │
│  │  QuickEntryForm ───→ localStorage                │  │
│  │  EntryHistoryList ←─ localStorage                │  │
│  │  DailyRowControls ←→ localStorage                │  │
│  │  MonthlyReflectionEditor ←→ localStorage         │  │
│  │  MonthActionButtons ←→ localStorage              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

1. **Entry Creation**:
   ```
   User fills QuickEntryForm
   → onClick handler
   → saveEntry(domainId, entry)
   → localStorage.setItem()
   → Re-fetch entries
   → Update EntryHistoryList
   ```

2. **Notebook Daily Controls**:
   ```
   User changes dropdown
   → onChange handler
   → getMonthlyNotebook()
   → Modify day object
   → saveMonthlyNotebook()
   → localStorage.setItem()
   ```

3. **Month Navigation**:
   ```
   User clicks Previous/Next
   → Calculate new month
   → Update window.location with query params
   → Page reloads
   → Astro reads URL params
   → Renders with new month
   ```

---

## 9. Manual Testing Checklist

### Setup
1. Open `/lifelab` in browser
2. Open DevTools → Application → Local Storage

### Domain Pages Test
For each domain (Habits, Learning, Career, Health):
1. Navigate to domain page
2. Create a new entry with test data
3. Verify entry appears in list
4. Check localStorage shows new entry
5. Delete entry
6. Verify entry removed from list and localStorage

### Notebook Page Test
1. Navigate to `/notebook`
2. Verify current month displays
3. Check all 31 daily rows render
4. Select intent for Day 1
5. Verify saves (check localStorage)
6. Select quality for Day 1
7. Select outcome for Day 1
8. Verify all three saved correctly

### Month Navigation Test
1. Click "Previous Month"
2. Verify URL changes to previous month
3. Verify month title updates
4. Click "Next Month" twice
5. Click "Go to Current Month"
6. Verify returns to current month

### Reflection Editor Test
1. Type in reflection textarea
2. Wait 1 second
3. Verify "Saved just now" appears
4. Refresh page
5. Verify reflection persists

### Month Actions Test
1. Click "Export Month"
2. Verify JSON file downloads
3. Open file, verify structure
4. Click "Import Month"
5. Select downloaded file
6. Confirm import
7. Verify page reloads and data matches

---

## 10. Acceptance Criteria

### Must Have (Required for M5 Completion)
- [ ] All storage operations work correctly
- [ ] No data loss or corruption
- [ ] Islands are truly isolated (no global state)
- [ ] Notebook sync preserves manual edits
- [ ] Month navigation works via URL
- [ ] Export/Import functions correctly

### Nice to Have (Stretch Goals)
- [ ] Lighthouse score >90
- [ ] Zero console errors
- [ ] Smooth animations (<16ms frame time)
- [ ] Offline functionality works

---

## Status Tracking

| Component | Storage | State | Sync | Tested |
|-----------|---------|-------|------|--------|
| QuickEntryForm | ✅ | ✅ | N/A | ⏳ |
| EntryHistoryList | ✅ | ✅ | N/A | ⏳ |
| DailyRowControls | ✅ | ✅ | ✅ | ⏳ |
| DomainPresenceBadges | ✅ | ✅ | ✅ | ⏳ |
| NotebookMonthNavigation | N/A | ✅ | N/A | ⏳ |
| MonthlyReflectionEditor | ✅ | ✅ | N/A | ⏳ |
| MonthActionButtons | ✅ | ✅ | N/A | ⏳ |

**Next**: Run manual tests in browser with `npm run dev`
