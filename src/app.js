require('dotenv').config();
const {NODE_ENV} = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const UsersRouter = require('./users/users-router');
const GoalsRouter = require('./goals/goals-router');
const PastGoalsRouter = require('./pastgoals/pastgoals-router');
const ObjectivesRouter = require('./objectives/objectives-router');
const PastObjectivesRouter = require('./pastobjectives/pastobjectives-router');
const authRouter = require('./middleware/auth-router');
const settingsRouter = require('./settings/settings-router');
const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';
app.use(morgan(morganOption));

// const allowedOrigins = ['http://koigoalkeeper.com', 'https://koigoalkeeper.com', 'https://koigoalkeeperapi.herokuapp.com',
//     'http://www.koigoalkeeper.com', 'https://www.koigoalkeeper.com', 'http://localhost:3000', 'http://localhost:3001'];
app.use(cors(
//     {
//     origin: function (origin, callback) {
//         // allow requests with no origin - like mobile apps, curl, postman
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.indexOf(origin) === -1) {
//             const msg = 'The CORS policy for this site does not ' +
//                 'allow access from the specified Origin.';
//             return callback(new Error(msg), false);
//         }
//         return callback(null, true);
//     }
// }
));
app.use(helmet());
app.use('/users', UsersRouter);
app.use('/goals', GoalsRouter);
app.use('/objectives', ObjectivesRouter);
app.use('/past/objectives', PastObjectivesRouter);
app.use('/past/goals', PastGoalsRouter);
app.use('/auth', authRouter);
app.use('/settings', settingsRouter);
app.use(errorHandler);

function errorHandler(error, req, res, next) {
    const code = error.status || 500;
    if (NODE_ENV === 'production') {
        error.message = code === 500 ? 'internal server error' : error.message;
    } else {
        console.error(error);
    }
    res.status(code).json({message: error.message});
}

module.exports = app;
