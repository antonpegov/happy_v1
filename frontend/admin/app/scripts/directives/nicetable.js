'use strict';

/**
 * @ngdoc directive
 * @name adminApp.directive:niceTable
 * @description
 * # niceTable
 */
angular.module('happyTurtlesAppAdmin')
  .directive('niceTable', function () {
    return {
      templateUrl: 'views/nice-table.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the niceTable directive');
      }
    };
  });
