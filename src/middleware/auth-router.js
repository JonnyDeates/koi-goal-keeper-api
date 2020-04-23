const express = require('express');
const AuthService = require('./auth-service');
const SettingsService = require('../settings/settings-service');

const authRouter = express.Router();
const jsonBodyParser = express.json();
authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const {username, password} = req.body;
        const loginUser = {username, password};

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });

        AuthService.getUserWithUserName(req.app.get('db'), loginUser.username)
            .then(dbUser => {
                if (!dbUser)
                    return res.status(400).json({
                        error: 'Incorrect username or password',
                    });

                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect username or password',
                            });
                        SettingsService.getByUserId(req.app.get('db'), dbUser.id).then((settings) => {
                            const sub = dbUser.username;
                            const payload = {
                                id: dbUser.id,
                                username: dbUser.username,
                                nickname: dbUser.nickname,
                                email: dbUser.email
                            };
                            res.send({authToken: AuthService.createJwt(sub, payload), payload: {...payload, id: '***', settings: {...settings, userid:'***'}}})
                        })
                    })
            })
            .catch(next)
    });

module.exports = authRouter;
