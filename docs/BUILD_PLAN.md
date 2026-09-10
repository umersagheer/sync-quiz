# SYNC Quiz — Build Plan

Standalone Next.js application implementing the SYNC personalisation quiz and reveal.
Built as a working demo for the client pitch. It will later be integrated into the
client's existing site repo, so it stays deliberately simple: good code, no speculative
abstraction, no architecture built for a scale this app will never reach on its own.

## Stack

| Concern      | Choice                                                     |
| ------------ | ---------------------------------------------------------- |
| Framework    | Next.js (App Router) + TypeScript                          |
| Styling      | Tailwind CSS v4, tokens in `@theme`. No component library. |
| Validation   | Zod — shared between client and server                     |
| Forms        | React Hook Form + `zodResolver`                            |
| Client state | Zustand                                                    |
| Server state | TanStack Query                                             |
| Tests        | Vitest                                                     |
| Deploy       | Vercel or Netlify                                          |

No HeroUI, no shadcn. The design is bespoke enough that a component library would be
fought more than used. Validation is real — a demo that silently accepts bad input
undersells the work.

## Conventions

Project conventions live in `CLAUDE.md` at the repo root. In short: `lib/{client,server,shared}`
split, `resource.usecase.ts` file naming, functional object exports rather than classes,
lookup tables rather than switch statements, shared types as the single source of truth,
minimal comments.

**No controller layer.** Route handler validates with Zod and calls the engine or service
directly — four endpoints do not need the extra hop. The `lib/{client,server,shared}` split
stays, because it is what physically keeps the answer-to-compound mapping out of the browser
bundle.

## Reference material

| File                                                      | What it is                                                                                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reference/SYNC_The_Quiz_Copy_Layer_v2_1.docx.txt`        | Customer-facing copy, screen order, reveal spec. **Wins on copy, screens and reveal layout.** Its inline trigger summaries are lossy — see Document authority.  |
| `reference/SYNC_The_Quiz_Backend_Mapping_v2_1.docx.txt`   | Engine resolution: R1–R8, R7 substitutions, per-lane triggers, four shapes, handoff payload, 18-path test matrix. **Governs all engine mechanics.** Signed off. |
| `reference/SYNC_Peptide_Intake_Build_Spec_v1.0_DRAFT.pdf` | The clinical intake that follows our handoff. Not our build — read for gates, formulary and the handoff contract.                                               |
| `reference/SYNC_Quiz_Build_Brief.html`                    | Engineering read of the above: architecture, flow diagrams, open questions.                                                                                     |

### Document authority

**Corrected in Phase 1.** This section previously read that the copy layer wins on result
mapping, trigger outcomes and read logic. That is wrong, and it matters, because it would
have pointed the engine at the weaker of the two documents.

Backend Mapping's precedence clause names **`The Quiz — FINAL v2.1`** — a document that
has never been supplied and is _not_ the copy layer. The copy layer describes itself, twice
and explicitly, as sitting on top of the engine spec with "every trigger, every rule
(R1–R8), every substitution unchanged", and says engine logic is built against Backend
v2.1 while it "governs the words and the reveal layout".

So:

- **Backend Mapping v2.1 governs engine mechanics** — lane triggers, rules, substitutions,
  shape assembly, read selection.
- **The copy layer governs copy, screen order and reveal layout.**

Where the copy layer's inline "Trigger LOCKED" lines differ from Backend, they are lossy
restatements rather than overrides. Both apparent gaps in them — REPAIR one box with
`inflammatory_intermittent`, and a PERFORM single box that is not `recovery_lag` — are
fully resolved by Backend Lane A row 2 and Lane B row 5. Nothing is genuinely undefined.

Screen numbering differs between the two documents. The copy layer's numbering is the one
the build follows, and the Figma frame names agree with it.

## Design

File: `https://www.figma.com/design/kxBzmwCi8NCZR69YeybQOm/Sync.-Website`
File key `kxBzmwCi8NCZR69YeybQOm` · Quiz page `1:772` · access confirmed via Figma MCP.

Use the `figma-to-code-react` skill when building any of these frames.

Screens are drawn at 402×874 (`LG` set); reveal variants are taller. Twenty-two top-level
frames:

