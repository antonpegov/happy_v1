'use strict';

/**
 * @ngdoc service
 * @name happyTurtlesAppAdmin.auth
 * @description
 * # auth
 * Service in the happyTurtlesAppAdmin.
 */
angular.module('happyTurtlesAppAdmin')
  .service('auth', function ($http,authToken,API_URL_ADM,$state) {

    function authSuccessful(res){
      authToken.setToken(res.token);
      $state.go('admin');
    }

    this.login = function(email,password){
      return $http.post(API_URL_ADM + 'login', {
        email:email,
        password:password
      }).success(authSuccessful);
    };

    this.register = function(email,password){
      return $http.post(API_URL_ADM + 'register', {
        email:email,
        password:password

      }).success(authSuccessful);
    };
  });
