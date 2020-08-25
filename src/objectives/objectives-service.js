const ObjectivesService = {
    getGroupedObjectives(knex, goalid) {
        return knex
            .select('*')
            .where('goalid', goalid)
            .from('objectives');
    },
    getById(knex, id) {
        return knex
            .from('objectives')
            .select('*')
            .where('id', id)
            .first()
    },
    deleteObjective(knex, id) {
        return knex('objectives')
            .where({id})
            .delete()
    },
    insertObjective(knex, newObj) {
        return knex
            .insert(newObj)
            .into('objectives')
            .returning('*')
            .then(([obj]) => obj)
            .then(obj =>
                ObjectivesService.getById(knex, obj.id)
            )
    },
    updateObjective(knex, id, newObj) {
        return knex('objectives')
            .where({id})
            .update(newObj)
            .then(obj =>
                ObjectivesService.getById(knex, id)
            )
    },
};

module.exports = ObjectivesService;