| Node     | Frame                                  |
| -------- | -------------------------------------- |
| `1:1323` | S1 Welcome                             |
| `1:1375` | S2 Name                                |
| `1:1353` | S3 Welcome interstitial                |
| `1:1590` | S4 Sex assigned at birth               |
| `1:1245` | S5 Primary goal (lane)                 |
| `1:1636` | S6 Depth (+ recognition)               |
| `1:1682` | S7 Secondary goals (multi)             |
| `1:1755` | Branch A discriminator (+ recognition) |
| `1:1812` | Branch A qualifier (inflammation)      |
| `1:1858` | Branch A education                     |
| `1:1883` | S8A Sleep                              |
| `1:1931` | S8B Stress                             |
| `1:1483` | S8C 90-day capture                     |
| `1:1977` | S9 Email (gates reveal)                |

### Reveal — the 390px set is current (client-confirmed)

| Node     | Frame                                              |                            |
| -------- | -------------------------------------------------- | -------------------------- |
| `1:775`  | 10 Reveal · Shape 3–4 (base + supporting)          | **First build target**     |
| `1:904`  | 10 Reveal · Shape 2 (solo blend + pairs-well-with) |                            |
| `1:1005` | 10 Reveal · Shape 1 (recommend-less)               |                            |
| `1:1099` | 10 Reveal · Sticky footer in viewport              | scroll behaviour reference |

The 402px reveal set (`1:2019`, `1:2124`, `1:2256`, `1:2350`) is superseded. Do not build it.

Visual direction is **Apple Liquid Glass (iOS 26)** — deep maroon gradient with glass
surfaces, not the earlier cream/peach treatment. The reveal opens on a dark read band that
fades to cream for the protocol cards below.

Only Branch A is designed. Branches B–E reuse the same discriminator / qualifier / education
structure, so they are built from the Branch A components with different content.

### Reveal structure, as drawn

Read band (eyebrow `NAME — YOUR READ`, heading, two body paragraphs, footer label showing
answer count + lane, and a `BLEND` / `SINGLE` marker) → `YOUR BASE PROTOCOL` card → the
shape-conditional block → `SELECT A PLAN` → locked clinical line → controls → sticky footer.

Protocol card: product image, lane eyebrow, compound name, form line
(`Injection · 5mg vial · 12-week cycle`), four benefit chips in a 2×2 grid, paragraph,
price, and a `BASE` / `ADJUNCT` pill.

Shape-conditional block:

- Shapes 3–4 → `SUPPORTING PROTOCOL` card, plus a `REMOVE ADJUNCT` control
- Shape 2 → `PAIRS WELL WITH` card with an `+ ADD TO PROTOCOL` button
- Shape 1 → `WHY ONLY ONE` red-bar trust block, no third card

The sticky-footer frame also shows a **condensed header** that pins on scroll, carrying
`YOUR PROTOCOL`, the assembled stack name and the base price.

## Outstanding from client

| Item                                                                  | Blocks                                                                                 |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Full price table — design carries only the Recovery lane              | Phase 5, other lanes                                                                   |
| Reveal card copy for lanes B–E — 4 chips and a paragraph per compound | Phase 2 content                                                                        |
| `The Quiz — FINAL v2.1`                                               | Named as paired source of truth; not supplied. The copy layer appears to supersede it. |

### Secondary goals have no defined result above one — raise with the client

The highest-impact open item found in Phase 1, because it affects what a real customer
sees rather than an unreachable branch.

The secondary-goals screen is "MULTI-SELECT, NO RANKING" across the four non-primary
goals, with **no cap stated**, and tells the customer "anything you pick becomes part of
what we build". But §4 defines shapes for zero or one secondary only, the reveal draws
exactly one supporting protocol card, and R3 caps the stack at one blend. A customer who
ticks three goals has no defined result.

Built behaviour: resolve **one** secondary, taken in the goal screen's own lane order
(REPAIR → PERFORM → DEFINE → RESTORE → PT141), and pass the **full** array through to the
handoff so the clinician still sees everything the customer asked for.

Ask whether the screen should cap selection at one — which is probably the better fix,
since the current copy promises something the reveal cannot deliver — or whether an
explicit priority order should be specified.

### `sex_at_birth` is collected for the read but no read uses it

§6 lists it as feeding "clinical accuracy of the read", and the copy layer calls it
"clinical input for the read logic and intake dosing". None of the ten read variants
reference sex in their trigger or their copy. It is genuinely needed for intake dosing, so
it stays in the payload — but confirm whether a sex-varying read was intended and dropped,
or whether the description is just loose.

### Spec defect found in Backend Mapping §2A — raise with the client

Independent of the design. The R7 substitution table contradicts R7's own trigger
condition on one row.

