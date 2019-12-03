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
        const {type, checkedamt, date, goals} = req.body;
        const newPastGoals = {type, checkedamt, date, goals};
        const types = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly','5-Year'];

        console.log(newPastGoals);
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
        if(goals.length === 0) {
            return res.status(400).json({error: 'Missing Goals in request Body'})
        }
        for(let goal of goals){
            if(!(!!(goal.id))) {
                return res.status(400).json({error: `Goal is missing an ID`})
            }
            if(!(!!goal.goal)) {
                return res.status(400).json({error: `Missing info in goal :${goal.id}`})
            }
            if(!(!!goal.checked)) {
                Object.assign(goal, {checked: false})
            }
        }
        Object.assign(newPastGoals, {goals: goals});
        Object.assign(newPastGoals, {userid: req.user.id});
        PastGoalService.insertPastGoal(req.app.get('db'), newPastGoals)
            .then(pg => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl,`/${pg.id}`))
                    .json(pg)
            })
            .catch(next)
    });
pastgoalsRouter
    .route('/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        PastGoalService.getById(req.app.get('db'), req.params.id, req.user.id)
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
        const {type, checkedamt, date, goals} = req.body;
        const newPastGoal = {type, checkedamt, date, goals};
        const types = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', '5-Year'];
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
        }
        Object.assign(newPastGoal, {goals: goals});
        Object.assign(newPastGoal, {userid: req.user.id});

        PastGoalService.updatePastGoal(req.app.get('db'),req.params.id,newPastGoal)
            .then(() => {
                res.status(204).end()
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