# Carisma CRM — GHL Interface Replication (Design)

**Goal:** Make the Carisma CRM feel like GoHighLevel — adopt GHL's module **layouts, left-rail navigation, and information architecture** — while keeping the Carisma visual identity (forest/sage/beige palette, Novecento/Trajan fonts, glass surfaces, pill radii). Familiar GHL structure, on-brand polish.

**Scope (approved):** three modules — **Conversations** (restyle existing Chat), **Opportunities** (new Kanban, absorbs the existing Tasks queue), **Contacts** (new). Visual approach: *GHL layout, Carisma skin*.

**Stack:** existing carisma-crm app (Next.js 15/16, Tailwind, shadcn/ui, Supabase, Supabase Realtime, Framer Motion). Drag-and-drop for Kanban: `@dnd-kit/core` + `@dnd-kit/sortable`.

---

## 1. Navigation — left icon-rail (replaces top-bar module switcher)

GHL's signature vertical rail, Carisma-skinned.
- Rail: ~64px collapsed, expands to ~220px on hover; deep-forest→sage gradient; Carisma leaf logo at top; agent avatar + XP/level at bottom.
- Items (lucide icon + Novecento label): **Conversations** (`MessageCircle`), **Opportunities** (`Kanban`/`Target`), **Contacts** (`Users`). Active = light-sage pill highlight + left accent bar.
- Top bar slims to: **brand filter** (All / Spa / Slimming / Aesthetics) · global **search** · theme toggle.
- Gate behind existing `TASKS_ENABLED`-style flags; brand filter state shared across modules (URL `?brand=`).
- New component `components/shell/AppRail.tsx`; refactor `(inbox)` + `(tasks)` + new `(contacts)` to share a single shell layout that renders the rail + top bar. Routes: `/` → Conversations, `/opportunities`, `/contacts`. (Keep `/tasks` as a redirect to `/opportunities` for back-compat.)

## 2. Conversations — GHL 3-pane (restyle existing Chat)

Today: list + thread (2-pane). Add GHL's **right contact panel**.
- Pane 1: conversation list (reuse `ConversationList`, restyle to GHL density).
- Pane 2: message thread (reuse `ThreadPane` + `ReplyBox` + AI draft + gamification).
- Pane 3 (**new**) `components/conversations/ContactPanel.tsx`: contact name, phone, email, tags, source, and **quick links to that contact's Opportunities** (unified contact via `crm_conversations.contact_id`). Collapsible.
- Data: extend `/api/conversations/[id]` (or the panel fetches `/api/contacts/[id]`) to include the linked contact + their opportunities.

## 3. Opportunities — Kanban board (absorbs Tasks)

Becomes the default view of the lead pipeline.
- **Board view (default):** columns = `crm_pipeline_stages` for the selected brand, ordered by `position`; cards = `crm_leads` (name, €value, source, owner avatar, 🔥 hot/SLA badge). `@dnd-kit` drag between columns → existing `PATCH /api/leads/[id]/stage` (writes through to GHL + mirror + activity + XP). Optimistic move with rollback on error.
- **Pipeline selector:** brands have multiple GHL pipelines (e.g. Spa "Call Pipeline" + "Chat Pipeline"); a dropdown picks the pipeline; columns = that pipeline's stages. Persist choice per brand.
- **List ⇄ Board toggle:** "List" reuses the existing prioritized queue (`LeadQueue`); the queue covers the **All-brands** case (board needs a single brand since stages are per-brand).
- Card click → existing `LeadDetailPane` rendered as a **slide-over drawer** (not a separate route).
- New: `components/opportunities/KanbanBoard.tsx`, `KanbanColumn.tsx`, `OpportunityCard.tsx`, `PipelineSelector.tsx`, `hooks/usePipelines.ts` (+ `GET /api/pipelines?brand=` reading `crm_pipeline_stages`).

## 4. Contacts — smart-list table + detail drawer (new)

- **Table** `components/contacts/ContactsTable.tsx`: checkbox · Name · Phone · Email · Tags · Source · Brand · Created. Sortable headers, search (name/phone/email), filters (brand, tag, source), pagination (page size 50). Data from `crm_contacts` (256+).
- **Detail drawer** `components/contacts/ContactDrawer.tsx` (slide-over) with tabs:
  - **Overview** — fields + tags + source + brand.
  - **Conversations** — the contact's chat threads (`crm_conversations WHERE contact_id`), deep-link into Conversations module.
  - **Opportunities** — the contact's leads (`crm_leads WHERE contact_id`), deep-link into Opportunities.
  This is the unified contact fully realized.
- Bulk actions: row selection scaffolding only for v1 (tag/assign deferred — YAGNI).
- New routes: `GET /api/contacts` (filters + pagination, auth-gated, ordered by created desc) and `GET /api/contacts/[id]` (contact + conversations + opportunities). New hooks `useContacts`, `useContact`.

## 5. Visual system

GHL *structure* in Carisma *tokens*:
- Primary accent: GHL-blue → Carisma **sage/forest** (`#4F7373` / `#024C27`).
- Surfaces: glass panes + `--r-card`/`--r-pill` radii; tables get GHL-like density but Carisma row styling.
- Eyebrows/labels: Novecento Wide; headings: Trajan; body: Roboto.
- Reuse existing `app/globals.css` tokens; add table + kanban-card utility classes only as needed.

---

## Reuse vs new

**Reused as-is:** `crm_leads` / `crm_contacts` / `crm_pipeline_stages` data, `/api/leads/*` (incl. stage-drag PATCH), `useLeads` / `LeadDetailPane` / gamification, conversations data + realtime.

**New build:** left rail + shared shell; Kanban board + `@dnd-kit`; pipeline selector + `/api/pipelines`; contacts table + detail drawer + `/api/contacts` + `/api/contacts/[id]`; conversation contact-panel; `/opportunities` + `/contacts` route groups; `/tasks`→`/opportunities` redirect.

## Decisions

- Opportunities **absorbs** Tasks (Board default + List toggle) — one pipeline module, not two.
- Contact detail = **slide-over drawer**, not a full page (fast, GHL quick-view feel).
- Board is **single-brand** (stages are per-brand); All-brands uses List view.
- DnD library: **@dnd-kit** (accessible, modern, well-maintained).

## Non-goals (v1)

Payments, Automation/Workflows, Calendars, Reputation, Sites, full bulk-action engine, multi-pipeline drag across pipelines.

## Testing / verification

- Vitest for new pure logic (pipeline/stage grouping, contact filtering).
- Runtime verification (`verify` skill) on the deployed app: rail navigation; Conversations 3-pane + contact panel; Opportunities board renders real stages/cards, drag moves a card and round-trips to GHL; Contacts table + drawer shows unified conversations/opportunities.
- Modularity gate unchanged: no `lib/ghl` imports outside the provider boundary.
