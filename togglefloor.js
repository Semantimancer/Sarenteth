on("change:graphic:left", function(obj,prev){
    var page = findObjs({ _id: obj.get("_pageid"), type: "page" })[0];
    var pageName = page.get("name");
    var objName = obj.get("name");
    if(objName==pageName){
      obj.set("left",prev["left"]);
      obj.set("top",prev["top"]);
        
      var ids = obj.get("gmnotes").split("%3Cbr%3E");
      var objs = filterObjs(function(o){ return ids.indexOf(o.get("id")) != -1; });
      objs.forEach(function(o){
        if(o.get("layer")=="gmlayer"){
          if(o.get("represents")){
            o.set("layer","objects")
          } else {
            o.set("layer","map");
          }
        } else {
          o.set("layer","gmlayer");
        }
      });
    }
});
