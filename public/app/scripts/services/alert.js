'use strict';

/**
 * @ngdoc service
 * @name happyTurtlesApp.alert
 * @description
 * # alert
 * Service in the happyTurtlesApp.
 */
angular.module('happyTurtlesApp')
  .service('alert', function alert($rootScope,$timeout) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var alertTimeout;
    return function(type,title,message,timeout){
      $rootScope.alert = {
        hasBeenShown: true,
        show: true,
        type: type,
        message:message,
        title:title
      };
      $timeout.cancel(alertTimeout);
      alertTimeout = $timeout(function(){
        $rootScope.alert.show = false;
      }, timeout||2000);
    };
  });
