/* eslint-disable indent */
'use strict';
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Objectives Endpoints', function() {
	let db;

	const testUsers = helpers.makeUsersArray();
	const [ testUser ] = testUsers;
	const [ testGoals ] = helpers.makeGoals(testUser);
	const [ testObjectives ] = helpers.makeObjectives(testGoals[0]);

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
				title: `GET /objectives/1`,
				path: `/objectives/1`,
				method: supertest(app).get
			}
		];

		goalSpecificEndpoint.forEach((endpoint) => {
			describe(endpoint.title, () => {
				beforeEach('insert users and journals ', () => {
					return helpers.seedUsers(db, testUsers);
				});

				it(`responds with 404 if user doesn't have any objectives`, () => {
					return endpoint
						.method(endpoint.path)
						.set('Authorization', helpers.makeAuthHeader(testUsers[0]))
						.expect(404, {
							error: {message: "Objective doesn't exist"}
						});
				});
			});
		});
	});

	/**
   * @description Get goals for a user
   **/
	describe(`GET /objectives`, () => {
		const [ usersGoal ] = testGoals.filter((goal) => goal.userid === testUser.id);
		const [ usersObjectives ] = testObjectives.filter((obj) => obj.goalid === usersGoal.id);
		beforeEach('insert users and objectives', () => {
			return helpers.seedUsersObjectives(db, testUsers, testGoals, testObjectives);
		});
		it(`responds with 200 and user's objectives`, () => {
			return supertest(app)
				.get(`/objectives/1`)
				.set('Authorization', helpers.makeAuthHeader(testUser))
				.expect(200)
				.expect((res) => {
					expect(res.body).to.have.property('id', usersObjectives.id);
					expect(res.body).to.have.property('checked', usersObjectives.checked);
					expect(res.body).to.have.property('obj', usersObjectives.obj);
				});
		});
	});
});
