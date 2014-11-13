angular.module('starter.controllers').controller('taskhomecontroller',
    ['$scope', '$location', '$http', '$rootScope', '$ionicPopup', 'sharedProperties', 'cacheTasksWhileMovingToTags', 'PreviousURLForAddPeriodFilter',  'globalservice',
        function ($scope, $location, $http, $rootScope, $ionicPopup, sharedProperties, cacheTasksWhileMovingToTags, PreviousURLForAddPeriodFilter, globalservice) {

            $scope.ShowAddButton = true;
            $scope.ShowFilterButton = true;
            $scope.ShowExportButton = false;
            $scope.ShowDeleteButton = false;

            if (window.localStorage.getItem("IsProjectClosed") == "true")
            {
                $scope.ShowAddButton = false;
                $scope.ShowDeleteButton = false;
            }

            $scope.Tasks = {};
            window.localStorage.removeItem("TagsForTaskId");
            window.localStorage.removeItem("TaskIdForUpdates");
            window.localStorage.removeItem("IncludeTags");
            window.localStorage.removeItem("ExcludeTags");
            window.localStorage.removeItem("TaskIdForEntries");
            window.localStorage.removeItem("EntryPayPeriod");

            cacheTasksWhileMovingToTags.setTask($scope.Tasks);

            if (window.localStorage.getItem("TaskPayPeriod") == null)
                $scope.SelectedPeriodFilter = "ALL"
            else
                $scope.SelectedPeriodFilter = window.localStorage.getItem("TaskPayPeriod");

            

            var filters = JSON.parse(window.localStorage.getItem("SelectedFilters"));
            var FilterList = new Array();

            
            angular.forEach(filters, function (filter) {
                FilterList.push({
                    "fldFilterId": filter.fldFilterId
                });
            });

            if (FilterList.length == 0)
                FilterList = null;

            debugger;
            if ($scope.SelectedPeriodFilter != null && $scope.SelectedPeriodFilter != "" && $scope.SelectedPeriodFilter != "ALL") {
                //Fetch Tasks
                $http.get(globalservice.AppURL() + 'GetTaskByPayPeriod/' + +window.localStorage.getItem("ProjectIdForTasks"), { params: { "payperiod": $scope.SelectedPeriodFilter } }).
                   success(function (data) {
                       
                       $scope.Tasks = data;
                   }).
                   error(function (data) {
                       
                       $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch Task from database \n' + data.ExceptionMessage });
                   });
            }
            else {
                //Fetch Tasks
                $http.post(globalservice.AppURL() + 'GetTaskByFilter/' + window.localStorage.getItem("ProjectIdForTasks"), FilterList).
                   success(function (data) {
                       
                       $scope.Tasks = data;

                   }).
                   error(function (data) {
                       
                       $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch Task from database \n' + data.ExceptionMessage });
                   });
            }

            $scope.ExportDatabyTasks = function () {
                
                var count = 0;
                var selectedTaskIds = '';

                angular.forEach($scope.Tasks, function (task) {
                    if (task.checked == true) {
                        count++;
                        selectedTaskIds = task.fldTaskId + ',' + selectedTaskIds;
                    }
                });

                var RequiredFields = {};
                RequiredFields = { 'Ids': selectedTaskIds, 'type': 'Task' };
                window.localStorage.setItem("RequiredCSVFields", JSON.stringify(RequiredFields));

                $location.path('/projecttasks/exporttoemail');
            };

            $scope.PeriodFilter = function () {
                PreviousURLForAddPeriodFilter.setPrevURL('Task');
                window.localStorage.setItem("SelectedFilters", null);
                $location.path('/timeperiodfilter');
            };

            //Delete tasks
            $scope.DeleteTasks = function () {
                var TaskList = [{}];

                angular.forEach($scope.Tasks, function (task) {
                    if (task.checked == true) {
                        TaskList.push({
                            "fldTaskId": task.fldTaskId,
                            "fldProjectId": window.localStorage.getItem("ProjectIdForTasks"),
                            "fldPayPeriod": $scope.SelectedPeriodFilter
                        });
                    }
                });

                if (TaskList.length <= 1) {
                    $ionicPopup.alert({ title: 'Time Tracking', template: 'Please select task to delete' });
                    return;
                };

                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete Task/s',
                    template: 'Are you sure you want to delete task/s? It will delete all related entries. It will be undone.'
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        $http.post(globalservice.AppURL() + 'DeleteMultipleTasks/' + window.localStorage.getItem("ProjectIdForTasks"), TaskList).
                            success(function (data) {
                                $scope.Tasks = data;
                                $ionicPopup.alert({ title: 'Time Tracking', template: 'Task deleted successfully' });
                                SetTaskSelected();
                            }).
                            error(function (data) {
                                $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch Task from database \n' + data.ExceptionMessage });
                            });
                    }
                });
            };

            $scope.AddTasks = function () {
                $location.path('/projecttasks/addtask');
            };

            $scope.ShowTaskEntries = function (taskId) {
                
                window.localStorage.setItem("TaskIdForEntries", taskId);
                window.localStorage.setItem("TaskIdForUpdates", taskId);
                $location.path('/taskentries/taskdetails');
            };

            //Configure tags
            $scope.ConfigureTags = function () {
                $location.path('/tags');
            };

            $scope.TaskCheckBoxSelectionChanged = function () {
                SetTaskSelected();
            };

            $scope.NoOfTaskSelected = '0 Task/s \n have been selected';

            function SetTaskSelected() {
                var count = 0;
                angular.forEach($scope.Tasks, function (task) {
                    if (task.checked == true) {
                        count++;
                    }
                });
                $scope.NoOfTaskSelected = count + ' Task/s \nhave been selected';

                if (count == 0) {
                    $scope.ShowAddButton = true;
                    $scope.ShowFilterButton = true;
                    $scope.ShowExportButton = false;
                    $scope.ShowDeleteButton = false;
                }
                else {
                    $scope.ShowExportButton = true;
                    $scope.ShowDeleteButton = true;
                    $scope.ShowAddButton = false;
                    $scope.ShowFilterButton = false;
                }

                if (window.localStorage.getItem("IsProjectClosed") == "true") {
                    $scope.ShowAddButton = false;
                    $scope.ShowDeleteButton = false;
                }
            };

            $scope.SetFilters = function () {
                $location.path('/projecttasks/settagfilter');
            };

        }]);
