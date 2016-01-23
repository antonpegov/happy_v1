'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:LogoutCtrl
 * @description
 * # LogoutCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
  .controller('LogoutCtrl', function ($scope,authToken,$state) {
    authToken.removeToken();
    $state.go('main');
  });
