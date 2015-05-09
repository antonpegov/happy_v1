'use strict';

angular.module('happyTurtlesApp')

  .config(function($stateProvider,$urlRouterProvider,$httpProvider){

    $urlRouterProvider.otherwise('/');
    $httpProvider.interceptors.push('authInterceptor');

    $stateProvider
    
      .state('register', {
          url:'/register',
          templateUrl:'../views/register.html',
          controller:'RegisterCtrl'
      })
      .state('reception', {
          url:'/reception',
          templateUrl:'../views/reception.html',
          controller:'ReceptionCtrl'
      })
      .state('logout', {
          url:'/logout',
        controller:'LogoutCtrl'
      })
      .state('free', {
        url:'/free',
        templateUrl:'views/demo.html',
        controller:'DemoCtrl'
      })
      .state('about', {
        url:'/about',
        templateUrl:'views/about.html'
      })
      .state('main', {
        url:'/',
        templateUrl:'views/main.html',
        controller:'MainCtrl'
      })
      .state('login', {
        url:'/login',
        templateUrl:'../views/login.html',
        controller:'LoginCtrl'
      });
  })
  // Removing circle running while loading
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  }])
  .constant('API_URL','/')
  .constant('SYS_LANG', 'rus');
