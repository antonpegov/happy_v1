'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
