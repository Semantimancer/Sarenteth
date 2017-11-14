on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!roll") == 0){
        var args = msg.content.split(" ");
        var environment = findObjs({_type: 'character', name: "Environment"})[0];
        var difficulty = getAttrByName(environment.id,"Difficulty","current");
        var speaking = findObjs({_type: 'character', name: msg.who})[0];
        
        //Check if we're rolling any extra d10s.
        var extra = 0;
        var double = false;
        if(args[2]&&isNaN(args[2])){ //If args[2] both exists and is not a number
            if(args[2]=="double"){
                double = true;
            } else {
                sendChat(msg.who,"Error: Unknown argument \""+args[2]+"\"");
            }
        } else if(args[2]){ //Else, if args[2] exists, it must be a number
            extra = args[2];
        }
        
        if (!args[1]){
            sendChat(msg.who,"/roll 1d100");
        } else if (isNaN(args[1])) { //args[1] is not a number
            //If we found the player's character, go ahead. Otherwise,
            //we'll just do a normal roll and give an error message.
            if(speaking){
                var stat = getAttrByName(speaking.id,capitalize(args[1]),"current");
                
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
                        makeRoll("character|"+speaking.id,difficulty,args[1],stat,extra,double)
                    });
                }
            } else {
                sendChat("player|"+msg.playerid,"ERROR: No character found. Rolling normally...");
                sendChat("player|"+msg.playerid,"/roll 1d100");
            }
        } else { //args[1] is a number, and therefore we don't need to fetch a stat
            //If we found the player's character, go ahead. Otherwise,
            //we'll just do a normal roll and give an error message.
            if(speaking){
                makeRoll("character|"+speaking.id,difficulty,"Custom",args[1],extra,double)
            } else {
                sendChat("player|"+msg.playerid,"ERROR: No character found. Rolling normally...")
                makeRoll("player|"+msg.playerid,difficulty,"Custom",args[1],extra,double)
            }
        }
    }
});

function capitalize(string){
    String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function makeRoll(speaking,difficulty,statname,stat,extraRolls,doubleDifficulty){
    sendChat("","/roll 1d100",function(b){
        var roll = JSON.parse(b[0].content).total;
        if(doubleDifficulty){
            difficulty = difficulty*2;
        }
        var result = determineSuccess(roll,difficulty,stat);
        
        var flip = "Flipping the dice would result in a ";
        if (roll==100){ flip = ""; }
        else if (roll==1){ flip = flip+determineSuccess(10,difficulty,stat); }
        else if (roll<10){ 
            var flipped = roll*10;
            flip = flip+determineSuccess(flipped,difficulty,stat);
        } else {
            var flipped = roll.toString()[1]+roll.toString()[0];
            flip = flip+determineSuccess(parseInt(flipped),difficulty,stat);
        }
        
        sendChat("","/roll "+extraRolls+"d10",function(c){
            var sagaDice = JSON.parse(c[0].content).rolls[0].results.map(function(x){ return "[["+(x["v"]%10)+"]]"; });
            sendChat(speaking,"<table style=\"text-align: center; margin-left: auto; margin-right: auto;\"><tr><th colspan=\"2\"><h2>"+result+"</h2></th></tr><tr><th style=\"background: #b3ecff;\"><h4>"+capitalize(statname)+"</h4></th><td>[["+stat+"]]</td></tr><tr><th style=\"background: #b3ecff;\"><h4>Difficulty</h4></th><td>[["+difficulty+"]]</td></tr><tr><th><h4 style=\"background: #b3ecff;\">Roll</h4></th><td>[["+roll+"]]</td></tr><tr><th><h4 style=\"background: #b3ecff;\">Extra Dice</h4></th><td>"+sagaDice.join(", ")+"</td></tr><tr><td colspan=\"2\">"+flip+"</table>");
        });
    });
}

function determineSuccess(roll,difficulty,stat){
    var degree="";
    var res="Failure!";
    var flip;
                            
    if ((roll>difficulty)&&(roll<=stat)){ res="Success!"; }
    if ((roll%11==0)||(roll==100)){ degree = "Critical "; }
    
    return degree+res;
}
