BEGIN;

TRUNCATE
    users,
    current_goals,
    past_goals,
    objectives,
    past_objectives,
    RESTART IDENTITY CASCADE;

INSERT INTO users (username, email, password)
VALUES
    ('admin', 'admin@gmail.com',  '$2a$10$fCWkaGbt7ZErxaxclioLteLUgg4Q3Rp09WW0s/wSLxDKYsaGYUpjG');


INSERT INTO current_goals (id, checkedAmt, type, userId)
VALUES
    (1, 0, 'Daily', 1),
    (1, 0, 'Weekly', 1);

COMMIT;
