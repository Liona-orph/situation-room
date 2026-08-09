# Situation Room

Situation Room is a local-first operational workspace for declaring, tracking,
and resolving incidents. It is intentionally focused: a team can capture
ownership, safe status transitions, and a readable timeline without first
standing up a backend.

## What it includes

- incident declaration with severity, service, and commander;
- a guarded lifecycle from declared through resolved;
- timeline updates and immutable history entries;
- severity and status filters;
- versioned browser persistence with a safe fallback for corrupt local data;
- responsive, keyboard-accessible interface;
- strict TypeScript, linting, interface tests, and a production Docker image.

## Run locally

Requires Node.js 20.19 or newer.

    npm install
    npm run dev

Then open the local URL printed by Vite. The workspace begins with two
illustrative incidents. All edits are stored only in the current browser's
local storage under situation-room:v1.

## Verify

    npm run check

This runs ESLint, Vitest, TypeScript project builds, and the Vite production
bundle. The GitHub Actions workflow uses the same gate.

## Deploy as a static site

    docker build -t situation-room .
    docker run --rm -p 8080:8080 situation-room

The image is served by an unprivileged Nginx process with conservative static
asset headers. For a backend-connected version, keep the domain model and
replace the local store adapter with an authenticated API client.

## Architecture

The core domain stays separate from the React components:

    form or detail action
            |
            v
    domain command validates transition
            |
            v
    reducer updates in-memory incident state
            |
            +--> React view
            |
            +--> versioned localStorage snapshot

See [docs/architecture.md](docs/architecture.md) for extension points and
[SECURITY.md](SECURITY.md) for usage boundaries.

## Scope

This project is a polished local operational tool, not a replacement for a
multi-team incident platform. It has no authentication, collaboration sync,
audit export, paging, or server-side persistence. Those are deliberate
integration points rather than misleading placeholders.
