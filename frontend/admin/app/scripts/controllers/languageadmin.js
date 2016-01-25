'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:LanguageadminCtrl
 * @description
 * # LanguageadminCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
    .controller('LanguageAdminCtrl',function ($scope,$http,API_URL,API_URL_ADM,alert,$state,$timeout) {
        var urlCli = API_URL + 'langs';
        var urlAdm = API_URL_ADM + 'langs';
        $scope.langs = [];  // массив из всех имеющихся в базе языков
        $scope.newLang = {};  // новый язык
        $scope.modLang = {};  // редактируемый язык
        function reload(){
          $state.reload();
      }

        /*---------------------------------------------------------------------------------
                Функция удаления языка
                НЕ ДОДЕЛАННО!!! Необходимо реализовать удаление свойства с кодом
                удаляемого языка из массивов names всех имеющихся в базе языков и тем
        ---------------------------------------------------------------------------------*/

        $scope.removeLanguage = function(){
            $http.delete(urlAdm + '?_id=' +$scope.modLang._id)
            .success(function(err) {
                if (err) console.log(err);
                console.log('Sending delete request with id= '
                    , $scope.modLang._id);
            })
            .error(function(err){
                console.log(err);
            });
            $timeout(reload, 1000);
            //console.log('=removeLanguage= is Done');
        };

        /*------------------------------------------------------------------------------
                Функция сохраниения объекта Language
                НЕ ДОДЕЛАННО!!! Необходимо реализовать добавление свойства с
                новым кодом в массив names всех имеющихся в базе языков и тем
        ----------------------------------------------------------------------------------*/

        $scope.addLanguage = function(){
            var lang = {
                code: $scope.newLang.code,
                names: $scope.newLang.names
            };
            $http.post(urlAdm, lang)
                .success(function (err) {
                    if(err) console.log(err);
                    console.log("Saving new Language: ",lang);
                })
                .error(function (err) {
                    console.log(err);
                });
            $timeout(reload, 1000);
        };

        /*--------------------------------------------------------------------------
                Функция отправки изменённого объекта Language
        ---------------------------------------------------------------------------*/

        $scope.editLanguage = function(){
            var lang = {
                _id: $scope.modLang._id,
                code: $scope.modLang.code,
                names: $scope.modLang.names
            };
            $http.put(urlAdm, lang)
                .success(function (err) {
                    if (err) console.log(err);
                    console.log('Sending PUT request with ', lang);
                })
                .error(function (err) {
                    console.log(err);
                });
            $timeout(reload, 1000);
            //console.log('=editLanguage= is Done',lang);
        };

        /*---------------------------------------------------------------------------
                Функция обновления значения указателя и инициализации массива
                modLang, к которому привязаны поля формы редактирования языка
        ---------------------------------------------------------------------------*/

        $scope.click = function(item_index){
            //item_index - индекс выбранного языка в массиве langs
            $scope.modLang = $scope.langs[item_index];
            console.log('modLang:',$scope.modLang);
        };

        /*-------------------------------------------------------------------------
                Получаем массив объектов Language
        --------------------------------------------------------------------------*/

        $http.get(urlCli)
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



