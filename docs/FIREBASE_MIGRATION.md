Below is a **clean, end-to-end Firebase integration plan** written exactly the way you asked:
**phases + prompts**, Markdown-ready, no fluff, no framework bias, and focused on **migrating safely from local browser storage to Firebase**.

You can drop this into your repo as
`firebase-integration-phases.md`.

---

# Firebase Integration & Data Migration Plan

*From local-first to durable persistence*

---

## Guiding Principles (Lock These)

* Firebase is **persistence**, not logic
* App must work **without Firebase**
* Local data is never discarded automatically
* Migration is **explicit and reversible**
* Schema is simple, flat, human-readable

---

## PHASE 0: Firebase Boundary Definition

### Goal

Ensure Firebase never leaks into app logic.

---

### TODO 0.1 – Define Persistence Interface

**Copilot Prompt**

```
Define a persistence interface that abstracts storage.

Expose methods:
- init()
- save(type, data)
- fetch(type)
- migrate(localData)
- export()

Do not reference Firebase or localStorage here.
This interface defines what the app expects from any storage backend.
```

---

### TODO 0.2 – Separate Implementations

**Copilot Prompt**

```
Create two implementations of the persistence interface:

1. localStorageProvider
2. firebaseProvider

Both must implement the same methods.
No conditional logic in app code.
Switch providers only at initialization time.
```

---

## PHASE 1: Firebase Schema Design (Critical)

### Goal

Design a schema that will survive years of use.

---

### TODO 1.1 – User Root Document

**Copilot Prompt**

```
Design the Firestore schema under a user-scoped root.

Structure:
users/{uid}/

The root document should store:
- createdAt
- schemaVersion

Do not store data directly at the root.
All data must be in subcollections.
```

---

### TODO 1.2 – Subcollections Definition

**Copilot Prompt**

```
Define the following subcollections under each user:

- wins
- entries
- journals
- settings
- meta

For each subcollection, document:
- document ID strategy
- required fields
- optional fields
- immutability rules

Do not add cross-references.
Do not nest deeply.
```

---

### TODO 1.3 – Document Shapes (Canonical)

**Copilot Prompt**

```
Define canonical document shapes for each collection.

Rules:
- ISO timestamps only
- No derived fields
- No analytics data
- No counters stored

Document examples for:
- win
- entry
- journal
- setting

These shapes are the source of truth.
```

---

## PHASE 2: Firebase Initialization Flow

### Goal

Initialize Firebase without blocking the app.

---

### TODO 2.1 – Non-Blocking Auth Initialization

**Copilot Prompt**

```
Implement Firebase initialization as a non-blocking step.

Behavior:
- App loads immediately
- Firebase auth runs in background
- If auth fails, fallback to local storage
- Store resolved uid in memory only

Do not block rendering on Firebase.
```

---

### TODO 2.2 – Provider Selection Logic

**Copilot Prompt**

```
At app startup, select the persistence provider.

Rules:
- Default to localStorage
- Switch to Firebase only after successful auth
- Once switched, do not oscillate

Log provider choice silently (console only).
```

---

## PHASE 3: Firebase Write Path

### Goal

Ensure all new data flows cleanly into Firebase.

---

### TODO 3.1 – Write Adapter

**Copilot Prompt**

```
Implement write adapters for Firebase.

Requirements:
- All writes are explicit function calls
- No real-time listeners
- Writes are idempotent where possible
- Errors must not crash the app

Do not show UI errors for Firebase failures.
```

---

### TODO 3.2 – Date-Keyed Writes (Wins)

**Copilot Prompt**

```
Implement date-keyed document writes for wins.

Rules:
- One win per day
- Document ID is yyyy-mm-dd
- Reject overwrites silently

Do not expose Firebase errors to the UI.
```

---

## PHASE 4: Firebase Read Path

### Goal

Read only what is needed, when needed.

---

### TODO 4.1 – Scoped Fetches

**Copilot Prompt**

```
Implement scoped read functions.

Rules:
- Fetch by collection only
- Support optional date range filters
- No full database scans
- No real-time subscriptions

Reads must be explicitly triggered by the UI.
```

---

### TODO 4.2 – Cache Normalization

**Copilot Prompt**

```
Normalize Firebase data into in-memory structures.

Rules:
- Convert Firestore timestamps to ISO strings
- Do not mutate original documents
- Cache per session only

This cache must not replace persistence.
```

---

## PHASE 5: Local → Firebase Migration

### Goal

Safely move existing browser data to Firebase.

---

### TODO 5.1 – Migration Detection

**Copilot Prompt**

```
Detect whether local data exists that has not been migrated.

Rules:
- Check schemaVersion in local data
- Compare with Firebase meta schemaVersion
- Migration must be explicit

Do not auto-migrate silently.
```

---

### TODO 5.2 – Migration UI (One-Time)

**Copilot Prompt**

```
Create a one-time migration UI.

Behavior:
- Explain what will happen in plain language
- Show counts of items to migrate
- Require explicit confirmation
- Allow cancel

No countdowns.
No warnings.
No pressure language.
```

---

### TODO 5.3 – Migration Execution

**Copilot Prompt**

```
Implement the migration process.

Rules:
- Migrate collection by collection
- Write to Firebase first
- Verify write success
- Mark migrated items locally
- Never delete local data automatically

If migration fails, stop immediately.
```

---

### TODO 5.4 – Post-Migration State

**Copilot Prompt**

```
After successful migration:

- Mark local data as archived
- Continue writing new data to Firebase
- Allow manual local data deletion later

Do not auto-cleanup local storage.
```

---

## PHASE 6: Data Integrity & Versioning

### Goal

Protect future changes.

---

### TODO 6.1 – Schema Versioning

**Copilot Prompt**

```
Add schemaVersion handling.

Rules:
- Store schemaVersion in:
  - local storage
  - Firebase meta collection
- Increment only when shapes change
- Never mutate old documents

This enables future migrations safely.
```

---

### TODO 6.2 – Data Validation

**Copilot Prompt**

```
Validate data before writing to Firebase.

Rules:
- Reject malformed data
- Fail silently
- Log validation errors to console

Do not block user input.
```

---

## PHASE 7: Export & Exit Strategy (Mandatory)

### Goal

Avoid Firebase lock-in.

---

### TODO 7.1 – Full Data Export

**Copilot Prompt**

```
Implement full data export.

Behavior:
- Export all collections
- Output JSON
- Preserve document IDs
- Include schemaVersion

Export must work regardless of storage provider.
```

---

### TODO 7.2 – Local Restore

**Copilot Prompt**

```
Implement restore-from-export.

Rules:
- Accept JSON export
- Validate schemaVersion
- Restore to local storage only
- Firebase restore is manual

This is the escape hatch.
```

---

## Final Readiness Checklist

Before calling Firebase “done”:

* [ ] App runs fully offline
* [ ] Firebase failure does not break UI
* [ ] Migration is explicit and reversible
* [ ] No Firebase code outside provider
* [ ] Data can be exported cleanly
* [ ] Schema versioning exists

---

## Truth Check

If Firebase disappeared tomorrow:

* You should lose **zero** data
* You should be able to continue locally
* You should be able to migrate again later
