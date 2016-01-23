'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
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
