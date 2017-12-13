on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!lp-bg") == 0){
        var page = Campaign().get("playerpageid");
        var pageBox = findObjs({ _id: "-L0ASLArW6yfpi-klPa8", _pageid: page})[0];
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
    if (msg.type=="api"&&msg.content.indexOf("!lp-map") == 0){
        var page = Campaign().get("playerpageid");
        var pageBox = findObjs({ _id: "-L0ASLArW6yfpi-klPa8", _pageid: page})[0];
        var border = findObjs({ _id: "-L0AnSaaNLxhf0A-uM0g", _pageid: page})[0];
        var mapBG = findObjs({ _pageid: page, _id: "-L0Am_q13lEKN-W3mvqC"})[0];
        
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
        
        var cmd = msg.content.split(" ")[1];
        var mapItems = findObjs({ _pageid: page, gmnotes: "map"});
        var mapTexts = filterObjs(function(obj){
            if(obj.get("_pageid")!=page){ return false; }
            if(mapText.indexOf(obj.get("_id"))==-1){ return false; }
            return true;
        });
        log(mapTexts.length);
        var circItems = findObjs({ _pageid: page, gmnotes: "circumstance"});
        
        if(cmd=="off"){
            toBack(mapBG);
            for(i = 0; i<mapItems.length; i++){ toBack(mapItems[i]); }
            for(j = 0; j<mapTexts.length; j++){ toBack(mapTexts[j]); }
            for(q = 0; q<circItems.length; q++){ 
                toFront(circItems[q]); 
                circItems[q].set("layer","objects");
            }
        } else {
            toFront(mapBG);
            toFront(border);
            for(i = 0; i<mapItems.length; i++){ toFront(mapItems[i]); }
            for(j = 0; j<mapTexts.length; j++){ toFront(mapTexts[j]); }
            for(q = 0; q<circItems.length; q++){ 
                toBack(circItems[q]); 
                circItems[q].set("layer","map");
            }
        }
    }
});

var mapText = ["-L0B-RpqQxwHfkkMENU5","-L0B-0CMnWbcna5Cg_Jn","-L0B-XvrTIPjrCeiLnnZ"
              ,"-L0AzyVIhGK-6G_kjvY8","-L0B-2vQ_M29Nm6rivAr","-L0B-4ikMG5dXL8PSlgD"
              ,"-L0B-8Nwwn24ioEMs2UF"];
