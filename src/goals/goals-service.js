const GoalService = {
    getAllGoals(knex, userid) {
        return knex
            .select('*')
            .where('userid', userid)
            .from('current_goals');
    },
    getById(knex, id) {
        return knex
            .from('current_goals')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteItem(knex, id) {
        return knex('current_goals')
            .where({id})
            .delete()
    },
    insertGoal(knex, newGoal) {
        return knex
            .insert(newGoal)
            .into('current_goals')
            .returning('*')
            .then(([goal]) => goal)
            .then(goal =>
                GoalService.getById(knex, goal.id)
            )
    },
    updateGoal(knex, id, newGoal) {
        return knex('current_goals')
            .where({id})
            .update(newGoal)
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

module.exports = GoalService;