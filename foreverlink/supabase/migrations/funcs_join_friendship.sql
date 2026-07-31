-- Function to safely join a friendship by pairing_code.
-- Apply this in Supabase SQL editor AFTER initial migration.

CREATE OR REPLACE FUNCTION public.join_friendship(p_code TEXT)
RETURNS TABLE(friendship_id UUID) AS $$
BEGIN
  -- Ensure caller identity matches the provided auth uid
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE friendships f
  SET user_2_id = auth.uid(), status = 'active'
  WHERE f.pairing_code = p_code
    AND f.user_2_id IS NULL
  RETURNING f.id INTO friendship_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code invalide ou déjà utilisé';
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- IMPORTANT: SECURITY DEFINER bypasses RLS. The function checks auth.uid() and only updates when user_2_id IS NULL, limiting abuse.
-- Grant execute to authenticated role (default in Supabase projects uses 'auth' and 'authenticated')
GRANT EXECUTE ON FUNCTION public.join_friendship(TEXT) TO authenticated;
