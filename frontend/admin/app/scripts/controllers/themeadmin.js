'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:ThemeadminCtrl
 * @description
 * # ThemeadminCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
    .controller('ThemeAdminCtrl',function ($scope,$http,API_URL,API_URL_ADM,$state,$timeout,_) {
        var urlLangs = API_URL + 'langs';
        var urlThemes = API_URL + 'themes';
        var urlAdm = API_URL_ADM + 'themes';
        $scope.langs = [];  // массив из всех имеющихся в базе языков
        $scope.themes = [];  // все имеющиеся темы
        $scope.modTheme = {};  // редактируемая тема
        $scope.newTheme = {};  // новая тема
        function reload(){
            $state.reload();
        }

        /*--------------------------------------------------------------
                    Функция удаления Темы
        --------------------------------------------------------------*/

        $scope.removeTheme = function(){
            $http.delete(urlAdm + '?_id=' + $scope.modTheme._id)
                .success(function(err) {
                    if(err) console.log(err);
                    console.log('Sending delete request with id= '
                        , $scope.modTheme._id);
                })
                .error(function(err){
                    console.log(err);
                });
        
            $timeout(reload, 2000);
            ///console.log('=removeTheme= is Done');


        };

        /*-----------------------------------------------------------
                Функция сохраниения объекта Theme
         ------------------------------------------------------------*/

        $scope.addTheme = function(){
            var theme = {
                names: $scope.newTheme.names
            };
            $http.post(urlAdm, theme)
                .success(function (err) {
                    if(err) console.log(err);
                    console.log('Saving new Theme: ', theme);
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
            var theme = {
                _id: $scope.modTheme._id,
                names: $scope.modTheme.names
            };
            $http.put(urlAdm, theme)
              .success(function (err) {
                  if(err) console.log(err);
                  console.log('Sending PUT request with ', theme);
              })
              .error(function (err) {
                  console.log(err);
              });

            $timeout(reload, 2000);
        };

        /*--------------------------------------------------------------
         Функция обновления значения указателя, к которому
         привязаны поля формы редактирования темы
         --------------------------------------------------------------*/

        $scope.click = function(item_index){
            //item_index - индекс выбранной темы в массиве themes
            $scope.modTheme = $scope.themes[item_index];
            console.log('modTheme:',$scope.modTheme);
            console.log("Underscore test:", _.max([1,2,3,4]));
        };

        /*------------------------------------------------------------
         Получаем массивы Тем и Языков
         -------------------------------------------------------------*/

        $http.get(urlThemes)
            .success(function (themes) {
                $scope.themes = themes;
                //console.log('themes: ', themes);
                if(themes[0] === undefined)
                    console.log("--- didn't got themes array!!! ---");
            })
            .error(function (err) {
                console.log(err);
            });

        $http.get(urlLangs)
            .success(function (langs) {
                $scope.langs = langs;
                //console.log('langs: ', langs);
                if(langs[0] === undefined)
                    console.log("--- didn't got langs array!!! ---");
            })
            .error(function (err) {
                console.log(err);
            });
    });


