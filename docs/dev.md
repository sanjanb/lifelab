# LifeLab – Health, Insight & Memory Features
(Phased Implementation Plan)

---

## PHASE 1: Wellness & Health Metrics (Manual, Reflective)

### Goal
Allow logging of health-related signals as *context*, not targets.

---

### 1.1 Define Health Metrics Schema

Metrics (all optional, manual):
- Sleep: hours (number), quality (1–5)
- Exercise: duration (minutes), type (text)
- Water intake: litres
- Nutrition notes: free-text
- Symptoms: type (text), severity (1–5)
- Reflections / Gratitude: free-text

Rules:
- Nothing required
- Nothing “good/bad”
- No daily completion pressure

**Copilot Prompt**
```

Design a flexible healthMetrics schema for LifeLab.
All fields must be optional.
No required validation except type safety.
Schema must support adding new metrics later without breaking old data.
Do not add scoring or goal logic.
Document each field’s intent in comments.

```

---

### 1.2 Health Entry UI (Low Friction)

Design:
- One collapsible “Health Context” section per day
- Sliders for numeric inputs
- Plain text areas for notes
- Everything optional, nothing highlighted as primary

**Copilot Prompt**
```

Build a minimalist health entry UI.
Use sliders for numeric values and text areas for notes.
All inputs must be optional.
Do not use red/green or success/failure language.
UI should visually de-emphasize completion.

```

---

### 1.3 Store Health Data in Firebase

Storage rules:
- Health data tied to date
- Stored as raw values only
- No derived fields saved

**Copilot Prompt**
```

Implement Firebase storage for health metrics.
Store data by userId and date.
Persist raw user-entered values only.
No computed fields should be stored.

```

---

## PHASE 2: Correlation & Trend Analysis (Observational Only)

### Goal
Surface *patterns*, not advice.

---

### 2.1 Define Correlation Engine (Simple Math)

Supported comparisons:
- Sleep vs Mood
- Exercise vs Mood
- Water vs Energy
- Custom metric vs custom metric

Rules:
- Use averages, not ML
- Minimum data threshold (e.g. 7 days)
- If insufficient data, show nothing

**Copilot Prompt**
```

Create a lightweight correlation engine.
Use simple averages and comparisons.
Require a minimum number of data points before showing results.
Do not output recommendations or advice.
Return neutral observation strings only.

```

---

### 2.2 Insight Copy Generator (Tone Matters)

Examples:
- “On days with exercise, your mood was slightly higher on average.”
- “Sleep duration appears to vary with mood.”

Rules:
- No “should”
- No action verbs
- No optimization language

**Copilot Prompt**
```

Generate insight text from correlation data.
Language must be observational and neutral.
Avoid advice, goals, or action-oriented wording.
Insights should read like facts, not instructions.

```

---

### 2.3 Insight Display UI

Design:
- Small text blocks
- Appears only if valid
- No icons, no badges

**Copilot Prompt**
```

Display insights as subtle text blocks.
Do not highlight or gamify them.
Hide entire section if no insights are available.

```

---

## PHASE 3: Deep Monthly Report (Narrative, Not Scorecard)

### Goal
Create a **monthly story**, not a report card.

---

### 3.1 Monthly Data Aggregation

Include:
- Mood trends (line graph)
- Health averages
- Most common activities
- Notable days (high/low variance)

**Copilot Prompt**
```

Aggregate monthly LifeLab data.
Produce summaries without rankings or scores.
Focus on trends, ranges, and frequencies.
No comparison to previous months by default.

```

---

### 3.2 Monthly Report Layout

Sections:
1. Overview paragraph (auto-generated)
2. Line graph (mood/energy)
3. Health context summary
4. Reflection prompts (optional)

**Copilot Prompt**
```

Design a monthly report layout.
Use a narrative flow from overview → data → reflection.
Avoid dashboards or KPI-style blocks.

```

---

### 3.3 Monthly Reflection Prompts

Examples:
- “What stood out this month?”
- “What patterns surprised you?”
- “What feels unfinished?”

**Copilot Prompt**
```

Add optional reflection prompts to monthly reports.
Prompts must be skippable and editable.
No required responses.

```

---

## PHASE 4: Awareness-First Language System

### Goal
Ensure the app never sounds judgmental.

---

### 4.1 Language Ruleset

Principles:
- No “win/lose” outside Win Ledger
- No streak pressure
- Neutral verbs only

**Copilot Prompt**
```

Create a language guideline object for LifeLab.
Define forbidden terms and preferred alternatives.
Ensure all insight text follows this guide.

```

---

### 4.2 Enforce Language Consistency

**Copilot Prompt**
```

Audit all UI text and insights.
Replace goal-oriented or judgmental language.
Ensure consistency with awareness-first principles.

```

---

## PHASE 5: Memory Aids (Gentle Retrospection)

### Goal
Reinforce continuity of self, not performance.

---

### 5.1 “On This Day” Feature

Content:
- Entry from same date last year
- Or same week/month

Rules:
- Opt-in
- One surfaced item max
- No comparison language

**Copilot Prompt**
```

Implement an opt-in 'On This Day' feature.
Show past entries from the same date or month.
Do not compare or evaluate past vs present.

```

---

### 5.2 Memory Surface UI

Design:
- Small card
- Hidden by default
- Dismissible

**Copilot Prompt**
```

Display memory resurfacing as a subtle, dismissible card.
Do not interrupt primary workflows.

```

---

## PHASE 6: Final Integration & Safeguards

### Goal
Prevent feature creep from breaking philosophy.

---

### 6.1 Feature Toggles

Allow user to disable:
- Health tracking
- Insights
- Memory resurfacing

**Copilot Prompt**
```

Implement per-feature toggles in settings.
Disabled features must leave no UI residue.

```

---

### 6.2 Philosophy Check

Checklist:
- No scores
- No streaks (except Win Ledger)
- No punishments
- No optimization language

**Copilot Prompt**
```

Run a final audit against LifeLab philosophy.
List any violations and refactor them.

```

---

## Final Outcome

LifeLab becomes:
- A **personal observatory**
- Not a self-improvement machine
- Data supports thinking, not behavior control

When ready, say:
**“Start with Phase 1.1”**
and we’ll implement cleanly, one layer at a time.
```

---

### Final thought (truth check)

Your idea is solid **because you’re resisting pressure mechanics**.
Most self-tracking apps fail not technically, but psychologically.

If you keep:

* raw data
* slow insights
* neutral language

this will age well.
