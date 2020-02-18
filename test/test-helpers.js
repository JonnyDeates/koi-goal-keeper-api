/* eslint-disable indent */
'use strict';
const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//knex instance connection to postgres

function makeKnexInstance() {
	return knex({
		client: 'pg',
		connection: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/koigoalkeeper-test'
	});
}

//create testUsers
function makeUsersArray() {
	return [
		{
			id: 0,
			username: 'test-user-4',
			email: 'test123@gmail.com',
			password: 'password123'
		},
	];
}

function makeGoals(user) {
	const goals = [
		{
			id: 1,
			checkedamt: 0,
			userid: user.id
		},
		{
			id: 2,
			checkedamt: 0,
			userid: user.id
		},
		{
			id: 3,
			checkedamt: 0,
			userid: user.id
		}
	];
	return [ goals ];
}

function makeObjectives(goal) {
	const goals = [
		{
			id: 1,
			checked: false,
			obj: 'Objective 1',
			goalid: goal.id
		},
		{
			id: 2,
			checked: false,
			obj: 'Objective 2',
			goalid: goal.id
		},
		{
			id: 3,
			checked: false,
			obj: 'Objective 3',
			goalid: goal.id
		},
	];
	return [ goals ];
}

//make bearer token w. jwt auth header
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
	const token = jwt.sign({ userId: user.id }, secret, {
		subject: user.username,
		algorithm: 'HS256'
	});
	return `Bearer ${token}`;
}

function cleanTables(db) {
	return db.transaction((trx) =>
		trx.raw(`DELETE FROM users WHERE id >= 0; 
		DELETE FROM current_goals WHERE id >= 0;
		DELETE FROM past_goals WHERE id >= 0;
		DELETE FROM objectives WHERE id >= 0;
		DELETE FROM past_objectives WHERE id >= 0`)

	);
}

function seedUsers(db, users) {
	const preppedUsers = users.map((user) => ({
		...user,
		password: bcrypt.hashSync(user.password, 1)
	}));
	try{
	return db.transaction(async (trx) => {
		await trx.into('users').insert(preppedUsers);
	});
	} catch (e) {
		return null;
	}
}

async function seedUsersGoals(db, users, goals) {
	await seedUsers(db, users);

	await db.transaction(async (trx) => {
		await trx.into('current_goals').insert(goals);

		await trx.raw(`SELECT setval('current_goals_id_seq', ?)`, [ goals[goals.length - 1].id ]);
	});
}
async function seedUsersObjectives(db, users, goals, objectives) {
	await seedUsersGoals(db, users, goals);

	await db.transaction(async (trx) => {
		await trx.into('objectives').insert(objectives);

		await trx.raw(`SELECT setval('objectives_id_seq', ?)`, [ objectives[objectives.length - 1].id ]);
	});
}
module.exports = {
	makeKnexInstance,
	makeUsersArray,
	makeGoals,
	makeObjectives,
	makeAuthHeader,
	cleanTables,
	seedUsers,
	seedUsersGoals,
	seedUsersObjectives
};
