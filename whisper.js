on("chat:message", function(msg){
    if (msg.type=="whisper"){
        var currentPage = Campaign().get("playerpageid");
        var speakers = findObjs({
            _pageid: currentPage,
            _type: "graphic",
            name: msg.who
        });
        var listeners = findObjs({
            _pageid: currentPage,
            _type: "graphic",
            name: msg.target_name
        });
        var tokens = speakers.concat(listeners);
        
        _.each(tokens,function(token){
            var r = token.get("width")/2;
            var mod = r*(Math.cos(Math.PI/180));
            var bubble = createObj("graphic", {
                pageid: token.get("pageid"),
                layer: token.get("layer"),
                isdrawing: true,
                top: token.get("top") - mod,
                left: token.get("left") + mod,
                height: r,
                width: r,
                imgsrc: "https://s3.amazonaws.com/files.d20.io/images/26812030/x_R8BH-aCVtaoP5a9zNUxw/thumb.png?1483160177"
            });
            toFront(bubble);
            
            setTimeout(function(){ bubble.remove(); },3*1000);
        });
    }
});
