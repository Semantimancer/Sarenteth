on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!newnpc")==0&&playerIsGM(msg.playerid)){
        var token = findObjs({ _id: msg.selected[0]._id})[0];
        if(token&&token.get("_subtype")=="token"){
            var charName = msg.content.split(" ")[1];
            if(!charName){
                charName = token.get("name");
            }
    
            var stats = token.get("gmnotes").split("%3Cbr%3E");
            var character = createObj("character",{
                name: charName,
                controlledby: token.get("controlledby")
            });
            
            for(i = 0; i<5; i++){
                var currentStat = stats[i].split("%3A%20");
                if(currentStat[0]=="Give"){
                    createObj("attribute",{
                        name: "tab",
                        current: "3",
                        characterid: character.get("_id")
                    });
                }
                log(currentStat);
                createObj("attribute",{
                    name: currentStat[0],
                    current: currentStat[1].split("%")[0],
                    max: 100,
                    characterid: character.get("_id")
                });
            }
            
            var edges = stats[5].split("%3A%20")[1].split("%2C%20");
            for(i = 0; i<edges.length; i++){
                createObj("attribute",{
                    name: "repeating_edges_"+i+"_edge",
                    current: edges[i].split("%20").join(" "),
                    characterid: character.get("_id")
                });
            }
            
            var scars = stats[6].split("%3A%20")[1].split("%2C%20");
            for(i = 0; i<scars.length; i++){
                createObj("attribute",{
                    name: "repeating_scars_"+i+"_scar",
                    current: scars[i].split("%20").join(" "),
                    characterid: character.get("_id")
                });
            }
            
            var obsessions = stats[7].split("%3A%20")[1].split("%2C%20");
            for(i = 0; i<obsessions.length; i++){
                createObj("attribute",{
                    name: "repeating_obsessions_"+i+"_obsession",
                    current: obsessions[i].split("%20").join(" "),
                    characterid: character.get("_id")
                });
            }
        } else {
            sendChat("API Error","Selected object is a "+token.get("_subtype")+", not a token.");
        }
    }
});
