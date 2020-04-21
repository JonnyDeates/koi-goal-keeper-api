const express = require('express');
const path = require('path');
const settingsRouter = require("./settings-service");
const usersRouter = express.Router();
const jsonBodyParser = express.json();
const xss = require('xss');
const {requireAuth} = require('../middleware/jwt-auth');
const SettingsService = require("./settings-service");

const serializeSettings = settings => ({
    user_id: settings.user_id,
    theme: xss(settings.theme),
    type_list: xss(settings.type_list),
    type_selected: xss(settings.type_list),
    show_delete: xss(settings.show_delete),
    notifications: xss(settings.notifications),
    compacted: xss(settings.compacted)
});

settingsRouter
    .route('/')
    .post(jsonBodyParser, (req, res, next) => {
        const {user_id} = req.body;
        if (!user_id)
            return res.status(400).json({
                    error: `Missing user_id in request body`
                });

        const defaultSettings = {
            user_id,
            theme: 'Light Mode',
            type_list: 'Normal List',
            type_selected: 'All',
            show_delete: false,
            notifications: true,
            compacted: 'No'
        };
        SettingsService.insertSettings(req.app.get('db'), defaultSettings)
            .then(obj => {
                res.status(201).json(obj)
            })
            .catch(next)
    });
settingsRouter
    .route('/:user_id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.user_id)
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
        const {theme, type_selected, compacted} = req.body;
        const settingUpdate = {theme, type_selected, compacted};
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
            type_selected: settingUpdate.type_selected || res.setting.type_selected,
            compacted: settingUpdate.compacted || res.setting.compacted,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.user_id, serializeSettings(newSetting))
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });
settingsRouter
    .route('/toggle/delete/:user_id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.user_id)
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
        SettingsService.updateSettings(req.app.get('db'), req.params.user_id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
settingsRouter
    .route('/toggle/notifications/:user_id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.user_id)
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
        SettingsService.updateSettings(req.app.get('db'), req.params.user_id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
settingsRouter
    .route('/toggle/compacted/:user_id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.user_id)
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
        SettingsService.updateSettings(req.app.get('db'), req.params.user_id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
settingsRouter
    .route('/toggle/type_list/:user_id')
    .all(requireAuth)
    .all((req, res, next) => {
        SettingsService.getById(req.app.get('db'), req.params.user_id)
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
        SettingsService.updateSettings(req.app.get('db'), req.params.user_id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
module.exports = usersRouter;
