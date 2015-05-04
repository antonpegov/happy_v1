'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:ThemeadminCtrl
 * @description
 * # ThemeadminCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('ThemeAdminCtrl',function ($scope,$http,API_URL,$state,$timeout) {

    var url = API_URL + 'admin/theme';
    $scope.names = {};
    $scope.modTheme = {};
    $scope.pointer = 0;

    function reload(){
      $state.reload();
    }

    /*--------------------------------------------------------------
     Функция удаления Темы
     --------------------------------------------------------------*/

    $scope.removeTheme = function(){

      $http.delete(url + '?themeId=' +$scope.themes[$scope.pointer]._id)
        .success(function(err) {
          //console.log('Sended delete request with id= ', themes[pointer]._id);
          //alert('Success', 'Язык удалён');

        })
        .error(function(err){
          console.log(err);
        });
      $timeout(reload, 2000);
      console.log('=removeTheme= is Done');
    };

    /*-----------------------------------------------------------
     Функция сохраниения объекта Theme
     ------------------------------------------------------------*/

    $scope.addTheme = function(){
      var theme = {
        names: $scope.names
      };

      $http.post(url, theme)
        .success(function (err) {
          //console.log(theme,$scope.names);
          //alert('Success','Object sent');
        })
        .error(function (err) {
          console.log(err);
        });

      $timeout(reload, 2000);
    };



    /*-----------------------------------------------------------
     Функция отправки изменённого объекта Theme
     ------------------------------------------------------------*/

    $scope.editTheme = function(){

      $http.put(url, $scope.modTheme)
        .success(function (err) {
          //console.log('sending PUT request with ', $scope.modTheme);
        })
        .error(function (err) {
          console.log(err);
        });

      $timeout(reload, 2000);
      //console.log('=editTheme= is Done');
    };

    /*------------------------------------------------------------
     Получаем массив объектов Theme
     -------------------------------------------------------------*/

    $http.get(API_URL + 'theme')
      .success(function (themes) {
        $scope.themes = themes;
        //console.log('themes: ', themes);
        // Инициализация указателя
        if(themes[0] === undefined) return;
        $scope.pointer = 0;
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
     Функция обновления значения указателя, к которому
     привязаны поля формы редактирования темы
     --------------------------------------------------------------*/

    $scope.click = function(id){

      $scope.pointer = id;
      $scope.modTheme = $scope.themes[id];
            //console.log($scope.pointer);
            //console.log($scope.modTheme);
    };
  });


