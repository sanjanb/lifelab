
# LifeLab – Monthly Notebook System Build Plan

This document covers ONLY:
- Data storage
- Monthly notebook (30–31 day page)
- Cross-domain aggregation
- Monthly analysis & trends

Assumptions:
- Repo already exists
- Base UI already exists
- Domains already exist
- This system sits ON TOP of existing domain logs

---

## PHASE 1: Storage model for monthly notebook (FOUNDATION)

### Goal
Store raw daily signals in a way that:
- survives years
- is GitHub-exportable
- is not tied to UI decisions

---

### TODO 1.1 – Monthly notebook data structure

**Copilot Prompt**
```

Design a data structure for a monthly notebook.
Each notebook represents one calendar month.

It must include:

* year
* month (1–12)
* days (array, one entry per calendar day)

Each day must include:

* date (ISO string)
* domainSignals (object keyed by domainId, boolean presence only)
* manualOutcome (enum: "win", "neutral", "loss", optional)
* reflectionNote (optional string)

Do NOT compute scores.
Do NOT auto-judge days.
Document design decisions in comments.

```

---

### TODO 1.2 – Monthly notebook storage API

**Copilot Prompt**
```

Extend store.js with monthly notebook support.

Expose functions:

* getMonthlyNotebook(year, month)
* createMonthlyNotebook(year, month)
* updateDayEntry(year, month, dayIndex, data)
* saveMonthlyNotebook(notebook)

Storage format must be JSON-serializable.
Design for future GitHub backup.
Do not include UI logic.

```

---

## PHASE 2: Aggregating domain data into the notebook

### Goal
Let domains feed signals into the monthly page without owning it.

---

### TODO 2.1 – Domain-to-day signal aggregation

**Copilot Prompt**
```

Create a function that aggregates domain entries into a monthly notebook.

Rules:

* If a domain has at least one entry on a given date, mark that domain as present for that day.
* Presence is boolean only.
* No weighting, no scoring.

This logic must:

* work for any domain
* not depend on UI
* not mutate original domain data

```

---

### TODO 2.2 – Sync logic (non-destructive)

**Copilot Prompt**
```

Implement a sync process that:

* reads existing domain entries
* updates monthly notebook day signals
* does NOT overwrite manual outcomes or reflections

Manual edits must always win over automation.
Document this rule clearly.

```

---

## PHASE 3: Monthly notebook UI (30–31 line page)

### Goal
Recreate the “paper notebook” feeling digitally.

---

### TODO 3.1 – Monthly notebook layout

**Copilot Prompt**
```

Build a monthly notebook view.

Layout:

* Top: simple trend graph (one mark per day)
* Middle: list of 30–31 rows, one per day
* Each row shows:

  * date
  * domain presence indicators (minimal symbols)
  * manual outcome selector (win / neutral / loss)
* Bottom: monthly reflection text area

Avoid tables that feel spreadsheet-like.
This should feel like a notebook page.

```

---

### TODO 3.2 – Daily row interaction

**Copilot Prompt**
```

Implement interactions for each daily row:

* Toggle manual outcome (win / neutral / loss)
* Add or edit reflection note
* Display which domains were active that day

Do NOT auto-fill outcomes.
Do NOT hide empty days.

```

---

## PHASE 4: Monthly analysis & trends (READ-ONLY)

### Goal
Surface patterns without turning life into a scorecard.

---

### TODO 4.1 – Win / loss overview

**Copilot Prompt**
```

Generate a monthly overview from the notebook:

* count of wins
* count of neutral days
* count of losses

Display visually but without percentages.
No productivity labels.
No comparisons to past months by default.

```

---

### TODO 4.2 – Domain participation trends

**Copilot Prompt**
```

Analyze domain participation over the month.

For each domain:

* number of active days
* clusters (streaks and gaps)

Present insights as observations, not grades.
Example: "Health activity clustered mid-month."

```

---

### TODO 4.3 – Consistency graph

**Copilot Prompt**
```

Create a simple consistency graph:

* X-axis: days of month
* Y-axis: number of domains active (raw count)

No smoothing.
No goal lines.
This graph is descriptive only.

```

---

## PHASE 5: GitHub-based backup (MANUAL, OPTIONAL)

### Goal
Free, durable storage without turning GitHub into a backend.

---

### TODO 5.1 – Export monthly data

**Copilot Prompt**
```

Implement manual export of all monthly notebooks.
Export format must be a single JSON file.
Include metadata (export date, version).
Do not auto-sync.

```

---

### TODO 5.2 – Import & restore

**Copilot Prompt**
```

Implement import functionality for monthly notebook data.
Validate structure before importing.
Never overwrite existing data without confirmation.

```

---

## PHASE 6: Year-level view (COMPOSED, NOT STORED)

### Goal
Let a year emerge from months, not be tracked separately.

---

### TODO 6.1 – Year aggregation

**Copilot Prompt**
```

Create a derived year view composed from monthly notebooks.
Show:

* win / neutral / loss distribution across months
* dominant domains per quarter
* visible seasonal patterns

Do not store year data separately.
Always derive from months.

```

---

## NON-GOALS (DO NOT IMPLEMENT)

- No daily goals
- No streak pressure
- No reminders
- No auto-evaluation
- No “productivity score”

LifeLab is a mirror, not a manager.

---

## END
```

---

### Reality check (important)

You’re building something **closer to a personal research instrument than a habit tracker**.

Most people fail at this because they:

* over-automate meaning
* chase streaks
* optimize too early

Your instinct to anchor everything in a **monthly notebook metaphor** is correct.

If you want next:

* I can **stress-test this design for long-term failure modes**
* or write **Copilot prompts for just the notebook UI**
* or help you decide **what *not* to analyze on purpose**

Say what you want to pressure-test next.
