angular.module('starter.controllers').controller('clockinouttimecontroller',
    ['$scope', '$location', '$http', '$rootScope', 'sharedProperties', '$ionicPopup', '$filter', 'AUTH_EVENTS', 'AuthService', 'globalservice',
        function ($scope, $location, $http, $rootScope, sharedProperties, $ionicPopup, $filter, AUTH_EVENTS, AuthService, globalservice) {
            debugger;
            var clockinorout = window.localStorage.getItem("clockinorout");
            $scope.status = clockinorout;
            $scope.clockinout = {};

            window.localStorage.removeItem("EntryPayPeriod");

            $scope.clockinout.ClockDateTime = $filter('date')(Date.now(), 'yyyy/MM/dd');
            $scope.clockinout.ClockTime = $filter('date')(Date.now(), 'HH:mm');

            $scope.AddClockInOutEntry = function () {
                var clockinoutdate = $filter('date')($scope.clockinout.ClockDateTime, 'yyyy/MM/dd') + ' ' +  $scope.clockinout.ClockTime;

                var user = AuthService.getuser();
                var clockin = { "TaskId": window.localStorage.getItem("TaskIdForEntries"), "UserId": user.data.fldUserEmail, "ClockInOutTime": clockinoutdate };

                $http.post(globalservice.AppURL() + 'AutoClockInEntry/?ClockInOut=' + clockinorout,  clockin).
                    success(function (data) {
                        if (clockinorout == "Stop Clock At...")
                            $ionicPopup.alert({ title: 'Time Tracking', template: 'Clock out entry added successfully' });
                        else
                            $ionicPopup.alert({ title: 'Time Tracking', template: 'Clock In entry added successfully' });

                        $location.path('/taskentries/taskdetails');
                    }).
                    error(function (data) {
                        if (clockinorout == "Stop Clock At...")
                            $ionicPopup.alert({ title: 'Error', template: 'Can not create clock-out entry, please contact admin \n' + data.ExceptionMessage });
                        else
                            $ionicPopup.alert({ title: 'Error', template: 'Can not create clock-in entry, please contact admin \n' + data.ExceptionMessage });
                    });
            }

            $scope.Cancel = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Cancel clockin/out creation',
                    template: 'Are you sure you want to cancel clockin/out ?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $location.path('/taskentries/taskdetails');
                    }
                });
            };
        }]);