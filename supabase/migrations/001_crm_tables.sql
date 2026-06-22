-- Brands
create table if not exists crm_brands (
  id text primary key,
  name text not null,
  ghl_location_id text,
  gmail_account text,
  color_hex text
);

-- Seed brands
insert into crm_brands (id, name, ghl_location_id, color_hex) values
  ('spa',        'Carisma Spa',        null, '#96B2B2'),
  ('slimming',   'Carisma Slimming',   null, '#024C27'),
  ('aesthetics', 'Carisma Aesthetics', null, '#9B8D83')
on conflict (id) do nothing;

-- Agents (linked to Supabase Auth users)
create table if not exists crm_agents (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  assigned_brands text[] default '{}',
  xp int default 0,
  level text default 'Rookie',
  current_streak int default 0,
  longest_streak int default 0,
  last_active_date date
);

-- Conversations
create table if not exists crm_conversations (
  id uuid primary key default gen_random_uuid(),
  brand_id text references crm_brands(id),
  channel text not null check (channel in ('whatsapp','instagram','facebook','gmail')),
  contact_name text,
  contact_identifier text,
  ghl_conversation_id text unique,
  gmail_thread_id text unique,
  status text default 'open' check (status in ('open','pending','closed')),
  unread_count int default 0,
  last_message_at timestamptz,
  waiting_since timestamptz,
  created_at timestamptz default now()
);

create index if not exists crm_conversations_brand_id_idx on crm_conversations(brand_id);
create index if not exists crm_conversations_status_idx on crm_conversations(status);
create index if not exists crm_conversations_last_message_at_idx on crm_conversations(last_message_at desc);

-- Messages
create table if not exists crm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references crm_conversations(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  body text not null,
  sent_at timestamptz default now(),
  sender_name text,
  agent_id uuid references crm_agents(id),
  response_time_ms int,
  channel_metadata jsonb default '{}'
);

create index if not exists crm_messages_conversation_id_idx on crm_messages(conversation_id);
create index if not exists crm_messages_sent_at_idx on crm_messages(sent_at desc);

-- XP events
create table if not exists crm_xp_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references crm_agents(id) on delete cascade,
  event_type text not null,
  xp_earned int not null,
  conversation_id uuid references crm_conversations(id),
  created_at timestamptz default now()
);

-- Enable Realtime on messages and conversations
alter publication supabase_realtime add table crm_messages;
alter publication supabase_realtime add table crm_conversations;

-- RLS policies
alter table crm_conversations enable row level security;
alter table crm_messages enable row level security;
alter table crm_agents enable row level security;
alter table crm_xp_events enable row level security;

create policy "Authenticated agents can read conversations"
  on crm_conversations for select using (auth.role() = 'authenticated');
create policy "Authenticated agents can insert conversations"
  on crm_conversations for insert with check (auth.role() = 'authenticated');
create policy "Authenticated agents can update conversations"
  on crm_conversations for update using (auth.role() = 'authenticated');

create policy "Authenticated agents can read messages"
  on crm_messages for select using (auth.role() = 'authenticated');
create policy "Authenticated agents can insert messages"
  on crm_messages for insert with check (auth.role() = 'authenticated');

create policy "Agents can read own profile"
  on crm_agents for select using (auth.uid() = id);
create policy "Agents can update own profile"
  on crm_agents for update using (auth.uid() = id);

create policy "Agents can read xp events"
  on crm_xp_events for select using (auth.uid() = agent_id);

create policy "Service role can do everything on conversations"
  on crm_conversations for all using (auth.role() = 'service_role');
create policy "Service role can do everything on messages"
  on crm_messages for all using (auth.role() = 'service_role');
create policy "Service role can do everything on agents"
  on crm_agents for all using (auth.role() = 'service_role');
create policy "Service role can do everything on xp"
  on crm_xp_events for all using (auth.role() = 'service_role');
