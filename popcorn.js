on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!popcorn")==0){
        var retString = "";
        var page = Campaign().get("playerpageid");
        var args = msg.content.split(" ");
        if (args[1] == "all"){ //List all tokens which have not yet taken a turn
            var tokens = filterObjs(function(obj){
                if (obj.get("_pageid") != page) { return false; }
                if (obj.get("_subtype") != "token") { return false; }
                if (!obj.get("name")){ return false; }
                if (obj.get("name") == "Environment"){ return false; }
                if (!obj.get("bar1_value")){ return false; }
                if (obj.get("bar3_value") == "achievement"){ return false; }
                if (obj.get("gmnotes") == "circumstance"){ return false; }
                var list = obj.get("statusmarkers");
                if(list) { 
                    return !(list.includes("blue"));
                } else {
                    log("No list found for "+obj.get("name"));
                    return true;
                }
            });
            retString = "<table style=\"width: 100%; text-align: center; margin-left: auto; margin-right: auto; padding = 4px; \" border=\"1\">";
            blue = 1;
            for(i = 0; i<tokens.length; i++){
                var name = tokens[i].get("name");
                if (!name){
                    name = "Unknown Token";
                    log("Token: "+tokens[i].get("bar1_value"));
                }
                if(blue){
                    retString = retString + "<tr><td style=\"background: #b3ecff;\"><h4>" + name + "</h4></th></tr>";
                    blue = 0;
                } else {
                    retString = retString + "<tr><th style=\"background: #DDDDDD;\"><h4>" + name + "</h4></th></tr>";
                    blue = 1;
                }
            }
            retString = retString + "</table>";
        } else if (args[1]=="clear"){ //Remove the turn marker from all tokens
            var tokens = findObjs({
                _pageid: page,
                _subtype: "token"
            });
            for(i = 0; i<tokens.length; i++){
                tokens[i].set("status_bluemarker",false);
            }
            retString = "All turn markers reset.";
        } else if (args[1]){ //Attempts to set a new turn
            var arg = msg.content.substring(9);
            var tokens = findObjs({
                _pageid: page,
                _subtype: "token",
                name: arg,
            });
            if(tokens.length!=1){
                retString = "Unable to set '"+arg+"' as the next active character.";
                log(arg);
                log(msg.content);
            } else {
                tokens[0].set("status_bluemarker",true);
                retString = "It is now "+arg+"'s turn.";
            }
        } else {
            var tokens = filterObjs(function(obj){
                if (obj.get("_pageid") != page) { return false; }
                if (obj.get("_subtype") != "token") { return false; }
                if (!obj.get("name")){ return false; }
                if (obj.get("name") == "Environment"){ return false; }
                if (!obj.get("bar1_value")){ return false; }
                if (obj.get("bar3_value") == "achievement"){ return false; }
                if (obj.get("gmnotes") == "circumstance"){ return false; }
                var list = obj.get("statusmarkers");
                if(list) { 
                    log("This one's good: ["+list+"] "+obj.get("name"));
                    return !(list.includes("blue"));
                    
                } else {
                    log("No list found for "+obj.get("name"));
                    return true;
                }
            });
            
            retString = "Choose a character:";
            var name = "";
            for(i = 0; i<tokens.length; i++){
                name = tokens[i].get("name");
                retString = retString + "\n[" + name + "](!popcorn "+name.replace(")","&rpar;")+");" //The second ")" has to be an & followed by rpar; (the code editor keeps resolving HTML entities)
            }
            
        }
        sendChat("Popcorn",retString);
    }
});
