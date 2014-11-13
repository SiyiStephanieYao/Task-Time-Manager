angular.module('starter.controllers').controller('addprojectcontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'AUTH_EVENTS', 'AuthService', '$filter', 'globalservice', function ($scope, $location, $http, $ionicPopup, AUTH_EVENTS, AuthService, $filter, globalservice) {
        $scope.Project = {};
       
        //Location related code
        $scope.user = { 'from': '', 'fromLat': '', 'fromLng': '' };
        //var options = {
        //    componentRestrictions: { country: "as" }
        //};
        var inputFrom = document.getElementById('from');
        var autocompleteFrom = new google.maps.places.Autocomplete(inputFrom);

        google.maps.event.addListener(autocompleteFrom, 'place_changed', function () {
            var place = autocompleteFrom.getPlace();
            //$scope.user.fromLat = place.geometry.location.lat();
            //$scope.user.fromLng = place.geometry.location.lng();
            $scope.Project.fldLocation = place.formatted_address;
            $scope.$apply();
        });

        //Fetch clients
        $http.get(globalservice.AppURL() + 'Client').
            success(function (data) {
                $scope.Clients = data;
            }).
            error(function (data) {
                $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch client from database \n' + data.ExceptionMessage });
            });

        //Fetch Managers TODO: For now we have considered all users as managers
        $http.get(globalservice.AppURL() + 'TTUser').
            success(function (data) {
                $scope.Managers = data;
            }).
            error(function (data) {
                $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch manager from database \n' + data.ExceptionMessage });
            });

        //Insert new Project
        $scope.AddProject = function () {
            var user = AuthService.getuser();
            $scope.Project.fldUserEmail = user.data.fldUserEmail;
            $scope.Project.fldStartDate = $filter('date')($scope.Project.fldStartDate, 'yyyy/MM/dd');

            
            $http.post(globalservice.AppURL() + 'Project', $scope.Project).
             success(function (data) {
                 $ionicPopup.alert({ title: 'Time Tracking', template: 'Project added successfully' });
                 window.localStorage.removeItem("ProjectPayPeriod");
                 $location.path('/home');
             }).
             error(function (data) {
                 $ionicPopup.alert({ title: 'Error', template: 'Can not add Project, please contact admin \n' + data.ExceptionMessage });
             });
        };

        //Cancel
        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel project creation',
                template: 'Are you sure you want to cancel project creation?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $location.path('/home');
                }
            });
        };

        //Close project
        $scope.WantToMakeClose = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Close Project',
                template: 'Are you sure you want to close project? \n It will close all related tasks to this project.'
            });
            confirmPopup.then(function (res) {
                if (!res) {
                    $scope.Project.fldIsClosed = false;
                }
                else {
                    
                    $scope.Project.fldIsClosed = true;
                }
            });
        };
    }]);