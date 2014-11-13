angular.module('starter.controllers').controller('tagsdetailscontroller',
    ['$scope', '$location', '$http', '$rootScope', '$ionicPopup', 'PreviousURLForAddTags', 'globalservice',
        function ($scope, $location, $http, $rootScope, $ionicPopup, PreviousURLForAddTags, globalservice) {
        $scope.Tags = {};

        
        //Fetch all tags
        $http.get(globalservice.AppURL() + 'Tag/').
        success(function (data) {
            $scope.TagDetails = data;

            var TagList = JSON.parse(window.localStorage.getItem("TagsForTaskId"));

            SelectTagsForTask($scope.TagDetails, TagList);
        }).
        error(function (data) {
            $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch Tags from database \n' + data.ExceptionMessage });
        });

        //Add tags
        $scope.AddTags = function () {

            var TagList = new Array();

            angular.forEach($scope.TagDetails, function (tag) {
                if (tag.checked == true) {
                    TagList.push({
                        "fldTagId": tag.fldTagId,
                        "fldTagName": tag.fldTagName,
                        "Id": tag.Id
                    });
                }
            });

            $http.post(globalservice.AppURL() + 'Tag', $scope.Tags).
                success(function (data) {
                    $scope.TagDetails = data;
                    SelectTagsForTask($scope.TagDetails, TagList);
                    $ionicPopup.alert({ title: 'Time Tracking', template: 'Tags Add successfully' });
                }).
                error(function (data) {
                    SelectTagsForTask($scope.TagDetails, TagList);
                    $ionicPopup.alert({ title: 'Error', template: 'Unable  to fetch Tag from database \n' + data.ExceptionMessage });
                });
        };

        function SelectTagsForTask(AllTags, TagsToSelect) {
            angular.forEach(AllTags, function (tag) {
                angular.forEach(TagsToSelect, function (tagInList) {
                    if (tagInList.fldTagId == tag.fldTagId) {
                        tag.checked = true;
                        tag.Id = tagInList.Id;
                    }
                });
            });
        }

        //Cancel
        $scope.Cancel = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancel tag changes',
                template: 'Are you sure you want to cancel tag changes?'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    if (PreviousURLForAddTags.getPrevURL() == 'ADDTASK')
                        $location.path('/projecttasks/addtask');
                    else if (PreviousURLForAddTags.getPrevURL() == 'UPDATETASK')
                        $location.path('/taskentries/updatetask');
                }
            });
        };

        $scope.AssignTagsToTask = function () {
            var TagList = new Array();

            angular.forEach($scope.TagDetails, function (tag) {
                if (tag.checked == true) {
                    TagList.push({
                        "fldTagId": tag.fldTagId,
                        "fldTagName": tag.fldTagName,
                        "Id":tag.Id
                    });
                }
            });

            window.localStorage.setItem("TagsForTaskId", JSON.stringify(TagList));

            if (PreviousURLForAddTags.getPrevURL() == 'ADDTASK')
                $location.path('/projecttasks/addtask');
            else if (PreviousURLForAddTags.getPrevURL() == 'UPDATETASK')
                $location.path('/taskentries/updatetask');
        };

    }]);