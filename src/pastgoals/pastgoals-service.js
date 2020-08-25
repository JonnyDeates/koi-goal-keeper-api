const PastGoalService = {
    getAllPastGoals(knex, userid) {
        return knex
            .select('*')
            .where('userid', userid)
            .from('past_goals');
    },
    getById(knex, id) {
        return knex
            .from('past_goals')
            .select('*')
            .where('id', id)
            .first()
    },
    countPastGoals(knex, userid) {
    return knex('past_goals')
        .count('userid', {as: 'count'})
        .where({userid})
        .then((count) => count);
    },
    deleteItem(knex, id) {
        return knex('past_goals')
            .where({id})
            .delete()
    },
    deleteAllPastGoals(knex, userid){
        return knex('past_goals')
            .where({userid})
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
    }
};

module.exports = PastGoalService;