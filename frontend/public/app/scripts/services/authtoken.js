'use strict';

/**
 * @ngdoc service
 * @name happyTurtlesApp.authToken
 * @description
 * # authToken
 * Factory in the happyTurtlesApp.
 */
angular.module('happyTurtlesApp').factory('authToken', function ($window) {
  var storage = $window.localStorage;
  var chachedToken;
  var userToken = 'userToken';

  var authToken =  {
    setToken: function (token){
      chachedToken = token;
      storage.setItem(userToken,token);
    },
    getToken: function(){
      if(!chachedToken){
        chachedToken = storage.getItem(userToken);
      }
      return chachedToken;
    },
    isAuthenticated: function(){
      return !!authToken.getToken();
    },
    removeToken: function(){
      chachedToken = null;
      storage.removeItem(userToken);
    }
  };
  return authToken;
});
