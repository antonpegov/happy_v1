'use strict';

/**
 * @ngdoc service
 * @name publicApp.langs
 * @description
 * # langs
 * Service in the publicApp.
 */
angular.module('happyTurtlesApp')
  .service('langsSrv', function($http, API_URL) {


      var langsUrl = API_URL + 'langs';
      var themeDemoUrl = API_URL + 'demothemes';
      var wordsUrl = API_URL + 'words';
      var myService = {
          
          getLangsAsync: function(user_lang) {
              // $http returns a promise, which has a then function, which also returns a promise
              var promise = $http.get(langsUrl).then(function (response) {
                  // The then function here is an opportunity to modify the response
                  console.log('Response: ',response);
                  var langs = response.data;
                  var pattern = {};
                  pattern.code = user_lang;
                  // cut out user language
                  langs = _.without(langs, _.findWhere(langs, pattern));
                  // The return value gets picked up by the then in the controller.
                  return langs;
              });
              // Return the promise to the controller
              return promise;
          }
          
          ,getDemoThemesAsinc: function() {
              
              var promise = $http.get(themeDemoUrl).then(function(response){
                  return response.data;
              });
              return promise;
          }
          
          ,getWordsByThemeId: function(_id,lang1,lang2){
            
              console.log(_id,lang1,lang2);
              var query = wordsUrl+"?theme_id="+_id+"&lang1="+lang1+"&lang2="+lang2;
              var promise = $http.get(query).then(function(response){
              
                //response.data - тело ответа, в него положил массив 'words' и идентификатор 'theme'
                return response.data.words;
              });
              return promise;
          }
          
      };
      return myService;
  });
