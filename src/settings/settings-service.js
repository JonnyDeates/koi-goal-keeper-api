const SettingsService = {
    getById(knex, id) {
        return knex
            .from('settings')
            .select('*')
            .where('id', id)
            .first()
    },
    getByUserId(knex, userid) {
        return knex
            .from('settings')
            .select('*')
            .where('userid', userid)
            .first()
    },
    deleteSettings(knex, id) {
        return knex('settings')
            .where({id})
            .delete()
    },
    insertSettings(knex, newSettings) {
        return knex
            .insert(newSettings)
            .into('settings')
    },
    updateSettings(knex, id, newSettings) {
        return knex('settings')
            .where({id})
            .update(newSettings)
            .then(obj =>
                SettingsService.getById(knex, id)
            )
    },
};

module.exports = SettingsService;
