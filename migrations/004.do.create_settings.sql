CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  theme TEXT NOT NULL,
  type_list TEXT NOT NULL,
  type_selected TEXT NOT NULL,
  show_delete BOOLEAN NOT NULL,
  notifications BOOLEAN NOT NULL,
  auto_archiving BOOLEAN NOT NULL,
  compacted TEXT NOT NULL
);
