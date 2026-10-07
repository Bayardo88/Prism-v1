# Contributing

## Flow
1. `git pull` on `main`, then branch: `feature/…`, `fix/…`, `chore/…` — **never commit to `main`**.
2. Make the change following `docs/component-contract.md` and `AI-GUIDE.md`.
3. `npm run verify` must pass (typecheck, token lint, ESLint, tests). For product-app changes also `npm run verify:product`.
4. Commit with an imperative first line under 72 characters ("Add keyboard model to Tabs", not "fixed tabs").
5. Push and open a PR using the template. CI must be green; one review required (see `CODEOWNERS`).
6. Delete the branch after merging.

## Rules of thumb
- Tokens change in Figma first, then `src/styles/tokens.css` → `npm run gen:tokens` → `node scripts/gen-docs.mjs`.
- Every interactive role you declare must have its keyboard behaviour implemented **and tested**. No half-implemented ARIA.
- A new or changed component needs: a test (axe + keyboard + ref/className passthrough), JSDoc on props, an export of its props type.
- A prop rename is a breaking change: keep the old name as a `@deprecated` alias for one minor release and add a changeset.

## Releases
Add a changeset with `npx changeset` in your PR (patch/minor/major + one line for the changelog). Merging the generated "Version packages" PR bumps the version and updates `CHANGELOG.md`.
