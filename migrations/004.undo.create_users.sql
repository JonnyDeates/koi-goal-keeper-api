ALTER TABLE current_goals
  DROP COLUMN IF EXISTS userId;
ALTER TABLE past_goals
  DROP COLUMN IF EXISTS userId;

DROP TABLE IF EXISTS users;