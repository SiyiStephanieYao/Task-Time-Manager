var ser = angular.module('starter.services', []);

ser.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

ser.factory('AuthService', function ($http, Session) {
    var authService = {};
    var user = {};

    authService.login = function (credentials) {
        var promise =
            //$http.post('http://www.testsite9980.somee.com/api/Login', credentials)
            //$http.post('http://localhost/timetrackingapi/api/Login', credentials)
             $http.post('http://time.cloudstratagem.com.au/api/login', credentials)
            .success(function (data, status, headers, config) {
                Session.create(data.fldUserEmail);
                console.log('fetch data from database completed successfully');
                authService.setuser(data);
                return data;
            })
            .error(function (data, status, headers, config) {
                console.log('fetch data from database fail');
            });

        return promise;
    };

    authService.setuser = function (data) {
        return this.user = data;
    };

    authService.getuser = function () {
        return this.user;
    };

    authService.isAuthenticated = function () {
        return !!Session.fldUserEmail;
    };

    return authService;
});

ser.service('Session', function () {
    this.create = function (fldUserEmail) {
        this.fldUserEmail = fldUserEmail;
    };
    this.destroy = function () {
        this.fldUserEmail = null;
    };
    return this;
});

ser.service('sharedProperties', function () {
    var projectIdToEdit = 0;

    return {
        getProjectIdToEdit: function () {
            return projectIdToEdit;
        },
        setProjectIdToEdit: function (value) {
            projectIdToEdit = value;
        }
    };
});


ser.service('cacheTasksWhileMovingToTags', function () {
    var Task = {};

    return {
        getTask: function () {
            return Task;
        },
        setTask: function (value) {
            Task = value;
        }
    }
});

ser.service('cacheTagFilterWhileMovingToTags', function () {
    var FilterTag = {};

    return {
        getFilterTag: function () {
            return FilterTag;
        },
        setFilterTag: function (value) {
            FilterTag = value;
        }
    }
});


ser.service('PreviousURLForAddTags', function () {
    var previousURL = "";
    return {
        getPrevURL: function () {
            return previousURL;
        },
        setPrevURL: function (value) {
            previousURL = value;
        }
    }
});

ser.service('PreviousURLForAddPeriodFilter', function () {
    var previousURL = "";
    return {
        getPrevURL: function () {
            return previousURL;
        },
        setPrevURL: function (value) {
            previousURL = value;
        }
    }
});

ser.service('SetFieldsForEmail', function () {
    var Fields = {};

    return {
        getFields: function () {
            return Fields;
        },
        setFields: function (value) {
            Fields = value;
        }
    }
});

ser.service('globalservice', function () {
    return {
        AppURL: function () {
            //return 'http://localhost/TimeTrackingAPI/api/';
            //return 'http://www.testsite9980.somee.com/api/';
            return 'http://time.cloudstratagem.com.au/api/';
        }
    }
});