R7 fires when an adjunct molecule is **already inside the primary blend's components**
(§2, R7). The REPAIR row of §2A then resolves that collision by substituting
`BPC-157 → TB-500` — but TB-500 is itself listed as a REPAIR blend component in that
same row (`BPC-157 · TB-500 · KPV · GHK-Cu`). Applying the substitution therefore
re-triggers the rule it exists to resolve. The doc justifies the choice on mechanism
("different mechanism from BPC-157") while the trigger is molecule presence; the two
do not agree. PERFORM, DEFINE and RESTORE all substitute cleanly out of their blends.

It is **unreachable** under the current tables, which is presumably how it passed
sign-off: an adjunct can only arrive via an R8 cross-lane default (and a secondary lane
is by definition not the primary lane) or via pairs-well-with (none of which is a member
of its own blend). Both routes are pinned by tests in
`tests/unit/engine-constants.test.ts`, so if a future change to a blend composition or an
R8 default makes R7 reachable, the suite reports it rather than letting a duplicate
molecule reach a customer.

Ask whether §2A REPAIR should substitute something outside the blend — NAD+ is the
obvious candidate and is already the REPAIR pairs-well-with. Note this interacts with
discrepancy 1 below: TB-500 is in the REPAIR blend under **both** the two-compound and
four-compound readings, so narrowing the blend does not resolve it.

### Design ↔ spec discrepancies — raise before Phase 5

Three places where the reveal frames disagree with Backend Mapping v2.1. Build what the
design shows, since the client confirmed these frames, but get each one confirmed rather
than assuming the design is a later decision.

1. **REPAIR blend composition.** The card reads `BPC-157 + TB-500 · single vial`. Backend
   Mapping §3 Lane A defines the REPAIR blend as four compounds — BPC-157, TB-500, KPV,
   GHK-Cu. Two versus four changes the blend price and the R7 dedup surface.
2. **The REPAIR pairs-well-with is drawn as "Deep Rest"** (`OPTIONAL · SLEEP`, $65/month),
   a sleep product. Backend Mapping §4A locks REPAIR → **NAD+**, which is cellular energy,
   not sleep. Either a rename or a changed pairing — it matters because §4A is described
   as locked.
3. **Plan selector is a dropdown** defaulting to the 3-month plan. The copy layer specifies
   three side-by-side options (1 / 3 / 6) with 3 marked recommended. The dropdown is the
   newer artefact, so build it, but the running-total behaviour still needs all three prices.

### Prices visible in the design (Recovery lane only)

| Item                        | Price           |
| --------------------------- | --------------- |
| BPC-157 (base, single)      | $225.00 / month |
| REPAIR BLEND (base)         | $340.00 / month |
| TB-500 (adjunct)            | $185.00 / month |
| Deep Rest (pairs-well-with) | $65.00 / month  |
| 3-month plan total          | $289.00 / month |

The $289 total appears on all three shapes, including the single-only reveal where the base
is $225 — placeholder inconsistency in the design rather than a pricing rule. Confirm how the
plan length discounts before wiring the running total.

---

## Phase 0 — Foundation

Next.js + TypeScript + Tailwind v4 + Zod + React Hook Form + Zustand + TanStack Query.
ESLint and Prettier, Vitest, the `lib/{client,server,shared}` structure, repo `CLAUDE.md`,
design tokens in `@theme`.

Depends on: nothing.

**Status: done.** Next 16.3.4 · React 19.2.8 · TypeScript 5.9.3 · Tailwind 4.3.3 ·
Zod 4.6.1 · Vitest 4.1.11 · bun. `bun run verify` (lint + typegen + `tsc --noEmit` +
tests) and `bun run build` both pass.

Notes for later phases:

- **TypeScript is pinned to 5.9.3 deliberately.** 7.x is `latest`, but
  `typescript-eslint` peers `<6.1.0` — upgrading silently breaks typed linting.
- **`bun run typecheck` runs `next typegen` first.** Next 16 generates `LayoutProps` /
  `PageProps` into `.next/types`, so a bare `tsc --noEmit` fails on a clean checkout.
- **Next 16 is newer than the assistant's training data.** Version-accurate docs ship
  inside the package at `node_modules/next/dist/docs/` — read them before using an
  unfamiliar API. `next dev` maintains a block in `CLAUDE.md` saying so; leave it there,
  it re-creates itself.
