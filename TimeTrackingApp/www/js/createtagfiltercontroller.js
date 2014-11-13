angular.module('starter.controllers').controller('createtagfiltercontroller',
    ['$scope', '$location', '$http', '$ionicPopup', 'PreviousURLForAddTags', 'cacheTagFilterWhileMovingToTags', 'globalservice',
        function ($scope, $location, $http, $ionicPopup, PreviousURLForAddTags, cacheTagFilterWhileMovingToTags, globalservice) {

            $scope.init = function () {

                $scope.TagFilter = {};
                $scope.TagFilter = cacheTagFilterWhileMovingToTags.getFilterTag();

                
                if (window.localStorage.getItem("IncludeTags") != null)
                    $scope.TagFilter.IncludeTags = JSON.parse(window.localStorage.getItem("IncludeTags"));

                if (JSON.parse(window.localStorage.getItem("ExcludeTags")) != null)
                    $scope.TagFilter.ExcludeTags = JSON.parse(window.localStorage.getItem("ExcludeTags"));
            };

            $scope.init();

            //Insert new Tag filter 
            $scope.CreateTagFilter = function () {
                
                $http.post(globalservice.AppURL() + 'AddTagFilter', $scope.TagFilter).
                 success(function (data) {
                     $location.path('/projecttasks/settagfilter');
                     $ionicPopup.alert({ title: 'Time Tracking', template: 'Tag filter added successfully' });
                     $scope.TagFilter = {};
                     cacheTagFilterWhileMovingToTags.setTask($scope.TagFilter);

                 }).
                 error(function (data) {
                     $ionicPopup.alert({ title: 'Error', template: 'Can not add Tag, please contact admin \n' + data.ExceptionMessage });
                 });
            };

            //Cancel
            $scope.Cancel = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Cancel tag creation',
                    template: 'Are you sure you want to cancel tag creation?'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        $location.path('/projecttasks/settagfilter');
                    }
                });
            };

            //Add filter tags
            $scope.AddIncludeTags = function () {
                cacheTagFilterWhileMovingToTags.setFilterTag($scope.TagFilter);
                PreviousURLForAddTags.setPrevURL('INCLUDETAGS');
                $location.path('/projecttasks/filtertags');
            };

            $scope.AddExcludeTags = function () {
                cacheTagFilterWhileMovingToTags.setFilterTag($scope.TagFilter);
                PreviousURLForAddTags.setPrevURL('EXCLUDETAGS');
                $location.path('/projecttasks/filtertags');
            };
        }]);