-- Safer function to join a friendship by pairing_code.
-- Apply this in Supabase SQL editor AFTER initial migration.
-- Notes: SECURITY DEFINER is used to allow a controlled update that would otherwise be blocked by RLS for the joining user.
-- The function performs strict checks and records an audit row. Review owner and privileges before deployment.

DROP FUNCTION IF EXISTS public.join_friendship(TEXT);

CREATE OR REPLACE FUNCTION public.join_friendship(p_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_friendship_id UUID;
  v_user_1 UUID;
  v_user_2 UUID;
  v_caller UUID := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Fetch current friendship row for validation
  SELECT id, user_1_id, user_2_id INTO v_friendship_id, v_user_1, v_user_2
  FROM friendships
  WHERE pairing_code = p_code
  LIMIT 1;

  IF v_friendship_id IS NULL THEN
    RAISE EXCEPTION 'Code invalide';
  END IF;

  IF v_user_2 IS NOT NULL THEN
    RAISE EXCEPTION 'Ce code a déjà été utilisé';
  END IF;

  IF v_caller = v_user_1 THEN
    RAISE EXCEPTION 'Le créateur du code ne peut pas le rejoindre';
  END IF;

  -- Perform update: set the joining user as user_2 and activate the friendship
  UPDATE friendships
  SET user_2_id = v_caller, status = 'active'
  WHERE id = v_friendship_id AND user_2_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Impossible d''appairer - état inattendu';
  END IF;

  -- Audit log for security review
  INSERT INTO friendship_join_logs (id, friendship_id, joined_user_id, joined_at)
  VALUES (gen_random_uuid(), v_friendship_id, v_caller, NOW());

  RETURN v_friendship_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Audit table
CREATE TABLE IF NOT EXISTS friendship_join_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendship_id UUID REFERENCES friendships(id) ON DELETE CASCADE,
  joined_user_id UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANT SECURITY NOTES:
-- 1) SECURITY DEFINER runs with the function owner's privileges. Ensure the owner is a tightly controlled role (the project owner), and do NOT set the owner to 'postgres' or a superuser accessible by others.
-- 2) The function validates auth.uid() and refuses self-joins and reused codes, and logs every successful join.
-- 3) Grant execute only to the authenticated role to limit who can call it.
REVOKE EXECUTE ON FUNCTION public.join_friendship(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.join_friendship(TEXT) TO authenticated;
