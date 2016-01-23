'use strict';
/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('HeaderCtrl', function ($scope,authToken) {
    $scope.isAuthenticated = authToken.isAuthenticated;
    console.log('isAuthanticated()='+$scope.isAuthenticated());
    $('.nav a').on('click', function() {
          $(".btn-navbar").click(); //bootstrap 2.x
          $(".navbar-toggle").click() //bootstrap 3.x by Richard
    });
  });
