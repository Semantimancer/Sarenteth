on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!help") == 0){
        sendChat("!time","Display current date and phase of the moon");
        sendChat("!circumstances","Display current circumstances");
        sendChat("!destinies","Display current destinies");
        sendChat("!allies","Display the allies (and their scores) of the current character");
        sendChat("!wyrd","Display possible uses of Wyrd");
        sendChat("!weather","Display the current weather and temperature");
        sendChat("!contest","Display contest rules & current circumstances");
        sendChat("!roll","<score|value> [adv|disadv]\nMake a <score|value> roll and use advantage/disadvantage as appropriate. <b>Message must be sent as the character who is rolling.</b>");
        sendChat("!popcorn","[all]|<character>Display all characters who have yet to take their turn or set it to a specified character's turn");
        sendChat("!advantage","Display possible advantages.");
        sendChat("!disadvantage","Display possible disadvantages.");
        sendChat("!help","Display these messages.");
    }
});

on("chat:message", function(msg){
    if (msg.type=="api"){
        var command = msg.content;
        if(command.indexOf("!circumstances") == 0){
            displayEnvironment("Circumstances","bio");
        } else if(command.indexOf("!destinies") == 0){
            displayEnvironment("Destinies","gmnotes");
        } else if(command.indexOf("!obsessions") == 0){
            var args = msg.content.split(" ");
            if(args[1]){
                if(args[1]=="players"){
                    var names = ["Graham","Thomas","Kyle","Luke","Brett","Charlie","Kegan"];
                } else {
                    var names = [args[1]];
                }
            } else { 
                var names = [""]; 
            }
            names.forEach(function(name){
                displayCharactersAttributes("repeating_obsessions",name);
            });
        } else if(command.indexOf("!allies") == 0){
            displayAllies(msg.who);
        } else if(command.indexOf("!wyrd") == 0){
            var opts = ["<b>Flip Dice:</b> Spend 1 Wyrd. Flip the 10s and 1s position of your roll."
                       ,"<b>Resolve Uncertainty:</b> Offer 1+ Wyrd and answer an uncertainty. If accepted, answer is true."
                       ,"<b>Invoke Destiny:</b> Spend 1 Wyrd. Describe how situation fits with destiny, and narrate the destiny's conclusion."
                       ,"<b>Defy Death:</b> Burn 1 Wyrd. Make a Destiny roll to avoid losing character."
                       ,"<b>Push Obsession:</b> Spend 1 Wyrd and name a relevant obsession. Your Approach becomes equal to your roll result."
                       ,"<b>Compel Obsession:</b> Offer 1+ Wyrd and offer a course of action befitting an obsession. If rejected, they pay you that many Wyrd."
                       ,"<b>Bribe:</b> Wyrd can be offered in exchange for goods and services."];
            display("Sarenteth",opts);
        } else if(command.indexOf("!contest") == 0){
            sendChat("","!circumstances");
            var steps = ["1. <b>Actor<b> gives an action"
                        ,"2. <b>Opponent</b> describes how they stop <b>Actor</b>."
                        ,"3. <b>Opponent <i>bids difficulty</i>, <i>declares their approach</i>, <i>adds momentum</i>, and may <i>set advantage</i>."
                        ,"4. <b>Actor</b> can <i>escalate</i> (return to step 2 and switch roles), <i>surrender</i> (lose, but ignore momentum & narrate), or <i>challenge</i> (start a single roll)."];
            display("Sarenteth",steps);
        } else if(command.indexOf("!advantage") == 0){
            var lines = ["If you succeed, treat it as a critical success."
                        ,"If you succeed, create a circumstance."
                        ,"Roll an extra d10 on the side. You may substitute it for one other die you rolled."
                        ,"Gain one momentum."
                        ,"If your opponent has disadvantage, select one of their options to lock. They may not choose it."];
            display("Sarenteth",lines);
        } else if(command.indexOf("!disadvantage") == 0){
            var lines = ["Double the roll's difficulty."
                        ,"If you succeed, treat it as a partial success."
                        ,"If you fail, treat it as a critical failure."
                        ,"Give your opponent 1 Wyrd."];
            display("Sarenteth",lines);
        }
    }
});

