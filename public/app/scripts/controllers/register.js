'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('RegisterCtrl', function ($scope,auth,alert) {

    $scope.submit = function(){

      auth.register($scope.email,$scope.password)
        .success(function(res){
          alert('успешно','Поздравляем!','Вы зарегистрированы');
        })
        .error(function(res){
          alert('внимание','Упс!','Регистрация не прошла');
        })
      };
  });
