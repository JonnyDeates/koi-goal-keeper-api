const express = require('express');
const settingsRouter = express.Router();
const jsonBodyParser = express.json();
const xss = require('xss');
const {requireAuth} = require('../middleware/jwt-auth');
const SettingsService = require("./settings-service");

const serializeSettings = settings => ({
    id: settings.id,
    userid: settings.userid,
    theme: xss(settings.theme),
    type_list: xss(settings.type_list),
    type_selected: xss(settings.type_selected),
    show_delete: settings.show_delete,
    auto_archiving: settings.auto_archiving,
    notifications: settings.notifications,
    compacted: xss(settings.compacted)
});
settingsRouter
    .route('/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.id)
            .then(setting => {
                if (!setting) {
                    return res.status(404).json({
                        error: {message: `Settings doesn't exist`}
                    })
                }
                res.setting = setting;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeSettings(res.setting))
    })
    .patch(jsonBodyParser, (req, res, next) => {
        const {theme, type_selected} = req.body;
        const settingUpdate = {theme, type_selected};
        const numberOfValues = Object.values(settingUpdate).length;

        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'theme', 'type_list', or 'compacted'`
                }
            });
        const newSetting = {
            ...res.setting,
            theme: settingUpdate.theme || res.setting.theme,
            type_selected: settingUpdate.type_selected || res.setting.type_selected
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, serializeSettings(newSetting))
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });
settingsRouter
    .route('/toggle/delete/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.id)
            .then(setting => {
                if (!setting) {
                    return res.status(404).json({
                        error: {message: `Settings doesn't exist`}
                    })
                }
                res.setting = setting;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const newSetting = {
            ...res.setting,
            show_delete: !res.setting.show_delete,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })

    });
settingsRouter
    .route('/toggle/notifications/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.id)
            .then(setting => {
                if (!setting) {
                    return res.status(404).json({
                        error: {message: `Settings doesn't exist`}
                    })
                }
                res.setting = setting;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const newSetting = {
            ...res.setting,
            notifications: !res.setting.notifications,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
settingsRouter
    .route('/toggle/auto_archiving/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.id)
            .then(setting => {
                if (!setting) {
                    return res.status(404).json({
                        error: {message: `Settings doesn't exist`}
                    })
                }
                res.setting = setting;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        const newSetting = {
            ...res.setting,
            auto_archiving: !res.setting.auto_archiving,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
settingsRouter
    .route('/toggle/compacted/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.id)
            .then(setting => {
                if (!setting) {
                    return res.status(404).json({
                        error: {message: `Settings doesn't exist`}
                    })
                }
                res.setting = setting;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        let newCompacted = '';
        switch (res.setting.compacted) {
            case 'No':
                newCompacted = 'Compacted';
                break;
            case 'Compacted':
                newCompacted = 'Extra-Compacted';
                break;
            case 'Extra-Compacted':
                newCompacted = 'Ultra-Compacted';
                break;
            case 'Ultra-Compacted':
                newCompacted = 'No';
                break;
            default:
                newCompacted = 'No';
                break;
        }
        const newSetting = {
            ...res.setting,
            compacted: newCompacted,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
settingsRouter
    .route('/toggle/type_list/:id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.id)
            .then(setting => {
                if (!setting) {
                    return res.status(404).json({
                        error: {message: `Settings doesn't exist`}
                    })
                }
                res.setting = setting;
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        let newType = '';
        switch (res.setting.type_list) {
            case 'Today List':
                newType = 'Short List';
                break;
            case 'Short List':
                newType = 'Normal List';
                break;
            case 'Normal List':
                newType = 'Extended List';
                break;
            case 'Extended List':
                newType = 'Full List';
                break;
            case 'Full List':
                newType = 'Today List';
                break;
            default:
                newType = 'Normal List';
                break;
        }
        const newSetting = {
            ...res.setting,
            type_list: newType,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
module.exports = settingsRouter;
