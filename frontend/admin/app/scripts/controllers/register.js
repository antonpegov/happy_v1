'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
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
