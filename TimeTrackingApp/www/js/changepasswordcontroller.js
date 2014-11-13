angular.module('starter.controllers').controller('changepasswordcontroller',
    ['$scope', '$location', '$http', '$rootScope', 'AUTH_EVENTS', 'AuthService', '$ionicPopup', 'globalservice',
        function ($scope, $location, $http, $rootScope, AUTH_EVENTS, AuthService, $ionicPopup, globalservice) {
        $scope.ChangeTTUserPassword = {};

        //Change password
        $scope.ChangePassword = function () {
            $scope.ChangeTTUserPassword.Email = $scope.LoggedInUser.Email;

            if ($scope.ChangeTTUserPassword.NewPassword != $scope.ChangeTTUserPassword.ConfirmPassword) {
                $ionicPopup.alert({ title: 'Error', template: 'New password and confirm passwords are not matched' });
                return;
            }

            $http.post(globalservice.AppURL() + 'ChangePassword', $scope.ChangeTTUserPassword).
              success(function (data) {
                  $ionicPopup.alert({ title: 'Time Tracking', template: 'Password updated successfully' });
                  window.localStorage.setItem("username", null);
                  window.localStorage.setItem("password", null);
                  $location.path('/login');
              }).
              error(function (data) {
                  $ionicPopup.alert({ title: 'Error', template: 'Can not update password \n' + data.ExceptionMessage });
              });
        };

        //Cancel
        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel change password',
                template: 'Are you sure you want to cancel change password?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $location.path('/home');
                }
            });
        };
    }]);