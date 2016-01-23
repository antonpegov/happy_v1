'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('LoginCtrl', function ($scope,auth,alert) {

    $scope.submit = function() {

      auth.login($scope.email,$scope.password)
        .success(function(res){
          alert('success','Welcome back!',' Добро пожаловать '
          + res.user.email +'!');
        })
        .error(function(){
          alert('warning','Opps!','Wrong login/password');
        });
    };
  });
