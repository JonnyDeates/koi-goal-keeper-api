const express = require('express');
const path = require('path');
const GoalService = require('./goals-service');
//const { requireAuth } = require('../middleware/jwt-auth')
const goalsRouter = express.Router();
const jsonBodyParser = express.json();
const knex = require('knex');

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL
});

const serializeGoals = {}
goalsRouter
    .route('/')
    .get((req, res, next) => {
        GoalService.getAllGoals(knexInstance)
            .then(goals => {
                res.json(goals)
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {type, checkedamt, date, goals, userid} = req.body;
        const newGoal = {type, checkedamt, date, goals, userid};
        const types = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', '5-Year'];
        for (const [key, value] of Object.entries(newGoal)) {
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }
        if (!(!!types.find((t) => t === type))) {
            return res.status(400).json({error: `Type is not under correct Types ${types}`})
        }
        if (goals.length === 0) {
            return res.status(400).json({error: 'Missing Goals in request Body'})
        }
        for (let goal of goals) {
            if (!(!!(goal.id))) {
                res.status(400).json({error: `Goal is missing an ID`})
            }
            if (!(!!goal.goal)) {
                return res.status(400).json({error: `Missing info in goal :${goal.id}`})
            }
            Object.assign(goal, {checked: false});
        }
        Object.assign(newGoal, {goals: goals});
        GoalService.insertGoal(knexInstance, newGoal)
            .then(goal => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${goal.id}`))
                    .json(goal)
            })
            .catch(next)
    });
goalsRouter
    .route('/:id')
    .all((req, res, next) => {
        GoalService.getById(knexInstance, req.params.id)
            .then(goal => {
                if (!goal) {
                    return res.status(404).json({
                        error: {message: `Goal doesn't exist`}
                    })
                }
                res.goal = goal;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.goal)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const {type, checkedamt, date, goals, userid} = req.body;
        const newGoal = {type, checkedamt, date, goals, userid};
        const types = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', '5-Year'];
        for (const [key, value] of Object.entries(newGoal)) {
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }
        if (!(!!types.find((t) => t === type))) {
            return res.status(400).json({error: `Type is not under correct Types ${types}`})
        }
        if (goals.length === 0) {
            return res.status(400).json({error: 'Missing Goals in request Body'})
        }
        for (let goal of goals) {
            if (!(!!(goal.id))) {
                res.status(400).json({error: `Goal is missing an ID`})
            }
            if (!(!!goal.goal)) {
                return res.status(400).json({error: `Missing info in goal :${goal.id}`})
            }
            Object.assign(goal, {checked: false});
        }
        Object.assign(newGoal, {goals: goals});
        GoalService.updateGoal(knexInstance,req.params.id,newGoal)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        GoalService.deleteItem(knexInstance, req.params.id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    });
module.exports = goalsRouter;