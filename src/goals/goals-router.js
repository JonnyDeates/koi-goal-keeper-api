const express = require('express');
const path = require('path');
const GoalService = require('./goals-service');
//const { requireAuth } = require('../middleware/jwt-auth')

const goalsRouter = express.Router();
const jsonBodyParser = express.json();

goalsRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const {thing_id, type, checkedAmt, date, goals} = req.body;
        const newReview = {thing_id, type, checkedAmt, date, goals};

        for (const [key, value] of Object.entries(newReview)) {
            //why does undefined work here but null doesn't? Something to think about
            if (value === undefined || null) {
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });
            }
        }

        newReview.user_id = req.user.id;

        ReviewsService.insertReview(
            req.app.get('db'),
            newReview
        )
            .then(review => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${review.id}`))
                    .json(ReviewsService.serializeReview(review));
            })
            .catch(next);
    });

module.exports = reviewsRouter;