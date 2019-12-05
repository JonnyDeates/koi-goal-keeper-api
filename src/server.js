const app = require('./app');
const { PORT, DATABASE_URL, NODE_ENV } = require('./config')
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: DATABASE_URL,
})

app.set('db', db)
app.listen(PORT, () => {
    if (NODE_ENV !== 'production') {
        console.log(`Server listening at http://localhost:${PORT}`);
    }
});