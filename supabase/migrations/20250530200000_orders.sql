-- Storefront orders (saved after successful payment)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users on delete set null,
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text,
  status text not null default 'processing'
    check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null default 0,
  tax numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  currency text not null default 'usd',
  payment_provider text not null default 'stripe',
  stripe_session_id text unique,
  paystack_reference text unique,
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  product_name text not null,
  product_slug text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_email_idx on public.orders (email);
create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_stripe_session_id_idx on public.orders (stripe_session_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (
    auth.uid() = user_id
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
      and (
        o.user_id = auth.uid()
        or lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
    )
  );
