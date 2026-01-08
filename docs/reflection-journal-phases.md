# Reflection Journal

*Long-Form Thinking Without Performance*

---

## Philosophy Lock (Do Not Break)

* This is **thinking space**, not emotional discharge
* No scores, streaks, sentiment, or insights engine
* Writing is the end, not a means
* Silence is allowed. Empty weeks are allowed.

If any future feature violates this, it does not belong here.

---

## PHASE 0: Conceptual Separation

### Goal

Ensure reflection is not confused with daily logs or wins.

---

### TODO 0.1 – Hard Separation in Code & UI

**Copilot Prompt**

```
Create Reflection Journal as a completely separate module.

Rules:
- No shared data models with daily logs or wins
- No shared UI components beyond typography
- No references to dates by default

Reflection entries must feel timeless.
```

---

### TODO 0.2 – Navigation Placement

**Copilot Prompt**

```
Add a dedicated "Reflection" section in navigation.

Rules:
- Not nested under daily logs
- Not shown on the home dashboard
- No badges, counts, or highlights

This area should feel quiet and optional.
```

---

## PHASE 1: Data Model & Schema

### Goal

Store thoughts without forcing structure.

---

### TODO 1.1 – Reflection Entry Schema

**Copilot Prompt**

```
Design the Reflection Journal document schema.

Required fields:
- id
- createdAt
- content (free text)

Optional fields:
- promptId (nullable)
- title (optional, user-defined)

Rules:
- No word count
- No sentiment
- No tags by default
- No analytics fields
```

---

### TODO 1.2 – Prompt Definition Schema

**Copilot Prompt**

```
Define a prompt schema separate from entries.

Fields:
- promptId
- text
- isDefault (boolean)
- createdAt

Prompts must never be mandatory.
Entries can exist without prompts.
```

---

## PHASE 2: Writing Experience (Most Important)

### Goal

Make writing frictionless but intentional.

---

### TODO 2.1 – Entry Creation Flow

**Copilot Prompt**

```
Design the reflection entry creation flow.

Behavior:
- Blank editor by default
- Optional "Choose a prompt" link
- Prompt appears above editor if selected
- User can dismiss prompt at any time

No autosave indicators.
No timers.
No word counters.
```

---

### TODO 2.2 – Editor Design Rules

**Copilot Prompt**

```
Implement a minimal long-form text editor.

Rules:
- Plain textarea or contenteditable
- Monospaced or book-style serif font
- Comfortable line height
- No markdown toolbar
- No formatting buttons

Typing should feel like a notebook, not a tool.
```

---

### TODO 2.3 – Save Semantics

**Copilot Prompt**

```
Implement explicit save behavior.

Rules:
- Save only on user action
- No autosave every keystroke
- Show subtle "Saved" confirmation once
- Never nag to save

Unfinished thoughts are allowed.
```

---

## PHASE 3: Prompt System (Optional, Never Pushy)

### Goal

Support thinking without directing it.

---

### TODO 3.1 – Default Prompt Set

**Copilot Prompt**

```
Seed the app with a small default prompt set:

Examples:
- What did I notice this week?
- What feels unclear right now?
- What pattern am I seeing?
- What am I avoiding?

Rules:
- Prompts must be editable
- Prompts must be deletable
- Prompts must never rotate automatically
```

---

### TODO 3.2 – Prompt Selection UX

**Copilot Prompt**

```
Design prompt selection UI.

Rules:
- Prompts shown as simple text list
- No recommendation logic
- No highlighting of "good" prompts
- User can ignore prompts entirely

Prompt selection must feel optional, not guided.
```

---

## PHASE 4: Reading & Browsing Past Reflections

### Goal

Enable review without judgment.

---

### TODO 4.1 – Reflection List View

**Copilot Prompt**

```
Implement a reflection list view.

Display:
- Entry date
- Optional title
- Short text preview (first ~2 lines)

Rules:
- No sorting by length
- No filters by mood or topic
- Default sort: chronological
```

---

### TODO 4.2 – Entry Reading Mode

**Copilot Prompt**

```
Design a distraction-free reading mode.

Rules:
- No edit buttons visible initially
- No metrics shown
- No related entries
- Large margins and readable typography

Reading should feel like revisiting a notebook page.
```

---

## PHASE 5: Editing & Permanence Rules

### Goal

Respect thought evolution without rewriting history.

---

### TODO 5.1 – Edit Behavior

**Copilot Prompt**

```
Allow reflection entries to be edited.

Rules:
- Editing overwrites content
- No version history by default
- No "last edited" emphasis

Reflection is allowed to change quietly.
```

---

### TODO 5.2 – Deletion Philosophy

**Copilot Prompt**

```
Implement deletion with care.

Rules:
- Deletion requires confirmation
- No undo timer
- No archive or trash by default

Deleting a thought should feel intentional.
```

---

## PHASE 6: Firebase Integration (Reflection-Specific)

### Goal

Persist without coupling.

---

### TODO 6.1 – Firebase Collection Setup

**Copilot Prompt**

```
Create a Firestore collection for reflection entries.

Path:
users/{uid}/reflections/{entryId}

Rules:
- No subcollections
- Flat documents
- ISO timestamps only
```

---

### TODO 6.2 – Offline-First Behavior

**Copilot Prompt**

```
Ensure reflection entries work offline.

Rules:
- Save locally first
- Sync to Firebase when available
- No sync status UI

Reflection writing must never fail due to connectivity.
```

---

## PHASE 7: Explicit Non-Features (Document These)

### Goal

Protect the feature long-term.

---

### TODO 7.1 – Add Non-Goals Documentation

**Copilot Prompt**

```
Create a Reflection Journal non-goals document.

Explicitly state:
- No sentiment analysis
- No emotional labeling
- No streaks
- No insights engine
- No AI summaries

This document protects the feature from future drift.
```

---

## Final Integrity Checklist

Before marking this feature “done”:

* [ ] No numbers anywhere in the reflection UI
* [ ] No emotional interpretation
* [ ] No nudges to write more
* [ ] Empty weeks feel acceptable
* [ ] Writing feels calm, not productive

If writing here feels like *thinking*, you succeeded.
If it feels like *output*, something went wrong.

---

### Honest Assessment

This feature pairs extremely well with:

* **Win Ledger** (identity reinforcement)
* **Notebook / logs** (factual tracking)

But it must stay **orthogonal** to both.
