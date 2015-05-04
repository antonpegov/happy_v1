'use strict';

/**
 * @ngdoc function
 * @name happyTurtlesApp.controller:UploadwordsCtrl
 * @description
 * # UploadwordsCtrl
 * Controller of the happyTurtlesApp
 */
angular.module('happyTurtlesApp')
  .controller('WordsAdminCtrl', function ($scope,API_URL,SYS_LANG,$http) {
    $scope.langs = []; // список полученных с сервера языков
    $scope.themes = []; // список полученных с сервера тем
    $scope.myWordsInJSON = []; //преобразованный массив
    $scope.myWords = ''; // данные в 'textarea'
    $scope.myThemeId = ''; // идентификатор выбранной в селекте темы
    $scope.myLang1 = ''; // код выбранного в селекторе языка
    $scope.myLang2 = ''; // код выбранного в селекторе языка
    $scope.sysLang = SYS_LANG;
    // Объект для хранения параметров преобразования
    var Params = $scope.Params = {};
    Params.theme = $scope.Params.theme = '';
    Params.lang1 = $scope.Params.lang1 = '___';
    Params.lang2 = $scope.Params.lang2 = '___';
    $scope.isShown = false;

    $scope.cut = function(index){
      $scope.myWordsInJSON.splice(index,1);
      if ($scope.myWordsInJSON.length == 1)
        $scope.myWordsInJSON = [];
      console.log('cuted, index =', index,$scope.myWordsInJSON);
    };

    function getThemeById(id){
      var theme = {};
      console.log('id= ',id);
      $scope.themes.forEach(function(entry){

        if (entry._id === id) theme = entry;

      });
      return theme;

    }

    /*----------------------------------------------------------
       Функция преобразования строки. Сначала разбиваем текст на массив строк,
       затем отрезаем цифровую приставку, снова разбиваем уже на две части по
       разделителю ';', присваиваем полученные значения свойствам нового объекта,
       взяв названия свойств из lang1 и lang2, и, наконец, пушим объект в массив
     -----------------------------------------------------------*/

    function transform(input, lang1, lang2, themeId){

        var finalArray = [];
        var re = /\n/m;
        var array = input.split(re); // Разбиение на строки
        // Очистка от неформата (проверка наличия в строке символа ';')
        array.forEach(function(item){

            var index = array.indexOf(item);
            if (!(item.indexOf(';') + 1)){
              console.log('Removing El with Index = ', index);
              array.splice(index,1);
              console.log('Array:', array);
            }
        });

        // Фиксация параметров преобразования
        Params.lang1 = lang1;
        Params.lang2 = lang2;
        Params.theme = getThemeById(themeId);

        // Перебор массива строкх
        array.forEach(function(entry){

            var obj = {};
            var x = entry.indexOf(';');
            entry = entry.slice(x+1).split(';');
            obj[lang1] = entry[0];
            obj[lang2] = entry[1];
            finalArray.push(obj);
            //console.log('obj = ', obj);
            //console.log('entry = ', entry);
            //console.log('langs = ', lang1,lang2);

        });
        return finalArray;
    }

    // ---------------- Кнопка преобразования введенного текста

    $scope.transformWords = function () {

        $scope.myWordsInJSON = transform(
            $scope.myWords, $scope.myLang1,$scope.myLang2, $scope.myThemeId);
        Params.theme = $scope.myThemeId;
        Params.lang1 = $scope.myLang1;
        Params.lang2 = $scope.myLang2;
        $scope.isShown = true;

        console.log('FINAL = ', $scope.myWordsInJSON);
        //console.log('$scope.linesArray = ', $scope.linesArray);


    };

    // ---------------- Кнопка отправки результатов

    $scope.sendWords = function () {

      $http.post(API_URL + 'admin/words', {
        words: $scope.myWordsInJSON
        ,theme: Params.theme
        ,lang1: Params.lang1
        ,lang2: Params.lang2
      })
        .success(function(err){
            console.log('Success!', err);
        })
        .error(function(err){
          console.log('Error: ', err);
        });
        console.log(Params.theme
          ,Params.lang1
          ,Params.lang2
        );
    };

    /*----------------------------------------------------------
     Получаем массив ISO-кодов и на егo основе создаём
     объект codes для последующего заполнения в форме
     -----------------------------------------------------------*/

    $http.get(API_URL + 'lang')
      .success(function (langs) {

        $scope.langs = langs;
        /*codes.forEach(function(entry){
          $scope.names[entry.code]='';
        });
        */
        //console.log('langs:', $scope.langs);
      })
      .error(function (err) {
        console.log(err);
      });


    /*------------------------------------------------------------
     Получаем массив объектов Theme
     -------------------------------------------------------------*/

    $http.get(API_URL + 'theme')
      .success(function (themes) {
        $scope.themes = themes;
        //console.log('themes: ', $scope.themes);
        // Инициализация указателя
        if(themes[0] === undefined) return;
        $scope.pointer = 0;
      })
      .error(function (err) {
        console.log(err);
      });


//--------------------  TEST ----------------------
    /*console.log(SYS_LANG);
    console.log($scope.themes);
    console.log($scope.codes);*/
    //---------------- Кнопка преобразования ----------


  });
