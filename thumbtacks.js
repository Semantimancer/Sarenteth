on("change:graphic", function(obj, prev) {
  if(obj.get("left")!=prev["left"] || obj.get("top")!=prev["top"]){
    var text = unescape(obj.get("gmnotes"));
    var revertMovement = false;
    if(text.lastIndexOf("INFO:",0) === 0){
      revertMovement = true;
              
      var box = "<div style='background:#83d4ea; border:1px; border-radius:5px; padding:2px;'>";
      var output = "<h4>" + text.substr(5) + "</h4></div>";
      sendChat(obj.get("name")+" Info",box+output);
    } else if(text.lastIndexOf("COMMAND:",0) === 0){
      revertMovement = true;
      var output = text.substring(8).replace("#",obj.get("bar1_value"));
      sendChat("Thumbtack Command",output);
    }
              
    if(revertMovement){
      obj.set("left",prev["left"]);
      obj.set("top",prev["top"]);
    }
  }
});
