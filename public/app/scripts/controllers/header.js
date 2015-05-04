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
  });
