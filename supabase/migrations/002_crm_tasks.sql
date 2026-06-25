-- ============================================================
-- Tasks module: lead pipeline mirror tables.
-- Provider-agnostic: every external row carries (provider, external_id)
-- so GHL rows today and Carisma Soft rows later can coexist.
-- ============================================================

-- Unified contact: the person. Join key across Chat + Tasks.
create table if not exists crm_contacts (
  id          uuid primary key default gen_random_uuid(),
  provider    text not null default 'ghl',
  external_id text not null,
  brand_id    text references crm_brands(id),
  name        text,
  phone       text,
  email       text,
  source      text,
  tags        text[] default '{}',
  created_at  timestamptz default now(),
  unique (provider, external_id)
);
create index if not exists crm_contacts_brand_id_idx on crm_contacts(brand_id);

-- Pipeline stages, mirrored from each brand's GHL pipeline.
create table if not exists crm_pipeline_stages (
  id                   uuid primary key default gen_random_uuid(),
  provider             text not null default 'ghl',
  external_id          text not null,
  brand_id             text references crm_brands(id),
  pipeline_external_id text not null,
  name                 text not null,
  position             int not null default 0,
  is_won               boolean default false,
  is_lost              boolean default false,
  unique (provider, external_id)
);
create index if not exists crm_pipeline_stages_brand_id_idx on crm_pipeline_stages(brand_id);

-- Lead: the card. Mirror of a GHL opportunity.
create table if not exists crm_leads (
  id                  uuid primary key default gen_random_uuid(),
  provider            text not null default 'ghl',
  external_id         text not null,
  brand_id            text references crm_brands(id),
  contact_id          uuid references crm_contacts(id),
  name                text,
  monetary_value      numeric default 0,
  status              text not null default 'open' check (status in ('open','won','lost','abandoned')),
  stage_id            uuid references crm_pipeline_stages(id),
  source              text,
  assigned_agent_id   uuid references crm_agents(id),
  lead_score          numeric default 0,
  first_contacted_at  timestamptz,
  sla_due_at          timestamptz,
  external_created_at timestamptz,
  last_activity_at    timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now(),
  unique (provider, external_id)
);
create index if not exists crm_leads_queue_idx on crm_leads(brand_id, status, lead_score desc);
create index if not exists crm_leads_assignee_idx on crm_leads(assigned_agent_id, status);

-- Lead activity timeline.
create table if not exists crm_lead_activities (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references crm_leads(id) on delete cascade,
  agent_id   uuid references crm_agents(id),
  type       text not null check (type in ('call','note','stage_change','assignment','status_change','system')),
  body       text,
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists crm_lead_activities_lead_id_idx on crm_lead_activities(lead_id, created_at desc);

-- Link existing Chat conversations to the unified contact.
alter table crm_conversations add column if not exists contact_id uuid references crm_contacts(id);

-- Task-module XP events reuse crm_xp_events but may reference a lead.
alter table crm_xp_events add column if not exists lead_id uuid references crm_leads(id);

-- Realtime for the queue + timeline.
alter publication supabase_realtime add table crm_leads;
alter publication supabase_realtime add table crm_lead_activities;

-- RLS, matching the existing conversations/messages style.
alter table crm_contacts        enable row level security;
alter table crm_pipeline_stages enable row level security;
alter table crm_leads           enable row level security;
alter table crm_lead_activities enable row level security;

create policy "Authenticated agents can read contacts"
  on crm_contacts for select using (auth.role() = 'authenticated');
create policy "Authenticated agents can read stages"
  on crm_pipeline_stages for select using (auth.role() = 'authenticated');

create policy "Authenticated agents can read leads"
  on crm_leads for select using (auth.role() = 'authenticated');
create policy "Authenticated agents can update leads"
  on crm_leads for update using (auth.role() = 'authenticated');

create policy "Authenticated agents can read lead activities"
  on crm_lead_activities for select using (auth.role() = 'authenticated');
create policy "Authenticated agents can insert lead activities"
  on crm_lead_activities for insert with check (auth.role() = 'authenticated');

create policy "Service role full access contacts"
  on crm_contacts for all using (auth.role() = 'service_role');
create policy "Service role full access stages"
  on crm_pipeline_stages for all using (auth.role() = 'service_role');
create policy "Service role full access leads"
  on crm_leads for all using (auth.role() = 'service_role');
create policy "Service role full access lead activities"
  on crm_lead_activities for all using (auth.role() = 'service_role');
