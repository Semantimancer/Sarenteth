on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!roll") == 0){
        var args = msg.content.split(" ");
        var environment = findObjs({_type: 'character', name: "Environment"})[0];
        var difficulty = getAttrByName(environment.id,"Difficulty","current");
        var speaking = findObjs({_type: 'character', name: msg.who})[0];
        
        //Check for modifications to the roll
        var extra = 0;
        var mods = [];
        for(i = 2; i<args.length; i++){
            if(isNaN(args[i])){ //This argument isn't a number. Filter out bad args and pass along.
                switch(args[i]){
                    case "double":
                    case "crit-adv":
                    case "crit-disadv":
                    case "partial":
                    case "circumstance":
                    case "momentum":
                    case "wyrd":
                    case "mana":
                        mods.push(args[i]);
                        break;
                    default:
                        sendChat(msg.who,"Error: Unknown argument \""+args[i]+"\"");
                }
            } else { //This argument is a number
                if (args[i]<1){
                    sendChat(msg.who,"Error: Number of extra dice must be greater than 0");
                } else {
                    extra =+ args[i];
                }
            }
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
                        makeRoll("character|"+speaking.id,difficulty,args[1],stat,extra,mods)
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
                makeRoll("character|"+speaking.id,difficulty,"Custom",args[1],extra,mods)
            } else {
                sendChat("player|"+msg.playerid,"ERROR: No character found. Rolling normally...")
                makeRoll("player|"+msg.playerid,difficulty,"Custom",args[1],extra,mods)
            }
        }
    }
});

function capitalize(string){
    String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function makeRoll(speaking,difficulty,statname,stat,extraRolls,mods){
    sendChat("","/roll 1d100",function(b){
        var roll = JSON.parse(b[0].content).total;
        var crita = false;
        var critd = false;
        var partial = false;
        
        if (mods.indexOf("double")!==-1){
            difficulty = difficulty*2;
        }
        if (mods.indexOf("crit-adv")!==-1){
            crita = true;
        } else if(mods.indexOf("crit-disadv")!==-1){
            critd = true;
        }
        if (mods.indexOf("partial")!==-1){
            partial = true;
        }
        
        var result = determineSuccess(roll,difficulty,stat,crita,critd,partial);
        
        var flip = "Flipping the dice would result in a ";
        if (roll==100){ flip = ""; }
        else if (roll==1){ flip = flip+determineSuccess(10,difficulty,stat,crita,critd,partial); }
        else if (roll<10){ 
            var flipped = roll*10;
            flip = flip+determineSuccess(flipped,difficulty,stat,crita,critd,partial);
        } else {
            var flipped = roll.toString()[1]+roll.toString()[0];
            flip = flip+determineSuccess(parseInt(flipped),difficulty,stat,crita,critd,partial);
        }
        
        sendChat("","/roll "+extraRolls+"d10",function(c){
            var sagaDice = JSON.parse(c[0].content).rolls[0].results.map(function(x){ return "[["+(x["v"]%10)+"]]"; });
            var output = "<table style=\"text-align: center; margin-left: auto; margin-right: auto;\"><tr><th colspan=\"2\"><h2>"+result+"</h2></th></tr><tr><th style=\"background: #b3ecff;\"><h4>"+capitalize(statname)+"</h4></th><td>[["+stat+"]]</td></tr><tr><th style=\"background: #b3ecff;\"><h4>Difficulty</h4></th><td>[["+difficulty+"]]</td></tr><tr><th><h4 style=\"background: #b3ecff;\">Roll</h4></th><td>[["+roll+"]]</td></tr><tr><th><h4 style=\"background: #b3ecff;\">Extra Dice</h4></th><td>"+sagaDice.join(", ")+"</td></tr><tr><td colspan=\"2\">"+flip+"</td></tr>";
            var text = "";
            
            for(i=0;i<mods.length;i++){
                if(mods[i]=="circumstance"){
                    text = "<strike>Create A Circumstance</strike>"; //I'm aware you're supposed to use CSS most of the time, but this is just plain easier
                    if (result.indexOf("Success")!==-1){ text = "Create A Circumstance"; }
                } else if(mods[i]=="momentum"){
                    text = "Gain One Momentum";
                } else if(mods[i]=="mana"){
                    text = "Gain One Mana";
                } else if(mods[i]=="wyrd"){
                    text = "Give Your Opponent 1 Wyrd";
                }
                output = output + makeExtraRow(text,i);
            }
            
            sendChat(speaking,output+"</table>");
        });
    });
}

function makeExtraRow(rowText,rowNum){
    var extraRowColors = ["#78dde2","#8be0a4"];
    return "<tr><th colspan=\"2\"><h4 style=\"background: "+extraRowColors[rowNum%2]+";\">"+rowText+"</h4></th></tr>";
}

function determineSuccess(roll,difficulty,stat,crita,critd,partial){
    var degree="";
    var res="Failure!";
    var flip;
                            
    if ((roll>difficulty)&&(roll<=stat)){ res = "Success!"; }
    
    if ((roll%11==0)||(roll==100)){ 
        degree = "Critical "; 
    } else if(res=="Success!"&&crita){
        degree = "Critical ";
    } else if(res=="Success!"&&partial){
        degree = "Partial ";
    }
    
    if(res=="Failure!"&&critd){
        degree = "Critical ";
    }
    
    return degree+res;
}
