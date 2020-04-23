CREATE TABLE past_objectives (
  id SERIAL PRIMARY KEY,
  checked TEXT NOT NULL,
  obj TEXT NOT NULL
);

ALTER TABLE past_objectives
  ADD COLUMN
    goalid INTEGER REFERENCES past_goals(id)
    ON DELETE CASCADE;