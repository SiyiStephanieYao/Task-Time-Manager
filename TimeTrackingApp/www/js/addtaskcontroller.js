angular.module('starter.controllers').controller('addtaskcontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'cacheTasksWhileMovingToTags', 'PreviousURLForAddTags','$filter','globalservice',
        function ($scope, $location, $http, $ionicPopup, cacheTasksWhileMovingToTags, PreviousURLForAddTags, $filter, globalservice) {

        $scope.init = function () {
            
            $scope.Task = {};
            $scope.Task = cacheTasksWhileMovingToTags.getTask();
            $scope.fldProjectId = window.localStorage.getItem("ProjectIdForTasks");

            if ($scope.fldProjectId == null)
                $location.path('/home');

            $scope.Task.TaskTags = JSON.parse(window.localStorage.getItem("TagsForTaskId"));

            PreviousURLForAddTags.setPrevURL('ADDTASK');
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
            $scope.Task.fldTaskLocation = place.formatted_address;
            $scope.$apply();
        });

        //Fetch Data for PayPeriod
        $http.get(globalservice.AppURL() + 'PayPeriod').
           success(function (data) {
               $scope.PayPeriod = data;
           }).
           error(function (data) {
               $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch PayPeriod from database \n' + data.ExceptionMessage });
           });

        //Insert new Task
        $scope.AddTask = function () {
            $scope.Task.fldProjectId = window.localStorage.getItem("ProjectIdForTasks");
            $scope.Task.fldStartDate = $filter('date')($scope.Task.fldStartDate, 'yyyy/MM/dd');
            $http.post(globalservice.AppURL() + 'Task', $scope.Task).
             success(function (data) {
                 $ionicPopup.alert({ title: 'Time Tracking', template: 'Task added successfully' });
                 $scope.Task = {};
                 cacheTasksWhileMovingToTags.setTask($scope.Task);
                 window.localStorage.removeItem("TaskPayPeriod");
                 $location.path('/projecttasks/taskhome');
             }).
             error(function (data) {
                 $ionicPopup.alert({ title: 'Error', template: 'Can not add Task, please contact admin \n' + data.ExceptionMessage });
             });
        };

        //Cancel
        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel task creation',
                template: 'Are you sure you want to cancel task creation?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    $location.path('/projecttasks/taskhome');
                }
            });
        };

        //Add tags to task
        $scope.AddTags = function () {
            cacheTasksWhileMovingToTags.setTask($scope.Task);
            $location.path('/projecttasks/tags');
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