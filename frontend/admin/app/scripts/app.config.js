'use strict';

angular.module('happyTurtlesAppAdmin')
  .config(function($stateProvider,$urlRouterProvider,$httpProvider){

    $urlRouterProvider.otherwise('/');
    $httpProvider.interceptors.push('authInterceptor');

    $stateProvider
      .state('logout', {
        url:'/logout',
        controller:'LogoutCtrl'
      })
      .state('register', {
        url:'/register',
        templateUrl:'./views/register.html',
        controller:'RegisterCtrl'
      })
      .state('login', {
        url:'/login',
        templateUrl:'./views/login.html',
        controller:'LoginCtrl'
      })
      .state('admin', {
        url:'/',
        templateUrl:'./views/admin.html',
        controller:'AdminCtrl'
      })
      .state('words-adm', {
        url:'/words-adm',
        templateUrl:'./views/words-adm.html',
        controller:'WordsAdminCtrl'
      })
      .state('language-adm', {
        url:'/language-adm',
        templateUrl:'./views/language-adm.html',
        controller:'LanguageAdminCtrl'
      })
      .state('theme-adm', {
        url:'/theme-adm',
        templateUrl:'./views/theme-adm.html',
        controller:'ThemeAdminCtrl'
      });

  })
  .config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
  }])
  .constant('API_URL_ADM','/admin/')
  .constant('API_URL','/')
  .constant('SYS_LANG', 'rus');
