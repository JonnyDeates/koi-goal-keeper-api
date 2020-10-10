const express = require('express');
const settingsRouter = express.Router();
const jsonBodyParser = express.json();
const {postCharge} = require('../payment.js');
const xss = require('xss');
const {requireAuth} = require('../middleware/jwt-auth');
const SettingsService = require("./settings-service");
const serializeColorStyle = (paid_account, color_style) => {
    if (!paid_account)
        return 'Default';
    return color_style
};
const serializeTheme = (paid_account, theme) => {
    if (!paid_account)
        return (theme === 'Default' || theme === 'Bekko') ? theme : 'Default';
    return theme
};
const seralizeTypeList = (paid_account, type_list) => {
    if (!paid_account)
        return (type_list === 'Normal List' || type_list === 'Short List') ? type_list : 'Normal List';
    return type_list
};
const serializeSettings = settings => ({
    id: settings.id,
    userid: settings.userid,
    theme: xss(serializeTheme(settings.paid_account, settings.theme)),
    type_list: xss(seralizeTypeList(settings.paid_account, settings.type_list)),
    type_selected: xss(settings.type_selected),
    show_delete: settings.show_delete,
    auto_archiving: settings.auto_archiving,
    ascending: settings.ascending,
    sort_style: settings.sort_style,
    dark_mode: settings.dark_mode,
    local_storage: settings.local_storage,
    notifications: settings.notifications,
    paid_account: settings.paid_account,
    color_style: serializeColorStyle(settings.paid_account, settings.color_style),
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
        const {theme, type_selected, color_style, sort_style, type_list} = req.body;
        const settingUpdate = {theme, type_selected, color_style, sort_style, type_list};
        const numberOfValues = Object.values(settingUpdate).length;

        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'theme', 'type_selected', 'type_list', or 'color_style'`
                }
            });
        const newSetting = {
            ...res.setting,
            color_style: settingUpdate.color_style || res.setting.color_style,
            theme: settingUpdate.theme || res.setting.theme,
            type_list: settingUpdate.type_list || res.setting.type_list,
            sort_style: settingUpdate.sort_style || res.setting.sort_style,
            type_selected: settingUpdate.type_selected || res.setting.type_selected
        };
        console.log(sort_style, newSetting)
        SettingsService.updateSettings(req.app.get('db'), req.params.id, serializeSettings(newSetting))
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    });
settingsRouter
    .route('/all/:id')
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
    .patch(jsonBodyParser, (req, res, next) => {
        const {type_list, theme, type_selected, color_style, show_delete, notifications, auto_archiving, dark_mode,
            local_storage, compacted, ascending, sort_style} = req.body;
        const settingUpdate = {
            type_list,
            theme,
            type_selected,
            color_style,
            show_delete,
            notifications,
            auto_archiving,
            ascending,
            dark_mode,
            local_storage,
            sort_style,
            compacted
        };
        const numberOfValues = Object.values(settingUpdate).length;

        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must contain an entire settings object.`
                }
            });
        let paid_account = res.setting.paid_account;
        const newSetting = {
            ...res.setting,
            ascending: typeof settingUpdate === 'boolean' ? settingUpdate.ascending : res.setting.ascending,
            show_delete: typeof settingUpdate === 'boolean' ? settingUpdate.show_delete : res.setting.show_delete,
            notifications: typeof settingUpdate === 'boolean' ? settingUpdate.notifications : res.setting.notifications,
            auto_archiving: typeof settingUpdate === 'boolean' ? settingUpdate.auto_archiving : res.setting.auto_archiving,
            dark_mode: typeof settingUpdate === 'boolean' ? settingUpdate.dark_mode : res.setting.dark_mode,
            type_list: seralizeTypeList(paid_account, settingUpdate.type_list || res.setting.type_list),
            color_style: serializeColorStyle(paid_account, settingUpdate.color_style || res.setting.color_style),
            theme: serializeTheme(paid_account, settingUpdate.theme || res.setting.theme),
            sort_style: settingUpdate.sort_style || res.setting.sort_style,
            type_selected: settingUpdate.type_selected || res.setting.type_selected,
            compacted: settingUpdate.compacted || res.setting.compacted
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
    .route('/toggle/ascending/:id')
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
            ascending: !res.setting.ascending,
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
    .route('/toggle/dark_mode/:id')
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
            dark_mode: !res.setting.dark_mode,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });
settingsRouter
    .route('/toggle/local_storage/:id')
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
            local_storage: !res.setting.local_storage,
        };
        SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
            .then(() => {
                res.status(204).json(res.setting)
            })
    });

settingsRouter
    .route('/toggle/paid_account/:id')
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
    .post(jsonBodyParser, (req, res, next) => {
        postCharge(req, res).then((obj) => {
            if (!obj.error) {
                const newSetting = {
                    ...res.setting,
                    paid_account: !res.setting.paid_account,
                };
                SettingsService.updateSettings(req.app.get('db'), req.params.id, newSetting)
                    .then(() => {
                        res.status(204).json({setting: res.setting, ...obj})
                    })
            }
        }).catch(next);
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
        if (!res.setting.paid_account) {
            switch (res.setting.type_list) {
                case 'Short List':
                    newType = 'Normal List';
                    break;
                case 'Normal List':
                    newType = 'Short List';
                    break;
                default:
                    newType = 'Normal List';
                    break;
            }
        } else {
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
