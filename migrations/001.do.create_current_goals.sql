CREATE TABLE current_goals (
  id SERIAL PRIMARY KEY,
  checkedAmt NUMERIC,
  goals TEXT[] NOT Null,
  date TIMESTAMP DEFAULT now() NOT NULL
);