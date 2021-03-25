const express = require('express');
const path = require('path');
const UsersService = require("./users-service");
const SettingsService = require("../settings/settings-service");
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const xss = require('xss');
const {requireAuth} = require('../middleware/jwt-auth');
const AuthService = require("../middleware/auth-service");
const serializeUser = user => ({
    id: user.id,
    username: xss(user.username),
    date_created: user.date_created,
    nickname: xss(user.nickname)
});
const validateEmail = (email) => {
    const re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    return re.test(email);
}
usersRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const {password, username, nickname} = req.body;

        for (const field of ['username', 'password', 'nickname'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
        if(!validateEmail(username))
            return res.status(400).json({error: `Email not formatted correctly`});

        const passwordError = UsersService.validatePassword(password);
        if (passwordError)
            return res.status(400).json({error: passwordError});
        UsersService.hasUserWithUserName(req.app.get('db'), username)
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({error: `Email already taken`});

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            username,
                            password: hashedPassword,
                            nickname,
                            date_created: 'now()',
                            date_modified: 'now()',
                        };

                        return UsersService.insertUser(req.app.get('db'), newUser)
                            .then(user => {
                                const defaultSettings = {
                                    userid: user.id,
                                    theme: 'Default',
                                    type_list: 'Normal List',
                                    type_selected: 'All',
                                    ascending: false,
                                    auto_archiving: false,
                                    show_delete: false,
                                    notifications: true,
                                    compacted: 'No',
                                    paid_account: false,
                                    local_storage: false,
                                    dark_mode: false,
                                    color_style: 'standard',
                                    sort_style: 'No'
                                };
                                SettingsService.insertSettings(req.app.get('db'), defaultSettings);
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
        SettingsService.deleteSettings(req.app.get('db'), res.user.id).then(()=> {
            UsersService.deleteUser(req.app.get('db'), req.params.id)
                .then(() => {

                    res.status(204).end()
                })
        })
            .catch(next)
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const {username, nickname} = req.body;
        const userToUpdate = {username, nickname};
        const numberOfValues = Object.values(userToUpdate).length;

        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'username'' or 'nickname'`
                }
            });
        const newUser = {
            ...res.user,
            username: userToUpdate.username || res.user.username,
            nickname: userToUpdate.nickname || res.user.nickname,
            date_modified: 'now()'
        };
        if(!validateEmail(newUser.username))
            return res.status(400).json({error: `Email not formatted correctly already taken`});

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
            .catch(next)
    });
module.exports = usersRouter;
