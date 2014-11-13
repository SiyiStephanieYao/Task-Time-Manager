angular.module('starter.controllers').controller('taskdetailscontroller',
    ['$scope', '$location', '$http', '$rootScope', 'sharedProperties', '$ionicPopup', '$filter', 'AUTH_EVENTS', 'AuthService', 'globalservice',
        function ($scope, $location, $http, $rootScope, sharedProperties, $ionicPopup, $filter, AUTH_EVENTS, AuthService, globalservice) {

            var taskId = window.localStorage.getItem("TaskIdForEntries");
            window.localStorage.removeItem("clockinorout");

            if (window.localStorage.getItem("IsProjectClosed") == "true") {
                $scope.IsProjectClosed = true;
            }

            $scope.Task = {};




            $http.get(globalservice.AppURL() + 'Task/' + taskId).
               success(function (data) {
                   $scope.Task = data;

                   if (data.fldIsDone == true)
                       window.localStorage.setItem("IsTaskClosed", true);
                   else
                       window.localStorage.setItem("IsTaskClosed", false);

                   $scope.Task.fldStartDate = $filter('date')(data.fldStartDate, "yyyy-MM-dd");
                   $scope.Task.fldEndDate = $filter('date')(data.fldEndDate, "yyyy-MM-dd");
               }).
               error(function (data) {
                   $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch task from database \n' + data.ExceptionMessage });
               });




            //Redirect to task edit screen
            $scope.EditTask = function () {
                if (taskId == 0) {
                    $ionicPopup.alert({ title: 'Time Tracking', template: 'Please select task to edit' });
                    return;
                }
                else {
                    window.localStorage.setItem("TaskIdForUpdates", taskId);
                    $location.path('/taskentries/updatetask');
                }
            };

            var user = AuthService.getuser();

            //Check Is CheckedOut?
            $http.get(globalservice.AppURL() + 'IsCheckOut/', { params: { "id": 0, "TaskId": taskId, "UserId": user.data.fldUserEmail } }).
               success(function (data) {
                   if (data == "false") {
                       $scope.checkouttext = "Clock out Now";
                       $scope.autocheckouttext = "Stop Clock At...";
                   }
                   else {
                       $scope.checkouttext = "Clock in Now";
                       $scope.autocheckouttext = "Start Clock At...";
                   }
               }).
               error(function (data) {
                   $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch task from database \n' + data.ExceptionMessage });
               });

            $scope.Clock = function () {
                user = AuthService.getuser();

                var clockin = { "TaskId": window.localStorage.getItem("TaskIdForEntries"), "UserId": user.data.fldUserEmail };
                if ($scope.checkouttext == "Clock out Now") { //"Clock out Now"
                    $http.put(globalservice.AppURL() + 'Entry/0', clockin).
                    success(function (data) {
                        $ionicPopup.alert({ title: 'Time Tracking', template: 'Clock out done successfully' });

                        $scope.checkouttext = "Clock in Now"; //Start Clock At...
                        $scope.autocheckouttext = "Start Clock At...";

                        //Update total hours and earning after Clockout.
                       $http.get(globalservice.AppURL() + 'Task/' + window.localStorage.getItem("TaskIdForEntries")).
                       success(function (data) {
                           $scope.Task.totalearning = data.totalearning;
                           $scope.Task.totalhours = data.totalhours;
                       }).
                       error(function (data) {
                           $ionicPopup.alert({ title: 'Error', template: 'Could not create clock-out, please contact admin \n' + data.ExceptionMessage });
                       });
                    }).
                    error(function (data) {
                        $ionicPopup.alert({ title: 'Error', template: 'Could not create clock-out, please contact admin \n' + data.ExceptionMessage });
                    });
                }
                else { //"Clock in Now"
                    $http.post(globalservice.AppURL() + 'CreateClockInEntry', clockin).
                    success(function (data) {
                        $ionicPopup.alert({ title: 'Time Tracking', template: 'Clock In entry added successfully' });

                        $scope.checkouttext = "Clock out Now";
                        $scope.autocheckouttext = "Stop Clock At...";
                    }).
                    error(function (data) {
                        $ionicPopup.alert({ title: 'Error', template: 'Can not create clock-in entry, please contact admin \n' + data.ExceptionMessage });
                    });
                };
            }

            $scope.AutoClock = function () {
                window.localStorage.setItem("clockinorout", $scope.autocheckouttext);
                $location.path('/taskentries/clockinouttime');
            };

            $scope.ExportOptions = function () {
                var selectedTaskIds = '';
                selectedTaskIds = taskId + ',' + selectedTaskIds;

                var RequiredFields = {};
                RequiredFields = { "Ids": selectedTaskIds, "type": 'TaskDetails' };
                window.localStorage.setItem("RequiredCSVFields", JSON.stringify(RequiredFields));

                $location.path('/taskentries/exporttoemail');
                
            };
        }]);