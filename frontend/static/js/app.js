var app = angular.module('simpleTime', ["ngRoute", "ui.bootstrap"]);
var apiBase = '/api/v1/'

// Handles routing
app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            controller: "ItemListCtrl",
            templateUrl:"/static/partials/item_list.html"
        })
        .when("/item/:id/", {
            controller: "ItemDetailCtrl",
            templateUrl:"/static/partials/item_detail.html"
        })
        .when("/item/:id/delete/", {
            controller: "ItemDetailCtrl",
            templateUrl:"/static/partials/item_detail.html",
        })
        .when("/login/", {
            controller: "AuthenticationCtrl",
            templateUrl:"/static/partials/login.html"
        })
        .otherwise({redirectTo: "/"})
})

// Send all view requests to login if user is not authenticated
app.run(function($rootScope, $location) {
    // register listener to watch route changes
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        if ($rootScope.user == null) {
            if (next.templateUrl != "/static/partials/login.html") {
                $location.path( "/login" );
            }
        }
    });
 })

// Service prives RESTful methods to backend
app.service('ItemService', ['$http', '$rootScope', function($http, $rootScope) {
    var urlBase = apiBase + 'item/';
    var auth_key = $rootScope.user.username + ":" + $rootScope.user.api_key
    $http.defaults.headers.common.Authorization = "ApiKey " + auth_key;

    this.getItems = function() {
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
function AuthenticationCtrl($scope, $rootScope , $http, $location) {
    $scope.message = "Please login";
    $scope.authenticate = function() {
        $http.post(apiBase + "user/authenticate/", $scope.user)
            .success(function(data) {
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
}

// Controller for item list page
app.controller('ItemListCtrl', ['$scope', '$routeParams', 'ItemService',
    function($scope, $routeParams, ItemService) {
    $scope.items = getItems();
    function getItems() {
        var items = [];
        ItemService.getItems()
            .success(function(items) {
                $scope.items = items.objects;
            });
        return items;
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

