const PastGoalService = {
    getAllPastGoals(knex, userid) {
        return knex
            .select('*')
            .where('userid', userid)
            .from('past_goals');
    },
    getById(knex, id, userid) {
        return knex
            .from('past_goals')
            .select('*')
            .where('id', id)
            .where('userid',userid)
            .first()
    },
    deleteItem(knex, id) {
        return knex('past_goals')
            .where({id})
            .delete()
    },
    insertPastGoal(knex, newPastGoal) {
        return knex
            .insert(newPastGoal)
            .into('past_goals')
            .returning('*')
            .then(([pg]) => pg)
            .then(pg =>
                PastGoalService.getById(knex, pg.id)
            )
    },
    updatePastGoal(knex, id, newPastGoal) {
        return knex('past_goals')
            .where({id})
            .update(newPastGoal)
    },
    serializeGoal(goal) {
        return {
            id: goal.id,
            type: goal.type,
            currentamt: goal.currentamt,
            goals: goal.goals,
            userid: goal.userid,
            date: goal.date
        }
    }
};

module.exports = PastGoalService;