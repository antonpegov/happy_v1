'use strict';

/**
 * @ngdoc directive
 * @name adminApp.directive:ngConfirmClick
 * @description
 * # ngConfirmClick
 */
angular.module('happyTurtlesAppAdmin')
  .directive('ngConfirmClick', function () {
    return {
      priority: -1,
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        element.bind('click', function(e){
          var message = attrs.ngConfirmClick;
          if(message && !confirm(message)){
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        });
      }
    };
  });
