angular.module('starter.controllers').controller('filtertagscontroller',
    ['$scope', '$location', '$http', '$rootScope', '$ionicPopup', 'PreviousURLForAddTags', 'cacheTagFilterWhileMovingToTags', 'globalservice',
        function ($scope, $location, $http, $rootScope, $ionicPopup, PreviousURLForAddTags, cacheTagFilterWhileMovingToTags, globalservice) {
            $scope.Tags = {};
            $scope.TagFilter = cacheTagFilterWhileMovingToTags.getFilterTag();

            //Fetch all tags
            $http.get(globalservice.AppURL() + 'Tag/').
            success(function (data) {
                $scope.TagDetails = data;

                var TagList = {};

                if (PreviousURLForAddTags.getPrevURL() == 'INCLUDETAGS') {
                    
                    TagList = JSON.parse(window.localStorage.getItem("IncludeTags"));
                    //PullAleadySelectedTag(TagList);
                    SelectTagsForTask($scope.TagDetails, TagList);
                }
                else if (PreviousURLForAddTags.getPrevURL() == 'EXCLUDETAGS') {
                    
                    TagList = JSON.parse(window.localStorage.getItem("ExcludeTags"));
                    //PullAleadySelectedTag(TagList);
                    SelectTagsForTask($scope.TagDetails, TagList);
                }
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
                            "Id": tag.Id,
                            "type": PreviousURLForAddTags.getPrevURL()
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
                        $location.path('/projecttasks/createtagfilter');
                    }
                });
            };

            function PullAleadySelectedTag(TagsToPull) {
                angular.forEach($scope.TagDetails, function (tag) {
                    angular.forEach(TagsToPull, function (tagInList) {
                        if (tagInList.fldTagId == tag.fldTagId) {

                            delete $scope.TagDetails[tag.fldTagId];

                            console.log($scope.TagDetails);
                        }
                    });
                });
            }

            $scope.AssignTagsToFilter = function () {
                var TagList = new Array();

                angular.forEach($scope.TagDetails, function (tag) {
                    if (tag.checked == true) {
                        TagList.push({
                            "fldTagId": tag.fldTagId,
                            "fldTagName": tag.fldTagName,
                            "Id": tag.Id,
                            "type": PreviousURLForAddTags.getPrevURL()
                        });
                    }
                });

                if (PreviousURLForAddTags.getPrevURL() == 'INCLUDETAGS')
                    window.localStorage.setItem("IncludeTags", JSON.stringify(TagList));
                else if (PreviousURLForAddTags.getPrevURL() == 'EXCLUDETAGS')
                    window.localStorage.setItem("ExcludeTags", JSON.stringify(TagList));

                $location.path('/projecttasks/createtagfilter');
            };

        }]);