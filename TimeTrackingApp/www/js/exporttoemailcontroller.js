angular.module('starter.controllers').controller('exporttoemailcontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'SetFieldsForEmail', 'globalservice',
        function ($scope, $location, $http, $ionicPopup, SetFieldsForEmail, globalservice) {

        var RequiredFields = {};
        RequiredFields = window.localStorage.getItem("RequiredCSVFields");

        var obj = JSON.parse(RequiredFields);

        $scope.fldUserEmail = '';
        $scope.subject = '';

        FormFields = {};
        
        $scope.FormFields = FormFields;
        
        $scope.MoreOptions = function (fldUserEmail, subject) {
            SetFieldsForEmail.setFields({ "fldUserEmail": fldUserEmail, "subject": subject });
            
            alert(obj.type);

            if (obj.type == 'TaskDetails')
                $location.path('/taskentries/moreexportoptions');
            else
                $location.path('/moreexportoptions');
        };

        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Time tracking',
                template: 'Are you sure you want to stop export data?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    if (obj.type == 'TaskDetails')
                        $location.path('/taskentries/taskdetails');
                    else
                        $location.path('/home');
                }
            });
        };

        $scope.FullExport = function () {
            FormFields.UserEmail = $scope.FormFields.fldUserEmail;
            FormFields.RequiredFields = window.localStorage.getItem("RequiredCSVFields");

            $http.post(globalservice.AppURL() + 'GetFullCSVData', $scope.FormFields).
           success(function (data) {
               $ionicPopup.alert({ title: 'Success', template: 'Email sent successfully' });

               if (obj.type == 'TaskDetails')
                   $location.path('/taskentries/taskdetails');
               else
                   $location.path('/home');
           }).
           error(function (data) {
               $ionicPopup.alert({ title: 'Error', template: 'Unable to export data to csv \n' + data.ExceptionMessage });
           });
        };
    }]);