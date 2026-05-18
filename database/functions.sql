-- ====================================================
-- FUNCTIONS: FIT 'N' BLAZE
-- ====================================================

-- 1. Generate Member ID (Format: FNB001, FNB002...)
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS VARCHAR AS $$
DECLARE
    next_id INTEGER;
    new_custom_id VARCHAR;
BEGIN
    -- Find the highest number in custom_id starting with 'FNB'
    SELECT COALESCE(MAX(NULLIF(regexp_replace(custom_id, '\D', '', 'g'), '')::INTEGER), 0) + 1
    INTO next_id
    FROM public.members
    WHERE custom_id LIKE 'FNB%';
    
    new_custom_id := 'FNB' || LPAD(next_id::TEXT, 3, '0');
    RETURN new_custom_id;
END;
$$ LANGUAGE plpgsql;


-- 2. Generate Trainer ID (Format: TRN001, TRN002...)
CREATE OR REPLACE FUNCTION public.generate_trainer_id()
RETURNS VARCHAR AS $$
DECLARE
    next_id INTEGER;
    new_trainer_code VARCHAR;
BEGIN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(trainer_code, '\D', '', 'g'), '')::INTEGER), 0) + 1
    INTO next_id
    FROM public.trainers
    WHERE trainer_code LIKE 'TRN%';
    
    new_trainer_code := 'TRN' || LPAD(next_id::TEXT, 3, '0');
    RETURN new_trainer_code;
END;
$$ LANGUAGE plpgsql;


-- 3. Authenticate User (Login ID + Phone)
CREATE OR REPLACE FUNCTION public.authenticate_user(p_login_id VARCHAR, p_phone VARCHAR)
RETURNS JSON AS $$
DECLARE
    found_user RECORD;
    result JSON;
BEGIN
    SELECT id, role, login_id, full_name, is_active 
    INTO found_user
    FROM public.users
    WHERE login_id = p_login_id AND phone = p_phone;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Invalid credentials');
    END IF;
    
    IF NOT found_user.is_active THEN
        RETURN json_build_object('success', false, 'message', 'Account is inactive');
    END IF;
    
    RETURN json_build_object(
        'success', true, 
        'user', json_build_object(
            'id', found_user.id,
            'role', found_user.role,
            'login_id', found_user.login_id,
            'full_name', found_user.full_name
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Renew Membership (Creates payment and updates membership dates)
CREATE OR REPLACE FUNCTION public.renew_membership(
    p_member_id UUID,
    p_plan_id UUID,
    p_amount NUMERIC,
    p_payment_method VARCHAR,
    p_transaction_reference VARCHAR
)
RETURNS JSON AS $$
DECLARE
    v_duration_days INTEGER;
    v_current_end_date DATE;
    v_new_end_date DATE;
BEGIN
    -- Get plan duration
    SELECT duration_days INTO v_duration_days FROM public.plans WHERE id = p_plan_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Invalid Plan ID');
    END IF;

    -- Get current membership end date
    SELECT membership_end INTO v_current_end_date FROM public.members WHERE id = p_member_id;
    
    IF v_current_end_date IS NULL OR v_current_end_date < CURRENT_DATE THEN
        -- If expired or null, start from today
        v_new_end_date := CURRENT_DATE + v_duration_days;
    ELSE
        -- If active, add to existing end date
        v_new_end_date := v_current_end_date + v_duration_days;
    END IF;

    -- Update member record
    UPDATE public.members
    SET plan_id = p_plan_id,
        membership_end = v_new_end_date,
        status = 'active',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_member_id;

    -- Insert payment record
    INSERT INTO public.payments (
        member_id, plan_id, amount, payment_method, status, paid_at, transaction_reference
    ) VALUES (
        p_member_id, p_plan_id, p_amount, p_payment_method, 'paid', timezone('utc'::text, now()), p_transaction_reference
    );

    RETURN json_build_object('success', true, 'message', 'Membership renewed successfully', 'new_end_date', v_new_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Get Dashboard Stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    v_total_members INTEGER;
    v_active_members INTEGER;
    v_expired_members INTEGER;
    v_total_revenue NUMERIC;
BEGIN
    SELECT COUNT(*) INTO v_total_members FROM public.members;
    SELECT COUNT(*) INTO v_active_members FROM public.members WHERE status = 'active';
    SELECT COUNT(*) INTO v_expired_members FROM public.members WHERE status = 'expired' OR membership_end < CURRENT_DATE;
    SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue FROM public.payments WHERE status = 'paid';

    RETURN json_build_object(
        'total_members', v_total_members,
        'active_members', v_active_members,
        'expired_members', v_expired_members,
        'total_revenue', v_total_revenue
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
