/* eslint-disable indent */
'use strict';
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Goals Endpoints', function() {
	let db;

	const testUsers = helpers.makeUsersArray();
	const [ testUser ] = testUsers;
	const [ testGoals ] = helpers.makeGoals(testUser);

	before('make knex instance', () => {
		db = helpers.makeKnexInstance();
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());

	before('cleanup', () => helpers.cleanTables(db));

	afterEach('cleanup', () => helpers.cleanTables(db));

	/**
   Endpoints for a goal owned by a user
   **/
	describe(`Endpoints protected by user`, () => {
		const goalSpecificEndpoint = [
			{
				title: `GET /goals/1`,
				path: `/goals/1`,
				method: supertest(app).get
			}
		];

		goalSpecificEndpoint.forEach((endpoint) => {
			describe(endpoint.title, () => {
				beforeEach('insert users and goals', () => {
					return helpers.seedUsers(db, testUsers);
				});

				it(`responds with 404 if user doesn't have any goals`, () => {
					return endpoint
						.method(endpoint.path)
						.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
						.expect(404, {
							error: {message: "Goal doesn't exist"}
						});
				});
			});
		});
	});

	/**
   * @description Get goals for a user
   **/
	describe(`GET /goals`, () => {
		const [ usersJournal ] = testGoals.filter((journal) => journal.userid === testUser.id);
		beforeEach('insert users and journals', () => {
			return helpers.seedUsersGoals(db, testUsers, testGoals);
		});

		it(`responds with 200 and user's goal`, () => {
			return supertest(app)
				.get(`/goals/1`)
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('id', usersJournal.id);
					expect(res.body).to.have.property('checkedamt', usersJournal.checkedamt+'');
					expect(res.body).to.have.property('userid', usersJournal.userid);
				});
		});
	});
});
