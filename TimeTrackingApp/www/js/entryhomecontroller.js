angular.module('starter.controllers').controller('entryhomecontroller',
    ['$scope', '$location', '$http', '$rootScope', '$ionicPopup', 'sharedProperties', 'cacheTasksWhileMovingToTags', 'PreviousURLForAddPeriodFilter', 'globalservice',
        function ($scope, $location, $http, $rootScope, $ionicPopup, sharedProperties, cacheTasksWhileMovingToTags, PreviousURLForAddPeriodFilter, globalservice) {

            $scope.ShowFilterButton = true;
            $scope.ShowExportButton = false;
            $scope.ShowDeleteButton = false;

            var taskId = window.localStorage.getItem("TaskIdForEntries");

            if (taskId == null) {
                $location.path('/projecttasks/taskhome');
                return;
            }
            
            if (window.localStorage.getItem("EntryPayPeriod") == null)
                $scope.SelectedPeriodFilter = "ALL"
            else
                $scope.SelectedPeriodFilter = window.localStorage.getItem("EntryPayPeriod");

            if (window.localStorage.getItem("IsTaskClosed") == "true") {
                $scope.ShowDeleteButton = false;
            }


            $scope.EntryCheckBoxSelectionChanged = function () {
                SetEntriesSelected();
            };

            $scope.Entries = {};
            

            //Get all projects
            $http.get(globalservice.AppURL() + 'GetEntryByPayPeriod/' + taskId, { params: { "payperiod": $scope.SelectedPeriodFilter } }).
               success(function (data) {
                   $scope.Entries = data;
               }).
               error(function (data) {
                   $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch Entries from database \n' + data.ExceptionMessage });
               });

            $scope.PeriodFilter = function () {
                PreviousURLForAddPeriodFilter.setPrevURL('Entry');
                window.localStorage.setItem("SelectedFilters", null);
                $location.path('/timeperiodfilter');
            };

            $scope.ExportDatabyTasks = function () {
                var count = 0;
                var selectedEntryIds = '';
                angular.forEach($scope.Entries.EntryViewModelList, function (entry) {

                    if (entry.checked == true) {
                        count++;
                        selectedEntryIds = entry.fldEntryId + ',' + selectedEntryIds;
                    }
                });

                var RequiredFields = {};
                RequiredFields = { 'Ids': selectedEntryIds, 'type': 'Entry' };
                window.localStorage.setItem("RequiredCSVFields", JSON.stringify(RequiredFields));

                $location.path('/projecttasks/exporttoemail');
            };

            $scope.DeleteEntries = function () {
                var entrylist = [{}];
                angular.forEach($scope.Entries.EntryViewModelList, function (entry) {
                    if (entry.checked == true) {
                        entrylist.push({
                            "fldEntryId": entry.fldEntryId,
                            "fldPayPeriod": $scope.SelectedPeriodFilter,
                        });
                    }
                });

                if (entrylist.length <= 1) {
                    $ionicPopup.alert({ title: 'Time Tracking', template: 'Please select entry to delete' });
                    return;
                };

                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete Entry/s',
                    template: 'Are you sure you want to delete entry/s?'
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        //Delete selected projects
                        $http.post(globalservice.AppURL() + 'DeleteMultipleEntry/' + taskId, entrylist).
                           success(function (data) {
                               $scope.Entries = data;
                               $ionicPopup.alert({ title: 'Time Tracking', template: 'Entries deleted successfully' });
                               SetEntriesSelected();
                           }).
                           error(function (data) {
                               $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch entries from database,  \n' + data.ExceptionMessage });
                           });
                    }
                });
            };

            $scope.NoOfEntriesSelected = '0 Entry/s \n have been selected';

            function SetEntriesSelected() {
                var count = 0;

                angular.forEach($scope.Entries.EntryViewModelList, function (entry) {
                    if (entry.checked == true) {
                        count++;
                    }
                });
                $scope.NoOfEntriesSelected = count + ' Entry/s \nhave been selected';

                if (count == 0) {
                    $scope.ShowFilterButton = true;
                    $scope.ShowExportButton = false;
                    $scope.ShowDeleteButton = false;
                }
                else {
                    $scope.ShowExportButton = true;
                    $scope.ShowDeleteButton = true;
                    $scope.ShowFilterButton = false;
                }

                if (window.localStorage.getItem("IsTaskClosed") == "true") {
                    $scope.ShowDeleteButton = false;
                }
            };
        }]);
