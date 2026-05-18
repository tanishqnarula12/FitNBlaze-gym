-- ====================================================
-- SEED DATA: FIT 'N' BLAZE
-- ====================================================

-- 1. Insert Plans
INSERT INTO public.plans (name, duration_days, price, description) VALUES
('1 Month Starter', 30, 2000.00, 'Perfect for beginners. Includes standard gym access.'),
('3 Month Transformation', 90, 5999.00, 'Our most popular plan. Access to Gym and MMA basics.'),
('6 Month Elite', 180, 10999.00, 'Full premium access including customized diet plans.');

-- 2. Create Default Admin User
-- To avoid duplicate inserts, using an upsert mechanism (ON CONFLICT not natively available on non-PK without unique constraint but we have UNIQUE on login_id)
INSERT INTO public.users (role, login_id, phone, full_name, email, is_active)
VALUES ('admin', 'ADMIN001', '9876543210', 'Kunal Varshani', 'admin@fitnblaze.com', true)
ON CONFLICT (login_id) DO NOTHING;

-- Note: We could create sample members and trainers here, but they are typically created via the app to utilize the auto ID generation logic.
-- The default admin allows you to login immediately and start using the system.
