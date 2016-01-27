var Notion = require('../models/Notion.js');
var Lang = require('../models/Lang.js');
var _ = require('underscore');

var langRequest = function(lang, notion, callback){
    
    var searchReq = {};
    searchReq.lang = notion.lang;
    console.log('searchReq = ', searchReq);
    // запрос к БД,
    Notion.findOne(searchReq).exec(function(err,notionFound){
        if (err) return err;
        if (!notionFound) {
            console.log('searchReq = ', searchReq);
            console.log(('(langRequest) Notion not found : '+ notion[lang]).green);
            callback(undefined);
        } else {
            console.log(('(langRequest) Found notion : ' + notion[lang]).yellow);
            callback(notionFound);
        }
    });

};
var addNewNotion = function(theme,lang1,value1,lang2,value2){
    var newNotion = new Notion();
    newNotion['theme'] = theme;
    newNotion[lang1] = value1;
    newNotion[lang2] = value2;

    newNotion.save(newNotion,function(err){
        if (err){
            console.log(('ERROR:').red, err);
            return false;
        }
        else {
            console.log('(addNewNotion) Item saved: ', JSON.stringify(newNotion));
            return true;
        }
    });
};
var updateNotion = function(notionExist,lang,value){
    var upsertData = notionExist.toObject();
    upsertData[lang] = value;
    delete upsertData._id;

    Notion.update({_id: notionExist._id},upsertData,{upsert:true}, function(err){
        if (err){
            console.log(err);
            return false;
        } else {
            console.log(('(updateNotion) Notion updated.\n  '
            + lang + ': "' + value + '" added.').green);
            //console.log(('docId: ' +_id).yellow);
            return true;
        }

    })

};
var getLangCodesAll = function(callback){
    // возвращает массив кодов вида [eng,rus,fra,...], "выщипанных" из бызы языков
    Lang.find({},function(err,langs){
        if(err) return handleError(err);
        var lang_codes = _.pluck(langs,'code');
        //console.log('*getLangCodesAll* got this langs: '.yellow, arr);
        callback(err,lang_codes);
    });
};

/*--------------------------------------------------------------------------------------
            Функция загрузки слов в базу данных, принимает в качестве аргументов
                words - массив объектовтипа {"eng":"muscles","rus":"мускулы"}
                theme_id - идентификатор темы, в которую их нужно загрузить
 --------------------------------------------------------------------------------------*/
exports.addNotions = function(words, theme_id, lang1, lang2, callback){
    var rejected = []; // Массив для отбракованных слов
    var updCount = 0, newCount = 0; // Счётчики для notions - сколько создано новых и сколько обновлено

    // Функция получает массив words, состоящий из объектов вида {"eng":"clothes","rus":"одежда"}, после чего
    // используя forEach и сервис-функцию langRequest, проверяет наличие в базе первого слова. Если его нет, то
    // сразу проверяется наличие второго сло

    console.log('Слова:', JSON.stringify(words));
    console.log('Тема: ', JSON.stringify(theme_id));
    console.log(('(addingNotes)------------------------------------------------------------------------').yellow);
    words.forEach(function(word){
        // ???????? ?? ??????? ?????? ? ????????? lang1 ? lang2
        if (typeof(word[lang1]) == 'undefined' || typeof(word[lang2]) == 'undefined'){
            console.log('Type of lang1:', word[lang1],'Type of lang2:', word[lang2] );
            return;
        }
        langRequest(lang1,word, function(isLang1){
            if (!isLang1){  // ???? lang1 ??????????? ? ????:
                langRequest(lang2, word, function(isLang2){
                    if (!isLang2){  // lang1 and lang2 NOT FOUND, ????? ????? ??????? ????
                        console.log(('lang1 and lang2 NOT FOUND, creating new element').blue);
                        if (!(addNewNotion(theme_id,lang1,word[lang1],lang2,word[lang2]))) {
                            newCount++;
                            console.log('newCount = ', newCount);
                        } else {
                            console.log(('create Error!').red);
                        }
                    } else {        // ???? lang2 ????, ? lang1 ???????????
                        console.log(('Only lang2 FOUND').yellow);
                        if (!updateNotion(isLang2, lang1, word[lang1])){
                            updCount++;
                            console.log('updCount = ', updCount);
                        } else {
                            console.log(('update Error!').red);
                        }
                    }
                });
            } else {            // ???? lang1 ???? ? ????
                langRequest(lang2,word, function(isLang2){

                    if (!isLang2){  // ???? lang1 ????, ? lang2 ???????????
                        console.log(('Only lang1 FOUND').yellow);
                        if (!updateNotion(isLang1, lang2, word[lang2])){
                            updCount++;
                            console.log('updCount = ', updCount);
                        } else {
                            console.log(('update Error!').red);
                        }
                    } else {        // ???? ??? ????? ??? ???? ? ????, ?? ?????

                        rejected.push(word);
                        console.log(('lang1 and lang2 BOTH FOUND').red);

                    }
                });
            }
        });
    });
    setTimeout(callback, 1000);
};

exports.getWordsByThemeAndLangs = function(theme, lang1, lang2, callback){

    // если заданы языки, задаём темплейт из пары языков
    var template = '';
    if (lang1||lang2) {
        template = lang1 +' '+lang2;
        // Запрашиваем слова, сооветствующие заданной теме
        Notion.find({theme: theme},template, function(err, notions){
            //console.log('Message from *getWordsByThemeAndLangs*:'
            //+'sending db request with lang1 = ' + lang1
            //+',lang2 = ' + lang2 + ', theme = ' + theme);
            //console.log(notions);
            callback(err,notions);
        });
    } else {
        //составить темплейт из массива языковых кодов
        // если языки не заданы, то собираем темплейт из всез языковых кодов в базе 'langs'
        getLangCodesAll(function(err,codes){
            if(err) return handleError(err);
            template = codes.join(" ");
            Notion.find({theme:theme},template,function(err,notions){
                //console.log('Message from *getWordsByThemeAndLangs*'.yellow);
                //console.log('Запрос с темой %s и кодами %s дал результат %s',theme,codes,JSON.stringify(notions));
                callback(err,notions);
            });
        })
    }
};
//exports.getWordsByTheme = function(theme, callback){
//    var searhReq = {theme: theme};
//    Notion.find(searchReq, function(err, docs){
//        console.log('Message from *getWordsByTheme*:'
//        +'sending db request with theme = ' + theme);
//        callback(err,docs);
//    });
//};