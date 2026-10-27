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

## Product logic (only for changes to `apps/product` or product screens)
<!-- See docs/product/domain-logic.md and AI-GUIDE §11 (P1–P10). Delete this section if not applicable. -->
- Actor / permission scope:
- Company / measurement / market date / version(s) affected:
- User action, invariant and downstream effect:
- Evidence: training-notes `[Sxx @ hh:mm:ss]`, Figma frame, or decision
- States covered (loading / empty / dirty / saved / validation / error / forbidden / stale):
- Calculation source (`illustrative-calcs.ts` only, never a new formula in UI):
- Draft / published / audit visibility:
- Historical regressions covered (BUG-0x):
- Open questions left as `VERIFY`:

- [ ] Every value is bound to the valuation context (P1) and empty ≠ zero (P5)
- [ ] Dates are named by meaning: measurement vs market vs transaction (P2)
- [ ] Version switch resets derived state; Cap Table ↔ Fund Ownership pairing kept (P4)
- [ ] Weights / ordering / dates validated, never silently corrected (P7)
- [ ] `npm run test:product` and `npm run lint:product-logic` pass
