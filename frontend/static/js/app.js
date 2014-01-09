var app = angular.module('simpleTime', ["ngRoute", "ui.bootstrap"]);

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
            delete: true
        })
        .otherwise({redirectTo: "/"})
});

// Service prives RESTful methods to backend
app.service('ItemService', ['$http', function ($http) {
    var urlBase = '/api/v1/item/';
    $http.defaults.headers.common.Authorization = "ApiKey kevins:mysuperstrongkey";

    this.getItems = function() {
        return $http.get(urlBase);
    };
    this.getItem = function(id) {
        return $http.get(urlBase + id + "/");
    };
    this.createItem = function(item) {
        return $http.post(urlBase, item);
    };
    this.saveItem = function(item) {
        return $http.put("{0}{1}/".format(urlBase, id), item);
    };
    this.deleteItem = function(id) {
        return $http.delete(urlBase + id + "/");
    };
}]);

// Controller for list page
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

// Controller for detail page (create + modify)
app.controller('ItemDetailCtrl', ['$scope', '$routeParams', '$location', 'ItemService',
    function($scope, $routeParams, $location, ItemService) {
    console.log($routeParams.delete);
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
    $scope.createItem = function() {
        ItemService.createItem($scope.item)
            .success(function() {
                $scope.message = "New item has been successfully created";
                $location.path("/route");
            })
            .error(function(items) {
                $scope.message = "An error occurred while saving your item";
            });
    }
}]);

