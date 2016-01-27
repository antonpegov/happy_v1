'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesAppAdmin.controller:UploadwordsCtrl
 * @description
 * # WordsAdminCtrl
 * Controller of the happyTurtlesAppAdmin
 */
angular.module('happyTurtlesAppAdmin')
    .controller('WordsAdminCtrl', function ($scope,API_URL,API_URL_ADM,SYS_LANG,$http,_) {
        var urlLangs = API_URL + 'langs';
        var urlThemes = API_URL + 'themes';
        var urlAdm = API_URL_ADM + 'words';
        //_.mixin(s.exports());
        console.log(s.capitalize("anton"));
        $scope.langs = [];  // список полученных с сервера языков
        $scope.themes = [];  // список полученных с сервера тем
        $scope.myWordsInJSON = [];  //преобразованный массив
        $scope.myWords = '';  // данные в 'textarea'
        $scope.myThemeId = '';  // идентификатор выбранной в селекте темы
        $scope.myLang1 = '';  // код выбранного в селекторе языка
        $scope.myLang2 = '';  // код выбранного в селекторе языка
        $scope.sysLang = SYS_LANG;
        // Объект для хранения параметров преобразования
        $scope.Params = {
            theme: '',
            lang1:'',
            lang2:''
        };
        $scope.isShown = false; // выключатель показа панели с подготовленными словами
        // вырезает из массива myWordsInJSON один символ, начиная с указанного индекса
        $scope.cut = function(index){
          $scope.myWordsInJSON.splice(index,1);
          if ($scope.myWordsInJSON.length == 1)
            $scope.myWordsInJSON = [];
          console.log('cutted, index =', index,$scope.myWordsInJSON);
        };
        // возвращает объект-тему, используя переданный идентификатор
        function getThemeById(id){

            var theme = {};
            console.log('id= ',id);
            $scope.themes.forEach(function(entry){
                if (entry._id === id) theme = entry;
            });
            return theme;
        }

        /*------------------------------------------------------------------------
           Функция преобразования строки. Сначала разбиваем текст на массив строк,
           затем отрезаем цифровую приставку, снова разбиваем уже на две части по
           разделителю ';', присваиваем полученные значения свойствам нового объекта,
           взяв названия свойств из lang1 и lang2, и, наконец, пушим объект в массив
         -------------------------------------------------------------------------*/
        $scope.transformWords = function () {
            //$scope.myWordsInJSON = transform(
            //    $scope.myWords, $scope.myLang1,$scope.myLang2, $scope.myThemeId);
            //Params.theme = $scope.myThemeId;
            //Params.lang1 = $scope.myLang1;
            //Params.lang2 = $scope.myLang2;
            // Фиксация параметров преобразования
            $scope.Params.lang1 = $scope.myLang1;
            $scope.Params.lang2 = $scope.myLang2;
            $scope.Params.theme = getThemeById($scope.myThemeId);
            $scope.myWordsInJSON =[];
            var re = /\r?\n|\r/gm;// '\r'- символ перевода страоки,'/n' - возврат каретки
            var array = $scope.myWords.split(re); // Разбиение на строки

            // Очистка от неформата (проверка наличия в строке символа ';')
            array.forEach(function(item){
                var index = array.indexOf(item);
                //s.trim(item,'\r');
                if (!(item.indexOf(';') + 1)){
                    console.log('Removing El with Index = ', index);
                    array.splice(index,1);
                    //console.log('Array:', array);
                }
            });
            // Перебор массива строкх
            array.forEach(function(entry){
                var obj = {};
                var x = entry.indexOf(';');
                entry = entry.slice(x+1).split(';');
                obj[$scope.myLang1] = entry[0];
                obj[$scope.myLang2] = entry[1];
                $scope.myWordsInJSON.push(obj);
                //console.log('obj = ', obj);
                //console.log('entry = ', entry);
                //console.log('langs = ', $scope.myLang1,$scope.myLang2);
            });
            $scope.isShown = true;
            console.log('FINAL = ', $scope.myWordsInJSON);
            console.log('Params = ', $scope.Params);
        };
        /*---------------------------------------------------------------
                Кнопка отправки подготовленного массива слов на сервер
         ----------------------------------------------------------------*/
        $scope.sendWords = function () {
          $http.post(urlAdm, {
            words: $scope.myWordsInJSON,
            theme_id: $scope.Params.theme._id,
            lang1: $scope.Params.lang1,
            lang2: $scope.Params.lang2
          })
            .success(function(err){
                console.log('Success!', err);
            })
            .error(function(err){
              console.log('Error: ', err);
            });
            console.log($scope.Params.theme
              ,$scope.Params.lang1
              ,$scope.Params.lang2
            );
        };
        /*----------------------------------------------------------
                Получаем массив из доступных языков и тем
         -----------------------------------------------------------*/
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
        console.log("SYS_LANG: ",SYS_LANG);

    });
