on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!lp-bg") == 0){
        var page = Campaign().get("playerpageid");
        var pageBox = findObjs({ _id: "-L0Kh-m2vgvSnpMVKd8n", _pageid: page})[0];
        var border = findObjs({ _id: "-L0AnSaaNLxhf0A-uM0g", _pageid: page})[0];
        
        if(!pageBox){
            sendChat("API Error","/w gm Couldn't find page box, terminating...");
            return;
        }
        if(!border){
            sendChat("API Error","/w gm Couldn't find border, terminating...");
            return;
        }
        
        var givenID = msg.content.split(" ")[1];
        if(givenID&&(givenID[0]=='-')){
            var bg = findObjs({ _id: givenID, _pageid: page, gmnotes: "background"})[0];
            if(!bg){
                sendChat("API Error","/w gm Couldn't find the background "+givenID+", terminating...");
                return;
            }
            
            toFront(bg);
            toFront(pageBox);
            toFront(border);
        } else {
            var bgs = findObjs({ _pageid: page, gmnotes: "background"});
            for(i = 0; i<bgs.length; i++){
                toBack(bgs[i]);
            }
            toFront(pageBox);
            toFront(border);
        }
    }
});

on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!lp-special") == 0){
        var page = Campaign().get("playerpageid");
        var pageBox = findObjs({ _id: "-L0Kh-m2vgvSnpMVKd8n", _pageid: page})[0];
        var border = findObjs({ _id: "-L0AnSaaNLxhf0A-uM0g", _pageid: page})[0];
        var mapBG = findObjs({ _pageid: page, _id: "-L0Am_q13lEKN-W3mvqC"})[0];
        var councilBG = findObjs({ _pageid: page, _id: "-L0FwmiDJ8ft5xMTUn-t"})[0];
        
        if(!pageBox){
            sendChat("API Error","/w gm Couldn't find page box, terminating...");
            return;
        }
        if(!border){
            sendChat("API Error","/w gm Couldn't find border, terminating...");
            return;
        }
        if(!mapBG){
            sendChat("API Error","/w gm Couldn't find map object, terminating...");
            return;
        }
        if(!councilBG){
            sendChat("API Error","/w gm Couldn't find council object, terminating...");
            return;
        }
        
        var cmd = msg.content.split(" ")[1];
        var mapItems = findObjs({ _pageid: page, gmnotes: "map"});
        var mapTexts = filterObjs(function(obj){
            if(obj.get("_pageid")!=page){ return false; }
            if(mapText.indexOf(obj.get("_id"))==-1){ return false; }
            return true;
        });
        var councilItems = filterObjs(function(obj){
            if(obj.get("_pageid")!=page){ return false; }
            if(councilNames.indexOf(obj.get("_id"))==-1){ return false; }
            return true;
        })
        var circItems = findObjs({ _pageid: page, gmnotes: "circumstance"});
        
        var pushBack = function(x){ toBack(x); x.set("layer","map"); };
        var pushFront = function(x){ toFront(x); x.set("layer","objects"); };
        
        if(cmd=="off"){
            toBack(mapBG);
            toBack(councilBG);
            mapItems.map(toBack);
            mapTexts.map(toBack);
            circItems.map(pushFront);
            councilItems.map(pushBack);
        } else if(cmd=="map"){
            toFront(mapBG);
            toFront(border);
            mapItems.map(toFront);
            mapTexts.map(toFront);
            circItems.map(pushBack);
            councilItems.map(pushBack);
        } else if(cmd=="council"){
            toFront(councilBG);
            toFront(pageBox);
            toFront(border);
            mapItems.map(toBack);
            mapTexts.map(toBack);
            circItems.map(pushBack);
            councilItems.map(pushFront);
        }
    }
});

on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!add-circ") == 0){
        var page = Campaign().get("playerpageid");
        var circName = msg.content.substring(10);
        if(!circName){ circName = "Circumstance"; }
        
        var circToken = createObj("graphic",{
            _subtype: "token",
            _pageid: page,
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/43967296/zNm8Mwcvyh-tsErmsjIOuQ/thumb.png?1513268953",
            left: 450,
            top: 520,
            height: 137,
            width: 120,
            height: 120,
            layer: "objects",
            gmnotes: "circumstance",
            name: circName
        });
    
        var previousID = circToken.get("bar1_value");
        var previousObj = findObjs({ _id: previousID })[0];
        if(previousObj){
            previousObj.remove();
        }
        
        var circName = circToken.get("name");
        var circText = createObj("text",{
                _pageid: page,
                left: circToken.get("left"),
                top: circToken.get("top"),
                layer: "objects",
                font_size: 28,
                font_family: "Patrick Hand",
                text: circName
            });
            
        circToken.set("bar1_value",circText.get("_id"));
        sendChat("Circumstance","New circumstance <b>"+circName+"</b> added by "+msg.who);
        spawnFx(450,520,"explode-magic");
    }
});

on("change:graphic", function(obj,prev){
    if(obj.get("gmnotes")=="circumstance"){
        var textID = obj.get("bar1_value");
        var textObj = findObjs({ _id: textID })[0];
        
        textObj.set("left",obj.get("left"));
        textObj.set("top",obj.get("top"));
    }
});

on("destroy:graphic", function(obj){
    if(obj.get("gmnotes")=="circumstance"){
        var textID = obj.get("bar1_value");
        var textObject = findObjs({ _id: textID })[0];
        if(textObject){
            textObject.remove();
        }
    }
});

var mapText = ["-L0B-RpqQxwHfkkMENU5","-L0B-0CMnWbcna5Cg_Jn","-L0B-XvrTIPjrCeiLnnZ"
              ,"-L0AzyVIhGK-6G_kjvY8","-L0B-2vQ_M29Nm6rivAr","-L0B-4ikMG5dXL8PSlgD"
              ,"-L0B-8Nwwn24ioEMs2UF"];
              
var councilNames = ["-L0FznUXR5mHe6V9nAmG","-L0FznUaRM-o-jStoGOg","-L0FznUfN5CiRUl30cJ8"
                   ,"-L0FznUlzIKHv6Bl2j10","-L0FznUrUvCNXyO9UGgH","-L0FznUweiUPKvDdCI_P"
                   ,"-L0FznW7lZfCroWhlfRB","-L0FznV9J5I2cCinCtOO","-L0FznVlf1MpB1hQE6dJ"
                   ,"-L0FznXZsXgYguxFq_oJ","-L0FznXdFfGlWySkg7b2","-L0FznWcPuszzGYw_BZd"
                   ,"-L0FznXTHiLWvUnwbRgH","-L0FznXhzRfOOnbSKVxi","-L0FznV4-dIJi2Q8JA_A"
                   ,"-L0FznVvFb7cdPAV5jcE","-L0FznV-4jLnmoUmcSsH","-L0FznW-0Six6XBOuGds"
                   ,"-L0FznSkeJkN1G8E2FX0","-L0FznU5ylMHkHxR-LLH","-L0FznWDt8S2jS6a7gTx"
                   ,"-L0FznX6WdHW4VxlJPGX","-L0FznVDVr1Bo0hEXSIv","-L0FznWgaOw2FXmmvOKf"
                   ,"-L0FznTdvpMAm98PCCk3"];
