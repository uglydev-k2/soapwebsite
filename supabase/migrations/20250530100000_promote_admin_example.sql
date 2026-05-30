-- Promote a Supabase user to admin (run in Supabase SQL Editor)
-- Replace the email with the user's address.

-- Standard admin access:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'user@example.com';

-- Full super admin access:
-- UPDATE public.profiles SET role = 'superadmin' WHERE email = 'user@example.com';

-- Verify:
-- SELECT id, email, role FROM public.profiles WHERE role IN ('admin', 'superadmin');
