## What and why
<!-- One or two sentences. Link the task ID from the implementation plan if there is one. -->

## Checklist
- [ ] `npm run verify` passes (typecheck, token lint, ESLint, tests)
- [ ] Tokens only — no `--primitive-*`, raw hex or raw px in scaled properties
- [ ] Keyboard-operable and has an accessible name (tested, not assumed)
- [ ] Component follows `docs/component-contract.md` (ref, `...rest`, `className`, exported props type)
- [ ] Added or updated tests, including an axe check for new components
- [ ] `apps/product` / `examples` call sites updated for any prop change; `npm run verify:product` passes
- [ ] Figma impact noted (none / needs follow-up)
