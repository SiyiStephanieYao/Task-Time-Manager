angular.module('starter.controllers').controller('logincontroller',
    ['$scope', '$location', '$http', '$rootScope', 'AUTH_EVENTS', 'AuthService', '$ionicPopup', 'globalservice',
        function ($scope, $location, $http, $rootScope, AUTH_EVENTS, AuthService, $ionicPopup, globalservice) {

   //On load clear credentials
    $scope.credentials = {
        fldUserEmail: '',
        fldPassword: ''
    };

    window.localStorage.removeItem("ProjectPayPeriod");
    window.localStorage.removeItem("TaskPayPeriod");
    window.localStorage.removeItem("EntryPayPeriod");

    var username = window.localStorage.getItem("username");
    var password = window.localStorage.getItem("password");

    if (username != "null" && password != "null") {
        $scope.credentials.fldUserEmail = username;
        $scope.credentials.fldPassword = password;
        $scope.credentials.rememberme = true;
    }

    //Login button click
    $scope.login = function (credentials) {
        AuthService.login(credentials).then(function (user) {
            
            if (user.data == "null") {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $ionicPopup.alert({ title: 'Error', template: 'Invalid User name or password' });
            }
            else {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

                $scope.LoggedInUser.FirstName = user.data.fldFirstName;
                $scope.LoggedInUser.LastName = user.data.fldFamilyName;
                $scope.LoggedInUser.Email = user.data.fldUserEmail;

                AuthService.setuser(user);
                if (credentials.rememberme) {
                    window.localStorage.setItem("username", credentials.fldUserEmail);
                    window.localStorage.setItem("password", credentials.fldPassword);
                }

                //Remove all local storage data
                window.localStorage.removeItem("ProjectIdForTasks");

                $location.path('/home');
            }
        }, function () {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            $ionicPopup.alert({ title: 'Error', template: 'Unable to login' });
        });
    };

    //Signup button click
    $scope.RegisterUser = function () {
        $location.path('/register');
    };

    //Forgot password button click
    $scope.ForgetPassword = function () {
        $location.path('/forgetpassword');
    };
}]);