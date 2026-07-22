---
name: fix-and-deploy
description: Runs the full fix → test → commit → PR → deploy cycle for the mobile-observability-dashboard. Use when the user asks to fix bugs, fix failing tests, fix build errors, commit changes, open a pull request, or deploy to production on Netlify. Also use when Netlify reports a failed deploy or when tsc/vite build errors are reported.
---

# Fix and Deploy — Mobile Observability Dashboard

Runs the full quality loop: diagnose → fix → verify → branch → commit → PR → Netlify production deploy.

## Step 1 — Diagnose

Run both checks in parallel to get a full picture before touching any code:

```bash
npm run build   # tsc -b + vite build — catches TypeScript errors
npm test        # vitest run — catches failing tests
```

**Read all errors before fixing anything.** Group them by root cause.

## Step 2 — Fix

### TypeScript build errors (`tsc -b`)

| Error | Likely cause | Fix |
|---|---|---|
| `TS6133` unused import | Test file compiled by tsc | Remove the unused import |
| `TS2304` unknown name (`global`) | Node-only identifier in DOM-typed config | Replace with `globalThis` |
| `TS2307` cannot find module | Missing dep or wrong path | Check `package.json`, fix import path |
| Test files compiled at all | `tsconfig.app.json` missing exclude | Add to `exclude` in `tsconfig.app.json` (see below) |

**Permanent fix for test files leaking into the build** — add to `tsconfig.app.json`:
```json
"exclude": [
  "src/test",
  "src/**/*.test.ts",
  "src/**/*.test.tsx",
  "src/**/*.spec.ts",
  "src/**/*.spec.tsx"
]
```

### Failing tests (`npm test`)

Tests live in `src/test/`. The mock layer in `src/test/setup.ts` stubs:
- Firebase (`isConfigured: false` → hooks return mock fallback data)
- Datadog (`importActual` pattern — real helpers, stubbed `queryMetrics`)
- `ResizeObserver`, `matchMedia`, `scrollIntoView`

**Common fix patterns:**

- `Found multiple elements with text` → use `getAllByText(...).length > 0` or `getByRole('button', { name: /label/i })`
- `Unable to find element with text` → text may be split across nodes; use regex or `getAllByText`
- Sidebar button accessible name includes shortcut digit (e.g. "Engineering 2") → use partial match `/engineering/i` not `/^engineering$/i`
- `scrollIntoView` not called → ensure `window.HTMLElement.prototype.scrollIntoView = vi.fn()` is in `setup.ts`
- Hook returns `loading: true` → Firebase mock may not be applied; check `setup.ts` is in `setupFiles`

## Step 3 — Verify

Both must exit 0 before proceeding:

```bash
npm run build   # must complete with "✓ built"
npm test        # must show "X passed (X)"
```

## Step 4 — Branch and commit

```bash
# Create branch — use descriptive kebab-case name
git checkout -b fix/<short-description>

# Stage only the files you changed
git add <files>

# Commit — lead with the type of change
git commit -m "fix: <what was broken and how it was fixed>"
```

**Commit message types:** `fix:` `feat:` `chore:` `test:` `refactor:`

## Step 5 — Push and open PR

```bash
git push -u origin fix/<short-description>

gh pr create \
  --title "fix: <short description>" \
  --base main \
  --body "$(cat <<'EOF'
## What broke
<1-2 sentences>

## Root cause
<1-2 sentences>

## Fix
<bullet list of changes>

## Verified
- [ ] npm run build passes
- [ ] npm test passes (X/X)
EOF
)"
```

## Step 6 — Production deploy

Netlify auto-deploys from `main` on every push. After the PR is merged:

- Deploy triggers automatically — no manual step needed
- If a deploy preview fails on the PR, fix the errors before merging
- Common Netlify failure: `tsc -b` compiling test files → apply the `tsconfig.app.json` exclude fix from Step 2

**Key project facts for deploy context:**
- Build command: `npm run build` (`tsc -b && vite build`)
- Publish dir: `dist`
- Config: `netlify.toml`
- SPA redirect: `/* → /index.html` (already in `netlify.toml`)

## Quick-reference: project layout

```
src/
  hooks/        useSREData, useProductData, useExecutiveData,
                useEngineeringData, useSecurityData, useDatadogMetrics
  lib/          firebase.ts, datadog.ts
  pages/        SREDashboard, EngineeringDashboard, ProductDashboard,
                SecurityDashboard, ExecutiveDashboard
  test/         setup.ts + 6 test files (122 tests)
  App.tsx       keyboard nav (1-5), ThemeContext, section state
tsconfig.app.json   production TS config (exclude src/test!)
vite.config.ts      Vite + Vitest config (environment: jsdom)
netlify.toml        build + redirect rules
```

## Additional resources

- Test framework details → [TESTING.txt](../../TESTING.txt)
- Project overview → [.cursor/rules/project-overview.mdc](../../.cursor/rules/project-overview.mdc)
