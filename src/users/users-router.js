const express = require('express');
const path = require('path');
const Users = require('./store.js');
const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter
    .route('/')
    .get((req, res, next) => {
        res.status(200).json(Users);
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {email, password} = req.body;
        const newUser = {email, password};
        for (const [key, value] of Object.entries(newUser)) {
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }
        Object.assign(Users, {id: Users.length+1});
        res.status(201).json(Users);
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
usersRouter
    .route('/:id')
    .get((req, res, next) => {
        const { id } = req.params;
        let user = Users.find((g)=> g.id+'' === id);
        if(!(!!user)) {
            return res.status(404).send('Not Found')
        }
        res.status(200).json(user);
    })
    .delete((req, res) => {
        const { id } = req.params;
        const userIndex = Users.findIndex(g => g.id+'' === id);
        if (userIndex === -1) {
            return res.status(404).send('Not found');
        }
        Users.splice(userIndex, 1);
        res.status(204).end();
    });
module.exports = usersRouter;