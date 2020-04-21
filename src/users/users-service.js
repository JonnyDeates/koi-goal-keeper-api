const xss = require('xss');
const bcrypt = require('bcryptjs');
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[\S]+/;

const UsersService = {
    hashPassword(password) {
        return bcrypt.hash(password, 12);
    },
    hashUserdata(password) {
        return bcrypt.hash(password, 12);
    },
    validatePassword(password) {
        if (password.length < 8) {
            return 'Password must be longer than 8 characters';
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters';
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
            return 'Password must not start or end with empty spaces';
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
            return 'Password must contain one upper case, lower case, and number';
        }
        return null;
    },
    serializeUser(user) {
        return {
            id: user.id,
            email: xss(user.email),
            username: xss(user.username),
            nickname: xss(user.nickname),
            date_created: new Date(user.date_created)
        };
    },
    hasUserWithUserName(db, username) {
        return db('users')
            .where({username})
            .first()
            .then(user => !!user);
    },
    insertUser(db, newUser) {
        return db
            .insert(newUser)
            .into('users')
            .returning('*')
            .then(([user]) => user);
    },
    getAllUsers(db) {
        return db.select('*').from('users')
    },
    getById(db, id) {
        return db
            .from('users')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteUser(db, id) {
        return db('users')
            .where({id})
            .delete()
    },

    updateUser(db, id, newUserFields) {
        return db('users')
            .where({id})
            .update(newUserFields)
    },
};

module.exports = UsersService;
