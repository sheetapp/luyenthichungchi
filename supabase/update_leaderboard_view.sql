-- Update View leaderboard_view to include preferences
-- This allows the Rankings page to display user's Rank and Specialty

CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
    id,
    display_name,
    avata, -- Preserving original column name
    stats,
    preferences, -- Newly added column
    created_at
FROM
    profiles
WHERE
    status = 'active';

-- Grant access to public/authenticated users if needed (usually handled by RLS on table, but view ownership matters)
GRANT SELECT ON leaderboard_view TO authenticated;
GRANT SELECT ON leaderboard_view TO anon;
