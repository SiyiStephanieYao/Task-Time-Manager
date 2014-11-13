angular.module('starter.controllers').controller('applicationcontroller',
    ['$scope', '$http', 'AuthService', '$location', function ($scope, $http, AuthService, $location) {
        $scope.LoggedInUser = { FirstName: "", LastName: "", Email: "" };

        if (!AuthService.isAuthenticated()) {
            $location.path('/login');
        }
    }]);