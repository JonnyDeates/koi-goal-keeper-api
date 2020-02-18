/* eslint-disable indent */
'use strict';
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('User Endpoints', function() {
	let db;

	const testUsers = helpers.makeUsersArray();
	const testUser = testUsers[0];

	before('make knex instance', () => {
		db = helpers.makeKnexInstance();
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());

	before('cleanup', () => helpers.cleanTables(db));

	afterEach('cleanup', () => helpers.cleanTables(db));

	/**
   Register a user and populate their fields
   **/
	describe(`POST /api/users`, () => {
		beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

		const requiredFields = [ 'username', 'password', 'email' ];

		requiredFields.forEach((field) => {
			const registerAttemptBody = {
				username: 'test username',
				password: 'test password',
				email: 'test email'
			};

			it(`responds with 400 required error when '${field}' is missing`, () => {
				delete registerAttemptBody[field];

				return supertest(app).post('/users').send(registerAttemptBody).expect(400, {
					error: `Missing '${field}' in request body`
				});
			});
		});

		it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
			const userShortPassword = {
				username: 'test username',
				password: '1234567',
				email: 'test@gmail.com'
			};
			return supertest(app)
				.post('/users')
				.send(userShortPassword)
				.expect(400, { error: `Password must be longer than 8 characters` });
		});

		it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
			const userLongPassword = {
				username: 'test username',
				password: '*'.repeat(73),
				email: 'test@gmail.com'
			};
			return supertest(app)
				.post('/users')
				.send(userLongPassword)
				.expect(400, { error: `Password must be less than 72 characters` });
		});

		it(`responds 400 error when password starts with spaces`, () => {
			const userPasswordStartsSpaces = {
				username: 'test username',
				password: ' 1Aa!2Bb@',
				email: 'test@gmail.com'
			};
			return supertest(app).post('/users').send(userPasswordStartsSpaces).expect(400, {
				error: `Password must not start or end with empty spaces`
			});
		});

		it(`responds 400 error when password ends with spaces`, () => {
			const userPasswordEndsSpaces = {
				username: 'test username',
				password: '1Aa!2Bb@ ',
				email: 'test@gmail.com'
			};
			return supertest(app).post('/users').send(userPasswordEndsSpaces).expect(400, {
				error: `Password must not start or end with empty spaces`
			});
		});

		it(`responds 400 error when password isn't complex enough`, () => {
			const userPasswordNotComplex = {
				username: 'test username',
				password: 'AAaabbcc',
				email: 'test@gmail.com'
			};
			return supertest(app).post('/users').send(userPasswordNotComplex).expect(400, {
				error: `Password must contain one upper case, lower case, and number`
			});
		});

		describe(`Given a valid user`, () => {
			it(`stores the new user in db with bcryped password`, () => {
				const newUser = {
					user_name: 'test username',
					password: '11AAaa!!',
					full_name: 'test name'
				};
				return supertest(app).post('/users').send(newUser).expect((res) =>
					db
						.from('users')
						.select('*')
						.where({ id: res.body.id })
						.first()
						.then((row) => {
							expect(row.username).to.eql(newUser.username);
							expect(row.email).to.eql(newUser.email);

							return bcrypt.compare(newUser.password, row.password);
						})
						.then((compareMatch) => {
							expect(compareMatch).to.be.true;
						})
				);
			});
		});
	});
});
