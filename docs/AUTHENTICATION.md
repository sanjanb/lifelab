# Authentication & User-Scoped Data Storage

This document defines how authentication and per-user data storage are implemented.
The goal is **identity continuity**, not accounts as a product feature.

---

## PHASE 0: Identity Philosophy Lock

### Goal

Authentication exists only to:

- Preserve data across devices
- Keep data private
- Maintain continuity over time

### Non-Goals

- No social features
- No follower concepts
- No gamification
- No public profiles

### Rules

- One user = one private data space
- No cross-user visibility
- No analytics tied to identity

### Copilot Prompt

```

Create documentation comments explaining why authentication exists in this project.
Explicitly state that auth is for data continuity and privacy, not social features.

```

---

## PHASE 1: Firebase Auth Setup

### Goal

Enable authentication with the least cognitive overhead.

### Auth Methods

- Email + password
- Google Sign-In (optional, later)

### Copilot Prompt

```

Set up Firebase Authentication:

* Enable Email/Password authentication
* Prepare optional Google provider but do not expose it yet
* Export auth instance for use across modules

```

---

## PHASE 2: Auth State Management

### Goal

Know who the user is, without building a “user system”.

### Requirements

- Single global auth state
- Reactive but simple
- No Redux / frameworks

### Copilot Prompt

```

Implement a global auth state listener using Firebase:

* Track current user
* Expose user UID when authenticated
* Expose null state when signed out
* Avoid complex state management libraries

```

---

## PHASE 3: Auth UI (Minimal & Calm)

### Goal

Authentication should feel like opening a notebook, not joining a platform.

### UI Components

- Sign in page
- Sign up page
- Sign out action (settings only)

### UX Rules

- No marketing copy
- No upsells
- No “benefits” language

### Copilot Prompt

```

Create minimal authentication UI:

* Email and password fields
* Sign in / Sign up toggle
* Neutral language
* No illustrations or persuasion copy

```

---

## PHASE 4: User Data Namespace

### Goal

Strict separation of data per user.

### Canonical Data Shape

```

users/
{uid}/
profile/
wins/
journal/
reflections/
board/
settings/

```

### Rules

- All reads and writes are scoped to uid
- No shared collections

### Copilot Prompt

```

Define a Firebase data structure where:

* All user data is nested under their UID
* No global collections are used for user-generated content
* Paths are explicit and predictable

```

---

## PHASE 5: Security Rules

### Goal

Guarantee privacy at the database level.

### Core Rule

A user can only read/write their own data.

### Copilot Prompt

```

Write Firebase security rules that:

* Allow users to read/write only their own UID subtree
* Deny all access when unauthenticated
* Do not allow list access across users

```

---

## PHASE 6: Migration from Local Storage → Firebase

### Goal

Respect existing users’ data.

### Strategy

- Detect local data
- Prompt user once
- Migrate explicitly
- Never auto-delete local data

### Copilot Prompt

```

Implement a one-time migration flow:

* Detect existing localStorage data
* Prompt user to migrate after sign-in
* Write data to Firebase under their UID
* Preserve local copy unless user confirms deletion

```

---

## PHASE 7: Auth-Aware Feature Access

### Goal

Features should degrade gracefully without auth.

### Behavior

- Logged out: read-only or local-only mode
- Logged in: persistent mode

### Copilot Prompt

```

Update feature modules to:

* Check auth state before Firebase operations
* Fall back to local storage if unauthenticated
* Sync automatically when user logs in

```

---

## PHASE 8: Settings & Account Actions

### Goal

Keep account management invisible unless needed.

### Actions

- Sign out
- Delete account (with warning)
- Export data

### Copilot Prompt

```

Create a settings panel that allows:

* Signing out
* Deleting account and data (with confirmation)
* Exporting user data

Keep UI minimal and hidden behind settings.

```

---

## PHASE 9: Failure & Offline Handling

### Goal

Never punish the user for network or auth issues.

### Rules

- Silent retries
- Clear offline indicators
- No blocking modals

### Copilot Prompt

```

Implement graceful failure handling:

* Queue writes when offline
* Retry on reconnect
* Display subtle offline state without blocking usage

```

---

## PHASE 10: Integrity Review

### Final Checklist

- No cross-user data access
- No identity-based analytics
- No social surface
- No auth pressure

### Copilot Prompt

```

Review authentication and data access code.
Remove any unnecessary user metadata, analytics hooks, or identity coupling.
Ensure privacy and calmness are preserved.

```

---

## Completion Definition

Authentication is complete when:

- Users feel ownership, not obligation
- Data feels private and durable
- Auth disappears after setup

Identity exists to protect thought — nothing more.

```

```

# Authentication Entry Flow (Soft Gate Model)

---

## PHASE 1: Default Anonymous / Local Mode

### Goal
Allow the site to function without authentication.

### Behavior
- All data stored in localStorage
- UI fully usable
- No login required

### Copilot Prompt
```

Ensure the application runs in unauthenticated mode by default.
Store all data locally when no user is authenticated.
Do not block any core feature behind login.

```

---

## PHASE 2: Auth Awareness (Silent)

### Goal
Make the app aware of auth state without changing UI yet.

### Behavior
- Track auth state internally
- Expose `isAuthenticated` flag
- No visible UI change

### Copilot Prompt
```

Implement silent auth state detection.
Expose a simple boolean for authentication status.
Do not render auth UI automatically.

```

---

## PHASE 3: Contextual Auth Prompt

### Goal
Invite authentication only when it matters.

### Trigger moments
- First win saved
- First journal entry saved
- First full day completed

### UX Rules
- Inline prompt (not modal)
- Dismissible
- Never blocks action

### Example Copy
> “Save this privately across devices?”

### Copilot Prompt
```

When a user creates meaningful data:

* Show a subtle inline prompt inviting authentication
* Do not interrupt the action
* Allow dismissal without penalty

```

---

## PHASE 4: Minimal Auth Entry UI

### Goal
Make authentication feel like continuation, not signup.

### UI
- Inline card or side panel
- Email + password
- Neutral copy

### Language Rules
Avoid:
- “Join”
- “Sign up now”
- “Create account”

Prefer:
- “Continue”
- “Save privately”
- “Keep this safe”

### Copilot Prompt
```

Render authentication UI as an inline continuation step.
Use neutral language focused on saving and continuity.
Avoid marketing or persuasive language.

```

---

## PHASE 5: Post-Auth Migration

### Goal
Seamlessly move local data to Firebase.

### Behavior
- On successful auth:
  - Migrate local data
  - Confirm completion
- Do not delete local data automatically

### Copilot Prompt
```

After authentication:

* Migrate local data to Firebase under user UID
* Confirm migration success
* Preserve local data unless explicitly removed

```

---

## PHASE 6: Persistent Mode Indicator

### Goal
Provide quiet reassurance.

### UI
- Small indicator in settings or footer
- Example: “Saved privately”

No action required.

### Copilot Prompt
```

Display a subtle indicator when data is being stored remotely.
Avoid badges, colors, or gamification.

```

---

## PHASE 7: Settings-Based Auth Control

### Goal
Never force identity decisions in the main flow.

### Actions
- Sign out
- Switch back to local-only mode
- Export data

### Copilot Prompt
```

Expose authentication controls only inside settings.
Do not place login/logout in the main navigation.

```

---

## Definition of Done

- Site is usable without auth
- Auth appears only when value exists
- User never feels forced
- Data continuity feels earned, not demanded
```

---

