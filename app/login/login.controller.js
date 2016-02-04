'use strict';

function sfUiAlertList() {
    return {
        restrict: 'E',
        templateUrl: 'app/login/alert-list.html',
        scope: {
            'alerts': '=', //success, info, warning, or danger
            'message': '@?',
            'alertType': '@'
        }
    };
}

function sfResetPassword() {
    return {
        restrict: 'E',
        templateUrl: 'app/login/passwordReset.html',
        scope: {
            'emailAddress': '='
        },
        controller: ['$scope', 'PasswordReset', function($scope, PasswordReset) {
            $scope.state = 'ready';

            $scope.resetPassword = function() {
                $scope.state = 'resetting';

                PasswordReset.save({email: $scope.emailAddress}).$promise.then(
                    function success() { $scope.state = 'sent'; },
                    function failure() { $scope.state = 'error'; }
                );
            };
        }]
    };
}

function loginCtrl ($log, $state, sessionService, usSpinnerService) {
    /*jshint validthis:true */
    var self = this;

    self.isLoggingIn = false;

    self.spinnerOptions = {
        lines: 8, // The number of lines to draw
        length: 0, // The length of each line
        width: 4, // The line thickness
        radius: 7, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 10, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#FFF', // #rgb or #rrggbb or array of colors
        speed: 1.5, // Rounds per second
        trail: 0, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: true, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9 // The z-index (defaults to 2000000000)
    };

    if (sessionService.sessionId) {
        $state.go('landing');
    }

    function login(data) {
        self.isLoggingIn = true;
        self.startSpinner();

        function loginSuccess() {
            self.isLoggingIn = false;
            self.stopSpinner();
            $log.log(data);
            $state.go('landing');
        }

        function loginError(e) {
            self.isLoggingIn = false;
            self.stopSpinner();
            self.loginFailed = true;
            $log.error(e);
        }

        sessionService.login({username: self.username, password: self.password})
            .then(loginSuccess)
            .catch(loginError);
    }

    function stopSpinner() {
        return usSpinnerService.stop('spinner-1');
    }

    function startSpinner() {
        return usSpinnerService.spin('spinner-1');
    }

    self.login = login;
    self.startSpinner = startSpinner;
    self.stopSpinner = stopSpinner;
    self.loginFailed = false;
}

angular.module('dealerportal.login', ['dealerportal.service'])
    .controller('LoginCtrl', ['$log', '$state', 'sessionService', 'usSpinnerService', loginCtrl])
    .directive('sfUiAlertList', sfUiAlertList)
    .directive('sfResetPassword', sfResetPassword);
