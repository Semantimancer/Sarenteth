on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!roll") == 0){
        var args = msg.content.split(" ");
        var environment = findObjs({_type: 'character', name: "Environment"})[0];
        var difficulty = getAttrByName(environment.id,"Difficulty","current");
        
        //If advantage or disadvantage has been set, then we'll fetch that
        //too. If it hasn't (so no argument was given), we'll just use an
        //empty string to represent it.
        var adv = "";
        if (args[2]){ adv = args[2]; }
        
        if (!args[1]){
            sendChat(msg.who,"/roll 1d100");
        } else if (isNaN(args[1])) {
            //Fetching all characters, and selecting the two (the player's
            //character, and the environment's) that we need.
            var characters = findObjs({_type: 'character'});
            var speaking = findObjs({_type: 'character', name: msg.who})[0];
            
            //If we found the player's character, go ahead. Otherwise,
            //we'll just do a normal roll and give an error message.
            if(speaking){
                var stat = getAttrByName(speaking.id,capitalize(args[1]),"current");
                
                var sagas = getAttrByName(speaking.id,"sagas","current");
                if(args[3]){ sagas = args[3]; }
                if(stat){
                    //Once I've found a stat, I have to run a replace over it. This
                    //is because auto-calculated fields in a character sheet don't
                    //reference a particular character, but the chat needs to know
                    //whose attributes to look at.
                    stat = stat.replace("@{","@{"+msg.who+"|");
                    //Because the character's attribute might be auto-calculated,
                    //we can't just use "getAttrByName" to fetch the value. So
                    //we'll need to go down another level into a sendChat.
                    sendChat("","[["+stat+"]]",function(a){
                        var stat = a[0].inlinerolls[0].results.total;
                        //Now it's time to actually roll!
                        makeRoll("character|"+speaking.id,difficulty,args[1],stat,adv,sagas)
                    });
                }
            } else {
                //log("ERROR: No character found by the name of \""+msg.who+"\"");
                sendChat("player|"+msg.who,"ERROR: No character found. Rolling normally...");
                sendChat("player|"+msg.who,"/roll 1d100");
            }
        } else {
            var sagas = getAttrByName(speaking.id,"sagas","current");
            if(args[3]){ sagas = args[3]; }
            makeRoll("player|"+msg.playerid,difficulty,"Custom",args[1],adv,sagas)
        }
    }
});

function capitalize(string){
    String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function makeRoll(speaking,difficulty,statname,stat,adv,numRolls){
    sendChat("","/roll 1d100",function(b){
        var roll = JSON.parse(b[0].content).total;
        var result = determineSuccess(roll,difficulty,stat,adv);
        
        var flip = "Flipping the dice would result in a ";
        if (roll==100){ flip = ""; }
        else if (roll==1){ flip = flip+determineSuccess(10,difficulty,stat,adv); }
        else if (roll<10){ 
            var flipped = roll*10;
            flip = flip+determineSuccess(flipped,difficulty,stat,adv);
        } else {
            var flipped = roll.toString()[1]+roll.toString()[0];
            flip = flip+determineSuccess(parseInt(flipped),difficulty,stat,adv);
        }
        
        sendChat("","/roll "+numRolls+"d10",function(c){
            var sagaDice = JSON.parse(c[0].content).rolls[0].results.map(function(x){ return "[["+(x["v"]%10)+"]]"; });
            sendChat(speaking,"<table style=\"text-align: center; margin-left: auto; margin-right: auto;\"><tr><th colspan=\"2\"><h2>"+result+"</h2></th></tr><tr><th style=\"background: #b3ecff;\"><h4>"+capitalize(statname)+"</h4></th><td>[["+stat+"]]</td></tr><tr><th style=\"background: #b3ecff;\"><h4>Difficulty</h4></th><td>[["+difficulty+"]]</td></tr><tr><th><h4 style=\"background: #b3ecff;\">Roll</h4></th><td>[["+roll+"]]</td></tr><tr><th><h4 style=\"background: #b3ecff;\">Saga Dice</h4></th><td>"+sagaDice.join(", ")+"</td></tr><tr><td colspan=\"2\">"+flip+"</table>");
        });
    });
}

function determineSuccess(roll,difficulty,stat,adv){
    var degree="";
    var res="Failure!";
    var flip;
    
    var success=(roll>difficulty)&&(roll<=stat);
    var crit=(roll%11==0)||(roll==100);
                            
    if (success){ res="Success!"; }
    if (adv=="adv"){ //I don't use (adv=="adv"&&success) here because I want to catch it on a failure too
        if (success){ degree = "Critical "; }
    } else if (adv=="disadv"){
        if (success&&!crit){ degree = "Partial "; } else { degree = "Critical "; }
    } else if (crit){ degree = "Critical "; }
    
    return degree+res;
}
