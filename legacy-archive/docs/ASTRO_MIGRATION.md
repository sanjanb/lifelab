Below is a **clean, conversion-only Markdown plan**.
No feature changes.
No redesign.
Only migration from your **current slow system → Astro + Svelte**, while preserving behavior.

You can drop this into your repo as `ASTRO_MIGRATION.md`.

---

```md
# LifeLab – Migration Plan: Vanilla / Existing System → Astro + Svelte

Scope:

- Convert existing system to Astro + Svelte
- Improve interaction speed
- Preserve all existing functionality and data
- Do NOT redesign features or add new ones

Principle:
Astro owns structure and routing.
Svelte owns interaction and local state.

---

## PHASE M1: Baseline & Constraints (DO NOT SKIP)

### Goal

Prevent regressions and accidental rewrites.

---

### TODO M1.1 – Freeze current behavior

**Copilot Prompt**
```

Before migrating, document the current system behavior.

List:

- All interactive elements
- Data storage keys and formats
- User flows that must remain unchanged

Do not refactor or optimize yet.
This is a behavioral snapshot for migration safety.

```

---

### TODO M1.2 – Identify interaction hotspots

**Copilot Prompt**
```

Identify which parts of the current system require JavaScript interaction.

Classify each as:

- Static (no JS needed)
- Interactive (user input)
- Computed (derived view)

This classification will decide Astro vs Svelte boundaries.

```

---

## PHASE M2: Introduce Astro (Structure Only)

### Goal
Replace HTML structure with Astro without adding JS.

---

### TODO M2.1 – Create Astro project shell

**Copilot Prompt**
```

Create an Astro project for LifeLab.

Requirements:

- Static output only
- No server routes
- GitHub Pages compatible
- No framework integration yet

Do not migrate features yet.

```

---

### TODO M2.2 – Move static layout into Astro

**Copilot Prompt**
```

Move existing static HTML structure into Astro pages and layouts.

Rules:

- One Astro layout for global structure
- Pages render pure HTML
- No interactivity or JS logic yet

Verify visual parity with original system.

```

---

## PHASE M3: Add Svelte (Interaction Layer)

### Goal
Move interactivity to Svelte without bloating JS.

---

### TODO M3.1 – Install Svelte integration

**Copilot Prompt**
```

Add Svelte integration to the Astro project.

Verify:

- Svelte components render correctly
- No global hydration

Do not convert any existing logic yet.

```

---

### TODO M3.2 – Define island boundaries

**Copilot Prompt**
```

Define which components should be Svelte islands.

Rules:

- One island per interactive unit
- Avoid hydrating entire pages
- Static content stays in Astro

Document island boundaries clearly.

```

---

## PHASE M4: Convert Interactive Components (One at a Time)

### Goal
Incrementally replace JS with Svelte.

---

### TODO M4.1 – Migrate daily row interaction

**Copilot Prompt**
```

Convert the daily row interaction into a Svelte component.

Rules:

- Preserve existing behavior
- Local state only
- No global stores
- Use client:visible or client:idle hydration

Verify interaction speed improvement.

```

---

### TODO M4.2 – Migrate controls (intent, quality, outcome)

**Copilot Prompt**
```

Convert day-level controls into Svelte components.

Rules:

- One component per concern
- No shared mutable state
- Data persistence must remain unchanged

Avoid introducing reactive cascades.

```

---

### TODO M4.3 – Migrate notebook reflection input

**Copilot Prompt**
```

Move reflection input logic into a Svelte component.

Rules:

- Preserve validation rules
- No auto-saving on every keystroke
- Batch writes to storage

Ensure performance remains smooth.

```

---

## PHASE M5: Storage & State Integration

### Goal
Keep storage logic framework-agnostic.

---

### TODO M5.1 – Isolate storage access

**Copilot Prompt**
```

Refactor storage access into framework-agnostic utility functions.

Rules:

- No Svelte stores
- No Astro imports
- Plain JavaScript only

All components must call this layer.

```

---

### TODO M5.2 – Prevent reactive over-fetching

**Copilot Prompt**
```

Ensure Svelte components do not re-read storage on every state change.

Rules:

- Load once on mount
- Write on explicit user action
- No watchers tied directly to storage

Document data flow.

```

---

## PHASE M6: Performance Hardening

### Goal
Ensure Astro + Svelte actually delivers speed.

---

### TODO M6.1 – Audit hydration strategy

**Copilot Prompt**
```

Audit all Svelte components hydration strategy.

Ensure:

- No client:load unless absolutely required
- Prefer client:visible or client:idle
- No unnecessary JavaScript on initial load

List hydration choices and reasons.

```

---

### TODO M6.2 – Remove unused JavaScript

**Copilot Prompt**
```

Identify and remove legacy JavaScript files
that are no longer needed after Svelte migration.

Ensure no functionality loss.

```

---

## PHASE M7: GitHub Pages Deployment Validation

### Goal
Ensure static compatibility and clean deploy.

---

### TODO M7.1 – Astro config for GitHub Pages

**Copilot Prompt**
```

Configure astro.config.mjs for GitHub Pages deployment.

Requirements:

- Correct site URL
- Correct base path
- Static output

Verify assets load correctly on subpath.

```

---

### TODO M7.2 – Final parity check

**Copilot Prompt**
```

Compare original system vs Astro + Svelte version.

Verify:

- Data compatibility
- UI behavior parity
- Interaction speed improvement

Do not optimize features.
Only fix regressions.

```

---

## MIGRATION RULES (NON-NEGOTIABLE)

- Never hydrate full pages
- Never introduce global Svelte stores
- Never reimplement logic already working
- Never change storage formats during migration

---

## END
```

---

### Final sanity check

This plan:

- respects your existing work
- improves speed without rewriting logic
- keeps LifeLab philosophically intact

If you want next, I can:

- mark **exact components** that should be islands
- or generate **Astro + Svelte starter code** for the notebook page
- or help you benchmark before/after interaction latency

Just say which one you want to lock next.
