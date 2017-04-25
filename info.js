on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!contest") == 0){
        sendChat("","!circumstances");
        var string = "<ol><li>Actor gives an action.</li><li>Opponent describes how they stop the actor. They <b>bid difficulty</b>, <b>declare "
                   + "their approach</b>, <b>add momentum</b>, and (optionally) <b>set advantage</b>.</li><li>Actor can escalate, surrender, or "
                   + "challenge.<ul><li>If they escalate, actor and opposition switch roles and return to Step 2.</li><li>If they surrender, they "
                   + "lose. The opponent can deal damage or inflict a scar, but the actor narrates the results.</li><li>If they challenge, the "
                   + "contest becomes a single roll (with the chance to act to endure).</li></ul></li></ol>";
        sendChat("Sarenteth",string);
    }
});

on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!help") == 0){
        sendChat("!time","Display current date and phase of the moon");
        sendChat("!circumstances","Display current circumstances");
        sendChat("!destinies","Display current destinies");
        sendChat("!weather","Display the current weather and temperature");
        sendChat("!contest","Display contest rules & current circumstances");
        sendChat("!roll","<score|value> [adv|disadv]\nMake a <score|value> roll and use advantage/disadvantage as appropriate. <b>Message must be sent as the character who is rolling.</b>");
        sendChat("!popcorn","[all]|<character>\nDisplay all characters who have yet to take their turn or set it to a specified character's turn");
        sendChat("!help","Display these messages.");
    }
});

on("chat:message", function(msg){
    if (msg.type=="api"){
        if(msg.content.indexOf("!circumstances") == 0){
            displayEnvironment("Circumstances","bio");
        } else if(msg.content.indexOf("!destinies") == 0){
            displayEnvironment("Destinies","gmnotes");
        } else if(msg.content.indexOf("!obsessions") == 0){
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
        } else if(msg.content.indexOf("!allies") == 0){
            displayAllies(msg.who);
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
                //log("Is "+obj.get("name")+" found in "+attribute.get("current")+"?");
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
                    var scores = [["Vigor","Meditation"],["Passion","Serenity"],["Empathy","Will"],["Hope","Verity"],["Fate","Choice"]];
                    break;
                case "3": //Fairy
                    var scores = [["Give","Take"],["Salt","Fire"],["Bulk","Wisp"],["Joy","Sorrow"],["Command","Harmony"]];
                    break;
                default:
                    var scores = [["ERROR: Invalid tab value! ("+tab+")",""]];
                    break;
           }
           scores.forEach(function(tuple){
               var num = getAttrByName(id,tuple[0]);
               arr.push(tuple[0]+": "+num);
               arr.push(tuple[1]+": "+(100-num));
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
