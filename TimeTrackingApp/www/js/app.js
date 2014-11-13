var blurFocusDirective = function () {
    return {
        restrict: 'E',
        require: '?ngModel',
        link: function (scope, elm, attr, ctrl) {
            if (!ctrl) {
                return;
            }

            elm.on('focus', function () {
                elm.addClass('has-focus');

                scope.$apply(function () {
                    ctrl.hasFocus = true;
                });
            });

            elm.on('blur', function () {
                elm.removeClass('has-focus');
                elm.addClass('has-visited');

                scope.$apply(function () {
                    ctrl.hasFocus = false;
                    ctrl.hasVisited = true;
                });
            });

            $("form").on('submit', function () {
                elm.addClass('has-visited');

                scope.$apply(function () {
                    ctrl.hasFocus = false;
                    ctrl.hasVisited = true;
                });
            });
        }
    };
};



var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'mgcrea.ngStrap'])
    .directive('input', blurFocusDirective)
    .directive('select', blurFocusDirective)
    .directive('appFilereader', function ($q) {
        /*
        made by elmerbulthuis@gmail.com WTFPL licensed
        */
        var slice = Array.prototype.slice;

        return {
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel) return;

                ngModel.$render = function () { }

                element.bind('change', function (e) {
                    var element = e.target;
                    if (!element.value) return;

                    element.disabled = true;
                    $q.all(slice.call(element.files, 0).map(readFile))
                      .then(function (values) {
                          if (element.multiple) ngModel.$setViewValue(values);
                          else ngModel.$setViewValue(values.length ? values[0] : null);
                          element.value = null;
                          element.disabled = false;
                      });

                    function readFile(file) {
                        var deferred = $q.defer();

                        var reader = new FileReader()
                        reader.onload = function (e) {
                            deferred.resolve(e.target.result);
                        }
                        reader.onerror = function (e) {
                            deferred.reject(e);
                        }
                        reader.readAsDataURL(file);

                        return deferred.promise;
                    }
                }); //change
            } //link
        }; //return
    })
    .run(function ($ionicPlatform, $rootScope, AUTH_EVENTS, AuthService) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

        $rootScope.$on('$stateChangeStart', function (event, next) {
            if (AuthService.isAuthenticated() == false) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
        });
    });

