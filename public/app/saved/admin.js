'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:AdminCtrl
 * @description
 * # AdminCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('AdminCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
