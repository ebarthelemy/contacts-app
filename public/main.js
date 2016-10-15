var app = angular.module('contacts-app', [
    'ngResource',
    'infinite-scroll',
    'angularSpinner',
    'jcs-autoValidate',
    'angular-ladda',
    'mgcrea.ngStrap',
    'toaster',
    'ngAnimate',
    'ui.router'
]);

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('list', {
            url: "/",
            views: {
                'main': {
                    templateUrl: 'templates/list.html',
                    controller: 'PersonListController'
                },
                'search': {
                    templateUrl: 'templates/searchform.html',
                    controller: 'PersonListController'
                }
            }
        })
        .state('create', {
            url: "/create",
            views: {
                'main': {
                    templateUrl: 'templates/edit.html',
                    controller: 'PersonCreateController'
                }
            }
        })
        .state('edit', {
            url: "/edit/:email",
            views: {
                'main': {
                    templateUrl: 'templates/edit.html',
                    controller: 'PersonDetailController'
                }
            }
        });

    $urlRouterProvider.otherwise('/');
});

app.config(function ($httpProvider, $resourceProvider, laddaProvider, $datepickerProvider) {
    $httpProvider.defaults.headers.common['Authorization'] = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjBlNDQyOTVjMDA0ZTFlZTkxYWRlNzA4OTgzZjEwODk0NjI0NDQ5ODUzOWNlYzhjZjE5ZWNlYzAyMzliMGI5ZjU1ZjA5OTU1ZTYxMGYxMWJiIn0.eyJhdWQiOiIzIiwianRpIjoiMGU0NDI5NWMwMDRlMWVlOTFhZGU3MDg5ODNmMTA4OTQ2MjQ0NDk4NTM5Y2VjOGNmMTllY2VjMDIzOWIwYjlmNTVmMDk5NTVlNjEwZjExYmIiLCJpYXQiOjE0NzY1MDA2NzMsIm5iZiI6MTQ3NjUwMDY3MywiZXhwIjo0NjMyMTc0MjczLCJzdWIiOiIxIiwic2NvcGVzIjpbXX0.IL-691rl3ZkIPeqMBTmYjS-s-FCe5srluV84LsPmYItNSVQRaKoG2Qs292lOjNp7NVyo7LADyNVLB56WYuq0PZbgOK_iKR65qg_to8uIjid4I0ThoXA8IsTrojG__h7kbw8Bm9CVOL80aAwNE4WubpZiqgz736zOGhpE7GV2mef0aI508lJjyXdkAqXeXwSwbxkMGg3RrqfudsLU4nqky6CAPPArrUsHC2J8lMZc0RVE9uSOvq0EVBGzOVvNtTu3jNtMbnW2H2PdwTXxKxwKzuewLeVziLRXfwvsbPip7UdDZ92Dll9-BU2sn5jUUhjLFnNOwAf_mj1QzmgmiM12O8bwApuOavZPdxp7xOKuMaqRNf3INiklme2I00gjl7rG84-QSqgOI9Q7ELghUD-pTk571O7VWeyPRO9LmVPKoKNAPpIfqouVFGul03mGzW8IdNXy3WqNkWYxrI8eknuYlCxfwgL02jO39MixIoE2xmxdBzQWbs6gnpphvwhAR_Yu_qz_Laef9TRjpYIgNhc0jX8VKxcAcWiqGbALZ5jSzybpsAONPgEvqJ0_lUQ_gqfj-UXhCxwUfGbM3ITSNalfjxTwz8T6C0l31rEKKSS4bU116lIgkT-hO8ZALqn2T3RK-wGlU380vh9_Gei7dg5wKUX9C4Fk7_hTuqvYA5PZLrA';
    $httpProvider.defaults.headers.common['Accept'] = 'application/json';
    $resourceProvider.defaults.stripTrailingSlashes = false;
    laddaProvider.setOption({
        style: 'expand-right'
    });
    angular.extend($datepickerProvider.defaults, {
        dateFormat: 'M/dd/yyyy',
        modelDateFormat: 'yyyy-M-dd',
        dateType: 'string',
        autoclose: true
    });
});

app.filter('defaultImage', function () {
    return function (input, param) {
        if (!input) {
            return param
        }
        return input;
    }
});

app.factory("Contact", function ($resource) {
    return $resource("http://192.34.60.253/api/contacts/:id/", {id: '@id'}, {
        update: {
            method: 'PUT'
        }
    });
});

// Directives
app.directive('contactsSpinner', function () {
    return {
        'restrict': 'AE',
        'templateUrl': 'templates/spinner.html',
        'scope': {
            'isLoading': '=',
            'message': '@'
        }
    }
});