- **`@theme` values are all placeholders** pending Figma. Every one is marked
  `/* PLACEHOLDER */` in `styles/globals.css`, so the Phase 4 sweep is a grep. The
  typeface is a placeholder too, isolated to one `next/font` call in `app/layout.tsx`.
- **The app commits to one visual world** rather than following the OS theme — the
  reveal's dark band and cream protocol cards are two surfaces in one page, not two
  themes. `background`/`surface` are the maroon side, `card` the cream side.
- `app/page.tsx` is a placeholder that renders a swatch of every colour token. It exists
  so a broken token pipeline is visible rather than silent; Phase 3/4 replaces it.
- **jsx-a11y interaction rules are enabled**, unlike the reference repo. That is what
  keeps Phase 4's option cards real radio/checkbox inputs rather than divs with onClick.

## Phase 1 — Domain and engine

Answer types and enums · lookup tables for lanes, blends, R7 substitutions, R8 defaults,
pairings · formulary clearance filter · Zod schemas · the resolver
(lane → box count → qualifier → shape → R7 dedup → pairs-well-with → read variant).

Tests are the Backend Mapping §7 matrix: all eighteen paths, each asserting the rules fired
and the assembled output. Plus a guard asserting R7 never fires under the current tables —
if a future change to R8 defaults or blend composition introduces a collision, that test
reports it rather than letting a duplicate molecule reach a customer.

Depends on: nothing. Server-side only — the answer-to-compound mapping never reaches the browser.

**Status: done.** 79 tests green; `bun run verify` and `bun run build` pass.

- `lib/server/services/engine/` — `engine.service.ts` (entry), `lane-resolution.ts` (§3),
  `assembly.ts` (§4 + R3–R8), `read-variant.ts` (§5).
- `lib/server/validations/quiz.schema.ts` — Zod, discriminated on lane.
- The mapping tables **moved** from `lib/shared/constants/` to `lib/server/constants/`.
  They are answer→compound mappings, which is the thing that must not reach the browser;
  leaving them in `shared` made the boundary a convention rather than a fact. Every engine
  module now imports `server-only`, so a client component importing one **fails the build**
  — verified by deliberately doing it. Types stay in `lib/shared/`: a string union is not a
  promotional claim, and the reveal needs them.
- Tests: the §7 eighteen-path matrix, lane edge cases, read-variant selection and
  precedence, schema validation, and an **exhaustive sweep of all 57,600 valid answer
  combinations** asserting §7A's claims — every path resolves, no duplicate molecule in a
  stack, never two blends, no GLP-1 inside a blend, exactly one read.
- Vitest needs `ssr.resolve.conditions: ['react-server', …]` so `server-only` resolves to
  its empty module in tests. Without it every engine test fails at import.

Two rules are implemented but unreachable, both pinned dead by test so that a future
change reports itself rather than quietly coming alive: **R7** (see §2A defect above) and
**Lane C's "2+ boxes" row**, which cannot fire while the pinch test stays single-select.

`QuizAnswers` keeps `discriminator` and `qualifier` as flat unions rather than a
discriminated union, so a half-finished quiz stays expressible while the customer is
answering it. The cost is that cross-lane mismatches are not a compile error, which is
exactly why the Zod schema is discriminated — and why a type-level guard in
`quiz.schema.ts` fails the typecheck if the two ever drift apart.

## Phase 2 — Content layer

Typed content schema and the real transcribed copy for all fifteen screens, the education
screens, the recognition lines and the ten reveal read variants.

Depends on: nothing.

## Phase 3 — Flow and state

Quiz state machine and branch routing · Zustand store · React Hook Form on the three input
screens · TanStack Query mutations · session persistence · API routes.

Depends on: Phases 1–2.

## Phase 4 — Screens

`ScreenShell`, `OptionCard`, `OptionGroup`, `ProgressHeader`, `RecognitionLine`,
`EducationPanel`, `TextField`, `PrimaryButton`. Then the fifteen screens.

Option cards are real radio and checkbox inputs styled with `peer-checked:`, not divs
tracking state — keyboard and screen-reader behaviour comes free that way.

Depends on: Phase 0 tokens.

## Phase 5 — Reveal

`ProtocolCard`, `BenefitChip`, `PlanSelector`, `StickyFooter`. Standard and recommend-less
templates, running total, conditional supporting and pairs-well-with cards, swap/remove.

Depends on: Phase 4, price table.

## Phase 6 — Ship

Mobile QA on device, accessibility pass, deploy.

---

## Working agreement

One phase at a time, reviewed before the next begins.
