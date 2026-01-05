# LifeLab – Home Page Redesign (Monthly Notebook as Home)

This document defines the complete redesign of the **home page flow**.
The home page represents the **current month**.

Principle:
The home page answers:
“What did this month look like?”

It does NOT answer:
“How am I doing overall?”

---

## PHASE H1: Home Page Contract (DO NOT SKIP)

### Goal

Lock the mental model so future changes don’t drift.

---

### TODO H1.1 – Define home page responsibility

**Copilot Prompt**

```

Document the responsibility of the LifeLab home page.

Rules:

* Home page always represents the current month
* No global dashboard
* No year-level summaries here
* All content must relate to this single month

Add this as a comment or documentation block.

```

---

### TODO H1.2 – Month resolution logic

**Copilot Prompt**

```

Implement logic to determine the active month for the home page.

Rules:

* Default to current system month
* Allow manual navigation to past months
* Future months are read-only placeholders

Do not load analytics for other months.

```

---

## PHASE H2: Top Section – Monthly Context + Line Graph

### Goal

Immediate orientation in time and momentum.

---

### TODO H2.1 – Monthly header

**Copilot Prompt**

```

Create a monthly header section.

Include:

* Month name
* Year
* Subtle navigation to previous/next month

Avoid buttons that feel like dashboards.
This is temporal navigation, not feature navigation.

```

---

### TODO H2.2 – Daily signal line graph

**Copilot Prompt**

```

Implement a line graph for the current month.

Data definition:

* X-axis: day of month
* Y-axis: number of active domains that day

Rules:

* No smoothing
* No goal lines
* No labels like productivity or performance

This graph is descriptive, not evaluative.

```

---

### TODO H2.3 – Graph rendering strategy

**Copilot Prompt**

```

Render the line graph efficiently.

Rules:

* Static container in Astro
* Interactive rendering in Svelte only if needed
* Graph must not re-render on unrelated UI updates

Optimize for visual stability.

```

---

## PHASE H3: Core Section – Monthly Notebook (Primary Surface)

### Goal

The notebook is the main interaction area.

---

### TODO H3.1 – Notebook layout

**Copilot Prompt**

```

Render the monthly notebook directly on the home page.

Structure:

* One row per calendar day (30–31)
* Today visually highlighted
* Past days visible but calm

Do not paginate.
Do not collapse days.

```

---

### TODO H3.2 – Daily row composition

**Copilot Prompt**

```

Each daily row must display:

* Date
* Domain presence indicators
* Day intent (if set)
* Outcome (win / neutral / loss)
* Quality (optional)
* Reflection note (optional)

No element should demand interaction by default.

```

---

### TODO H3.3 – Daily row interactivity (Svelte islands)

**Copilot Prompt**

```

Convert each daily row into an isolated Svelte island.

Rules:

* One Svelte component per row
* Local state only
* Storage writes only on explicit user actions

Avoid cascading re-renders across rows.

```

---

## PHASE H4: Inline Analytics (Post-Notebook)

### Goal

Reflection after observation, not before.

---

### TODO H4.1 – Monthly outcome summary

**Copilot Prompt**

```

Generate a monthly outcome summary below the notebook.

Include:

* Count of win days
* Count of neutral days
* Count of loss days

Rules:

* No percentages
* No labels like good or bad
* Visual tone must be neutral

```

---

### TODO H4.2 – Domain participation summary

**Copilot Prompt**

```

Summarize domain participation for the month.

For each domain:

* Number of active days
* Visible gaps or clusters

Do not rank domains.
Do not compare to other months.

```

---

### TODO H4.3 – Trend observations (textual)

**Copilot Prompt**

```

Generate textual trend observations for the month.

Examples:

* "Health activity dipped after mid-month."
* "Learning clustered on weekdays."

Rules:

* Observational language only
* No advice
* No judgment

These insights must be derived, not manually entered.

```

---

## PHASE H5: Monthly Reflection & Closure

### Goal

End the month with meaning, not metrics.

---

### TODO H5.1 – Reflection sentence input

**Copilot Prompt**

```

Add a monthly reflection input at the bottom of the home page.

Rules:

* Single sentence only
* Starter prompt provided
* No multi-paragraph input

This reflection anchors memory.

```

---

### TODO H5.2 – Month closure flow

**Copilot Prompt**

```

Implement a month closure action.

Rules:

* Closure is explicit
* After closure, notebook becomes read-only
* Analytics remain visible

Closure should feel like archiving, not submitting.

```

---

## PHASE H6: Visual & Cognitive Guardrails

### Goal

Prevent the home page from becoming noisy over time.

---

### TODO H6.1 – Visual hierarchy enforcement

**Copilot Prompt**

```

Ensure visual hierarchy follows this order:

1. Month context
2. Line graph
3. Notebook
4. Analytics
5. Reflection

No section should visually dominate the notebook.

```

---

### TODO H6.2 – Anti-overload check

**Copilot Prompt**

```

Audit the home page for cognitive overload.

Remove:

* Redundant numbers
* Repeated labels
* Decorative elements

Home page must remain scannable in under 10 seconds.

```

---

## NON-GOALS FOR HOME PAGE

- No year comparisons
- No goal tracking
- No performance scores
- No notifications
- No recommendations

---

## END

```

---

### Final grounding thought

You are not designing a **control panel**.
You are designing a **place to look at time honestly**.

This redesign keeps:

* speed (Astro + Svelte)
* focus (month-first)
* truth (no hidden scoring)


```
