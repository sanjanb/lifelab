# Firestore Security Rules Documentation

## Overview

LifeLab's Firestore security rules enforce **strict privacy at the database level**. A user can only read and write their own data. No exceptions.

## Core Principles

1. **Authentication Required**: All access denied when unauthenticated
2. **Owner-Only Access**: Users can only access `users/{uid}/` where `uid` matches their authenticated user ID
3. **No Cross-User Visibility**: No user can read or write another user's data
4. **No User Listing**: Cannot list all users or enumerate UIDs
5. **Path Validation**: Only explicitly allowed paths are accessible

## Data Structure

All user data is nested under their UID:

```
users/
  {uid}/
    profile/          - User profile metadata
    wins/             - Win Ledger entries
    journal/          - Daily journal entries
    reflections/      - Reflection responses
    board/
      cards/          - Visualization board cards
      settings/       - Board settings
    settings/         - App settings
```

## Security Rules

### User Data (`users/{uid}/`)

```javascript
match /users/{uid} {
  // Root document: Deny (prevents user enumeration)
  allow read, write: if false;

  // All subcollections: Owner only
  match /{collection}/{document=**} {
    allow read, write: if request.auth.uid == uid;
  }
}
```

**What this enforces:**

- User cannot access `/users` collection (no listing)
- User cannot read `/users/{otherUserUid}` (no cross-user access)
- User can only access `/users/{theirUid}/...` (owner-only access)

### Shared Collection (Deprecated)

```javascript
match /lifelab_data/shared_data/{document=**} {
  // Temporary: Allow all access for backward compatibility
  // Will be removed after Phase 6 migration
  allow read, write: if true;
}
```

**Status:** 🚨 **Not Secure** - For migration only

This shared collection allows anonymous access for backward compatibility with existing localStorage users. It will be removed once all users have migrated to authenticated user-scoped data (Phase 6).

## Testing Rules

You can test these rules locally using the Firebase Emulator Suite:

```bash
firebase emulators:start
```

Or deploy to Firebase:

```bash
firebase deploy --only firestore:rules
```

## Common Patterns

### Creating a New Document

```javascript
// ✅ Allowed: Creating in your own namespace
users / { yourUid } / wins / { newWinId };

// ❌ Denied: Creating in someone else's namespace
users / { otherUid } / wins / { newWinId };
```

### Reading Data

```javascript
// ✅ Allowed: Reading your own data
users / { yourUid } / journal / { entryId };

// ❌ Denied: Reading someone else's data
users / { otherUid } / journal / { entryId };
```

### Listing Collections

```javascript
// ✅ Allowed: Listing your own wins
users / { yourUid } / wins;

// ❌ Denied: Listing all users
users /
  // ❌ Denied: Listing someone else's wins
  users /
  { otherUid } /
  wins;
```

## Migration Strategy

During Phase 6 (Migration from Local Storage → Firebase):

1. User signs in for the first time
2. App detects existing localStorage data
3. App prompts user to migrate
4. Data is written to `users/{uid}/` with proper scoping
5. Shared collection access can be revoked after migration complete

## Validation

All paths are validated in code using `userDataNamespace.js`:

```javascript
import { validateUserScopedPath } from "./userDataNamespace.js";

// Before any Firestore operation
if (!validateUserScopedPath(path)) {
  throw new Error("Invalid path: must be user-scoped");
}
```

## Philosophy Alignment

These rules enforce the authentication philosophy:

✅ **Privacy Guaranteed**: Database-level enforcement, not just app-level  
✅ **No Social Features**: No ability to see other users' data  
✅ **Identity Continuity**: Data preserved across devices, privately  
✅ **Calm UX**: No cross-user comparisons possible

---

**See Also:**

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Full authentication implementation phases
- [authPhilosophy.js](../src/data/persistence/authPhilosophy.js) - Philosophy constants
- [userDataNamespace.js](../src/data/persistence/userDataNamespace.js) - Path helpers
