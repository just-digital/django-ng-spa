var app = angular.module('simpleTime', ["ngRoute"]);
var apiBase = '/api/v1/'

// Handles routing
app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            controller: "ItemListCtrl",
            templateUrl:"/static/partials/item_list.html"
        })
        .when("/login/", {
            controller: "AuthenticationCtrl",
            templateUrl:"/static/partials/login.html"
        })
        .when("/register/", {
            controller: "UserDetailCtrl",
            templateUrl:"/static/partials/user_detail.html"
        })
        .when("/item/:id/", {
            controller: "ItemDetailCtrl",
            templateUrl:"/static/partials/item_detail.html"
        })
        .when("/item/:id/delete/", {
            controller: "ItemDetailCtrl",
            templateUrl:"/static/partials/item_detail.html",
        })
        .otherwise({redirectTo: "/"})
})

// Send all view requests to login if user is not authenticated
app.run(function($rootScope, $location) {
    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if ($rootScope.user == null) {
            if (next.templateUrl != "/static/partials/login.html" &&
                next.controller != "UserDetailCtrl") {
                $location.path( "/login/" );
            }
        }
    });
 })

// Service provides RESTful methods to user entity including authentication methods
app.service('UserService', ['$http', '$rootScope', function($http, $rootScope) {
    var urlBase = apiBase + 'user/';
    this.authenticate = function(user) {
        return $http.post(apiBase + "user/authenticate/", user);
    }
    this.register = function(user) {
        return $http.post(apiBase + "user/register/", user);
    }
}]);

// Service provides RESTful methods to backend
app.service('ItemService', ['$http', '$rootScope', function($http, $rootScope) {
    var urlBase = apiBase + 'item/';
    this.getItems = function(dates) {
        if (dates) {
            return $http.get(urlBase, {params:{date__range: [dates.from, dates.to]}});
        }
        return $http.get(urlBase);
    };
    this.getItem = function(id) {
        return $http.get(urlBase + id + "/");
    };
    this.saveItem = function(item) {
        return $http.post(urlBase, item);
    };
    this.deleteItem = function(id) {
        return $http.delete(urlBase + id + "/");
    };
}]);

// Controller for authentication
app.controller('AuthenticationCtrl', ['$scope', '$rootScope', '$routeParams',
    '$location', '$http', 'UserService', function($scope, $rootScope,
    $routeParams, $location, $http, UserService) {
    $scope.message = "";
    $scope.authenticate = function() {
        UserService.authenticate($scope.user)
            .success(function(data) {
                // Valid response returned means authentication was successful
                // Create an auth key and inject it into the $http singleton
                // so that all future requests will then be authorized
                var auth_key = data.username + ":" + data.api_key
                $http.defaults.headers.common.Authorization = "ApiKey " + auth_key;
                $rootScope.user = data
                $location.path("/");
            })
            .error(function(data, status){
                $scope.message = "Sorry, an error occurred."
                if (status == 401) {
                    if (data.message) {
                        $scope.message = data.message;
                    } else {
                        $scope.message = "Sorry, we're unable to authenticate you";
                    }
                }
            });
    };
}]);

// Controller for user detail page (register + modify)
app.controller('UserDetailCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 
    '$http', 'UserService', function($scope, $rootScope, $routeParams, $location, $http, 
    UserService) {
    $scope.user = {};
    $scope.message = "";
    // Register a new user
    $scope.register = function() {
        UserService.register($scope.user)
            .success(function(data) {
				// Set the user session to aviod having to login again.
                var auth_key = data.username + ":" + data.api_key
                $http.defaults.headers.common.Authorization = "ApiKey " + auth_key;
                $rootScope.user = data; // Set the session user
                $location.path("/");
            })
            .error(function() {
                $scope.message = "An error occurred while registering";
            });
    }
}]);

// Controller for item list page
app.controller('ItemListCtrl', ['$scope', '$rootScope', '$routeParams', 'ItemService',
    function($scope, $rootScope, $routeParams, ItemService) {
    $scope.items = []
    $scope.totals = {};
    if (!$rootScope.dates) {
        $rootScope.dates = {from: today(), to: today()};
    }
    // Get items, uses dates as filter
    $scope.getItems = function getItems() {
        ItemService.getItems($scope.dates)
            .success(function(items) {
                $scope.items = items.objects;
                $scope.totals = {time: items.meta.total_time, 
                    count: items.meta.total_count}
            });
    }
    // A a method to delete the entity
    $scope.deleteItem = function(id) {
        ItemService.deleteItem(id)
            .success(function() {
                $scope.message = "New item has been successfully deleted";
                $scope.items = getItems();
            })
            .error(function(items) {
                $scope.message = "Item could not be deleted";
            });
    }
    $scope.getItems();
}]);

// Controller for item detail page (create + modify)
app.controller('ItemDetailCtrl', ['$scope', '$routeParams', '$location', 'ItemService',
    function($scope, $routeParams, $location, ItemService) {
    $scope.item = {};
    $scope.message = "";
    if ($routeParams.id && $routeParams.id != "new") {
        // If an id was requested it's a modify, so
        // fetch the entity and bind it to the form.
        ItemService.getItem($routeParams.id)
            .success(function(item) {
                $scope.item = item;
            });
    }
    // A a method to create a new entity
    $scope.saveItem = function() {
        ItemService.saveItem($scope.item)
            .success(function() {
                $location.path("/");
            })
            .error(function(items) {
                $scope.message = "An error occurred while saving your item";
            });
    }
}]);

