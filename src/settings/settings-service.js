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
            .where('user_id', userid)
            .first()
    },
    deleteSettings(knex, id) {
        return knex('settings')
            .where({id})
            .delete()
    },
    postSettings(knex, newSettings) {
        return knex
            .insert(newSettings)
            .into('settings')
            .returning('*')
            .then(([settings]) => settings);
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
