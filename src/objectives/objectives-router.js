const express = require('express');
const path = require('path');
const ObjectivesService = require('./objectives-service');
const {requireAuth} = require('../middleware/jwt-auth');
const objectivesRouter = express.Router();
const jsonBodyParser = express.json();

function serializeObjective(Objective) {
    return {
        id: Objective.id,
        goalid: Objective.goalid,
        obj: Objective.obj,
        checked: Objective.checked,
    }
}

objectivesRouter
    .route('/')
    .all(requireAuth)
    .post(jsonBodyParser, (req, res, next) => {
        const {obj, goalid, checked} = req.body;
        const newObjective = {checked: typeof checked === "boolean" ? checked : false, obj, goalid};
        let count = 0;
        for (const [key, value] of Object.entries(newObjective)) {
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }
            ObjectivesService.insertObjective(req.app.get('db'), newObjective)
                .then(obj => {
                    res
                        .status(201)
                        .location(path.posix.join(req.originalUrl, `/${obj.id}`))
                        .json(obj)
                })
                .catch(next)
    });
objectivesRouter
    .route('/goal-list/:id')
    .all(requireAuth)
    .get((req, res, next) => {
        ObjectivesService.getGroupedObjectives(req.app.get('db'), req.params.id)
            .then(objs => {
                res.json(objs)
            })
            .catch(next)
    });
objectivesRouter
    .route('/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        ObjectivesService.getById(req.app.get('db'), req.params.id)
            .then(obj => {
                if (!obj) {
                    return res.status(404).json({
                        error: {message: `Objective doesn't exist`}
                    })
                }
                res.obj = obj;
                next();
                return null;
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.obj)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const {obj, goalid} = req.body;
        const newObjective = {obj, goalid};
        newObjective.obj = (!!obj) ? obj : res.obj.checked;
        newObjective.goalid = (!!goalid) ? goalid : res.obj.goalid;

        for (const [key, value] of Object.entries(newObjective)) {
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }

        ObjectivesService.updateObjective(req.app.get('db'), req.params.id, newObjective)
            .then(() => {
                res.status(204).json(res.obj)
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        ObjectivesService.deleteObjective(req.app.get('db'), req.params.id)
            .then(() => {
                res.status(204).json(res.obj)
            })
            .catch(next)
    });
objectivesRouter
    .route('/toggle/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        ObjectivesService.getById(req.app.get('db'), req.params.id)
            .then(obj => {
                if (!obj) {
                    return res.status(404).json({
                        error: {message: `Objective doesn't exist`}
                    })
                }
                res.obj = obj;
                next();
                return null;
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.obj.checked = !res.obj.checked;

        ObjectivesService.updateObjective(req.app.get('db'), req.params.id, res.obj)
            .then(obj => {
                res.json(obj)
            })

    });
module.exports = objectivesRouter;
