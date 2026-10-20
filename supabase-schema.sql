-- CKAVOX DATABASE SCHEMA
-- Run this in the Supabase SQL Editor.

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text,
    role text not null default 'user'
        check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);

create table if not exists public.content (
    id uuid primary key default gen_random_uuid(),

    type text not null check (
        type in ('movie', 'music', 'news', 'showbiz', 'sports', 'photo')
    ),

    title text not null,
    category text not null,
    description text,

    image_url text,
    media_url text,
    external_url text,

    is_published boolean not null default false,
    featured boolean not null default false,

    created_by uuid references public.profiles(id) on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id) on delete cascade,

    content_id uuid not null
        references public.content(id) on delete cascade,

    created_at timestamptz not null default now(),

    unique(user_id, content_id)
);

create table if not exists public.content_events (
    id bigint generated always as identity primary key,

    content_id uuid
        references public.content(id) on delete set null,

    user_id uuid
        references public.profiles(id) on delete set null,

    event_type text not null check (
        event_type in ('view', 'play', 'download')
    ),

    created_at timestamptz not null default now()
);

-- Create a profile automatically when a user registers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.profiles (id, email, role)
    values (new.id, new.email, 'user');

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Admin checker. Role is read from the protected profiles table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.profiles
        where id = (select auth.uid())
          and role = 'admin'
    );
$$;

grant execute on function public.is_admin() to authenticated;

-- Enable Row Level Security.
alter table public.profiles enable row level security;
alter table public.content enable row level security;
alter table public.favorites enable row level security;
alter table public.content_events enable row level security;

-- Profiles: users can read their own profile; admins can read all.
drop policy if exists "Read own profile or admin" on public.profiles;

create policy "Read own profile or admin"
on public.profiles
for select
to authenticated
using (
    id = (select auth.uid())
    or (select public.is_admin())
);

-- No client policy allows a user to change their role.

-- Published content is visible to visitors.
drop policy if exists "Read published content or admin" on public.content;

create policy "Read published content or admin"
on public.content
for select
to anon, authenticated
using (
    is_published = true
    or (select public.is_admin())
);

-- Only admins can insert content.
drop policy if exists "Admin inserts content" on public.content;

create policy "Admin inserts content"
on public.content
for insert
to authenticated
with check ((select public.is_admin()));

-- Only admins can update content.
drop policy if exists "Admin updates content" on public.content;

create policy "Admin updates content"
on public.content
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Only admins can delete content.
drop policy if exists "Admin deletes content" on public.content;

create policy "Admin deletes content"
on public.content
for delete
to authenticated
using ((select public.is_admin()));

-- Favorites: each user manages their own favorites.
drop policy if exists "Read own favorites" on public.favorites;

create policy "Read own favorites"
on public.favorites
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Add own favorites" on public.favorites;

create policy "Add own favorites"
on public.favorites
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "Delete own favorites" on public.favorites;

create policy "Delete own favorites"
on public.favorites
for delete
to authenticated
using (user_id = (select auth.uid()));

-- Visitors may record an event only for published content.
-- Authenticated users must record their own user ID.
-- Anonymous visitors must submit NULL as user_id.
drop policy if exists "Record content events" on public.content_events;

create policy "Record content events"
on public.content_events
for insert
to anon, authenticated
with check (
    (
        user_id is null
        and exists (
            select 1
            from public.content
            where content.id = content_events.content_id
              and content.is_published = true
        )
    )
    or
    (
        user_id = (select auth.uid())
        and exists (
            select 1
            from public.content
            where content.id = content_events.content_id
              and content.is_published = true
        )
    )
);

-- Only admins can read analytics events.
drop policy if exists "Admin reads events" on public.content_events;

create policy "Admin reads events"
on public.content_events
for select
to authenticated
using ((select public.is_admin()));

-- Grant only the required client privileges.
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.content to authenticated;
grant select on public.content to anon;

grant select, insert, delete on public.favorites to authenticated;

grant select, insert on public.content_events to anon, authenticated;
grant usage, select on sequence public.content_events_id_seq
to anon, authenticated;
