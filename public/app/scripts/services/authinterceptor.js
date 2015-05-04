'use strict';

/**
 * @ngdoc service
 * @name happyTurtlesApp.authInterceptor
 * @description
 * # authInterceptor
 * Factory in the happyTurtlesApp.
 */
angular.module('happyTurtlesApp')
  .factory('authInterceptor', function (authToken) {
    return {
      request: function (config) {
        var token = authToken.getToken();
        if(token)
          config.headers.Authorization = 'Bearer ' +token;
        return config;
      },
      response: function (response) {
        return response;
      }
    }
  });
