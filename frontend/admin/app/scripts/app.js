'use strict';

/**
 * @ngdoc overview
 * @name happyTurtlesAppAdmin
 * @description
 * # happyTurtlesAppAdmin
 *
 * Main module of the application.
 */
var app = angular.module('happyTurtlesAppAdmin',[
  'ngAnimate'
  ,'ngCookies'
  ,'ngResource'
  ,'ngRoute'
  ,'ngSanitize'
  ,'ngTouch'
  ,'ui.router'
  ,'ui.utils'
  ,'ui.select'
  ,'angular-loading-bar'
  ,'underscore'
  //,'underscore.string'
]);

/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */
app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});

// Загрузка файла в модуле загрузки слов
app.directive('fileReader', function() {
  return {
    /*scope: {
      fileReader:"="
    },*/
    link: function(scope, element) {
      $(element).on('change', function(changeEvent) {
        var files = changeEvent.target.files;
        if (files.length) {
          var r = new FileReader();
          r.onload = function(e) {
              var contents = e.target.result;
              scope.$apply(function () {
                scope.fileReader = contents;
                scope.myWords = contents;
              });
          };
           
          r.readAsText(files[0]);
        }
      });
    }
  };
});

// Подключение библиотеки Underscore
var underscore = angular.module('underscore', []);
underscore.factory('_', ['$window', function($window) {
    return $window._;
}]);
