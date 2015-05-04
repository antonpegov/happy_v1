'use strict';

/**
 * @ngdoc directive
 * @name happyTurtlesAppAdmin.directive:navBar
 * @description
 * # navBar
 */
angular.module('happyTurtlesAppAdmin')
  .directive('navBar', function () {
    return {
      templateUrl: 'views/navigation-bar.html',
      restrict: 'E',
      controller: 'HeaderCtrl'
      //link: function postLink(scope, element, attrs) {
      //  element.text('this is the navBar directive');
      //}
    };
  });
