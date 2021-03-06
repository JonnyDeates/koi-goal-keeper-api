const express = require('express');
const path = require('path');
const GoalService = require('./goals-service');
const {requireAuth} = require('../middleware/jwt-auth');
const goalsRouter = express.Router();
const jsonBodyParser = express.json();

goalsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        GoalService.getAllGoals(req.app.get('db'), req.user.id)
            .then(goals => {
                res.json(goals)
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {type, checkedamt, date} = req.body;
        const newGoal = {type, checkedamt, date};
        const types = ['Daily', 'Weekly', 'BiWeekly', 'Monthly', 'Quarterly', '6-Month', '9-Month', 'Yearly', '2-Year', '3-Year', '4-Year', '5-Year', '10-Year', '20-Year', '30-Year', 'Distant'];
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
        Object.assign(newGoal, {userid: req.user.id});

        if (!req.paid_account) {
            GoalService.countGoals(req.app.get('db'), req.user.id)
                .then(Count => {
                    let count = parseInt(Count[0].count);
                    if (count >= 10) {
                        return res.status(402).json({
                            error: `Hit Unpaid Max On Goals`
                        });
                    } else {
                        GoalService.insertGoal(req.app.get('db'), newGoal)
                            .then(goal => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${goal.id}`))
                                    .json(goal)
                            })
                            .catch(next)
                    }
                })
        } else {
            GoalService.insertGoal(req.app.get('db'), newGoal)
                .then(goal => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${goal.id}`))
                        .json(goal)
                })
                .catch(next)
        }
    })
    .delete((req, res, next) => {
        GoalService.deleteAllGoals(req.app.get('db'), req.user.id)
            .then(() => {
                res.status(204)
            })
            .catch(next)
    });

goalsRouter
    .route('/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        GoalService.getById(req.app.get('db'), req.params.id)
            .then(goal => {
                if (!goal) {
                    return res.status(404).json({
                        error: {message: `Goal doesn't exist`}
                    })
                }
                res.goal = goal;
                next();
                return null;
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.goal)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const {type, checkedamt, date} = req.body;
        const newGoal = {type, checkedamt, date};
        const types = ['Daily', 'Weekly', 'BiWeekly', 'Monthly', 'Quarterly', '6-Month', '9-Month', 'Yearly', '2-Year', '3-Year', '4-Year', '5-Year', '10-Year', '20-Year', '30-Year', 'Distant'];
        // console.log(type, req.params.id);
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
        Object.assign(newGoal, {userid: req.user.id});
        GoalService.updateGoal(req.app.get('db'), req.params.id, newGoal)
            .then(() => {
                res.status(204).json(res.goal)
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        GoalService.deleteItem(req.app.get('db'), req.params.id)
            .then(() => {
                res.status(204).json(res.goal)
            })
            .catch(next)
    });
module.exports = goalsRouter;
