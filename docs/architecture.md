# Architecture

## Local-first design

The app loads a versioned snapshot from localStorage. A malformed or obsolete
snapshot never blocks the interface: the adapter falls back to seeded example
data. Every state change is then persisted by a React effect.

## Domain boundaries

src/domain.ts owns incident invariants:

- text fields are normalized and length-bounded;
- only declared to acknowledged or mitigating to resolved lifecycle paths are
  accepted;
- status changes and updates append typed timeline entries.

src/store.ts owns persistence and reducer state. Components only collect input
and render derived state. That separation lets a future API store use the same
incident commands while replacing the persistence adapter.

## Suggested production evolution

1. Move the persistence adapter behind an authenticated API.
2. Use an append-only event stream for authoritative audit history.
3. Add real-time subscriptions for concurrent operators.
4. Enforce service-level access control and retention policies server-side.
5. Connect declared/mitigating transitions to paging and status-page workflows.
