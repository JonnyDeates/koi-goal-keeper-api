CREATE TYPE goal_type AS ENUM (
    'Daily',
    'Weekly',
    'BiWeekly',
    'Monthly',
    'Quarterly',
    '6-Month',
    '9-Month',
    'Yearly',
    '2-Year',
    '3-Year',
    '4-Year',
    '5-Year',
    '10-Year',
    '20-Year',
    '30-Year',
    'Distant'
);

ALTER TABLE current_goals
  ADD COLUMN
    type goal_type;
ALTER TABLE past_goals
  ADD COLUMN
    type goal_type;
