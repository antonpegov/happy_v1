'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:LogoutCtrl
 * @description
 * # LogoutCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('LogoutCtrl', function ($scope,authToken,$state) {
    authToken.removeToken();
    $state.go('main');
  });
