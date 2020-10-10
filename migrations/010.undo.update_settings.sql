ALTER TABLE settings
  DROP COLUMN IF EXISTS dark_mode;

ALTER TABLE settings
  DROP COLUMN IF EXISTS local_storage;

ALTER TABLE settings
  DROP COLUMN IF EXISTS paid_account;

ALTER TABLE settings
  DROP COLUMN IF EXISTS color_style;
