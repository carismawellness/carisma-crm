# Carisma CRM — GHL Interface Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (or a Workflow) to implement this plan task-by-task with QC.

**Goal:** Give the carisma-crm app GoHighLevel's module layouts + left-rail nav (Conversations 3-pane, Opportunities Kanban, Contacts table+drawer) in the Carisma skin.

**Architecture:** Reuse all existing data/routes/hooks. Add a shared shell with a left icon-rail; restructure routes to `/` (Conversations), `/opportunities`, `/contacts`. New UI: @dnd-kit Kanban (drives the existing `PATCH /api/leads/[id]/stage`), contacts smart-list + detail drawer, conversation contact-panel. 3 small new read routes.

**Tech Stack:** Next.js 15/16 (App Router), Tailwind + shadcn/ui, Supabase + Realtime, Framer Motion, **@dnd-kit/core + @dnd-kit/sortable** (new), Vitest.

**Design doc:** `docs/plans/2026-06-25-carisma-crm-ghl-interface-design.md`

**Conventions (match exactly):** read sibling files before writing; read `node_modules/next/dist/docs/` before route/page work (per AGENTS.md); auth via `createClient()`/`getUser`; service writes via `createServiceClient()`; brand config from `@/lib/constants`; domain types from `@/types`; **no `lib/ghl` imports outside the provider boundary**; styling tokens from `app/globals.css` (forest/sage/beige, Novecento/Trajan, `.glass`, `.eyebrow`, `--r-card`, `--r-pill`).

---

## Phase 1 — Foundation (sequential; lock contracts first)

### Task 1: Add @dnd-kit + read routes

