'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:ReceptionCtrl
 * @description
 * # ReceptionCtrl
 * Controller of the happyTurtlesApp
 */
//Нужен список тем.
//

angular.module('happyTurtlesApp')
  .controller('ReceptionCtrl', function ($scope,API_URL,SYS_LANG,$http) {
    $scope.sysLang = SYS_LANG;
    $http.get(API_URL + 'themes')
      .success(function(themes){
        $scope.themes = themes;
      })
      .error(function(err){
        alert('Warning','Can"t get "themes"');
      });
  });
