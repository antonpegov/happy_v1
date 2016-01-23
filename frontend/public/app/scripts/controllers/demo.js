'use strict';

/**
 * @ngdoc function
 * @name publicApp.controller:DemoCtrl
 * @description
 * # DemoCtrl
 * Controller of the publicApp
 */
angular.module('happyTurtlesApp')
  .controller('DemoCtrl', function ($scope,$q,langsSrv,$mdDialog,$state,alert,$timeout) {
    
    var LIFES_NUM = 100;
    var VERSIONS_NUM = 5; // кол-во неправильных вариантов
    var PROGR = 5; // прогресса за каждый правильный ответ
    var ERR_PRICE = 20;

    function setup() {
        $scope.Progress = {
            value: 0,
            plus: function() {
                this.value += PROGR;
                return this.value;
            },
            reset: function() {
                this.value = 0;
            }
        };
        $scope.Life = {
            value: LIFES_NUM,
            minus: function() {
                this.value-=ERR_PRICE;
                return this.value;
            },
            reset: function() {
                this.value = LIFES_NUM;
            }
        }
        $scope.word = ''; // Загадываемое слово
        $scope.hide_themes = true;
        $scope.hide_header = false;
        $scope.show_main = false;
        $scope.show_winner = false;
        $scope.chechout = true;
        $scope.user_lang = "rus";
        $scope.target_lang;
        $scope.target_lang_name;
        $scope.target_theme;
        $scope.langs = [];
        $scope.themes = [];
        $scope.words = []; // исходный массив слов
        $scope.words_used = []; // массив отгаданных слов
        $scope.versions = []; // массив вариантор ответа
    }
    setup();
    /* ----------------------------------------------------
    
                      Инициализация
    
    ---------------------------------------------------------*/
    
    // Запросить и сформировать массив языков 
    langsSrv.getLangsAsync($scope.user_lang).then(function(data) {
        $scope.langs = data;
        //console.log('Langs: ', $scope.langs);
        
    });
    // Запросить и сформировать массив демо-тем
    langsSrv.getDemoThemesAsinc().then(function(data){
        $scope.themes = data;
        //console.log('Themes: ', $scope.themes);
    });
    // При изменении языка выводим список тем
    $scope.changeTargetLang = function (code,lang){
        $scope.hide_themes = false;
        $scope.target_lang = code;
        $scope.target_lang_name = lang;
        console.log('target_lang_ = ', $scope.target_lang);
        console.log('target_lang_name = ', $scope.target_lang_name);
    };
    $scope.run = function(_id){
        if (typeof _id === 'undefined') {
            _id = $scope.target_theme; 
        }
        $scope.target_theme = _id;
        langsSrv.getWordsByThemeId(_id,$scope.user_lang,$scope.target_lang)
          .then(function(data){
              $scope.words = data;
              console.log('(Run) data: ',data);
              if($scope.words.length < 1) {
                  alert("warning","Этот язык ещё не загружен, попробуйте другой!");
                  setTimeout(function(){$state.go('main')}, 2000);
                  return;
              }
              init(null); // запуск главного модуля после получения массива слов
        });
        $scope.hide_themes = true;
        $scope.hide_header = true;
        //$scope.show_main = true;
    };
    
    /*-----------------------------------------------------------   
    
                    Главный модуль
    
    -----------------------------------------------------------*/   
    
     
    // функция выбора случайного слова, которое вырезается из
    // массива и сохраняется в переменной $scope.word
    function cutRandomWord(){
        
        var deferred = $q.defer();
        var promise = deferred.promise;
        var rand = Math.floor(Math.random() * $scope.words.length);
        var word = $scope.words[rand];
        if (rand == 0 || rand == null || rand == undefined) {
            console.log('Не смогли выбрать случайный элемент');
            deferred.reject('invalid value');
        }
        else {
            $scope.words = _.without($scope.words,rand);
            $scope.word = word;
            console.log('cutRandomWord(): passing "rand" = ', word);
            deferred.resolve(word);        
        }
        
        return deferred.promise;
    }
    // функция выбора случайных вариантов
    function getRandomVersions(res){
        console.log('getRandomVersions(): получено слово ', res);
        var word = res || ''; // слово приходит из пред.функции 
        var num = VERSIONS_NUM; // число вариантов - из настроек
        var array_tmp = $scope.words; // временный масив для вырезания слов
        var array = []; // массив для выбранных слов
        
        array_tmp = _.without(array_tmp, word); // вырезаем загаданное слово
        
        for (var i=0;i<num;i++) {
            console.log('i=',i);// проверка последовательности выполнения
            var rand = Math.floor(Math.random() * array_tmp.length);
            array.push(array_tmp[rand]); // добавляем вариан в массив
            array_tmp = _.without(array_tmp,array_tmp[rand]); // и вырезаем его из времянки
            
        }
        if (array.length !== num) {
            console.log('getRandomVersions(): Массив не создан!');
            return $q.reject('invalid value');
        }
        else {
            console.log('getRandomVersions(): Массив создан: ', array);
            return {
                word: word,
                array: array
            };
        }
        
    }
    // функция внедрения ответа
    function seedAnswer(res) {
        console.log('seedAnswer(): получено ', res);
        var array = res.array;
        array.push(res.word);
        array = _.shuffle(array);
        if (res == 'bad value') {
            return $q.reject('invalid value');
        }
        else {
            return {
                word: res.word,
                array: array
            };
        }
    
    }
    
    var Check = {
        
        word: function(word,id){   // проверка угадывания слова
            
            console.log('Check.word() startig... word =',word,' id = ', id);
            var isTrue = false;
            var deferred = $q.defer();
            
            if (word._id == id){
                isTrue = true;
                $scope.words_used.push(word); // добавляем в хранилище ответов
                $scope.words = _.without($scope.words,word); // удаляем из основного массива
                $scope.Progress.plus(); // увеличиваем прогресс
                alert('success','Верно!');
                deferred.resolve(isTrue);
            } else {
                $scope.Life.minus(); // уменьшаем жизнь
                alert('warning','Ошибка, жизнь уменьшается на '+ERR_PRICE+'%');
                deferred.resolve(isTrue);
            }
            
            return deferred.promise;
            
        },
        out: function(req){    // проверка состояния объектов
            console.log('Check.out() startig...');
            if($scope.Life.value <= 0){
                return false;    
            } else if ($scope.Progress.value >= 100) {
                return true;
            } else {
                return null;
            }
        }
        
    };
    
    // функция инициализации - запускается первый раз из $scope.run
    // и продолжает вызываться при каждом пересчёте
    function  init(req){
        console.log('----------------- Init() starting... req =',req);
        console.log('WORDS_ARRAY: ',$scope.words);
        console.log('WORDS_USED_ARRAY: ',$scope.words_used);
        if(req === true) Finish.win();
        if(req === false) Finish.loose();
        
        var deferred = $q.defer();
        cutRandomWord() // вынимаем из массива случайное слово
        .then(getRandomVersions) // формируем массив ответов 
        .then(seedAnswer) // внедряем слово в массив с ответами
        .then(
            function(res){
                console.log('Chain finished with ', res.array);
                $scope.versions = res.array;
                $scope.show_main = true;
            }
            ,function(err){
                if(err) console.log(err);
            }
        );
        
        console.log('Конец функции INIT() -----------------');
        return deferred.promise;
    }
    
    $scope.shot = function(answerId){
        console.log('answerId = ', answerId);
        Check.word($scope.word,answerId)
        .then(Check.out)
        .then(init);
        
    };
    
    
     /*-----------------------------------------------------------   
    
                    Вывод результата
    
    -----------------------------------------------------------*/ 
    
    var Finish = {

        win: function() {
            console.log('Win() starting...');
            setup();
            $scope.hide_header = true;
            $scope.show_winner = true;
        },
        loose: function() {
            console.log('Loose() starting...');
            setup();
            $scope.hide_header = true;
            showConfirmLooser("Ти не гофорить по "
                + $scope.target_lang_name);
            
        }
    };

    var showConfirmLooser = function(content) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
            .parent(angular.element(document.body))
            .title('Ой, вам стоит улучшить свои знания!')
            .content(content)
            .ariaLabel('Lucky day')
            .ok('На главную')
            .cancel('Заново!')
            //.targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
            $state.go('main'); // go to login
            console.log('Выбран возврат на главную');
        }, function() {
            $scope.run($scope.target_theme);
            console.log('Выбран повтор');
        });
    };

    
    
    
    
    
});
  
  