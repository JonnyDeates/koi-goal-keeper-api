const PastObjectivesService = {
    getGroupedObjectives(knex, goalid) {
        return knex
            .select('*')
            .where('goalid', goalid)
            .from('past_objectives');
    },
    getById(knex, id) {
        return knex
            .from('past_objectives')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteObjective(knex, id) {
        return knex('past_objectives')
            .where({id})
            .delete()
    },
    insertObjective(knex, newObj) {
        return knex
            .insert(newObj)
            .into('past_objectives')
            .returning('*')
            .then(([obj]) => obj)
            .then(obj =>
                PastObjectivesService.getById(knex, obj.id)
            )
    },
    updateObjective(knex, id, newObj) {
        return knex('past_objectives')
            .where({id})
            .update(newObj)
            .then(obj =>
                PastObjectivesService.getById(knex, id)
            )
    },
};

module.exports = PastObjectivesService;