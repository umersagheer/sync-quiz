# SYNC Quiz — project conventions

Standalone Next.js app implementing the SYNC personalisation quiz and reveal.
Built as a working demo for the client pitch; it will later be integrated into
SYNC's existing site. See `docs/BUILD_PLAN.md` for scope, phases and the
reference material.

Conventions here follow SoftAims' internal reference repo so the work ports
cleanly. Where this repo deliberately differs, the reason is stated.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5.9 · Tailwind CSS v4 ·
Zod 4 · React Hook Form · Zustand · TanStack Query · Vitest 4 · bun.

No component library. No CMS — quiz copy is typed content in-repo.

TypeScript is pinned to 5.9.3 on purpose: 7.x is `latest`, but
`typescript-eslint` peers `<6.1.0`, so upgrading silently breaks typed linting.

## Structure

```
app/            App Router. Server Components by default.
lib/client/     Browser-only: stores, queries, client services, form schemas
lib/server/     Server-only: the engine, services, request validation
lib/shared/     Types, constants, utils used by both sides
styles/         globals.css — the @theme token block
tests/          Vitest. Not co-located.
docs/           BUILD_PLAN.md and the client's reference material
```

`@/*` maps to the repo root. There is no `src/`.

**The `lib/client` / `lib/server` split is load-bearing, not organisational.**
The answer-to-compound mapping must never reach the browser bundle — SYNC is a
503A compounding operation and that mapping is a promotional claim about
unapproved drugs. The engine lives in `lib/server/`; only its _output_ types
live in `lib/shared/`.

## Naming

- `resource.usecase.ts` — `quiz.types.ts`, `engine.constants.ts`,
  `reveal.schema.ts`, `engine.service.ts`
- Hooks are camelCase: `useQuizFlow.ts`
- Components are PascalCase: `OptionCard.tsx`
- Tests are kebab-case, named for the behaviour: `r7-dedup.test.ts`

## Patterns

**Functional object exports, never classes.**

```ts
export const engineService = {
  resolve: (answers: QuizAnswers): EngineResult => { … },
}
```

**Lookup tables, not switch statements.** Type them as exhaustive
`Record<Union, T>` so adding a lane or a shape is a compile error until every
table is updated.

**Shared types are the single source of truth.** String unions, not TS `enum`.
No duplicating a type across client and server.

**No controller layer.** A route handler validates with Zod and calls the
engine or service directly. Four endpoints do not need the extra hop.

**Zod splits by side** — `lib/server/validations/*.schema.ts` for requests,
`lib/client/validations/*-form.schema.ts` for forms. React Hook Form uses
`Controller`, `mode: 'onSubmit'`, `reValidateMode: 'onChange'`.

**Query keys are factories:** `X_QUERY_KEYS = { all, lists(), details(), detail(id) }`.

**Zustand stores** are `interface XState` with State / Actions / Helpers
sections, exported as `useXStore`.

**Imports are ordered** type-first, then by distance, with blank lines between
groups. ESLint autofixes this — it is why files open with an `import type` block.

**Comments are for the non-obvious.** No narrating what the code already says;
do explain a decision that would otherwise look wrong.

**YAGNI.** This ports into someone else's repo. Build what the phase needs;
don't build abstraction for scale this app will never reach on its own.

## UI

Read `figma-to-code-react` (skill) before building any screen. The rules that
bite most here:

- Layout is flow / flex / grid reconstructed from Auto Layout. Absolute
  positioning only for genuine overlaps and sticky elements.
- The frames are drawn at 390px. Build fluid with `max-w-*`, not `w-[390px]`.
- **Every design value goes through `@theme` in `styles/globals.css`.** No hex
  in a component, no `bg-[#2a0e14]`. Semantic token names only.
- Real semantic HTML. Option cards are a `<label>` wrapping a visually-hidden
  `<input type="radio">` styled with `peer-checked:` — not a `<div>` tracking
  state. Keyboard and screen-reader behaviour come free that way.
- `jsx-a11y` lint rules are **on** here, unlike the reference repo. That is
  deliberate and they should stay on.

Compose conditional classes with `cn()` from `@/lib/shared/utils/cn`.

### Design tokens are placeholders

Every value in the `@theme` block is marked `/* PLACEHOLDER */`. The Figma file
was unreachable when the foundation was built (View seat, MCP tool-call limit).
Before building the reveal, run `get_variable_defs` on node `1:772` of file
`kxBzmwCi8NCZR69YeybQOm` and sweep the markers. The typeface is a placeholder
too — `next/font` keeps it to one declaration in `app/layout.tsx`.

The app commits to one visual world rather than following the OS theme: the
reveal opens on a dark maroon band and fades to cream protocol cards in the same
page, so `background`/`surface` and `card` are two surfaces, not two themes.

## Commands

```
bun run dev        # dev server
bun run verify     # lint + tsc --noEmit + test — run this before calling work done
bun run test       # vitest
bun run format     # prettier, including Tailwind class sorting
```

## Working agreement

Research → Understand → Propose → Implement. Don't implement before the approach
is agreed. One phase of `docs/BUILD_PLAN.md` at a time, reviewed before the next
begins.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
