```md
# LifeLab Home Page – Insight Update

## Phases & Copilot Prompts (Formalized Math + Safe Heatmap + Yearly Roll-up Ready)

This document covers ONLY the **home page update**:

- Formalized line graph math
- Psychologically safe heatmap matrix
- Hooks for a future yearly roll-up (without implementing it fully)

Notebook, data entry, and domain pages are out of scope.

---

## PHASE 1: Formalize the Line Graph Signal (Source of Truth)

### Goal

Lock the meaning of the line graph so it never drifts into scoring or productivity.

---

### TODO 1.1 – Define presence rules (domain-agnostic)

**Copilot Prompt**
```

Define a clear rule for domain presence per day.

Presence must be:

- binary (present / not present)
- capped at one per domain per day
- independent of number of entries

Document in comments what presence means
and what it explicitly does NOT mean.

```

---

### TODO 1.2 – Daily aggregate signal function

**Copilot Prompt**
```

Implement a function that computes a daily aggregate signal.

Definition:

- Sum of domain presence values for that day
- No weights
- No intensities
- No streak logic

Return raw values only.
Do not normalize inside this function.

```

---

### TODO 1.3 – Visualization normalization (render-only)

**Copilot Prompt**
```

Create a small utility that normalizes
daily aggregate values to a 0–1 range
for visualization purposes only.

Important:

- normalization must not alter stored data
- document clearly that this is visual scaling only

```

---

## PHASE 2: Line Graph Component (Astro + Svelte)

### Goal
Render rhythm and momentum without implying progress or success.

---

### TODO 2.1 – Line graph Svelte component (locked semantics)

**Copilot Prompt**
```

Build a Svelte SVG line graph component.

Inputs:

- days array
- normalized daily aggregate values

Rules:

- no tooltips
- no hover states
- no animations
- no numeric labels

This graph represents rhythm, not performance.
Reflect this intent in comments.

```

---

### TODO 2.2 – Home page hydration boundary

**Copilot Prompt**
```

Embed the line graph into the Astro home page
as a hydrated island.

Ensure:

- only this component is hydrated
- layout and headers remain static

Add comments explaining hydration boundaries.

```

---

## PHASE 3: Heatmap Matrix (Psychologically Safe)

### Goal
Show distribution of attention without creating guilt, streaks, or scorekeeping.

---

### TODO 3.1 – Heatmap value constraints

**Copilot Prompt**
```

Define heatmap cell values based on domain presence.

Constraints:

- values represent presence only
- no success/failure semantics
- no intensity scaling
- same rules for all domains

Document why binary or low-range values are intentional.

```

---

### TODO 3.2 – Heatmap matrix data builder

**Copilot Prompt**
```

Transform monthly domain presence data into a matrix:

- rows = days
- columns = domains
- cells = presence value

This function must be:

- pure
- deterministic
- UI-independent

```

---

### TODO 3.3 – Heatmap Svelte component (non-GitHub-like)

**Copilot Prompt**
```

Build a heatmap matrix component in Svelte.

Rules:

- no checkboxes
- no click handlers
- no totals (row or column)
- no streak highlighting
- no color semantics (no green/red)

Use subtle opacity or neutral shading only.
This is a distribution map, not a habit tracker.

```

---

### TODO 3.4 – Long-term psychology audit (inline documentation)

**Copilot Prompt**
```

Add inline comments explaining:

- why totals are intentionally omitted
- why streaks are avoided
- why the heatmap is read-only

This documentation is to protect future contributors
from turning this into a scorecard.

```

---

## PHASE 4: Home Page Composition (Insight-Only)

### Goal
Ensure the home page communicates meaning in under 5 seconds.

---

### TODO 4.1 – Home page layout revision

**Copilot Prompt**
```

Update the home page layout to contain only:

1. Month header
2. Line graph section
3. Heatmap matrix section
4. Insight text placeholder

Explicitly remove notebook-like structures.
This page is for insight, not input.

```

---

### TODO 4.2 – Responsive behavior without interaction

**Copilot Prompt**
```

Ensure the heatmap remains readable on small screens.

Rules:

- horizontal scroll allowed
- no collapsing into interactive views
- no tap interactions

Clarity over cleverness.

```

---

## PHASE 5: Descriptive Insight Text (Optional, Guarded)

### Goal
Add language without judgment, advice, or evaluation.

---

### TODO 5.1 – Observation generator (descriptive only)

**Copilot Prompt**
```

Generate short textual observations from monthly data.

Rules:

- descriptive only
- no advice
- no scores
- no improvement language
- max 3 observations

Examples:

- clustering
- consistency shifts
- noticeable gaps

```

---

### TODO 5.2 – Insight rendering constraints

**Copilot Prompt**
```

Render observations subtly below the heatmap.

Constraints:

- plain text
- subdued styling
- must not dominate the page

This section is optional and dismissible.

```

---

## PHASE 6: Yearly Roll-up Hooks (No Aggregation Yet)

### Goal
Prepare for a yearly view without flattening nuance.

---

### TODO 6.1 – Monthly silhouette export

**Copilot Prompt**
```

Expose a lightweight monthly summary output
suitable for yearly aggregation.

This should preserve:

- daily signal shape
- not averages or totals

Do not implement yearly UI yet.
Only prepare the data contract.

```

---

### TODO 6.2 – Guardrails documentation

**Copilot Prompt**
```

Document rules for future yearly views:

- no yearly scores
- no ranking months
- no improvement arrows
- preserve month-to-month shape

Explain why yearly views must show patterns, not metrics.

```

---

## PHASE 7: Final Boundary Check

### Goal
Ensure the home page remains reflective long-term.

---

### TODO 7.1 – Anti-drift audit

**Copilot Prompt**
```

Audit the home page implementation and confirm:

- no data entry
- no editing
- no streaks
- no totals
- no performance language

Add a final comment summarizing
what the home page intentionally avoids.

```

---

## End State (Definition of Done)

The LifeLab home page should:
- show monthly rhythm (line graph)
- show attention distribution (heatmap)
- avoid guilt mechanics
- remain emotionally safe after years of use

Home page = understanding.
Notebook = expression.
```
