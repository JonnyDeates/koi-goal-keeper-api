const express = require('express');
const path = require('path');
//const GoalService = require('./goals-service');
//const { requireAuth } = require('../middleware/jwt-auth')
const allPastGoals = require('./store.js');
const pastgoalsRouter = express.Router();
const jsonBodyParser = express.json();
const serializePastGoals = {

}

pastgoalsRouter
    .route('/')
    .get((req, res, next) => {
        res.status(200).json(allPastGoals);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {type, checkedAmt, date, goals} = req.body;
        const newGoal = {type, checkedAmt, date, goals};
        const types = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly','5-Year'];
        for (const [key, value] of Object.entries(newGoal)) {
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
                res.status(400).json({error: `Goal is missing an ID`})
            }
            if(!(!!goal.goal)) {
                return res.status(400).json({error: `Missing info in goal :${goal.id}`})
            }
            Object.assign(goal, {checked: false});
        }
        Object.assign(newGoal, {goals: goals});
        Object.assign(newGoal, {id: allPastGoals.length+1});
        allPastGoals.push(newGoal);
        res.status(201).json(newGoal);
        // newReview.user_id = req.user.id;

        // ReviewsService.insertReview(
        //     req.app.get('db'),
        //     newReview
        // )
        //     .then(review => {
        //         res
        //             .status(201)
        //             .location(path.posix.join(req.originalUrl, `/${review.id}`))
        //             .json(ReviewsService.serializeReview(review));
        //     })
        //     .catch(next);
    });
pastgoalsRouter
    .route('/:id')
    .get((req, res, next) => {
        const { id } = req.params;
        let goal = allPastGoals.find((g)=> g.id+'' === id);
        console.log(goal, id, !!goal);
        if(!(!!goal)) {
            return res.status(404).send('Not Found')
        }
        res.status(200).json(goal);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const pastGoalIndex = allPastGoals.findIndex(g => g.id+'' === id);
        if (pastGoalIndex === -1) {
            return res.status(404).send('Not found');
        }
        allPastGoals.splice(pastGoalIndex, 1);
        res.status(204).end();
    });
module.exports = pastgoalsRouter;