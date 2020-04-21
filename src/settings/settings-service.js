const SettingsService = {
    getById(knex, id) {
        return knex
            .from('settings')
            .select('*')
            .where('user_id', id)
            .first()
    },
    deleteSettings(knex, id) {
        return knex('settings')
            .where({user_id: id})
            .delete()
    },
    insertSettings(knex, newSettings) {
        return knex
            .insert(newSettings)
            .into('settings')
            .returning('*')
            .then(([obj]) => obj)
            .then(obj =>
                SettingsService.getById(knex, obj.user_id)
            )
    },
    updateSettings(knex, id, newSettings) {
        return knex('settings')
            .where({user_id: id})
            .update(newSettings)
            .then(obj =>
                ObjectivesService.getById(knex, id)
            )
    },
};

module.exports = SettingsService;
