'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('MainCtrl', function ($scope,authToken,$state) {
    if (authToken.isAuthenticated()){
      $state.go('reception');
    }
  });
