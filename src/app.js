require('dotenv').config();
const { NODE_ENV } = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const UsersRouter = require('./users/users-router');
const GoalsRouter = require('./goals/goals-router');
const PastGoalsRouter = require('./pastgoals/pastgoals-router');
const authRouter = require('./middleware/auth-router');
const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';
const whitelist = ['https://koi-goal-keeper.now.sh'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
};

app.use(morgan(morganOption));
app.use(cors(corsOptions));
app.use(helmet());
app.use('/users', UsersRouter);
app.use('/goals', GoalsRouter);
app.use('/pastgoals', PastGoalsRouter);
app.use('/auth', authRouter);
app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV  === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        console.error(error);
        response = {message: error.message, error}
    }
    res.status(500).json(response)
});


module.exports = app;