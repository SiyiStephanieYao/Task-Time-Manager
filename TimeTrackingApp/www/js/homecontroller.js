angular.module('starter.controllers').controller('homecontroller',
    ['$scope', '$location', '$http', '$rootScope', 'AUTH_EVENTS', 'AuthService', 'sharedProperties', '$ionicPopup', 'PreviousURLForAddPeriodFilter', 'globalservice',
function ($scope, $location, $http, $rootScope, AUTH_EVENTS, AuthService, sharedProperties, $ionicPopup, PreviousURLForAddPeriodFilter, globalservice) {

    
    $scope.ShowAddButton = true;
    $scope.ShowFilterButton = true;
    $scope.ShowExportButton = false;
    $scope.ShowDeleteButton = false;

    $scope.getDatetime = new Date;
    $scope.TTUser = {};
    $scope.Projects = {};

    var user = AuthService.getuser();
    window.localStorage.removeItem("SelectedFilters");
    
    $scope.LoggedInUser.FirstName = user.data.fldFirstName;
    $scope.LoggedInUser.LastName = user.data.fldFamilyName;
    $scope.LoggedInUser.Email = user.data.fldUserEmail;

    if (window.localStorage.getItem("ProjectPayPeriod") == null)
        $scope.SelectedPeriodFilter = "ALL"
    else
        $scope.SelectedPeriodFilter = window.localStorage.getItem("ProjectPayPeriod");

    
    //Get user by email id
    $http.get(globalservice.AppURL() + 'TTUser/', { params: { "id": user.data.fldUserEmail } }).
    success(function (data) {
        $scope.TTUser = data;
    }).
    error(function (data) {
        $ionicPopup.alert({ title: 'Error', template: 'Could not find user \n' + data.ExceptionMessage });
    });

    
    //Get all projects
    $http.get(globalservice.AppURL() + 'GetProjectsByPayPeriod/', { params: { "payperiod": $scope.SelectedPeriodFilter, "useremail": $scope.LoggedInUser.Email } }).
       success(function (data) {
           
           $scope.Projects = data;
       }).
       error(function (data) {
           $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch projects from database \n' + data.ExceptionMessage });
       });

    //Redirect to modify account details screen
    $scope.ModifyAccountDetails = function () {
        $location.path('/updateaccount');
    };

    $scope.PeriodFilter = function () {
        PreviousURLForAddPeriodFilter.setPrevURL('Project');
        $location.path('/timeperiodfilter');
    };

    //Redirect to change password screen
    $scope.ChangePassword = function () {
        $location.path('/changepassword');
    };

    //Logout
    $scope.LogOut = function () {

        var confirmPopup = $ionicPopup.confirm({
            title: 'Logout',
            template: 'Are you sure you want to logout?'
        });
        confirmPopup.then(function (res) {
            if (res) {

                $location.path('/login');

                $scope.LoggedInUser.FirstName = "";
                $scope.LoggedInUser.LastName = "";
                $scope.LoggedInUser.Email = null;

                window.localStorage.removeItem("username");
                window.localStorage.removeItem("password");


            }
        });
    };

    //Redirect to add project screen
    $scope.AddProject = function () {
        $location.path("/addproject");
    };

    //Redirect to delete projects screen
    $scope.DeleteProjects = function () {

        var projectlist = [{}];

        angular.forEach($scope.Projects, function (project) {
            if (project.checked == true) {
                projectlist.push({
                    "fldProjectId": project.fldProjectId,
                    "fldUserEmail":$scope.LoggedInUser.Email,
                    "fldPayPeriod": $scope.SelectedPeriodFilter,
                });
            }
        });

        if (projectlist.length <= 1) {
            $ionicPopup.alert({ title: 'Time Tracking', template: 'Please select project to delete' });
            return;
        };

        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Project/s',
            template: 'Are you sure you want to delete project/s? It will delete all related tasks and entries. It will be undone.'
        });

        confirmPopup.then(function (res) {
            if (res) {
                //Delete selected projects
                $http.post(globalservice.AppURL() + 'DeleteMultipleProjects/0', projectlist).
                   success(function (data) {
                       $scope.Projects = data;
                       $ionicPopup.alert({ title: 'Time Tracking', template: 'Projects deleted successfully' });
                       SetProjectSelected();
                   }).
                   error(function (data) {
                       $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch projects from database,  \n' + data.ExceptionMessage });
                   });
            }
        });
    };

    $scope.ExportDatabyProjects = function () {
        var count = 0;
        var selectedProjectIds = '';

        angular.forEach($scope.Projects, function (project) {
            if (project.checked == true) {
                count++;
                selectedProjectIds = project.fldProjectId + ',' + selectedProjectIds;
            }
        });

        var RequiredFields = {};
        RequiredFields = { "Ids": selectedProjectIds, "type": 'Project' };
        window.localStorage.setItem("RequiredCSVFields", JSON.stringify(RequiredFields));

        $location.path('/projecttasks/exporttoemail');
    };

    //Redirect to project edit screen
    $scope.EditProjects = function (selectedProjectId) {
        angular.forEach($scope.Projects, function (project) {
            if (project.checked == true) {
                selectedProjectId = project.fldProjectId;
            }
        });

        if (selectedProjectId == 0) {
            $ionicPopup.alert({ title: 'Time Tracking', template: 'Please select project to edit' });
            return;
        }
        else {
            sharedProperties.setProjectIdToEdit(selectedProjectId);
            $location.path('/editproject');
        }
    };

    //Redirect to project tasks screen
    $scope.ShowTasks = function (projectId) {
        if (projectId == 0) {
            return;
        }
        
        window.localStorage.removeItem("TaskPayPeriod");

        sharedProperties.setProjectIdToEdit(projectId);
        window.localStorage.setItem("ProjectIdForTasks", projectId);

        $location.path('/projecttasks/projectdetails');
    };


    $scope.CheckBoxSelectionChanged = function () {
        SetProjectSelected();
    };

    $scope.NoOfProjectSelected = '0 Project/s \n have been selected';

    function SetProjectSelected() {
        var count = 0;
        angular.forEach($scope.Projects, function (project) {
            if (project.checked == true) {
                count++;
            }
        });
        $scope.NoOfProjectSelected = count + ' Project/s \nhave been selected';

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
    };

   
}]);