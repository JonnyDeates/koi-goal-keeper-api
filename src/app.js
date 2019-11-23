require('dotenv').config();
const { NODE_ENV } = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const UsersRouter = require('./users/users-router');
const GoalsRouter = require('./goals/goals-router');
const PastGoalsRouter = require('./pastgoals/pastgoals-router');
const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use('/users', UsersRouter);
app.use('/goals', GoalsRouter);
app.use('/pastgoals', PastGoalsRouter);
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