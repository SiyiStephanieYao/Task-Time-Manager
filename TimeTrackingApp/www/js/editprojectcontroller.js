app.controller('editprojectcontroller',
    ['$scope', '$location', '$http', '$filter', 'sharedProperties', '$ionicPopup', 'globalservice',
        function ($scope, $location, $http, $filter, sharedProperties, $ionicPopup, globalservice) {
            $scope.Project = {};
            $scope.Clients = {};
            $scope.Managers = {};

            if (window.localStorage.getItem("IsProjectClosed") == "true") {
                $scope.HideDoneButton = true;
            }

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

            //Fetch managers TODO: For now all users are managers
            $http.get(globalservice.AppURL() + 'TTUser').
                success(function (data) {
                    $scope.Managers = data;
                }).
                error(function (data) {
                    $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch manager from database \n' + data.ExceptionMessage });
                });

            //Select Client, Managers in dropdown for selected project
            $http.get(globalservice.AppURL() + 'Project/', { params: { "id": sharedProperties.getProjectIdToEdit() } }).
                      success(function (data) {
                          
                          $scope.Project = data;
                          $scope.Project.fldStartDate = $filter('date')(data.fldStartDate, "yyyy-MM-dd");
                          $scope.Project.fldEndDate = $filter('date')(data.fldEndDate, "yyyy-MM-dd");
                          
                          $scope.Clients = $scope.options[$scope.Project.fldClientId];
                          $scope.Managers = $scope.options[$scope.Project.fldManager];
                      }).
                  error(function (data) {
                      $ionicPopup.alert({ title: 'Error', template: 'Unable to edit project \n' + data.ExceptionMessage });
                  });

            //Cancel button click
            $scope.Cancel = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Cancel Project update',
                    template: 'Are you sure you want to cancel project update?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $location.path('/projecttasks/projectdetails');
                    }
                });
            };

            //Update project
            $scope.UpdateProject = function () {

                $http.put(globalservice.AppURL() + 'Project/' + $scope.Project.fldProjectId, $scope.Project).
                   success(function (data) {
                       $ionicPopup.alert({ title: 'Time Tracking', template: 'Project details updated successfully' });
                       $location.path('/projecttasks/projectdetails');
                   }).
                   error(function (data) {
                       $ionicPopup.alert({ title: 'Error', template: 'Can not update project \n' + data.ExceptionMessage });
                   });
            };

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

                        $scope.ProjectClosed = $scope.Project.fldIsClosed;
                    }
                });
            };


        }]);