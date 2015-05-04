'use strict';

angular.module('happyTurtlesApp').config(function($stateProvider,$urlRouterProvider,$httpProvider){

    $urlRouterProvider.otherwise('/');
    $httpProvider.interceptors.push('authInterceptor');

    $stateProvider
    .state('register', {
        url:'/register',
        templateUrl:'../views/register.html',
        controller:'RegisterCtrl'


      }).state('reception', {
        url:'/reception',
        templateUrl:'../views/reception.html',
        controller:'ReceptionCtrl'

      }).state('logout', {
        url:'/logout',
        controller:'LogoutCtrl'

      }).state('free', {
        url:'/free',
        templateUrl:'views/free.html'


      }).state('about', {
        url:'/about',
        templateUrl:'views/about.html'


      }).state('main', {
        url:'/',
        templateUrl:'views/main.html',
        controller:'MainCtrl'


      }).state('login', {
        url:'/login',
        templateUrl:'../views/login.html',
        controller:'LoginCtrl'

/*

      }).state('admin', {
        url:'/admin',
        templateUrl:'../views/admin.html',
        controller:'AdminCtrl'


      }).state('words-adm', {
        url:'/words-adm',
        templateUrl:'../views/words-adm.html',
        controller:'WordsAdminCtrl'



      }).state('language-adm', {
        url:'/language-adm',
        templateUrl:'../views/language-adm.html',
        controller:'LanguageAdminCtrl'


      }).state('theme-adm', {
        url:'/theme-adm',
        templateUrl:'../views/theme-adm.html',
        controller:'ThemeAdminCtrl'
*/

      })


      ;

}).constant('API_URL','http://localhost:3000/')
  .constant('SYS_LANG', 'rus');
