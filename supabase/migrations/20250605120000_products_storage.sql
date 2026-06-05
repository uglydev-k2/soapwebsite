-- Public bucket for product images (admin uploads via Supabase client)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products',
  'products',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can view product images
create policy "Product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'products');

-- Allow uploads to products bucket (anon key from admin UI)
create policy "Allow uploads to products bucket"
  on storage.objects for insert
  with check (bucket_id = 'products');
