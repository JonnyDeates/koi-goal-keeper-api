CREATE TYPE goal_type AS ENUM (
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Yearly',
    '5-Year'
);
ALTER TABLE current_goals
  ADD COLUMN
    type goal_type;
ALTER TABLE past_goals
  ADD COLUMN
    type goal_type;