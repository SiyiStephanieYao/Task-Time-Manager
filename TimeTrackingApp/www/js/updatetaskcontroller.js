angular.module('starter.controllers').controller('updatetaskcontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'cacheTasksWhileMovingToTags', 'PreviousURLForAddTags','$filter', 'globalservice',
        function ($scope, $location, $http, $ionicPopup, cacheTasksWhileMovingToTags, PreviousURLForAddTags,$filter, globalservice) {
            $scope.init = function () {
            
            $scope.Task = {};
            $scope.Task = cacheTasksWhileMovingToTags.getTask();
            $scope.fldProjectId = window.localStorage.getItem("ProjectIdForTasks");

            if (window.localStorage.getItem("IsTaskClosed") == "true") {
                $scope.HideDoneButton = true;
            }

            if ($scope.fldProjectId == null)
                $location.path('/home');

            if (window.localStorage.getItem("TagsForTaskId") != 'undefined')
                $scope.Task.TaskTags = JSON.parse(window.localStorage.getItem("TagsForTaskId"));

            PreviousURLForAddTags.setPrevURL('UPDATETASK');
            $scope.fldTaskId = window.localStorage.getItem("TaskIdForUpdates");

            
            if ($scope.fldTaskId!=null)
                window.localStorage.setItem("TaskIdForEntries", $scope.fldTaskId);

            
            if ($scope.fldTaskId == null)
                $location.path('/projecttasks/taskhome');

            //Fetch Data for PayPeriod
            $http.get(globalservice.AppURL() + 'PayPeriod').
               success(function (data) {
                   $scope.PayPeriod = data;
               }).
               error(function (data) {
                   $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch PayPeriod from database \n' + data.ExceptionMessage });
               });

            

            if ($scope.Task.$id == null) {

                //Fetch Task from database
                $http.get(globalservice.AppURL() + 'Task/' + $scope.fldTaskId).
                   success(function (data) {
                       $scope.Task = data;
                       
                       $scope.Task.fldStartDate = $filter('date')(data.fldStartDate, "yyyy-MM-dd");
                       $scope.Task.fldEndDate = $filter('date')(data.fldEndDate, "yyyy-MM-dd");
                       window.localStorage.setItem("TagsForTaskId", JSON.stringify(data.TaskTags));
                   }).
                   error(function (data) {
                       $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch Task from database \n' + data.ExceptionMessage });
                   });
            }
        };

            $scope.init();

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
            //$scope.user.from = place.formatted_address;
            $scope.Task.fldTaskLocation = place.formatted_address;
            $scope.$apply();
        });

        //Update Task
        $scope.UpdateTask = function () {
            $scope.Task.fldProjectId = window.localStorage.getItem("ProjectIdForTasks");

            
            $http.put(globalservice.AppURL() + 'Task/' + $scope.Task.fldTaskId, $scope.Task).
             success(function (data) {
                 $ionicPopup.alert({ title: 'Time Tracking', template: 'Task updated successfully' });
                 $scope.Task = {};
                 cacheTasksWhileMovingToTags.setTask($scope.Task);
                 $location.path('/taskentries/taskdetails');
             }).
             error(function (data) {
                 $ionicPopup.alert({ title: 'Error', template: 'Can not update Task, please contact admin \n' + data.ExceptionMessage });
             });
        };

        //Cancel
        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel task update',
                template: 'Are you sure you want to cancel task update?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $location.path('/taskentries/taskdetails');
                }
            });
        };

        //Add tags to task
        $scope.AddTags = function () {
            
            cacheTasksWhileMovingToTags.setTask($scope.Task);
            $location.path('/taskentries/tags');
        };

        $scope.WantToMakeClose = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Close Project',
                template: 'Are you sure you want to close task? \n Close task will make all fields readonly.'
            });
            confirmPopup.then(function (res) {
                if (!res) {
                    $scope.Task.fldIsDone = false;
                }
                else {

                    $scope.Task.fldIsDone = true;
                }
            });
        };
    }]);