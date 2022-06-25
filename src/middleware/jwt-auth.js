const AuthService = require('./auth-service');
const {JWT_SUB} = require('../config');

function requireAuth(req, res, next) {
    let bearerToken = req.get('authorization') || '';

    if (!bearerToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({error: 'Missing bearer token'})
    } else {
        bearerToken = bearerToken.slice(7, bearerToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken);

        if(payload.sub !== JWT_SUB)
            return res.status(401).json({error: 'Unauthorized request'})

        AuthService.getUserWithEmail(req.app.get('db'), payload.email)
            .then(async user => {
                if (!user && !payload.token_accessed)
                    return res.status(401).json({error: 'Unauthorized request'});

                const newDate = new Date(payload.token_accessed);
                newDate.setUTCDate(newDate.getUTCDate() + 7);
                const expiryDate = new Date();

                if(expiryDate.valueOf() >= newDate.valueOf())
                    return res.status(401).json({error: 'Unauthorized request, Token Expired'});

                req.user = user;

                next();
                return null;
            })
            .catch(err => next(err))
    } catch (error) {
        res.status(401).json({error: 'Unauthorized request'})
    }
}

module.exports = {
    requireAuth,
};
