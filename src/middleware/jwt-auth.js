const AuthService = require('./auth-service');
const SettingsService = require("../settings/settings-service");

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || '';

    let bearerToken;
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({error: 'Missing bearer token'})
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken);

        AuthService.getUserWithUserName(req.app.get('db'), payload.sub,)
            .then(async user => {
                if (!user)
                    return res.status(401).json({error: 'Unauthorized request'});
                req.user = user;

               await SettingsService.getByUserId(req.app.get('db'), req.user.id)
                    .then(settings => req.paid_account = settings.paid_account)
                    .catch(e => req.paid_account = false);

                next();
                return null;
            })
            .catch(err => {
                console.error(err);
                next(err)
            })
    } catch (error) {
        res.status(401).json({error: 'Unauthorized request'})
    }
}

module.exports = {
    requireAuth,
};
