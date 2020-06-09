CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  nickname TEXT,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);

ALTER TABLE current_goals
  ADD COLUMN
    userId INTEGER REFERENCES users(id)
    ON DELETE CASCADE;
ALTER TABLE past_goals
  ADD COLUMN
    userId INTEGER REFERENCES users(id)
    ON DELETE CASCADE;
ALTER TABLE settings
  ADD COLUMN
    userId INTEGER REFERENCES users(id)
    ON DELETE CASCADE;
