angular.module('starter.controllers').controller('registercontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'globalservice',
        function ($scope, $location, $http, $ionicPopup, globalservice) {
        $scope.TTUser = {};

        //Cancel button click
        $scope.CancelRegister = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel Registration',
                template: 'Are you sure you want to cancel registration?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $location.path('/login');
                } 
            });
        };

        //Register User
        $scope.RegisterUser = function () {
            if ($scope.TTUser.fldPassword != $scope.TTUser.ConfirmPassword) {
                $ionicPopup.alert({ title: 'Error', template: 'Password and Confirm password are not matched'});
                return;
            }

            $http.post(globalservice.AppURL() + 'TTUser', $scope.TTUser).
               success(function (data) {
                   $ionicPopup.alert({ title: 'Time Tracking', template: 'Account created successfully' });
                   $location.path('/login');
               }).
               error(function (data) {
                   $ionicPopup.alert({ title: 'Error', template: 'Can not register account. \n ' + data.ExceptionMessage });
               });
        }
    }]);