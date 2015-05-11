var listTemplate = require('./list/list.html'),
    showTemplate = require('./show/show.html'),
    createTemplate = require('./form/create.html'),
    editTemplate = require('./form/edit.html'),
    deleteTemplate = require('./delete/delete.html'),
    batchDeleteTemplate = require('./delete/batchDelete.html');

function templateProvider(viewName, defaultView) {
    return ['$stateParams', 'NgAdminConfiguration', function ($stateParams, Configuration) {
        var customTemplate;
        var view = Configuration().getViewByEntityAndType($stateParams.entity, viewName);
        customTemplate = view.template();
        if (customTemplate) return customTemplate;
        customTemplate = Configuration().customTemplate()(viewName);
        if (customTemplate) return customTemplate;
        return defaultView;
    }];
}

function viewProvider(viewName) {
    return ['$stateParams', 'NgAdminConfiguration', function ($stateParams, Configuration) {
        try {
            var view = Configuration().getViewByEntityAndType($stateParams.entity, viewName);
        } catch (e) {
            var error404 = new Error('Unknown view or entity name');
            error404.status = 404; // trigger the 404 error
            throw error404;
        }
        if (!view.isEnabled()) {
            throw new Error('The ' + viewName + ' is disabled for this entity');
        }
        return view;
    }];
}

function routing($stateProvider) {

    $stateProvider
        .state('list', {
            parent: 'main',
            url: '/:entity/list?{search:json}&page&sortField&sortDir',
            params: {
                entity: null,
                page: null,
                search: null,
                sortField: null,
                sortDir: null
            },
            controller: 'ListController',
            controllerAs: 'listController',
            templateProvider: templateProvider('ListView', listTemplate),
            resolve: {
                view: viewProvider('ListView'),
                data: ['$stateParams', 'ReadQueries', 'view', function ($stateParams, ReadQueries, view) {
                    var page = $stateParams.page,
                        filters = $stateParams.search,
                        sortField = $stateParams.sortField,
                        sortDir = $stateParams.sortDir;

                    return ReadQueries.getAll(view, page, true, filters, sortField, sortDir);
                }],
                referencedValues: ['$stateParams', 'ReadQueries', 'view', function ($stateParams, ReadQueries, view) {
                    return ReadQueries.getReferencedValues(view.getFilterReferences());
                }]
            }
        });

    $stateProvider
        .state('show', {
            parent: 'main',
            url: '/:entity/show/:id?sortField&sortDir',
            controller: 'ShowController',
            controllerAs: 'showController',
            templateProvider: templateProvider('ShowView', showTemplate),
            params: {
                entity: null,
                id: null,
                sortField: null,
                sortDir: null
            },
            resolve: {
                view: viewProvider('ShowView'),
                rawEntry: ['$stateParams', 'ReadQueries', 'view', function ($stateParams, ReadQueries, view) {
                    return RetrieveQueries.getOne(view.getEntity(), view.type, $stateParams.id, view.identifier(), view.getUrl());
                }],
                referencedValues: ['ReadQueries', 'view', 'rawEntry', function (ReadQueries, view, rawEntry) {
                    return ReadQueries.getReferencedValues(view.getReferences(), [rawEntry.values]);
                }],
                referencedListValues: ['$stateParams', 'ReadQueries', 'view', 'rawEntry', function ($stateParams, ReadQueries, view, rawEntry) {
                    var sortField = $stateParams.sortField,
                        sortDir = $stateParams.sortDir;

                    return ReadQueries.getReferencedListValues(view, sortField, sortDir, rawEntry.identifierValue);
                }],
                entry: ['ReadQueries', 'rawEntry', 'referencedValues', function(ReadQueries, rawEntry, referencedValues) {
                    return ReadQueries.fillReferencesValuesFromEntry(rawEntry, referencedValues, true);
                }]
            }
        });

    $stateProvider
        .state('create', {
            parent: 'main',
            url: '/:entity/create',
            controller: 'FormController',
            controllerAs: 'formController',
            templateProvider: templateProvider('CreateView', createTemplate),
            resolve: {
                view: viewProvider('CreateView'),
                entry: ['view', function (view) {
                    var entry = view
                        .mapEntry({});

                    view.processFieldsDefaultValue(entry);

                    return entry;
                }],
                referencedValues: ['ReadQueries', 'view', function (ReadQueries, view) {
                    return ReadQueries.getReferencedValues(view.getReferences());
                }]
            }
        });

    $stateProvider
        .state('edit', {
            parent: 'main',
            url: '/:entity/edit/:id?sortField&sortDir',
            controller: 'FormController',
            controllerAs: 'formController',
            templateProvider: templateProvider('EditView', editTemplate),
            params: {
                entity: null,
                id: null,
                sortField: null,
                sortDir: null
            },
            resolve: {
                view: viewProvider('EditView'),
                rawEntry: ['$stateParams', 'ReadQueries', 'view', function ($stateParams, ReadQueries, view) {

                }],
                referencedValues: ['ReadQueries', 'view', 'rawEntry', function (ReadQueries, view, rawEntry) {
                    return ReadQueries.getReferencedValues(view.getReferences(), null);
                }],
                referencedListValues: ['$stateParams', 'ReadQueries', 'view', 'rawEntry', function ($stateParams, ReadQueries, view, rawEntry) {
                    var sortField = $stateParams.sortField,
                        sortDir = $stateParams.sortDir;

                    return ReadQueries.getReferencedListValues(view, sortField, sortDir, rawEntry.identifierValue);
                }],
                entry: ['ReadQueries', 'rawEntry', 'referencedValues', function(ReadQueries, rawEntry, referencedValues) {
                    return ReadQueries.fillReferencesValuesFromEntry(rawEntry, referencedValues, true);
                }]
            }
        });

    $stateProvider
        .state('delete', {
            parent: 'main',
            url: '/:entity/delete/:id',
            controller: 'DeleteController',
            controllerAs: 'deleteController',
            templateProvider: templateProvider('DeleteView', deleteTemplate),
            resolve: {
                view: viewProvider('DeleteView'),
                params: ['$stateParams', function ($stateParams) {
                    return $stateParams;
                }],
                entry: ['$stateParams', 'ReadQueries', 'view', function ($stateParams, ReadQueries, view) {

                }]
            }
        });

    $stateProvider
        .state('batchDelete', {
            parent: 'main',
            url: '/:entity/batch-delete/{ids:json}',
            controller: 'BatchDeleteController',
            controllerAs: 'batchDeleteController',
            templateProvider: templateProvider('BatchDeleteView', batchDeleteTemplate),
            params: {
                entity: null,
                ids: [],
            },
            resolve: {
                view: viewProvider('BatchDeleteView'),
                params: ['$stateParams', function ($stateParams) {
                    return $stateParams;
                }]
            }
        });
}

routing.$inject = ['$stateProvider'];

module.exports = routing;
