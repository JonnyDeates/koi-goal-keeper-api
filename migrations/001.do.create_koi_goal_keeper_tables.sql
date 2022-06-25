CREATE TABLE users
(
    id             SERIAL PRIMARY KEY,
    email          TEXT      NOT NULL UNIQUE,
    password       TEXT      NOT NULL,
    nickname       TEXT,
    paid_account   TEXT,
    token          TEXT,
    token_accessed TIMESTAMP,
    date_created   TIMESTAMP NOT NULL DEFAULT now(),
    date_modified  TIMESTAMP
);
CREATE TABLE settings
(
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users (id) ON DELETE CASCADE,
    theme          TEXT,
    type_list      TEXT,
    type_selected  TEXT,
    show_delete    BIT,
    notifications  BIT,
    auto_archiving BIT,
    dark_mode      BIT,
    ascending      BIT,
    compacted      TEXT,
    color_style    TEXT,
    sort_style     TEXT
);
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
CREATE TABLE current_goals
(
    id      SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
    date    TIMESTAMP DEFAULT now() NOT NULL,
    type    goal_type
);

CREATE TABLE past_goals
(
    id         SERIAL PRIMARY KEY,
    user_id    INTEGER REFERENCES users (id) ON DELETE CASCADE,
    date       TIMESTAMP DEFAULT now() NOT NULL,
    type       goal_type
);

CREATE TABLE objectives
(
    id      SERIAL PRIMARY KEY,
    goal_id INTEGER REFERENCES current_goals (id) ON DELETE CASCADE,
    checked BIT,
    obj     TEXT NOT NULL
);

CREATE TABLE past_objectives
(
    id      SERIAL PRIMARY KEY,
    goal_id  INTEGER REFERENCES past_goals (id) ON DELETE CASCADE,
    checked BIT,
    obj     TEXT NOT NULL
);
