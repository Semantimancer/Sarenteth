on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!difficulty") == 0){
        var args = msg.content.split(" ");
        var environment = findObjs({_type: 'character', name: "Environment"})[0];
        var difficulty = findObjs({_type: 'attribute', _characterid: environment.id, name: "Difficulty" })[0];
        
        if(!isNaN(args[1])){
            //log(environment.get(getAttrByName(environment.id,"Difficulty","current"));
            difficulty.set("current",args[1]);
            sendChat(msg.who,"Difficulty set to "+args[1]);
        } else {
            sendChat(msg.who,"'"+args[1]+"' not a valid difficulty.")
        }
    }
});
