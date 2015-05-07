'use strict';

/**
 * @ngdoc overview
 * @name happyTurtlesApp
 * @description
 * # happyTurtlesApp
 *
 * Main module of the application.
 */
var app = angular
  .module('happyTurtlesApp', [
    'ngAnimate'
    ,'ngCookies'
    ,'ngResource'
    ,'ngRoute'
    ,'ngSanitize'
    ,'ngTouch'
    ,'ui.router'
    ,'ui.utils'
    ,'ui.select'
    ,'ui.bootstrap'
    ,'angular-loading-bar'
    
  ]);
 /* .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });*/
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
