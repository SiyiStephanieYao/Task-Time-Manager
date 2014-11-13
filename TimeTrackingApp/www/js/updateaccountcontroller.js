angular.module('starter.controllers').controller('updateaccountcontroller',
    ['$scope', '$location', '$http', '$filter', '$ionicPopup', 'AUTH_EVENTS', 'AuthService', 'globalservice',
        function ($scope, $location, $http, $filter, $ionicPopup, AUTH_EVENTS, AuthService, globalservice) {

        $scope.TTUser = {};

        

        //Fetch user details
        $http.get(globalservice.AppURL() + 'TTUser/', { params: { "id": $scope.LoggedInUser.Email } }).
         success(function (data) {
             $scope.TTUser = data;
             $scope.TTUser.fldDOB = $filter('date')(data.fldDOB, "yyyy-MM-dd");
         }).
         error(function (data) {
             $ionicPopup.alert({ title: 'Error', template: 'Could not find user, please contact admin \n' + data.ExceptionMessage });
         });

        //Update account
        $scope.UpdateAccount = function () {
            $http.put(globalservice.AppURL() + 'TTUser/0', $scope.TTUser).
               success(function (data) {
                   $ionicPopup.alert({ title: 'Time Tracking', template: 'Account details updated successfully' });

                   var user = AuthService.getuser();
                   user.data.fldFirstName = $scope.TTUser.fldFirstName;
                   user.data.fldFamilyName = $scope.TTUser.fldFamilyName;


                   AuthService.setuser(user);
                   $location.path('/home');
               }).
               error(function (data) {
                   $ionicPopup.alert({ title: 'Error', template: 'Can not update account, please contact admin \n' + data.ExceptionMessage });
               });
        };

        //Cancel Registration
        $scope.CancelRegister = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel Registration',
                template: 'Are you sure you want to cancel registration updates?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $location.path('/home');
                }
            });
        };
    }]);