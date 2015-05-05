'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:ThemeadminCtrl
 * @description
 * # ThemeadminCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
  .controller('ThemeAdminCtrl',function ($scope,$http,API_URL,API_URL_ADM, $state,$timeout) {

    var urlCli = API_URL + 'theme';
    var urlAdm = API_URL_ADM + 'theme';
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

        $http.delete(urlAdm + '?themeId=' +$scope.themes[$scope.pointer]._id)
            .success(function(err) {
                if(err) console.log(err);
            
                console.log('Sended delete request with id= '
                              , $scope.themes[$scope.pointer]._id);
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

        $http.post(urlAdm, theme)
          .success(function (err) {
              if(err) console.log(err);
              console.log('AddTheme POST request sended...');
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

        $http.put(urlAdm, $scope.modTheme)
          .success(function (err) {
              if(err) console.log(err);
              console.log('EditTheme PUT request sended...');//, $scope.modTheme);
          })
          .error(function (err) {
              console.log(err);
          });

        $timeout(reload, 2000);
    };

    /*------------------------------------------------------------
     Получаем массив объектов Theme
     -------------------------------------------------------------*/

    $http.get(urlCli)
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
          if(!codes) console.log('CAN"T GET LANGUAGE CODES!');
          $scope.codes = codes;
          codes.forEach(function(entry){
              $scope.names[entry.code]='';
          });
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


