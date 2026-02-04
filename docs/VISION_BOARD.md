# Visualization Board — Phases & Copilot Prompts

A calm, manual, non-performative visualization space.
No goals. No metrics. No pressure.

---

## PHASE 0: Philosophy Lock-in

### Goal

Ensure the Visualization Board never turns into a productivity or performance tool.

### Rules

- No goals
- No metrics
- No progress indicators
- No streaks
- No auto-generated content
- Manual edits only

### Copilot Prompt

```

Create a documentation section explaining the Visualization Board philosophy:

* No goals
* No metrics
* No progress tracking
* No auto updates
* User edits only

Also create a constants file exporting these constraints so future code can reference them.

```

---

## PHASE 1: Page Skeleton & Navigation

### Goal

Create a dedicated Visualization Board page with no logic yet.

### Deliverables

- `board.html`
- `board.css`
- `board.js`
- Navigation link from home/dashboard

### Copilot Prompt

```

Create a Visualization Board page with:

* Minimal header
* Full-screen board container
* Neutral background
* Typography consistent with journal pages

No logic or interactivity yet.

```

---

## PHASE 2: Board Canvas (Visual Only)

### Goal

Render a calm, open canvas that invites reflection.

### Design Constraints

- No visible grid
- No metrics
- No UI clutter

### Copilot Prompt

```

Implement a free-form board canvas:

* Large scrollable area
* Neutral background
* No grid lines
* No interactivity yet

Focus only on spacing, layout, and calm visuals.

```

---

## PHASE 3: Card Types (Rendering Layer)

### Goal

Define allowed visual elements.

### Allowed Card Types

- Text card (short reflection)
- Image card (user-provided)
- Color card (single color block)

### Copilot Prompt

```

Create a card rendering system supporting:

* Text cards (short free text)
* Image cards
* Color cards

Render cards based on type.
Do not include counts, scores, or metadata in the UI.

```

---

## PHASE 4: Manual Card Creation

### Goal

Ensure all additions are intentional.

### UX Rules

- No auto-suggestions
- No default content
- Explicit user action required

### Copilot Prompt

```

Implement manual card creation:

* Small 'Add' button
* User selects card type
* Explicit confirmation before adding

Avoid fast or gamified interactions.

```

---

## PHASE 5: Drag & Arrange (Spatial Meaning)

### Goal

Let meaning emerge through placement, not numbers.

### Behavior

- Free drag
- No snapping
- Calm movement

### Copilot Prompt

```

Add drag-and-drop functionality for board cards:

* Free-form positioning
* No snapping or alignment guides
* Save position on drop

Movement should feel calm and predictable.

```

---

## PHASE 6: Firebase Persistence

### Goal

Make the board durable and long-lasting.

### Data Shape (Example)

```

boards/
userId/
items/
itemId/
type
content
position

```

### Copilot Prompt

```

Integrate Firebase persistence for the Visualization Board:

* Save card type, content, and position
* Load board state on page load
* Update data only on explicit user actions

Avoid continuous autosave loops.

```

---

## PHASE 7: Edit & Delete (Non-Destructive)

### Goal

Allow refinement without pressure.

### Rules

- Edit on click
- Confirm before delete
- No undo stack required

### Copilot Prompt

```

Implement editing and deletion for cards:

* Click to edit content
* Confirm before deleting
* Keep UI minimal and calm

No analytics or tracking of edits.

```

---

## PHASE 8: Optional Starter Template

### Goal

Reduce blank-page anxiety without imposing structure.

### Behavior

- Shown only once
- Can be dismissed permanently

### Copilot Prompt

```

Add an optional starter template:

* Show 2–3 neutral placeholder cards for new users
* Allow dismissing permanently
* Store dismissal state in Firebase

Do not reintroduce after dismissal.

```

---

## PHASE 9: Accessibility & Visual Polish

### Goal

Make the board humane and readable.

### Requirements

- Keyboard navigation
- Reduced motion support
- High contrast text

### Copilot Prompt

```

Improve accessibility and polish:

* Keyboard focus for cards
* Respect prefers-reduced-motion
* Ensure readable text contrast
* Avoid decorative animations

Maintain a notebook-like feel.

```

---

## PHASE 10: Final Integrity Review

### Goal

Verify alignment with core philosophy.

### Checklist

- No numbers displayed
- No progress language
- No performance cues
- Calm visual tone

### Copilot Prompt

```

Review the Visualization Board implementation and remove anything that:

* Suggests progress, goals, or performance
* Adds unnecessary UI noise
* Encourages comparison

Refactor toward simplicity and calm.

```

---

## Completion Criteria

The Visualization Board is complete when:

- It feels quiet
- It invites reflection
- It does not push action
- It respects user pace

Silence is a feature.
