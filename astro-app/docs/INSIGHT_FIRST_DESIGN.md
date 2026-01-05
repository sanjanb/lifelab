# LifeLab Home Page – Insight-First Redesign

## Phases & Copilot Prompts (Astro + Svelte)

This document defines ONLY the home page insight layer:

- Line graph (temporal flow)
- Heatmap matrix (days × domains)
- Lightweight analytics summaries

Notebook and detailed entry views live elsewhere and are NOT part of this flow.

---

## PHASE 1: Home Page Data Contract (Foundation)

### Goal

Define a clean, domain-agnostic monthly data model that the home page consumes.
No UI assumptions. No storage assumptions.

---

### TODO 1.1 – Monthly insight schema

**Copilot Prompt**

```

Define a MonthlyInsight data structure for LifeLab.

It should represent a single month and include:

* monthId (YYYY-MM)
* days (array of day numbers present in the month)
* domains (array of domain ids)
* dailyDomainMap: day → domain → presence/intensity
* dailyAggregateSignal: day → numeric signal

This file must not import UI code.
Document all assumptions clearly.

```

---

### TODO 1.2 – Data adapter from storage

**Copilot Prompt**

```

Create a pure function that converts stored domain entries
into the MonthlyInsight structure.

Rules:

* domain-agnostic
* deterministic
* no UI logic
* missing days must still appear in output

Do not compute insights yet.
Only normalize data shape.

```

---

## PHASE 2: Line Graph (Temporal Flow)

### Goal

Show how the month _moves_ over time.
This is the emotional and rhythmic overview.

---

### TODO 2.1 – Aggregate signal derivation

**Copilot Prompt**

```

Implement logic to derive a daily aggregate signal
from per-domain data.

Constraints:

* explainable in plain language
* no scoring, grading, or gamification
* avoid heavy normalization
* consistent across months

Add comments explaining why this signal is meaningful.

```

---

### TODO 2.2 – Line graph Svelte component

**Copilot Prompt**

```

Create a Svelte component for a monthly line graph.

Inputs:

* days array
* dailyAggregateSignal array

Requirements:

* SVG-based line graph
* responsive width
* minimal styling
* no animations
* no interactions yet

This component must be read-only and fast.

```

---

### TODO 2.3 – Astro hydration boundary

**Copilot Prompt**

```

Embed the line graph component into the Astro home page
as a hydrated island.

Ensure:

* only the graph is hydrated
* surrounding layout remains static HTML

Document why hydration is required here.

```

---

## PHASE 3: Heatmap Matrix (Distribution View)

### Goal

Show _where attention went_ across the month.
Not success. Not failure. Just presence.

---

### TODO 3.1 – Heatmap value rules

**Copilot Prompt**

```

Define rules for heatmap cell values.

Requirements:

* values represent presence or low-intensity only
* no success/failure semantics
* consistent across domains
* limited value range (e.g., 0–2)

Document how these values should be interpreted.

```

---

### TODO 3.2 – Heatmap data transformation

**Copilot Prompt**

```

Transform MonthlyInsight data into a 2D matrix:

* rows = days
* columns = domains
* cells = heatmap values

This function must be pure and UI-independent.

```

---

### TODO 3.3 – Heatmap Svelte component

**Copilot Prompt**

```

Build a heatmap matrix component in Svelte.

Requirements:

* days on Y-axis
* domains on X-axis
* subtle visual encoding (opacity or light shading)
* no checkboxes
* no click handlers
* no tooltips

This component is for reading, not interaction.

```

---

### TODO 3.4 – Performance guardrails

**Copilot Prompt**

```

Audit the heatmap component for performance.

Ensure:

* no unnecessary re-renders
* local state only where required
* no global stores

Add comments explaining performance decisions.

```

---

## PHASE 4: Home Page Composition (Astro)

### Goal

Assemble insight layers into a calm, readable home page.

---

### TODO 4.1 – Home page layout structure

**Copilot Prompt**

```

Design the LifeLab home page layout using Astro.

Order:

1. Month header
2. Line graph section
3. Heatmap matrix section
4. Insight text section (empty placeholder)

Use semantic HTML.
Avoid visual clutter.

```

---

### TODO 4.2 – Responsive behavior

**Copilot Prompt**

```

Ensure the home page layout works on small screens.

Rules:

* heatmap scrolls horizontally if needed
* line graph remains readable
* no collapsing into complex interactions

Do not add mobile-specific features yet.

```

---

## PHASE 5: Insight Text (Descriptive Analytics)

### Goal

Surface patterns without advice, judgment, or goals.

---

### TODO 5.1 – Observation generator

**Copilot Prompt**

```

Generate simple textual observations from MonthlyInsight data.

Rules:

* descriptive only
* no prescriptions
* no scores
* no motivational language
* max 3 observations

Examples:

* consistency changes
* clustering of activity
* noticeable gaps

```

---

### TODO 5.2 – Insight rendering

**Copilot Prompt**

```

Render generated observations on the home page.

Requirements:

* plain text
* subdued styling
* optional visibility toggle

This section must never dominate the page.

```

---

## PHASE 6: Validation & Boundaries

### Goal

Ensure the home page stays an insight layer, not a control panel.

---

### TODO 6.1 – Interaction audit

**Copilot Prompt**

```

Audit the home page for unintended interactions.

Ensure:

* no data entry
* no editing
* no scoring
* no streaks

Document what the home page intentionally does NOT do.

```

---

### TODO 6.2 – Future extension notes

**Copilot Prompt**

```

Add comments or documentation explaining:

* how new domains appear automatically
* how new insight components could be added
* what should never be added to the home page

Keep this philosophical, not technical.

```

---

## End State Definition

When complete, the LifeLab home page should:

- explain the month in under 5 seconds
- feel calm, not evaluative
- prioritize understanding over action
- remain fast even as data grows

Notebook and domain pages handle detail.
Home handles meaning.
