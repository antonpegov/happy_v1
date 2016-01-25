var Notion = require('../models/Notion.js');

var getWordsByTheme = function(theme, lang1, lang2, callback){
    var searchReq = { theme: theme };
    var template = lang1 +' '+lang2;
    Notion.find(searchReq,template, function(err, docs){
        console.log('Message from *getWordsByTheme*:'
                        +'sending db request with lang1 = ' + lang1 
                        +',lang2 = ' + lang2 + ', theme = ' + theme);
        callback(err,docs);
    });
};
var langRequest = function(lang, notion, callback){
    
    var searchReq = {};
    searchReq[lang] = notion[lang];
    console.log('searchReq = ', searchReq);

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

// главная функция добавления слов
exports.addNotions = function(words, theme_id, lang1, lang2, callback){
    //return new Promise (function (resolve,reject){
    console.log('Слова:', JSON.stringify(words));
    console.log('Тема: ', JSON.stringify(theme_id));
    console.log(('(addingNotes)------------------------------------------------------------------------').yellow);
    words.forEach(function(item){
        // ???????? ?? ??????? ?????? ? ????????? lang1 ? lang2
        if (typeof(item[lang1]) == 'undefined' || typeof(item[lang2]) == 'undefined'){
            console.log('Type of lang1:', item[lang1],'Type of lang2:', item[lang2] );
            return;
        }
        langRequest(lang1,item, function(isLang1){
            if (!isLang1){  // ???? lang1 ??????????? ? ????:
                langRequest(lang2, item, function(isLang2){
                    if (!isLang2){  // lang1 and lang2 NOT FOUND, ????? ????? ??????? ????
                        console.log(('lang1 and lang2 NOT FOUND, creating new element').blue);
                        if (!(addNewNotion(theme_id,lang1,item[lang1],lang2,item[lang2]))) {
                            newCount++;
                            console.log('newCount = ', newCount);
                        } else {
                            console.log(('create Error!').red);
                        }
                    } else {        // ???? lang2 ????, ? lang1 ???????????
                        console.log(('Only lang2 FOUND').yellow);
                        if (!updateNotion(isLang2, lang1, item[lang1])){
                            updCount++;
                            console.log('updCount = ', updCount);
                        } else {
                            console.log(('update Error!').red);
                        }
                    }
                });
            } else {            // ???? lang1 ???? ? ????
                langRequest(lang2,item, function(isLang2){

                    if (!isLang2){  // ???? lang1 ????, ? lang2 ???????????
                        console.log(('Only lang1 FOUND').yellow);
                        if (!updateNotion(isLang1, lang2, item[lang2])){
                            updCount++;
                            console.log('updCount = ', updCount);
                        } else {
                            console.log(('update Error!').red);
                        }
                    } else {        // ???? ??? ????? ??? ???? ? ????, ?? ?????

                        rejected.push(item);
                        console.log(('lang1 and lang2 BOTH FOUND').red);

                    }
                });
            }
        });
    });
    setTimeout(callback, 1000);
};