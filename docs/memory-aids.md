# PHASE 5: Memory Aids (Gentle Retrospection)

Purpose:
Reinforce continuity of self without evaluation, pressure, or nostalgia traps.

This feature must feel like:
“Here is something you once thought.”
Not:
“Look how you changed.”

---

## 5.0 Design Constraints (Read Before Coding)

Non-negotiables:

- Opt-in only
- One memory max at a time
- No comparison language
- No metrics, scores, or trends
- No resurfacing by default
- Dismissible forever per day

If any of these break → delete the feature.

---

## 5.1 Memory Eligibility Logic

### What qualifies as a memory

- Long-form journal entry
- Daily reflection notes
- Optional: Win Ledger note (later)

Explicitly excluded:

- Metrics
- Health numbers
- Charts
- Analytics

Priority order:

1. Same calendar date (YYYY-MM-DD) from previous years
2. Same month, closest date
3. Same ISO week, any year

If none found → show nothing.

---

### Copilot Prompt

```

Implement a memory selection function.
Given today's date and past entries:

- First try exact date match from previous years
- Else try same month, nearest date
- Else try same ISO week
  Return only one entry or null.
  Do not compute differences or comparisons.
  Document selection rules clearly.

```

---

## 5.2 Firebase Query Layer

Storage assumptions:

- Entries are timestamped
- Entries have type (journal, reflection, win, etc.)
- User-scoped

Rules:

- Query must be lightweight
- No full-history scan on load
- Cache result per day

---

### Copilot Prompt

```

Create a Firebase query to fetch past entries
eligible for 'On This Day'.
Query only what is needed.
Cache the selected memory for the current day.
Do not fetch analytics or metrics data.

```

---

## 5.3 Opt-In Control (Critical)

User controls:

- Global toggle: Enable / Disable Memory Aids
- Local toggle: “Show memory today”

Defaults:

- OFF by default
- No re-enable prompts

Persistence:

- Stored in user settings
- Respect immediately

---

### Copilot Prompt

```

Implement an opt-in setting for Memory Aids.
Default must be disabled.
Store preference per user.
UI must not nag or remind users to enable it.

```

---

## 5.4 Memory Card UI (Surface Layer)

Visual rules:

- Looks like a note, not a stat
- No icons that imply success/failure
- Muted colors
- Plenty of whitespace

Content:

- Date of original entry
- Entry text (truncated if long)
- Optional label: “From your past”

Actions:

- Dismiss (for today)
- Hide forever (disable feature)

---

### Copilot Prompt

```

Build a small, calm memory card UI.
Hidden by default.
Shows a past entry with its original date.
Include dismiss and disable actions.
Avoid emojis, badges, or highlights.

```

---

## 5.5 Placement Rules

Allowed locations:

- Bottom of home page
- End of journal view
- Never above primary content

Disallowed:

- Modals
- Popups
- First-load interruptions

---

### Copilot Prompt

```

Place the memory card only at the bottom
of primary views.
Never block or interrupt user actions.
Ensure layout shift is minimal.

```

---

## 5.6 Language Audit (Very Important)

Allowed language:

- “From this day”
- “You wrote”
- “A past note”

Forbidden language:

- “Then vs now”
- “You’ve grown”
- “You were better/worse”
- “Progress”

---

### Copilot Prompt

```

Audit all text used in the Memory Aid feature.
Remove evaluative or comparative language.
Ensure tone is neutral and observational.

```

---

## 5.7 Failure Modes (Explicit Handling)

Cases:

- No past data → show nothing
- Corrupt entry → skip silently
- User dismisses → do not resurface today

Never:

- Show empty placeholders
- Display error messages

---

### Copilot Prompt

```

Handle all Memory Aid failure cases silently.
If no valid memory exists, render nothing.
Do not show empty states or error messages.

```

---

## 5.8 Final Philosophy Check

Checklist:

- Is this optional? ✔
- Does it judge? ✘
- Does it optimize behavior? ✘
- Does it interrupt flow? ✘
- Does it respect forgetting? ✔

If any answer fails → remove feature.

---

## Expected Outcome

The Memory Aid should feel like:
A quiet note left on a desk.

Not:
A reminder.
Not:
A comparison.
Not:
A lesson.

Just continuity.

```

---

### One honest thought (checking assumptions)

You’re right to be cautious here.
Memory resurfacing is **one of the easiest places to accidentally manipulate emotion**.

By:

- limiting frequency
- limiting quantity
- limiting language

you keep it human instead of extractive.
```