function displayEnvironment(name,string){
    var characters = findObjs({_type: 'character'});
    var environment;
    var i = 0;
    while (environment == null){
        if(characters[i].get("name")=="Environment") { environment = characters[i]; }
        i++;
    }
    environment.get(string,function(bio){
        var lines = bio.split("<br>");
        lines.pop(); //This gets rid of an empty element at the end of the array
        display(name,lines);
    });
}

function displayCharactersAttributes(attribute,name){
    var characters = filterObjs(function(obj){
        if(obj.get("_type") != "character"){ return false; }
        var result = obj.get("name").indexOf(name);
        log(obj.get("name") + " index within " + name + ": " + result);
        return (result != -1);
    });
    characters.forEach(function(character){
        var id = character.get("_id");
        var atts = findObjs({_type: 'attribute', _characterid: id });
        var arr = [];
        
        if(atts){
            atts.forEach(function(obj){
                if(obj.get("name").indexOf(attribute) != -1){
                    arr.push(obj.get("current"));
                }
            });
            if(arr.length>0){ display(character.get("name"),arr); }
        }
    });
}

function displayAllies(characterName){
    log("Looking for "+characterName);
    var character = findObjs({_type: 'character', name: characterName })[0];
    if(character){
        var id = character.get("_id");
        log("Looking for allies...");
        var allyList = filterObjs(function(obj){
            if(obj.get("_type") != "attribute"){ return false; }
            if(obj.get("_characterid") != id){ return false; }
            return (obj.get("name").indexOf("repeating_allies") != -1);
        });
        var allies = [];
        log("Number of allies: "+allyList.length);
        
        allyList.forEach(function(attribute){
            var characterList = filterObjs(function(obj){
                if(obj.get("_type") != "character"){ return false; }
                var result = obj.get("name").indexOf(attribute.get("current"));
                return (result != -1);
            });
            characterList.forEach(function(character){
                allies.push(character);
            })
        });
        log("Number of allies found: "+allies.length);
        
        allies.forEach(function(ally){
            var id = ally.get("_id");
            var arr = [];
            var tab = getAttrByName(id,"tab");
            switch(tab){
                case "1": //Human
                    var scores = [["Vigor","Meditation"],["Passion","Serenity"],["Empathy","Will"],["Hope","Verity"],["Fate","Choice"]];
                    break;
                case "2": //Wizard
                    var scores = [["Vigor","Meditation"],["Passion","Serenity"],["Empathy","Will"],["Hope","Verity"],["Command","Harmony"]];
                    break;
                case "3": //Fairy
                    var scores = [["Give","Take"],["Salt","Fire"],["Bulk","Wisp"],["Joy","Sorrow"],["Command","Harmony"]];
                    break;
                case "4":
                    var scores = [["Fate"]];
                    break;
                default:
                    var scores = [["ERROR: Invalid tab value! ("+tab+")",""]];
                    break;
           }
           scores.forEach(function(tuple){
               var num = getAttrByName(id,tuple[0]);
               arr.push(tuple[0]+": "+num);
               if(tuple[1]){ arr.push(tuple[1]+": "+(100-num)); }
           });
           display(ally.get("name"),arr);
        });
    } else {
        sendChat("Error","No known character named "+character);
    }
}

function display(name,lines){
    var str = "<table style=\"width: 100%; text-align: center; margin-left: auto; margin-right: auto; padding = 4px; \" border=\"1\">";
    var blue = 1;
    lines.forEach(function(line){
        if (blue) {
            str = str+"<tr><td style=\"background: #b3ecff;\"><h4>"+line+"</h4></td></tr>";
            blue = 0;
        } else {
            str = str+"<tr><td style=\"background: #DDDDDD;\"><h4>"+line+"</h4></td></tr>";
            blue = 1;
        }
    });
    sendChat(name,str+"</table>");
}