app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/vwlogin.html',
            controller: 'logincontroller'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'templates/vwregister.html',
            controller: 'registercontroller'
        })
        .state('forgetpassword', {
            url: '/forgetpassword',
            templateUrl: 'templates/vwforgetpassword.html',
            controller: 'forgetpasswordcontroller'
        })
        .state('updateaccount', {
            url: '/updateaccount',
            templateUrl: 'templates/vwupdateaccount.html',
            controller: 'updateaccountcontroller'
        })
        .state('home', {
            url: '/home',
            templateUrl: 'templates/vwhome.html',
            controller: 'homecontroller'
        })
        .state('changepassword', {
            url: '/changepassword',
            templateUrl: 'templates/vwchangepassword.html',
            controller: 'changepasswordcontroller'
        })
        .state('addproject', {
            url: '/addproject',
            templateUrl: 'templates/vwaddproject.html',
            controller: 'addprojectcontroller'
        })
        .state('projecttasks.editproject', {
            url: '/editproject',
            views: {
                'projecttasks-projectdetails': {
                    templateUrl: 'templates/vweditproject.html'
                }
            },
            controller: 'editprojectcontroller'
        })
        .state('projecttasks', {
            url: '/projecttasks',
            templateUrl: 'templates/vwtasks.html'
        })
        .state('projecttasks.projectdetails', {
            url: '/projectdetails',
            views: {
                'projecttasks-projectdetails': {
                    templateUrl: 'templates/vwprojectdetails.html'
                }
            },
            controller: 'projectdetailscontroller'
        })
        .state('projecttasks.taskhome', {
            url: '/taskhome',
            views: {
                'projecttasks-taskhome': {
                    templateUrl: 'templates/vwtaskhome.html'
                }
            },
            controller: 'taskhomecontroller'
        })
        .state('projecttasks.tags', {
            url: '/tags',
            views: {
                'projecttasks-taskhome': {
                    templateUrl: 'templates/vwtags.html'
                }
            },
            controller: 'tagsdetailscontroller'
        })
        .state('projecttasks.filtertags', {
            url: '/filtertags',
            views: {
                'projecttasks-taskhome': {
                    templateUrl: 'templates/vwfiltertags.html'
                }
            },
            controller: 'filtertagscontroller'
        })
        .state('projecttasks.addtask', {
            url: '/addtask',
            views: {
                'projecttasks-taskhome': {
                    templateUrl: 'templates/vwaddtask.html'
                }
            },
            controller: 'addtaskcontroller'
        })
        .state('taskentries.updatetask', {
            url: '/updatetask',
            views: {
                'taskentries-taskdetails': {
                    templateUrl: 'templates/vwupdatetask.html'
                }
            },
            controller: 'updatetaskcontroller'
        })
        .state('location', {
            url: '/location',
            templateUrl: 'templates/vwlocation.html',
            controller: 'locationcontroller'
        })
        .state('projecttasks.exporttoemail', {
            url: '/exporttoemail',
            views: {
                'projecttasks-taskhome': {
                    templateUrl: 'templates/vwexporttoemail.html'
                }
            },
            controller: 'exporttoemailcontroller'
        })
        .state('moreexportoptions', {
            url: '/moreexportoptions',
            templateUrl: 'templates/vwmoreexportoptions.html',
            controller: 'moreexportoptionscontroller'
        })
        .state('projecttasks.createtagfilter', {
            url: '/createtagfilter',
            views: {
                'projecttasks-taskhome': {
                    templateUrl: 'templates/vwcreatetagfilter.html'
                }
            },
            controller: 'createtagfiltercontroller'
        })
        .state('projecttasks.settagfilter', {
            url: '/settagfilter',
            views: {
                'projecttasks-taskhome': {
                    templateUrl: 'templates/vwsettagfilter.html'
                }
            },
            controller: 'settagfiltercontroller'
        })
        .state('timeperiodfilter', {
            url: '/timeperiodfilter',
            templateUrl: 'templates/vwTimePeriod.html',
            controller: 'timeperiodfiltercontroller'
        })
        .state('taskentries', {
            url: '/taskentries',
            templateUrl: 'templates/vwentries.html'
        })
        .state('taskentries.taskdetails', {
            url: '/taskdetails',
            views: {
                'taskentries-taskdetails': {
                    templateUrl: 'templates/vwtaskdetails.html'
                }
            },
            controller: 'taskdetailscontroller'
        })
        .state('taskentries.tags', {
            url: '/tags',
            views: {
                'taskentries-taskdetails': {
                    templateUrl: 'templates/vwtags.html'
                }
            },
            controller: 'tagsdetailscontroller'
        })
        .state('taskentries.entryhome', {
            url: '/entryhome',
            views: {
                'taskentries-entryhome': {
                    templateUrl: 'templates/vwentryhome.html'
                }
            },
            controller: 'entryhomecontroller'
        })
        .state('taskentries.clockinouttime', {
            url: '/clockinouttime',
            views: {
                'taskentries-taskdetails': {
                    templateUrl: 'templates/vwclockinouttime.html'
                }
            },
            controller: 'clockinouttimecontroller'
        })
        .state('taskentries.exporttoemail', {
            url: '/exporttoemail',
            views: {
                'taskentries-taskdetails': {
                    templateUrl: 'templates/vwexporttoemail.html'
                }
            },
            controller: 'exporttoemailcontroller'
        })
        .state('taskentries.moreexportoptions', {
            url: '/moreexportoptions',
            views: {
                'taskentries-taskdetails': {
                    templateUrl: 'templates/vwmoreexportoptions.html'
                }
            },
            controller: 'moreexportoptionscontroller'
        })
        
    $urlRouterProvider.otherwise("/login");
});



