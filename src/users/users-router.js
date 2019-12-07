const express = require('express');
const path = require('path');
const UsersService = require("./users-service");
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const xss = require('xss');
const {requireAuth} = require('../middleware/jwt-auth')

const serializeUser = user => ({
    id: user.id,
    email: xss(user.email),
    username: xss(user.username),
    date_created: user.date_created,
});

usersRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const { password, username, email, nickname } = req.body;

        for (const field of ['email', 'username', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
        const passwordError = UsersService.validatePassword(password);

        if (passwordError)
            return res.status(400).json({ error: passwordError });

        UsersService.hasUserWithUserName(req.app.get('db'), username)
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({ error: `Username already taken` });

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            username,
                            password: hashedPassword,
                            email,
                            nickname,
                            date_created: 'now()',
                        };

                        return UsersService.insertUser(req.app.get('db'), newUser)
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    });
usersRouter
    .route('/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        UsersService.getById(req.app.get('db'), req.params.id)
            .then(user => {
                if (!user) {
                    return res.status(404).json({
                        error: {message: `User doesn't exist`}
                    })
                }
                res.user = user;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeUser(res.user))
    })
    .delete((req, res, next) => {
        UsersService.deleteUser(req.app.get('db'), req.params.id)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const {email, username, password, nickname} = req.body;
        const userToUpdate = {email, username, password, nickname};

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'email', 'username', 'password' or 'nickname'`
                }
            })

        UsersService.updateUser(req.app.get('db'), req.params.id, userToUpdate)
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });
module.exports = usersRouter;