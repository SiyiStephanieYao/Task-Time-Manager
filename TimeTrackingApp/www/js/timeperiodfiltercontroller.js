angular.module('starter.controllers').controller('timeperiodfiltercontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'PreviousURLForAddPeriodFilter', 'globalservice',
        function ($scope, $location, $http, $ionicPopup, PreviousURLForAddPeriodFilter, globalservice) {

            $scope.SelectedTimePeriod = function (selectedtimeperiod) {

                if (PreviousURLForAddPeriodFilter.getPrevURL() == 'Project') {
                    window.localStorage.setItem("ProjectPayPeriod", selectedtimeperiod);
                    $location.path('/home');
                }
                else if (PreviousURLForAddPeriodFilter.getPrevURL() == 'Task') {
                    window.localStorage.setItem("TaskPayPeriod", selectedtimeperiod);
                    $location.path('/projecttasks/taskhome');
                }
                else if (PreviousURLForAddPeriodFilter.getPrevURL() == 'Entry')
                {
                    window.localStorage.setItem("EntryPayPeriod", selectedtimeperiod);
                    $location.path('/taskentries/entryhome');
                }
            };

            $scope.Cancel = function () {
                if (PreviousURLForAddPeriodFilter.getPrevURL() == 'Project') {
                    $location.path('/home');
                }
                else if (PreviousURLForAddPeriodFilter.getPrevURL() == 'Task') {
                    $location.path('/projecttasks/taskhome');
                }
                else if (PreviousURLForAddPeriodFilter.getPrevURL() == 'Entry') {
                    $location.path('/taskentries/entryhome');
                }
            };
        }]);