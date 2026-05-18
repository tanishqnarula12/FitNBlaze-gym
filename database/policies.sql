-- ====================================================
-- POLICIES: FIT 'N' BLAZE (Row-Level Security)
-- Note: This is an optional placeholder for MVP.
-- If you enable RLS on your tables in Supabase, run these.
-- ====================================================

-- Enable RLS on tables (Uncomment if you want to enforce RLS immediately)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- As we are using a custom login method (Login ID + Phone) instead of Supabase Auth (JWT),
-- standard RLS policies using `auth.uid()` won't work out of the box.
-- For this MVP, backend security relies on the custom authenticate_user function and client-side logic.

-- If you switch to Supabase Auth later, you would add policies like:

/*
CREATE POLICY "Admins can view everything"
ON public.users FOR SELECT
USING ( auth.uid() IN (SELECT id FROM users WHERE role = 'admin') );

CREATE POLICY "Members can view own data"
ON public.members FOR SELECT
USING ( user_id = auth.uid() );
*/

-- To bypass RLS and allow the anon key full access for fast prototyping:
DROP POLICY IF EXISTS "Allow All Public" ON public.users;
CREATE POLICY "Allow All Public" ON public.users FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow All Public" ON public.plans;
CREATE POLICY "Allow All Public" ON public.plans FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow All Public" ON public.members;
CREATE POLICY "Allow All Public" ON public.members FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow All Public" ON public.trainers;
CREATE POLICY "Allow All Public" ON public.trainers FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow All Public" ON public.payments;
CREATE POLICY "Allow All Public" ON public.payments FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow All Public" ON public.progress_logs;
CREATE POLICY "Allow All Public" ON public.progress_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow All Public" ON public.workout_programs;
CREATE POLICY "Allow All Public" ON public.workout_programs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow All Public" ON public.diet_plans;
CREATE POLICY "Allow All Public" ON public.diet_plans FOR ALL USING (true);
