var Notion = require('../models/Notion.js');

exports.langRequest = function (lang, notion, callback){
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

exports.addNewNotion = function(theme,lang1,value1,lang2,value2){
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
            console.log('(addNewNotion) Item saved: ', newNotion);
            return true;
        }
    })
};

exports.updateNotion = function(notionExist,lang,value){
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