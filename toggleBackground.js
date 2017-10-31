//Works best with a get-id macro
on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!bg") == 0){
        var bgID = msg.content.split(" ")[1];
        var bg = findObjs({ _id: bgID })[0];
        if(bg){ toFront(bg); }
    }
});
