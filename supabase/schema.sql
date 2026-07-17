-- Run this entire file in the Supabase SQL Editor (New query → paste → Run).

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task text not null,
  is_complete boolean not null default false,
  created_at timestamp with time zone not null default now()
);

-- Allow the API roles to use the table (RLS still restricts row access)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on table public.todos to authenticated;

-- Enable Row Level Security
alter table public.todos enable row level security;

-- Recreate policies so this script is safe to run more than once
drop policy if exists "Users can select their own todos" on public.todos;
drop policy if exists "Users can insert their own todos" on public.todos;
drop policy if exists "Users can update their own todos" on public.todos;
drop policy if exists "Users can delete their own todos" on public.todos;

create policy "Users can select their own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on public.todos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);
