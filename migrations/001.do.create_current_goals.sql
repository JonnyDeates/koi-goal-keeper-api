CREATE TABLE current_goals (
  id SERIAL PRIMARY KEY,
  checkedAmt NUMERIC,
  date TIMESTAMP DEFAULT now() NOT NULL
);