'use strict';
/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
  .controller('HeaderCtrl', function ($scope,authToken) {
    $scope.isAuthenticated = authToken.isAuthenticated;
    console.log('isAuthanticated()='+$scope.isAuthenticated());
  });
