require('dotenv').config();
const { EMAIL_SECRET, JWT_SUB} = require('../config');
const express = require('express');
const AuthService = require('./auth-service');
const UsersService = require("../users/users-service");
const SettingsService = require('../settings/settings-service');
const nodemailer = require('nodemailer')
const {requireAuth} = require("./jwt-auth");
const authRouter = express.Router();
const jsonBodyParser = express.json();
const validateEmail = (email) => {
    const re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
    return re.test(email);
};
const businessEmail = 'thekoifoundation@gmail.com';
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {user: businessEmail, pass: EMAIL_SECRET},
    tls: {
        rejectUnauthorized: false
    }
});
authRouter
    .post('/login', jsonBodyParser, (req, res, next) => {
        const {email, password} = req.body;
        const loginUser = {email: email.toLowerCase(), password};

        for (const [key, value] of Object.entries(loginUser))
            if (value == null)
                return res.status(400).json({
                    error: `Missing '${key}' in request body`
                });

        AuthService.getUserWithEmail(req.app.get('db'), loginUser.email)
            .then(dbUser => {
                if (!dbUser)
                    return res.status(400).json({
                        error: 'Incorrect email or password',
                    });
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch)
                            return res.status(400).json({
                                error: 'Incorrect email or password',
                            });
                        SettingsService.getByUserId(req.app.get('db'), dbUser.id).then((settings) => {
                            delete settings.id;
                            delete settings.user_id;
                            const token_accessed = new Date().toUTCString()
                            const sub = JWT_SUB
                            settings.email = dbUser.email;
                            settings.nickname = dbUser.nickname;
                            settings.paid_account = dbUser.paid_account;
                            UsersService.updateUser(req.app.get('db'), dbUser.id, {token_accessed}).then(
                                () =>
                                    res.send({
                                        authToken: AuthService.createJwt(sub, {
                                            email: dbUser.email,
                                            token_accessed
                                        }), ...settings
                                    })
                            )
                        })
                    })
            })
            .catch(next)
    })
    .post('/forgot-password', jsonBodyParser, (req, res, next) => {
        const {email} = req.body;
        if (!email)
            return res.status(400).json({error: `Email not received`});

        if (!validateEmail(email))
            return res.status(400).json({error: `Email not formatted correctly`});

        let randInt = (int) => Math.floor(Math.random() * int);
        let token = `${randInt(10)}${randInt(10)}${randInt(10)}${randInt(10)}${randInt(10)}${randInt(10)}${randInt(10)}`;

        let mail = {
            from: businessEmail,
            to: email,
            subject: 'KoiGoalKeeper Password Reset',
            text: 'To reset your password enter the token provided on https://koigoalkeeper.com/login/verification . \n' +
                'Thank you for using the Koi Foundation Services. We appreciate our customers to the highest degree! \n' +
                `The token is: ${token}`
        };

        UsersService.getUserWithEmail(req.app.get('db'), email)
            .then(user => {
                if (user) {
                    return emailTransporter.sendMail(mail, (e, info) => (e)
                        ? res.status(500).json({error: `Mailer Issue: \n ${e}`})
                        : UsersService.hashUserdata(token)
                            .then(hashedToken =>
                                UsersService.updateUser(req.app.get('db'), user.id, {
                                    token: hashedToken,
                                    date_modified: 'now()'
                                })
                                    .then(() => res.status(204).json({email}))
                                    .catch(() => res.status(500).json({error: `Couldn't update User`}))
                            )
                            .catch(() => res.status(500).json({error: `Internal Server Error`}))
                    )
                } else {
                    return res.status(400).json({
                        error: `Email does not exist`
                    });
                }
            })
            .catch(next)
    })
    .post('/verification', jsonBodyParser, (req, res, next) => {
        const {email, token, password} = req.body;
        for (const field of ['email', 'token', 'password'])
            if (!req.body[field])
                return res.status(400).json({error: `Missing '${field}' in request body`});

        if (!validateEmail(email))
            return res.status(400).json({error: `Email not formatted correctly`});

        const passwordError = UsersService.validatePassword(password);
        if (passwordError)
            return res.status(400).json({error: passwordError});

        UsersService.getUserWithEmail(req.app.get('db'), email)
            .then(user => {
                if (user) {
                    AuthService.comparePasswords(token, user.token)
                        .then(tokenValid => {
                                return (tokenValid
                                    ? UsersService.hashPassword(password).then(hashPassword =>
                                        UsersService.updateUser(req.app.get('db'), user.id, {
                                            password: hashPassword,
                                            date_modified: 'now()'
                                        }).then(() => res.status(204).end()))
                                    : res.status(400).json({error: 'Incorrect Token'}))
                            }
                        )
                        .catch(()=> res.status(400).json({error: 'Incorrect Token'}))
                } else {
                    return res.status(400).json({
                        error: `Email does not exist`
                    });
                }
            })
            .catch(next)
    });
authRouter
    .route('/token-check')
    .all(requireAuth)
    .get((req, res, next) => {
        res.status(200).end();
    })

module.exports = authRouter;
