const express = require('express');
const AuthService = require('./auth-service');
const UsersService = require("../users/users-service");
const SettingsService = require('../settings/settings-service');

const authRouter = express.Router();
const jsonBodyParser = express.json();
const validateEmail = (email) => {
    const re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    return re.test(email);
}
const encrypt = (string) => {
    let x = 0;
    for(let i = 0; i< string.length; i++){
        x = string[i]+x+string[i];
    }
    return x+7008041+(7007177*7005451*7004237);
};
authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const {username, password} = req.body;
        const loginUser = {username: username.toLowerCase(), password};

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

                if(dbUser.token){
                    return AuthService.comparePasswords(encrypt(loginUser.username), dbUser.password)
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
                                res.send({
                                    authToken: AuthService.createJwt(sub, payload),
                                    payload: {payload, settings: {...settings, userid: '***'}}
                                })
                            })
                        })
                } else {
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
                                res.send({
                                    authToken: AuthService.createJwt(sub, payload),
                                    payload: {payload, settings: {...settings, userid: '***'}}
                                })
                            })
                        })
                }
            })
            .catch(next)
    })
    .post('/google/login', jsonBodyParser, (req, res, next) => {
        const {token, username, nickname} = req.body;
        for (const field of ['username', 'token', 'nickname'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                });
        if (!validateEmail(username))
            return res.status(400).json({error: `Email not formatted correctly`});

        UsersService.hasUserWithUserName(req.app.get('db'), username)
            .then(hasUserWithUserName => {
                if (hasUserWithUserName)
                    return res.status(400).json({error: `Email already taken`});

                return UsersService.hashPassword(encrypt(username))
                    .then(hashedPassword => {
                        const newUser = {
                            username,
                            password: hashedPassword,
                            nickname,
                            token: 'google',
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
                                    auto_archiving: false,
                                    show_delete: false,
                                    notifications: true,
                                    compacted: 'No',
                                    paid_account: false,
                                    local_storage: true,
                                    dark_mode: false,
                                    color_style: 'standard'
                                };
                                SettingsService.insertSettings(req.app.get('db'), defaultSettings);
                                res
                                    .status(201)
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    });

module.exports = authRouter;
