angular.module('starter.controllers').controller('projectdetailscontroller',
    ['$scope', '$location', '$http', '$rootScope', 'sharedProperties', '$ionicPopup', '$filter', 'globalservice',
        function ($scope, $location, $http, $rootScope, sharedProperties, $ionicPopup, $filter, globalservice) {
            var projectId = sharedProperties.getProjectIdToEdit();

            $scope.Project = {};

            $http.get(globalservice.AppURL() + 'Project/' + projectId).
               success(function (data) {
                   $scope.Project = data;

                   if(data.fldIsClosed==true)
                       window.localStorage.setItem("IsProjectClosed", true);
                   else
                       window.localStorage.setItem("IsProjectClosed", false);

                   $scope.Project.fldStartDate = $filter('date')(data.fldStartDate, "yyyy-MM-dd");
                   $scope.Project.fldEndDate = $filter('date')(data.fldEndDate, "yyyy-MM-dd");
               }).
               error(function (data) {
                   $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch project from database \n' + data.ExceptionMessage });
               });

            //Redirect to project edit screen
            $scope.EditProject = function () {
                if (projectId == 0) {
                    $ionicPopup.alert({ title: 'Time Tracking', template: 'Please select project to edit' });
                    return;
                }
                else {
                    sharedProperties.setProjectIdToEdit(projectId);
                    $location.path('/projecttasks/editproject');
                }
            };

            $scope.ExportOptions = function () {
                var selectedProjectIds = '';
                selectedProjectIds = projectId + ',' + selectedProjectIds;

                var RequiredFields = {};
                RequiredFields = { "Ids": selectedProjectIds, "type": 'ProjectDetails' };
                window.localStorage.setItem("RequiredCSVFields", JSON.stringify(RequiredFields));

                $location.path('/projecttasks/exporttoemail');
            };
        }]);