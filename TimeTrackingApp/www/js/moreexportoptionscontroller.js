angular.module('starter.controllers').controller('moreexportoptionscontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'SetFieldsForEmail', 'globalservice',
        function ($scope, $location, $http, $ionicPopup, SetFieldsForEmail, globalservice) {

        FormFields = {};

        FormFields.ProjectNameChecked = false;
        FormFields.ProjectStartTimeChecked = false;
        FormFields.ProjectClientChecked = false;
        FormFields.ProjectEndTimeChecked = false;
        FormFields.ProjectLocationChecked = false;
        FormFields.ProjectDurationChecked = false;
        FormFields.ProjectDescriptionChecked = false;
        FormFields.ProjectTimeSuspendedChecked = false;
        FormFields.ProjectStatusChecked = false;
        FormFields.ProjectEarningsChecked = false;

        FormFields.TaskNameChecked = false;
        FormFields.TaskStartTimeChecked = false;
        FormFields.TaskEstimatedTimeChecked = false;
        FormFields.TaskEndTimeChecked = false;
        FormFields.TaskLocationChecked = false;
        FormFields.TaskDurationChecked = false;
        FormFields.TaskDescriptionChecked = false;
        FormFields.TaskTimeSuspendedChecked = false;
        FormFields.TaskStatusChecked = false;
        FormFields.TaskHourlyRateChecked = false;
        FormFields.TaskPayPeriodChecked = false;
        FormFields.TaskEarningsChecked = false;
        FormFields.TaskTagsChecked = false;
        FormFields.TaskIsPaidChecked = false;
        FormFields.EntryNameChecked = false;

        $scope.FormFields = FormFields;
        SetEmailFieldScope()

        var RequiredFields = {};
        RequiredFields = window.localStorage.getItem("RequiredCSVFields");

        var obj = JSON.parse(RequiredFields);

        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Time tracking',
                template: 'Are you sure you want to close stop export data?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    if (obj.type == 'TaskDetails')
                        $location.path('/taskentries/exporttoemail');
                    else
                        $location.path('/home');
                }
            });
        };

        $scope.MoreExport = function () {
            FormFields.RequiredFields = window.localStorage.getItem("RequiredCSVFields");
            $http.post(globalservice.AppURL() + 'GetCSVData/0', $scope.FormFields).
            success(function (data) {
                SetEmailFieldScope();
                $ionicPopup.alert({ title: 'Success', template: 'Email sent successfully' });

                if (obj.type == 'TaskDetails')
                    $location.path('/taskentries/taskdetails');
                else
                    $location.path('/home');
            }).
            error(function (data) {
                $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch PayPeriod from database \n' + data.ExceptionMessage });
            });
        };

        function SetEmailFieldScope() {

            var emailFields = SetFieldsForEmail.getFields();
            $scope.FormFields.UserEmail = emailFields.fldUserEmail;
            $scope.FormFields.Subject = emailFields.subject;
        }
    }]);