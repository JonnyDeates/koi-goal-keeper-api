CREATE TABLE settings (
  user_id INTEGER REFERENCES users(id),
  theme TEXT NOT NULL,
  type_list TEXT NOT NULL,
  type_selected TEXT NOT NULL,
  show_delete BOOLEAN NOT NULL,
  notifications BOOLEAN NOT NULL,
  compacted TEXT NOT NULL
);