**Files:**
- Modify: `package.json` (add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- Create: `app/api/pipelines/route.ts`, `app/api/contacts/route.ts`, `app/api/contacts/[id]/route.ts`

**Steps:**
1. `npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
2. `GET /api/pipelines?brand=<id>` — auth-gated; return `crm_pipeline_stages` for the brand grouped by `pipeline_external_id`: `{ pipelines: [{ pipelineId, stages: PipelineStage[] (ordered by position) }] }`.
3. `GET /api/contacts` — auth-gated; query params `brand_id?`, `q?` (ilike name/phone/email), `tag?`, `source?`, `page?` (size 50); order `created_at desc`; return `{ contacts: Contact[], total }` (use `count: 'exact'`).
4. `GET /api/contacts/[id]` — auth-gated; return `{ contact, conversations: Conversation[] (WHERE contact_id), opportunities: LeadWithContact[] (crm_leads WHERE contact_id, +stage) }`. Use the `Promise<{id}>` params pattern.
5. Verify each route: `curl` localhost or check 401 unauth. tsc clean.
6. Commit: `feat(crm): add @dnd-kit + pipelines/contacts read routes`.

### Task 2: Shared shell + left icon-rail + route restructure

**Files:**
- Create: `components/shell/AppRail.tsx`, `components/shell/AppShell.tsx`, `app/(app)/layout.tsx`
- Move: `app/(inbox)/page.tsx` → `app/(app)/page.tsx` (Conversations at `/`); create `app/(app)/opportunities/page.tsx`, `app/(app)/contacts/page.tsx`
- Create: `app/tasks/page.tsx` (redirect → `/opportunities`)
- Modify: `components/inbox/TopNav.tsx` (strip module switcher; keep brand filter + agent info, render inside the shell top bar)

**Steps:**
1. Read `app/(inbox)/layout.tsx` + `page.tsx` + `TopNav.tsx` + `Sidebar.tsx` first.
2. `AppRail.tsx`: vertical rail (collapsed 64px → hover 220px), forest→sage gradient, Carisma leaf logo top, items Conversations(`/`)/Opportunities(`/opportunities`)/Contacts(`/contacts`) with lucide icons + Novecento labels, active pill via `usePathname`, agent avatar+XP bottom (reuse `/api/agents/me`).
3. `AppShell.tsx`: flex row — `AppRail` + (top bar with brand filter/search/theme + `{children}`). Brand filter persists to URL `?brand=`.
4. `(app)/layout.tsx`: auth gate (mirror old inbox layout) + `AppShell`.
5. Wire the three pages; `/tasks` redirects.
6. Verify: build passes; rail navigates between the 3 routes; brand filter survives nav.
7. Commit: `feat(crm): GHL-style left rail + shared shell + route restructure`.

---

## Phase 2 — Modules (parallelizable; distinct file sets)

### Task 3: Opportunities — Kanban board (absorbs Tasks)

**Files:**
- Create: `components/opportunities/KanbanBoard.tsx`, `KanbanColumn.tsx`, `OpportunityCard.tsx`, `PipelineSelector.tsx`, `ViewToggle.tsx`
- Create: `hooks/usePipelines.ts`
- Modify: `app/(app)/opportunities/page.tsx` (Board default + List toggle; List reuses existing `LeadQueue`; card/drawer reuses `LeadDetailPane`)

**Steps:**
1. Read `hooks/useLeads.ts`, `components/tasks/LeadQueue.tsx`, `LeadRow.tsx`, `LeadDetailPane.tsx`, `app/api/leads/[id]/stage/route.ts`.
2. `usePipelines(brandId)` → `/api/pipelines`; expose pipelines+stages; default to first pipeline.
3. `KanbanBoard`: `DndContext`; one `KanbanColumn` per stage (ordered); fetch leads via `useLeads({brandId, status:'open'})` and group by `stage_id`. Horizontal scroll columns.
4. `OpportunityCard`: name, €value, source, owner avatar, 🔥 badge (reuse temperature logic); `useSortable`. Click → open `LeadDetailPane` in a slide-over (Framer Motion).
5. On drag end: optimistic move card to new column, call `PATCH /api/leads/[id]/stage { stageId }`; rollback + toast on error.
6. `PipelineSelector` (dropdown) + `ViewToggle` (Board ⇄ List). Board requires a single brand; if brand=All, force List and show a hint.
7. Carisma skin: glass columns, Novecento column headers w/ count, pill cards.
8. Verify (runtime): board shows real stages+cards for a brand; dragging a card persists + round-trips to GHL (check mirror `stage_id`); List toggle works; card opens detail.
9. Commit: `feat(opportunities): GHL kanban board + pipeline selector + list toggle`.

### Task 4: Contacts — table + detail drawer

**Files:**
- Create: `components/contacts/ContactsTable.tsx`, `ContactRow.tsx`, `ContactDrawer.tsx`, `ContactFilters.tsx`
- Create: `hooks/useContacts.ts`, `hooks/useContact.ts`
- Modify: `app/(app)/contacts/page.tsx`

**Steps:**
1. Read `app/api/conversations/route.ts` (list pattern), `components/inbox/ConversationRow.tsx` (row styling).
2. `useContacts({brandId,q,tag,source,page})` → `/api/contacts`; `useContact(id)` → `/api/contacts/[id]`.
3. `ContactsTable`: sticky header (checkbox · Name · Phone · Email · Tags · Source · Brand · Created), rows from `useContacts`, search input (debounced), `ContactFilters` (brand/tag/source), pagination (50/page). Carisma-dense styling.
4. `ContactDrawer` (slide-over) opened on row click: tabs **Overview / Conversations / Opportunities** from `useContact`; Conversations deep-link to `/?c=<convId>`, Opportunities deep-link to `/opportunities`.
5. Row selection checkboxes wired to local state (bulk actions deferred — show a disabled "Actions" affordance).
6. Verify (runtime): table lists real contacts, search/filter/paginate work; drawer shows a contact's unified conversations + opportunities.
7. Commit: `feat(contacts): GHL smart-list table + unified detail drawer`.

### Task 5: Conversations — 3-pane + contact panel

**Files:**
- Create: `components/conversations/ContactPanel.tsx`
- Modify: `app/(app)/page.tsx` (add the right pane), restyle `ConversationList`/`ThreadPane` density lightly to GHL feel

**Steps:**
1. Read `app/(app)/page.tsx` (moved inbox shell), `ThreadPane.tsx`, `hooks/useMessages.ts`.
2. `ContactPanel`: given the selected conversation's `contact_id`, fetch `/api/contacts/[id]`; show name/phone/email/tags/source + a compact list of the contact's Opportunities (deep-link). Collapsible; hidden when no contact linked.
3. Add as the right pane (third column) in the Conversations layout; keep thread + ReplyBox + AI draft + gamification intact.
4. Verify (runtime): opening a conversation whose contact has a lead shows the contact panel with that opportunity; AI draft/send still work.
5. Commit: `feat(conversations): GHL 3-pane with contact panel`.

---

## Phase 3 — Integration, QC, verify

### Task 6: Cross-module wiring + polish
- Deep-links resolve (Contacts→Conversations `?c=`, Contacts/Conversations→Opportunities). Brand filter consistent across modules. Empty/loading/error states on every new surface. Mobile: rail collapses; panes stack acceptably.
- Commit: `feat(crm): cross-module deep-links + states polish`.

### Task 7: QC + verification
- **Spec-compliance + code-quality QC** per module (subagents).
- **Modularity gate:** `grep -rn "lib/ghl" app components hooks lib/leads` → only `providers/ghl.ts` + `mapping.ts`.
- `npx tsc --noEmit` clean; `npm run build` passes; vitest green.
- **Runtime verify (`verify` skill)** on deployed app: rail nav; Conversations 3-pane+panel; Opportunities board drag→GHL round-trip; Contacts table+drawer unified tabs. Capture screenshots.
- Merge to `main`; confirm Vercel deploy via `gh api`/`vercel inspect`.

---

## Testing notes
- Pure logic (stage grouping in KanbanBoard, contact filter param building) → small Vitest specs.
- UI correctness → runtime verification, not unit tests.
- Drag-and-drop: verify the **persisted** result (mirror `stage_id` + GHL), not just the local optimistic move.

## YAGNI / non-goals
Payments, Automation, Calendars, Reputation, Sites, real bulk-action engine, cross-pipeline drag, contact create/edit forms (read-first v1).
