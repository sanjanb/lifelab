## PHASE 0: Project scaffolding & constraints

### Goal

Create a repo and structure that prevents chaos later.

### TODO 0.1 – Create repository and enable GitHub Pages

**Copilot Prompt**

```
We are creating a static GitHub Pages project called "lifelab".
This is a personal life metrics dashboard.
Do not add any frameworks or build tools.
Use plain HTML, CSS, and JavaScript only.
Set up a basic index.html, styles.css, and app.js.
Do not implement any features yet.
```

---

### TODO 0.2 – Define folder structure (extensibility-focused)

**Target structure**

```
lifelab/
├── index.html
├── styles/
│   └── main.css
├── scripts/
│   ├── app.js
│   ├── store.js
│   ├── config.js
│   └── utils.js
├── modules/
│   ├── habits/
│   ├── learning/
│   ├── career/
│   └── health/
└── README.md
```

**Copilot Prompt**

```
Design a folder structure for a personal dashboard project called LifeLab.
Each life area should be a self-contained module.
Shared logic should live in scripts/.
Do not write feature code yet.
Just create empty files with clear comments explaining their purpose.
```

---

## PHASE 1: Core system design (MOST IMPORTANT PHASE)

### Goal

Create the backbone that every future feature relies on.

---

### TODO 1.1 – Define global configuration

Purpose:

- Central place to add new life domains later
- Avoid hardcoding modules everywhere

**Copilot Prompt**

```
Create a config.js file that defines LifeLab domains as a configurable list.
Each domain should have:
- id
- displayName
- description
- storageKey
Do not implement UI logic.
This config must allow adding new domains without touching other files.
```

---

### TODO 1.2 – Create a generic storage layer

Purpose:

- Abstract localStorage
- Allow encryption or migration later

**Copilot Prompt**

```
Create store.js that wraps browser localStorage.
Expose functions like:
- saveEntry(domainId, entry)
- getEntries(domainId)
- deleteEntry(domainId, entryId)

Entries must be stored as arrays per domain.
Do not include UI code.
This file should not depend on specific domains.
```

---

### TODO 1.3 – Define a universal entry model

Purpose:

- Cross-domain consistency
- Future analytics possible

**Copilot Prompt**

```
Define a standard entry structure for LifeLab.
Each entry must include:
- id
- timestamp
- value
- notes (optional)

Document this structure clearly in comments.
Do not hardcode domain-specific fields.
```

---

## PHASE 2: Base UI skeleton

### Goal

A navigable shell with zero business logic.

---

### TODO 2.1 – Dashboard-first layout

**Copilot Prompt**

```
Build a dashboard-first layout in index.html.
Include:
- Header with site name "LifeLab"
- Navigation listing all domains dynamically
- Main dashboard section (empty placeholders only)

Do not add forms or charts yet.
Navigation must be data-driven, not hardcoded.
```

---

### TODO 2.2 – Minimal, neutral styling

Rules:

- No animations
- No gradients
- No heavy colors

**Copilot Prompt**

```
Create a minimalist CSS style for LifeLab.
Focus on readability and spacing.
Avoid bright colors and visual noise.
This is a thinking tool, not a marketing site.
```

---

## PHASE 3: Domain module system

### Goal

One pattern that all domains follow.

---

### TODO 3.1 – Domain page template

**Copilot Prompt**

```
Create a reusable domain module template.
Each domain view must have:
- Quick entry section
- Recent history section
- Trend placeholder section

This template must be reusable by all domains.
Do not include domain-specific logic yet.
```

---

### TODO 3.2 – Dynamic domain rendering

**Copilot Prompt**

```
Render domain views dynamically using the config file.
Switching domains should not reload the page.
Avoid frameworks except Alpine.js.
Ensure adding a new domain in config automatically appears in UI.
```

---

## PHASE 4: Feature implementation (one domain at a time)

⚠️ Important rule
**Implement ONE domain completely before touching others.**

Start with **Habits**.

---

### TODO 4.1 – Habits: quick entry

**Copilot Prompt**

```
Implement habit entry functionality.
Allow adding a habit log with:
- value (text)
- optional notes
- timestamp auto-generated

Use the shared store.js functions.
Do not hardcode UI text outside the habits module.
```

---

### TODO 4.2 – Habits: recent history

**Copilot Prompt**

```
Display recent habit entries (last 7–14).
Allow deletion of entries.
Ensure UI updates automatically after changes.
Do not implement charts yet.
```

---

### TODO 4.3 – Habits: streak logic (simple)

**Copilot Prompt**

```
Implement basic habit streak calculation.
Streak logic should be isolated and reusable.
Do not assume daily frequency.
Keep it generic.
```

---

## PHASE 5: Replicate pattern for other domains

Apply the same pattern to:

- Learning
- Career & Money
- Health

Each domain:

- Uses same entry model
- Uses same storage layer
- Has domain-specific interpretation only

**Copilot Prompt (reuse for each domain)**

```
Implement the [DOMAIN NAME] module using the existing domain template.
Reuse shared storage and entry model.
Do not duplicate logic from other modules.
Keep domain-specific rules isolated.
```

---

## PHASE 6: Reflection & trends (optional but powerful)

### Goal

Turn logs into insight.

---

### TODO 6.1 – Timeline view

**Copilot Prompt**

```
Create a timeline view that can show entries from any domain.
This must work generically across domains.
Do not hardcode labels.
```

---

### TODO 6.2 – Monthly summaries

**Copilot Prompt**

```
Generate monthly summaries per domain.
Summaries should be derived from existing entries.
No new data should be required.
```

---

## PHASE 7: Future-proofing hooks

### Goal

Make future ideas cheap to add.

---

### TODO 7.1 – Feature registry

**Copilot Prompt**

```
Create a feature registry system.
This should allow enabling/disabling features per domain.
Do not implement features yet.
Just design the mechanism.
```

---

## Final note (important mindset)

When using Copilot:

- Always paste **only one prompt at a time**
- Never ask it to “improve” or “optimize”
- Treat it like a junior dev with no context memory

You now have:

- A clear philosophy
- A scalable architecture
- Guardrails to prevent scope creep

When you’re ready, say:
**“Start with Phase 0.1”**
and we’ll walk through it step by step, cleanly.
