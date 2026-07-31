-- RLS test script for ForeverLink
-- Run in Supabase SQL editor as a privileged user (or psql) to set up test data,
-- then run the SELECTs with simulated jwt.claims using set_config('request.jwt.claims', ..., true)
-- Expected results are indicated in comments. Do NOT run on production without review.

BEGIN;

-- Create deterministic test users
INSERT INTO users (id, email) VALUES ('11111111-1111-1111-1111-111111111111', 'a@test.local') ON CONFLICT DO NOTHING;
INSERT INTO users (id, email) VALUES ('22222222-2222-2222-2222-222222222222', 'b@test.local') ON CONFLICT DO NOTHING;

-- Create an active friendship between them
INSERT INTO friendships (id, user_1_id, user_2_id, pairing_code, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'TESTCODE', 'active')
ON CONFLICT DO NOTHING;

-- Messages: one regular, one capsule locked until future
INSERT INTO messages (id, friendship_id, sender_id, content, is_capsule, unlock_at) VALUES
('m1-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Hello from A', FALSE, NULL)
ON CONFLICT DO NOTHING;

INSERT INTO messages (id, friendship_id, sender_id, content, is_capsule, unlock_at) VALUES
('m2-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Capsule future', TRUE, now() + INTERVAL '1 day')
ON CONFLICT DO NOTHING;

COMMIT;

-- Now simulate queries as user A (should see only the non-locked message)
-- Note: Supabase's auth.uid() reads from request.jwt.claims; simulate with set_config
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111"}', true);

-- This SELECT should return 1 row (only the unlocked message)
SELECT id, content, is_capsule, unlock_at FROM messages WHERE friendship_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- Expected: only m1 visible

-- Simulate queries as user B (should also see only the unlocked message)
SELECT set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222"}', true);
SELECT id, content, is_capsule, unlock_at FROM messages WHERE friendship_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- Expected: only m1 visible

-- Simulate queries as unrelated user C (should see 0 rows)
SELECT set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
SELECT id FROM messages WHERE friendship_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- Expected: 0 rows

-- Test join_friendship RPC security: create a pending friendship and try to join
BEGIN;
INSERT INTO friendships (id, user_1_id, user_2_id, pairing_code, status) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NULL, 'PENDING1', 'pending')
ON CONFLICT DO NOTHING;
COMMIT;

-- Simulate caller as user B and call the RPC (run the RPC in the SQL editor; the RPC will check auth.uid()).
-- In SQL editor, set request.jwt.claims to user B's sub and call:
-- SELECT public.join_friendship('PENDING1');
-- Expected: returns the friendship id and creates an audit row in friendship_join_logs.

-- Cleanup (optional)
-- DELETE FROM messages WHERE id IN ('m1-0000-0000-0000-000000000001','m2-0000-0000-0000-000000000002');
-- DELETE FROM friendships WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
-- DELETE FROM users WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');

-- End of tests
