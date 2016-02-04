'use strict';
angular.module('dealerportal.app', [
    'LocalStorageModule',
    'dealerportal.enum',
    'dealerportal.nav',
    'ngResource',
    'dealerportal.login',
    'dealerportal.homeowner',
    'dealerportal.map',
    'dealerportal.dashboard',
    'dealerportal.landing',
    'dealerportal.resource',
    'dealerportal.service',
    'ui.router',
    'ui.bootstrap',
    'angularSpinner',
    'ui.utils',
    'ng.shims.placeholder'
])

    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.interceptors.push('noCacheInterceptor');

        $urlRouterProvider.otherwise('/');
        $stateProvider
            .state('unauthenticated', {
                abstract: true,
                template: '<ui-view></ui-view>'
            })
            .state('authenticated', {
                abstract: true,
                template: '<ui-view></ui-view>',
                resolve: {
                    isAuthenticated: ['sessionService', function(sessionService) {
                        return sessionService.isAuthenticated();
                    }]
                },
                views: {
                    'nav@': {
                        templateUrl: 'app/navbar/navbar.html',
                        controller: 'NavbarCtrl as nav'
                    },
                    '': {
                        template: '<ui-view></ui-view>'
                    }
                }
            })
            .state('landing', {
                url: '/',
                templateUrl: 'app/landingRedirector/landingRedirector.html',
                controller: 'landingRedirectorCtrl'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/login/login.html',
                controller: 'LoginCtrl as loginPage',
                parent: 'unauthenticated'
            })
            .state('homepage', {
                abstract: false,
                url: '/homepage',
                templateUrl: 'app/main/home.html',
                parent: 'authenticated'
            })
            .state('dashboard', {
                abstract: true,                
                templateUrl: 'app/main/dashboard.html',
                controller: 'DashboardController as dashboardController',
                parent: 'authenticated'
            })
            .state('homeowners', {
                url: '/homeowners',
                templateUrl: 'app/main/homeowner-table.html',
                controller: 'HomeownerList as homeownerList',
                parent: 'dashboard'
            })
            .state('map', {
                url: '/map',
                templateUrl: 'app/main/homeowner-map.html',
                controller: 'HomeownerMapCtrl as homeownerMap',
                parent: 'dashboard'
            })
        ;

    }])

    .run(['$state', '$rootScope', '$log', 'snapflowConstant', 'sessionService', '$stateParams',
        function ($state, $rootScope, $log, snapflowConstant, sessionService, $stateParams) {
            // make route state available in all templates
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
                $log.log('$stateChangeStart from ' + fromState.name + ' to ' + toState.name);
            });
            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState){
                $rootScope.title = toState.name + '-body';
                $rootScope.currentView = toState.name;
                $log.log('$stateChangeSuccess from ' + fromState.name + ' to ' + toState.name);
            });
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
                $log.error('$stateChangeError from ' + fromState.name + ' to ' + toState.name + ' with error ' + error);
                if (error === snapflowConstant.ERROR.REQUIRES_AUTHENTICATION) {
                    $state.go('login');
                } else {
                    $log.debug('$stateChangeError ' + error);
                    throw new Error('Unhandled route change error', error);
                }
            });
            $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState){
                $log.error('$stateNotFound  from ' + fromState.name + ' to ' + unfoundState);
            });

            sessionService.setSessionTimeout();
        }])

    .factory('noCacheInterceptor', function () {
        return {
            request: function (config) {
                if(config.method === 'GET' && config.url.indexOf('api') !== -1) {
                    var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                    config.url = config.url+separator+'noCache=' + new Date().getTime();
                }
                return config;
            }
        };
    });
