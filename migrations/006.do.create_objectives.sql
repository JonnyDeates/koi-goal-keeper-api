CREATE TABLE objectives (
  id SERIAL PRIMARY KEY,
  checked BOOLEAN NOT NULL,
  obj TEXT NOT NULL
);

ALTER TABLE objectives
  ADD COLUMN
    goalid INTEGER REFERENCES current_goals(id)
    ON DELETE CASCADE;