angular.module('starter.controllers').controller('settagfiltercontroller',
    ['$scope', '$location', '$http', '$rootScope', '$ionicPopup', 'cacheTagFilterWhileMovingToTags', 'globalservice',
        function ($scope, $location, $http, $rootScope, $ionicPopup, cacheTagFilterWhileMovingToTags, globalservice) {
            $scope.TagFilter = {};
            cacheTagFilterWhileMovingToTags.setFilterTag(null);

            
            //Fetch all tags
            $http.get(globalservice.AppURL() + 'TagFilter/').
            success(function (data) {
                
                $scope.TagFilter = data;
                //SelectTagsForTask($scope.TagDetails, TagList);
            }).
            error(function (data) {
                $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch Tag filter from database \n' + data.ExceptionMessage });
            });

            //Cancel
            $scope.Cancel = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Cancel tag changes',
                    template: 'Are you sure you want to cancel tag filter changes?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $location.path('/projecttasks/taskhome');
                    }
                });
            };

            $scope.AssignTagsToFilter = function () {
                
                var FilterList = new Array();

                angular.forEach($scope.TagFilter, function (filter) {
                    if (filter.checked == true) {
                        FilterList.push({
                            "fldFilterId": filter.fldFilterId,
                            "fldFilterName": filter.fldFilterName
                        });
                    }
                });
                $location.path('/projecttasks/taskhome');
                window.localStorage.setItem("SelectedFilters", JSON.stringify(FilterList));

                
            };

            $scope.AddFilters = function () {
                var TagFilterTemp = {};
                window.localStorage.removeItem("IncludeTags");
                window.localStorage.removeItem("ExcludeTags");

                cacheTagFilterWhileMovingToTags.setFilterTag(TagFilterTemp);
                $location.path('/projecttasks/createtagfilter');
            };

            $scope.DeleteSelectedFilters = function () {
                
                var FilterList = [{}];

                angular.forEach($scope.TagFilter, function (filter) {
                    if (filter.checked == true) {
                        FilterList.push({
                            "fldFilterId": filter.fldFilterId
                        });
                    }
                });

                

                if (FilterList.length <= 1) {
                    $ionicPopup.alert({ title: 'Time Tracking', template: 'Please select filter to delete' });
                    return;
                };

                var confirmPopup = $ionicPopup.confirm({
                    title: 'Delete Filter/s',
                    template: 'Are you sure you want to delete filter/s?'
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        $http.post(globalservice.AppURL() + 'DeleteMultipleTagFilter/0', FilterList).
                            success(function (data) {
                                $scope.TagFilter = data;
                                $ionicPopup.alert({ title: 'Time Tracking', template: 'Tag filter deleted successfully' });
                            }).
                            error(function (data) {
                                $ionicPopup.alert({ title: 'Error', template: 'Unable to fetch tag filter from database \n' + data.ExceptionMessage });
                            });
                    }
                });
            };

        }]);