Alter TABLE settings
    ADD COLUMN
        ascending BOOLEAN NOT NULL DEFAULT false;

Alter TABLE settings
    ADD COLUMN
        sort_style TEXT;
