'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:ThemeadminCtrl
 * @description
 * # ThemeadminCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
    .controller('ThemeAdminCtrl',function ($scope,$http,API_URL,API_URL_ADM,SYS_LANG,$state,$timeout,_) {
        var urlLangs = API_URL + 'langs';
        var urlThemes = API_URL + 'themes';
        var urlCodes = API_URL + 'codes';
        var urlNotions = API_URL + 'words';
        var urlAdm = API_URL_ADM + 'themes';
        $scope.SYS_LANG = SYS_LANG;
        $scope.notins = []; // массив загруженных с сервера слов
        $scope.langs = [];  // массив из всех имеющихся в базе языков
        $scope.themes = [];  // все имеющиеся темы
        $scope.modTheme = {};  // редактируемая тема
        $scope.newTheme = {};  // новая тема
        $scope.btn = [];  // массив для хранения состояния кнопочек, инициализируется в get(темы)
        $scope.states = ['On', 'Off'];// массив возможных состояний кнопки
        $scope.click = function(item_index){
            //item_index - индекс выбранной темы в массиве themes
            resetButtons(function(){
                $scope.btn[item_index].state = $scope.states[1]; // переводим кнопку в состояние On
                $scope.modTheme = $scope.themes[item_index];  // и сохраняем выбранную тему в modTheme
                //console.log('item_index = %s', item_index);
            });
        };  // обработчик нажатия на кнопку выбранной темы
        //--------------------------------------
        function reload(){
            $state.reload();
        } // функция обновления страницы браузера
        function resetButtons(callback){
            _.map($scope.btn,function(button){
                button.state = $scope.states[0];
            });
            callback();
        }  // функция сброса кнопок в состояние Off

        /*-----------------------------------------------------------
              Функция загрузки слов по теме
         ------------------------------------------------------------*/

        $scope.getWords = function(theme_id){
            var request = urlNotions+'?theme='+theme_id;
            $http.get(request)
                .success(function (notions) {
                    $scope.notions = notions.words;
                    console.log('notions: ', notions.words);
                    if(notions[0] === undefined)
                        console.log("--- didn't got themes array!!! ---");
                    // цикл инициализации массива кнопочек
                    //for (var i = 0; i < themes.length; i++) {
                    //    $scope.btn[i] = {state: $scope.states[0]};
                    //}
                })
                .error(function (err) {
                    console.log(err);
                });

        };  // обработчик нажатия кнопки загрузки и показа слов по теме

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

        /*------------------------------------------------------------
         Получаем массивы Тем и Языков
         -------------------------------------------------------------*/

        $http.get(urlThemes)
            .success(function (themes) {
                $scope.themes = themes;
                //console.log('themes: ', themes);
                if(themes[0] === undefined)
                    console.log("--- didn't got themes array!!! ---");
                // цикл инициализации массива кнопочек
                for (var i = 0; i < themes.length; i++) {
                    $scope.btn[i] = {state: $scope.states[0]};
                }
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

        $http.get(urlCodes)
            .success(function (codes) {
                $scope.codes = codes;
                console.log('codes: ', codes);
                if(codes[0] === undefined)
                    console.log("--- didn't got codes array!!! ---");
            })
            .error(function (err) {
                console.log(err);
            });

    });


