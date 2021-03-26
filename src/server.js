const app = require('./app');
const { PORT, DATABASE_URL, NODE_ENV } = require('./config');
const knex = require('knex');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
});

app.set('db', db);
app.listen(PORT, () => {
    if (NODE_ENV !== 'production') {
        console.log(`Server listening at http://localhost:${PORT}`);
    }
});