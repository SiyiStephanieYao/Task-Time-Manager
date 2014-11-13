angular.module('starter.controllers').controller('forgetpasswordcontroller',
    ['$scope', '$location', '$http', '$rootScope', '$ionicPopup', 'globalservice',
        function ($scope, $location, $http, $rootScope, $ionicPopup, globalservice) {
        $scope.User = {};

        $scope.SendForgetPasswordEmail = function () {
            $http.get(globalservice.AppURL() + 'GetPassword/', { params: { "id": 0, "email": $scope.User.fldUserEmail } }).
              success(function (data) {
                  $ionicPopup.alert({ title: 'Time Tracking', template: 'Password has been sent to your email' });
                  $location.path('/login');
              }).
              error(function (data) {
                  $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch client from database \n' + data.ExceptionMessage });
              });
        };

        //Cancel
        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel forgot password',
                template: 'Are you sure you want to cancel forgot password step?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $location.path('/login');
                }
            });
        };
    }]);