Below is a **clean, copy-paste ready Markdown plan** you can put directly into your repo (for example: `BUILD_PLAN.md`).

It is written **for Copilot control**, not for humans only.
Each phase is intentionally scoped so Copilot does not wander.

I’ve also embedded design constraints so future-you doesn’t accidentally break the philosophy.

---

```md
# LifeLab – Build Plan

This document defines the phased construction of **LifeLab**, a personal life instrumentation system.
This is NOT a productivity app.
This is a reflection-first, monthly notebook system.

All development must follow these rules:
- No backend
- No frameworks beyond Alpine.js
- No auto-scoring of life
- Manual > automatic
- Views are derived, data is raw
- Monthly closure is mandatory

---

## PHASE 0 – Repository & Constraints

### Goal
Create a stable, boring foundation that will survive years.

---

### TODO 0.1 – Initialize repository

**Copilot Prompt**
```

Initialize a static GitHub Pages project called "LifeLab".
Use only HTML, CSS, and JavaScript.
Create index.html, styles/main.css, scripts/app.js.
Do not implement any features.
Add comments describing intent only.

```

---

### TODO 0.2 – Folder structure for extensibility

Target structure:
```

lifelab/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── app.js
│   ├── config.js
│   ├── store.js
│   ├── utils.js
│   └── analysis.js
├── modules/
│   ├── notebook/
│   ├── habits/
│   ├── learning/
│   ├── career/
│   ├── health/
│   └── reflections/
└── docs/
└── BUILD_PLAN.md

```

**Copilot Prompt**
```

Create the folder structure for LifeLab.
Each life domain must be isolated as a module.
Shared logic must live in scripts/.
Create empty files with comments explaining responsibility.
Do not write logic yet.

```

---

## PHASE 1 – Core Data & Configuration Layer

### Goal
Make data stable before UI exists.

---

### TODO 1.1 – Global domain configuration

**Copilot Prompt**
```

Create config.js defining LifeLab domains.
Each domain must have:

* id
* displayName
* shortCode (single letter)
* description
* storageKey

Domains must be configurable without touching UI code.

```

---

### TODO 1.2 – Universal entry model

**Copilot Prompt**
```

Define a universal LifeLab entry model.
Each entry must include:

* id
* domainId
* timestamp
* value
* notes (optional)

Document why this structure is intentionally minimal.
Do not include UI logic.

```

---

### TODO 1.3 – Storage abstraction

**Copilot Prompt**
```

Create store.js to abstract browser storage.
Expose:

* addEntry(domainId, entry)
* getEntries(domainId)
* deleteEntry(domainId, entryId)
* exportAllData()
* importData(json)

Do not assume localStorage is permanent.
Do not couple this to UI.

```

---

## PHASE 2 – Base UI Skeleton

### Goal
Create navigation and layout without meaning.

---

### TODO 2.1 – App shell & navigation

**Copilot Prompt**
```

Build index.html with:

* Header: "LifeLab"
* Navigation listing all domains dynamically
* Main content area

Navigation must be generated from config.js.
No domain logic yet.

```

---

### TODO 2.2 – Minimalist styling

**Copilot Prompt**
```

Create minimal CSS focused on:

* typography
* spacing
* readability

Avoid bright colors, gradients, animations, or gamification.
This is a notebook, not a dashboard.

```

---

## PHASE 3 – Monthly Notebook System (CORE)

### Goal
Implement the monthly 30–31 line notebook page.

---

### TODO 3.1 – Monthly notebook model

**Copilot Prompt**
```

Design a monthly notebook data model.
Each month must:

* know year and month
* contain one row per calendar day
* aggregate entries from all domains per day

Do not compute scores.
Store raw daily signals only.

```

---

### TODO 3.2 – Daily row schema

**Copilot Prompt**
```

Define a daily row structure.
Each row must include:

* date
* domainSignals (presence only)
* optional reflection note
* optional manual tag (strong / neutral / weak)

Do not auto-evaluate the day.

```

---

### TODO 3.3 – Notebook UI layout

**Copilot Prompt**
```

Build the monthly notebook UI.
Layout:

* Top: simple consistency graph (one mark per day)
* Middle: 30–31 rows (one per day)
* Bottom: monthly reflection section

Rows must be compact and readable.
Avoid checkboxes.
Avoid percentages.

```

---

## PHASE 4 – Domain Signal Logging

### Goal
Allow domains to contribute signals to days.

---

### TODO 4.1 – Generic domain entry UI

**Copilot Prompt**
```

Create a generic domain entry interface.
Allow adding a simple event with:

* value
* optional notes
* timestamp auto-generated

This must work for any domain.
Reuse shared storage logic.

```

---

### TODO 4.2 – Domain signal aggregation

**Copilot Prompt**
```

Aggregate domain entries into daily notebook rows.
Each entry contributes a presence signal only.
No weighting.
No scoring.

```

---

## PHASE 5 – Reflections Module

### Goal
Add narrative context to metrics.

---

### TODO 5.1 – Daily reflection notes

**Copilot Prompt**
```

Implement a reflections module.
Allow at most one reflection note per day.
Notes are optional.
No prompts, no structure.

```

---

### TODO 5.2 – Monthly reflection summary

**Copilot Prompt**
```

Add a monthly reflection section.
Allow free-text writing.
This must not be mandatory.

```

---

## PHASE 6 – Analysis & Trends (Read-only)

### Goal
Turn raw data into insight without judgment.

---

### TODO 6.1 – Consistency graph logic

**Copilot Prompt**
```

Create a simple consistency visualization.
One mark per day.
Mark intensity based on number of domain signals.
Do not label days as good or bad.

```

---

### TODO 6.2 – Trend detection

**Copilot Prompt**
```

Analyze monthly data to detect trends.
Examples:

* domain presence over time
* gaps and clusters
* correlations between domains

Output observations as text, not scores.

```

---

## PHASE 7 – GitHub Backup (Optional, Manual)

### Goal
Preserve data without making GitHub a dependency.

---

### TODO 7.1 – Manual export/import

**Copilot Prompt**
```

Implement manual JSON export and import.
Export must include all domains and months.
Import must validate structure before loading.

```

---

### TODO 7.2 – Optional GitHub sync (future)

**Copilot Prompt**
```

Design (do not implement) a GitHub sync interface.
Sync must be manual.
GitHub is a backup, not live storage.
Document security considerations.

```

---

## DESIGN NON-GOALS (Do Not Build)

- No productivity scores
- No streak obsession
- No daily targets
- No notifications
- No automation pressure

LifeLab is a mirror, not a judge.

---

## END
```

---

### Final thought (important)

This plan is intentionally **boring, strict, and slow**.
That’s why it will last.

If you want, next I can:

* review this plan as if it were a real open-source PR
* compress it further for Copilot efficiency
* or help you decide **which phase to intentionally stop at** (also important)

Just say the word.
