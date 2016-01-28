var Notion = require('../models/Notion.js');
var Lang = require('../models/Lang.js');
var _ = require('underscore');

var langCheck = function(lang, notion, callback){
    
    var query = {};
    query[lang] = notion[lang];
    //console.log('searchReq = ', query);
    // запрос к БД,
    Notion.findOne(query).exec(function(err,notionFound){
        if (err) return err;
        if (!notionFound) {
            //console.log(('(langCheck) Notion not found : '+ notion[lang]).green);
            callback(undefined);
        } else {
            //console.log(('(langCheck) Found notion : ' + notion[lang]).yellow);
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
            //console.log('(addNewNotion) Item saved: ', JSON.stringify(newNotion));
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

var addNotions = function(words, theme_id, lang1, lang2, callback){

    // Функция получает массив words, состоящий из объектов вида {"eng":"clothes","rus":"одежда"}, после чего
    // используя forEach и сервис-функцию langCheck, проверяет наличие слов в БД и при необходимости вызывает
    // функции addNotion  и updateNotion. По окончанию передаёт в колбэк результат своей работы

    var result = {
        rejected: [],
        added: 0,
        updated: 0,
        err: false
    };
    //console.log('Слова:', JSON.stringify(words));
    console.log('(addNotion) Пришло %s слов по теме %s, языки "%s" и "%s":', words.length, theme_id, lang1, lang2);
    var items_processed = 0; // счетчик для цикла forEach
    words.forEach(function(word) {
        // Сначала проверим наличие lang1 и lang2
        if (typeof(word[lang1]) == 'undefined' || typeof(word[lang2]) == 'undefined') {
            console.log('Type of lang1:', word[lang1], 'Type of lang2:'.red, word[lang2]);
            result.err = true;
            callback(result);
        }
        langCheck(lang1, word, function (isLang1) { // Проверим, есть ли слово с кодом lang1 в БД
            if (!isLang1) {  // Слово с кодом lang1 не найден в базе, тепрь проверяем слово с lang2
                langCheck(lang2, word, function (isLang2) {
                    if (!isLang2) {  // lang1 and lang2 NOT FOUND, создаём новый документ
                        console.log('"%s" and "%s" not found, creating new record...'.green,word[lang1],word[lang2]);
                        if (!(addNewNotion(theme_id, lang1, word[lang1], lang2, word[lang2]))) {
                            result.added++;
                        } else {
                            console.log(('create Error!').red);
                        }
                    } else {        // Есть lang2 но нет lang1 - добавляем слово к lang2
                        console.log('%s found, adding %s to existing record...'.blue,word[lang2],word[lang1]);
                        if (!updateNotion(isLang2, lang1, word[lang1])) {
                            result.updated++;
                        } else {
                            console.log(('update Error!').red);
                        }
                    }
                    // Цикл перебора закончен, увеличиваем счетчик и если
                    // он достиг величины нашего массива, выходим по колбэку
                    items_processed++;
                    //console.log('items_processed = ', items_processed);
                    if (items_processed === words.length) callback(result);
                });
            } else {  // Слово с кодом lang1 присутствует в БД, теперь проверяем на наличие lang2
                langCheck(lang2, word, function (isLang2) {
                    if (!isLang2) {  // Слова с lang2 в базе нет, добавляем его к lang1
                        console.log('"%s" found, adding "%s" to existing record...'.blue,word[lang1],word[lang2]);
                        if (!updateNotion(isLang1, lang2, word[lang2])) {
                            result.updated++;
                        } else {
                            console.log(('update Error!').red);
                        }
                    } else {  // Оба слова найдены в базе, добавляем их в массив "отказников"
                        result.rejected.push(word);
                        console.log('"%s" and "%s" already in database'.yellow, word[lang1],word[lang2]);
                    }
                    // Цикл перебора закончен, увеличиваем счетчик и если
                    // он достиг величины нашего массива, выходим по колбэку
                    items_processed++;
                    //console.log('items_processed = ', items_processed);
                    if (items_processed === words.length) callback(result);
                });
            }
        });

    });
};

var getWordsByThemeAndLangs = function(theme, lang1, lang2, callback){

    // если заданы языки, задаём темплейт из пары языков
    var template = '';
    if (lang1||lang2) {
        template = lang1 +' '+lang2;
        // Запрашиваем слова, сооветствующие заданной теме
        Notion.find({theme: theme},template, function(err, notions){
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

module.exports = {
    getWordsByThemeAndLangs: getWordsByThemeAndLangs,
    addNotions: addNotions,
    getLangCodesAll: getLangCodesAll

};
