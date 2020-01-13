const express = require('express');
const path = require('path');
const UsersService = require("./users-service");
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const xss = require('xss');
const {requireAuth} = require('../middleware/jwt-auth');
const AuthService = require("../middleware/auth-service");
const serializeUser = user => ({
    id: user.id,
    email: xss(user.email),
    username: xss(user.username),
    date_created: user.date_created,
    auto_archiver: user.auto_archiver,
    notifications: user.notifications,
    nickname: xss(user.nickname)
});

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res.json(users.map(serializeUser))
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {password, username, email, nickname} = req.body;

        for (const field of ['email', 'username', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
        const passwordError = UsersService.validatePassword(password);

        if (passwordError)
            return res.status(400).json({error: passwordError});

        UsersService.hasUserWithUserName(req.app.get('db'), username)
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({error: `Username already taken`});

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            username,
                            password: hashedPassword,
                            email,
                            nickname,
                            auto_archiver: true,
                            notifications: true,
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
        const {email, username, nickname, notifications, auto_archiver} = req.body;
        const userToUpdate = {email, username, nickname, notifications, auto_archiver};
        const numberOfValues = Object.values(userToUpdate).length;
        console.log(auto_archiver, numberOfValues, !(!!(userToUpdate.auto_archiver)) ?  userToUpdate.auto_archiver : res.user.auto_archiver)
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'email', 'username', 'password' or 'nickname'`
                }
            });
        const newUser = {
            email: userToUpdate.email || res.user.email,
            username: userToUpdate.username || res.user.username,
            nickname: userToUpdate.nickname || res.user.nickname,
            notifications: userToUpdate.notifications || res.user.notifications,
            auto_archiver: !!(userToUpdate.auto_archiver) ?  userToUpdate.auto_archiver : res.user.auto_archiver,
            id: res.user.id, date_created: res.user.date_created, date_modified: 'now()'
        };
        UsersService.updateUser(req.app.get('db'), req.params.id, serializeUser(newUser))
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });
usersRouter
    .route('/auth/:id')
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
    .patch(jsonBodyParser, (req, res, next) => {
        const {oldPassword, password} = req.body;
        const passToUpdate = {oldPassword, password};
        const numberOfValues = Object.values(passToUpdate).filter(Boolean).length;
        if (numberOfValues < 2)
            return res.status(400).json({
                error: {
                    message: `Request body must contain password & the oldPassword`
                }
            });

        const passwordError = UsersService.validatePassword(password);
        if (passwordError)
            return res.status(400).json({error: passwordError});

        AuthService.comparePasswords(oldPassword, res.user.password)
            .then(compareMatch => {
                if (!compareMatch)
                    return res.status(400).json({
                        error: 'Incorrect old Password',
                    });
                UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newPassword = {
                            password: hashedPassword,
                        };

                        return UsersService.updateUser(req.app.get('db'), res.user.id, newPassword)
                            .then(user => {
                                res
                                    .status(201).json('Password Updated')
                            })
                    })
            })
    });
module.exports = usersRouter;