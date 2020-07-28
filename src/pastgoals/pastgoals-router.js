const express = require('express');
const path = require('path');
const PastGoalService = require('./pastgoals-service');
const { requireAuth } = require('../middleware/jwt-auth')
const pastgoalsRouter = express.Router();
const jsonBodyParser = express.json();
const serializePastGoals = {

}

pastgoalsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        PastGoalService.getAllPastGoals(req.app.get('db'),req.user.id )
            .then(goals => {
                res.json(goals)})
            .catch(next)
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
        const {type, checkedamt, date} = req.body;
        const newPastGoals = {type, checkedamt, date};
        const types = ['Daily', 'Weekly','BiWeekly', 'Monthly', 'Quarterly','6-Month', 'Yearly','3-Year','5-Year','10-Year','25-Year','Distant'];
        for (const [key, value] of Object.entries(newPastGoals)) {
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }
        if(!(!!types.find((t) => t === type))){
            return res.status(400).json({error: `Type is not under correct Types ${types}`})
        }
        Object.assign(newPastGoals, {userid: req.user.id});
        PastGoalService.insertPastGoal(req.app.get('db'), newPastGoals)
            .then(pg => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl,`/${pg.id}`))
                    .json(pg)
            })
            .catch(next)
    })
    .delete((req, res, next) => {
    PastGoalService.deleteAllPastGoals(req.app.get('db'), req.user.id)
        .then(() => {
            res.status(204)
        })
        .catch(next)
});
pastgoalsRouter
    .route('/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        PastGoalService.getById(req.app.get('db'), req.params.id)
            .then(pg => {
                if (!pg) {
                    return res.status(404).json({
                        error: { message: `Past Goal doesn't exist` }
                    })
                }
                res.pastGoal = pg;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.pastGoal)
    })
    .patch(requireAuth, jsonBodyParser, (req, res, next) => {
        const {type, checkedamt, date} = req.body;
        const newPastGoal = {type, checkedamt, date};
        const types = ['Daily', 'Weekly','BiWeekly', 'Monthly', 'Quarterly','6-Month', 'Yearly','3-Year','5-Year','10-Year','25-Year','Distant'];
        for (const [key, value] of Object.entries(newPastGoal)) {
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }
        if (!(!!types.find((t) => t === type))) {
            return res.status(400).json({error: `Type is not under correct Types ${types}`})
        }
        Object.assign(newPastGoal, {userid: req.user.id});

        PastGoalService.updatePastGoal(req.app.get('db'),req.params.id,newPastGoal)
            .then(() => {
                res.status(204).json(res.pastGoal)
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        PastGoalService.deleteItem(req.app.get('db'), req.params.id)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    });
module.exports = pastgoalsRouter;