app.directive('contactsCard', function () {
    return {
        'restrict': 'AE',
        'templateUrl': 'templates/card.html',
        'scope': {
            'user': '='
        },
        'controller': function ($scope, ContactService) {
            $scope.isDeleting = false;
            $scope.deleteUser = function () {
                $scope.isDeleting = true;
                ContactService.removeContact($scope.user).then(function () {
                    $scope.isDeleting = false;
                });
            };

        }
    }
});

// Controllers
app.controller('PersonListController', function ($scope, $modal, ContactService) {

    $scope.search = "";
    $scope.order = "email";
    $scope.contacts = ContactService;

    $scope.loadMore = function () {
        $scope.contacts.loadMore();
    };

});

app.controller('PersonCreateController', function ($scope, $state, ContactService) {
    $scope.mode = "Create";

    $scope.contacts = ContactService;
    $scope.contacts.selectedPerson = {};

    $scope.save = function () {
        $scope.contacts.createContact($scope.contacts.selectedPerson)
            .then(function () {
                $state.go("list");
            })
    };
});

app.controller('PersonDetailController', function ($scope, $stateParams, $state, ContactService) {
    $scope.mode = "Edit";

    $scope.contacts = ContactService;
    $scope.contacts.selectedPerson = $scope.contacts.getPerson($stateParams.email);

    $scope.save = function () {
        $scope.contacts.updateContact($scope.contacts.selectedPerson).then(function () {
            $state.go("list");
        });
    };

    $scope.remove = function () {
        $scope.contacts.removeContact($scope.contacts.selectedPerson).then(function () {
            $state.go("list");
        });
    }
});

app.service('ContactService', function (Contact, $rootScope, $q, toaster) {
    var self = {
        'getPerson': function (email) {
            for (var i = 0; i < self.persons.length; i++) {
                var obj = self.persons[i];
                if (obj.email == email) {
                    return obj;
                }
            }
        },
        'page': 1,
        'hasMore': true,
        'isLoading': false,
        'isSaving': false,
        'selectedPerson': null,
        'persons': [],
        'search': null,
        'ordering': 'name',
        'doSearch': function () {
            self.hasMore = true;
            self.page = 1;
            self.persons = [];
            self.loadContacts();
        },
        'doOrder': function () {
            self.hasMore = true;
            self.page = 1;
            self.persons = [];
            self.loadContacts();
        },
        'loadContacts': function () {
            if (self.hasMore && !self.isLoading) {
                self.isLoading = true;

                var params = {
                    'page': self.page,
                    'search': self.search,
                    'ordering': self.ordering
                };

                Contact.get(params, function (response) {
                    angular.forEach(response.data.data, function (person) {
                        self.persons.push(new Contact(person));
                    });

                    if (response.data.current_page == response.data.last_page) {
                        self.hasMore = false;
                    }
                    self.isLoading = false;
                });
            }

        },
        'loadMore': function () {
            if (self.hasMore && !self.isLoading) {
                self.page += 1;
                self.loadContacts();
            }
        },
        'createContact': function (person) {
            var d = $q.defer();
            self.isSaving = true;
            Contact.save(person).$promise.then(function (response) {
                self.isSaving = false;
                self.selectedPerson = null;
                self.hasMore = true;
                self.page = 1;
                self.persons = [];
                self.loadContacts();
                toaster.pop('success', response.data);
                d.resolve()
            });
            return d.promise;
        },
        'updateContact': function (person) {
            var d = $q.defer();
            self.isSaving = true;
            person.$update().then(function (response) {
                self.isSaving = false;
                self.selectedPerson = null;
                self.hasMore = true;
                self.page = 1;
                self.persons = [];
                self.loadContacts();
                toaster.pop('success', response.data);
                d.resolve()
            });
            return d.promise;
        },
        'removeContact': function (person) {
            var d = $q.defer();
            self.isDeleting = true;
            person.$remove().then(function (response) {
                self.isDeleting = false;
                var index = self.persons.indexOf(person);
                self.persons.splice(index, 1);
                self.selectedPerson = null;
                toaster.pop('success', response.data);
                d.resolve()
            });
            return d.promise;
        },
        'watchFilters': function () {
            $rootScope.$watch(function () {
                return self.search;
            }, function (newVal) {
                if (angular.isDefined(newVal)) {
                    self.doSearch();
                }
            });

            $rootScope.$watch(function () {
                return self.ordering;
            }, function (newVal) {
                if (angular.isDefined(newVal)) {
                    self.doOrder();
                }
            });
        }
    };

    self.loadContacts();
    self.watchFilters();

    return self;
});