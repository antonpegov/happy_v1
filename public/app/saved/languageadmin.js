'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:LanguageadminCtrl
 * @description
 * # LanguageadminCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('LanguageAdminCtrl',function ($scope,$http,API_URL,alert,$state,$timeout) {

      var url = API_URL + 'lang';
      $scope.names = {};
      $scope.langs = {};
      $scope.editLang = {};
      // Хранит поле _id текущего элемента в массиве langs
      $scope.pointerId = 0;

      // Хранит значение поля code текущего элемента
      // От этого нужно будет избавиться...
      $scope.pointer = '';

      function reload(){
          $state.reload();
      }

    /*--------------------------------------------------------------
     Функция удаления языка
     --------------------------------------------------------------*/

      $scope.removeLanguage = function(id){

        $http.delete(API_URL + 'lang' + '?id=' +id)
          .success(function(err) {
              console.log('Sended delete request with id= ', id);
              //alert('Success', 'Язык удалён');

          })
          .error(function(err){
              console.log(err);
          });
        $timeout(reload, 1000);
        console.log('=removeLanguage= is Done');
      };

    /*-----------------------------------------------------------
     Функция сохраниения объекта Language
     ------------------------------------------------------------*/

    $scope.addLanguage = function(){
      var lang = {
        code: $scope.lang_add,
        names: $scope.names
      };

      $http.post(url, lang)
        .success(function (err) {
          //console.log(lang,$scope.names);
          //alert('Success','Object sent');
        })
        .error(function (err) {
          console.log(err);
        });

      $timeout(reload, 1000);
    };



    /*-----------------------------------------------------------
     Функция отправки изменённого объекта Language
     ------------------------------------------------------------*/

    $scope.editLanguage = function(){
      var lang = {
        _id: $scope.langs[$scope.pointerId]._id,
        code: $scope.pointer,
        names: $scope.editLang.names
      };

      $http.put(url, lang)
        .success(function (err) {
          //console.log('sending PUT request with ',lang);
          //alert('Success','Object sent');
        })
        .error(function (err) {
          console.log(err);
        });

      $timeout(reload, 1000);
      //console.log('=editLanguage= is Done',lang);
    };

/*------------------------------------------------------------
        Получаем массив объектов Language
-------------------------------------------------------------*/

      $http.get(API_URL + 'lang')
        .success(function (langs) {
          $scope.langs = langs;
          //console.log('langs: ', langs);
          // Инициализация указателя
          if(langs[0] === undefined) return;
          $scope.pointer = langs[0].code;
       })
        .error(function (err) {
          console.log(err);
      });

/*----------------------------------------------------------
        Получаем массив ISO-кодов и на егл основе создаём
        объект names для последующего заполнения в форме
-----------------------------------------------------------*/

        $http.get(API_URL + 'codes')
          .success(function (codes) {

            $scope.codes = codes;
            codes.forEach(function(entry){
              $scope.names[entry.code]='';
            });

            //console.log('names:', $scope.names);
        })
          .error(function (err) {
            console.log(err);
      });

    /*--------------------------------------------------------------
     Функция обновления значения указателя и
     инициализации массива editLang, к которому
     привязаны поля формы редактирования языка
     --------------------------------------------------------------*/

    $scope.click = function(id){
      $scope.pointer = id;
      //console.log('id= ',id);
      $scope.langs.forEach(function(item){
        if (item.code === $scope.pointer){

          //console.log($scope.langs.indexOf(item));
          $scope.pointerId = $scope.langs.indexOf(item);
          $scope.editLang = item;

        }
      });
    };


  });



