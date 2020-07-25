ALTER TABLE settings
  ADD COLUMN
    dark_mode BOOLEAN NOT NULL DEFAULT false;

Alter TABLE settings
    ADD COLUMN
        local_storage BOOLEAN NOT NULL DEFAULT true;

Alter TABLE settings
    ADD COLUMN
        paid_account BOOLEAN NOT NULL DEFAULT false;

Alter TABLE settings
    ADD COLUMN
        color_style TEXT;
