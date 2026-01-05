# LifeLab – Safeguards & Long-Term Integrity System

This document defines structural safeguards that prevent LifeLab
from turning into a productivity game or collapsing under ambiguity.

Scope:

- Silence days
- Activity vs quality
- Asymmetric domains
- Reflection friction
- Anti-optimization rules

No new domains.
No notifications.
No scoring systems.

---

## PHASE S1: Silence Days (Intentional Absence)

### Goal

Distinguish between:

- rest
- offline choice
- unlogged days

Prevent false narratives later.

---

### TODO S1.1 – Extend daily notebook model

**Copilot Prompt**

```

Extend the daily notebook entry model to include a field called dayIntent.

Allowed values:

- "active"
- "rest"
- "offline"
- "unknown" (default)

This field must be optional and user-controlled.
Do not auto-assign intent.
Update documentation comments accordingly.

```

---

### TODO S1.2 – Intent UI interaction

**Copilot Prompt**

```

Add a minimal UI control to each daily row
that allows selecting dayIntent.

Rules:

- One click maximum to change intent
- No modal dialogs
- Do not force selection

Intent should be visible but subtle.

```

---

## PHASE S2: Separate Activity from Quality

### Goal

Allow honest evaluation without numeric scoring.

---

### TODO S2.1 – Add daily quality annotation

**Copilot Prompt**

```

Add an optional daily quality field to the notebook model.

Allowed values:

- "low"
- "medium"
- "high"

This is independent of win/loss outcome.
Document why quality is not numeric.

```

---

### TODO S2.2 – Quality UI controls

**Copilot Prompt**

```

Add a lightweight way to annotate daily quality.

Rules:

- Optional
- Non-numeric
- Cannot be aggregated automatically

Quality should be visible in daily rows
but not summarized by default.

```

---

## PHASE S3: Asymmetric Domain Traits

### Goal

Stop treating all life domains as identical.

---

### TODO S3.1 – Domain analysis traits

**Copilot Prompt**

```

Extend domain configuration to support analysis traits:

- expectsContinuity (boolean)
- naturallyCyclical (boolean)
- isEnergySensitive (boolean)

These traits must:

- not affect storage
- not affect logging
- only influence analysis phrasing later

Add clear comments explaining intent.

```

---

### TODO S3.2 – Trait-aware insight phrasing

**Copilot Prompt**

```

When generating domain insights,
adjust phrasing based on domain traits.

Examples:

- Cyclical domains should not be labeled inconsistent
- Energy-sensitive domains should avoid loss framing

Do not change calculations.
Only change language.

```

---

## PHASE S4: Reflection Friction (Minimal, Forced Thought)

### Goal

Increase reflection consistency without increasing effort.

---

### TODO S4.1 – Monthly sentence starter system

**Copilot Prompt**

```

Implement a monthly reflection sentence starter.

Rules:

- Exactly one sentence
- Starter rotates monthly
- User must complete it before closing a month

Examples:

- "This month felt like..."
- "I underestimated..."
- "What surprised me was..."

Do not allow multi-paragraph input.

```

---

### TODO S4.2 – Reflection enforcement logic

**Copilot Prompt**

```

Prevent month closure if the reflection sentence is empty.

Rules:

- No aggressive blocking
- Gentle visual reminder only
- User retains control

Document why this friction exists.

```

---

## PHASE S5: Anti-Optimization Rule (Truth Lock)

### Goal

Prevent rewriting history.

---

### TODO S5.1 – Month closure mechanism

**Copilot Prompt**

```

Implement a month closure mechanism.

Once closed:

- Daily outcomes cannot be edited
- Quality and intent cannot be changed
- Notes become read-only

Closure must be explicit and manual.

```

---

### TODO S5.2 – Read-only past month enforcement

**Copilot Prompt**

```

Enforce read-only state for closed months.

Rules:

- UI must visually distinguish closed months
- Data integrity must be preserved
- No hidden overrides

This is a truth-preservation feature, not a punishment.

```

---

## NON-NEGOTIABLE CONSTRAINTS

- No productivity scores
- No daily goals
- No streak recovery
- No notifications
- No reminders

LifeLab observes. It does not chase.

---

## END

```

---

### Final thought (important)

Most systems fail because they optimize for **motivation**.
Yours is optimizing for **memory and honesty**.

That’s rare and correct.

If you want next, we can:

- simulate how a chaotic month looks under these safeguards
- test whether quality + intent overlaps too much
- or design the exact micro-UI for daily rows (symbols, spacing)

Say which one you want to stress next.
```
