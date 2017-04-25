on("chat:message",function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!weather") == 0){
        var weatherLine = (findObjs({ _type: "text", _id: "-Kfh4DL6qP15Wacx_oQr" }))[0].get("text");
        var weatherTemp = (findObjs({ _type: "text", _id: "-Kfh4DLDB1vCV3nfzR7m" }))[0].get("text");
        
        sendChat("Weather",weatherLine+", "+weatherTemp+"arenheit");
    }
});

on("chat:message",function(msg){
    if(msg.type=="api"&&msg.content.indexOf("!new-weather")==0&&playerIsGM(msg.playerid)){
        var environment = findObjs({ _type: "character", name: "Environment" })[0];
        
        if (environment){
            var month = parseInt(getAttrByName(environment.id,"Month","current")); //0-12
            var n = Math.floor(Math.random()*weatherVariance*3)-weatherVariance;
            var index = n+(month*monthResults);
            if (index>=0){
                var weather = weatherTable[index%weatherTable.length];
            } else {
                var weather = weatherTable[weatherTable.length+index]; //Pretty sure this works, but I haven't actually done the math
            }

            var weatherLine = (findObjs({ _type: "text", _id: "-Kfh4DL6qP15Wacx_oQr" }))[0];
            if (weatherLine){
                weatherLine.set("text",weather[0]);
            } else {
                log("weatherLine not found!");
            }
        
            var weatherTemp = (findObjs({ _type: "text", _id: "-Kfh4DLDB1vCV3nfzR7m" }))[0];
            if (weatherTemp&&weather[1]&&weather[2]){
                var temp = weather[1]+(Math.floor((Math.random()*weather[2]*2)-weather[2]));
                weatherTemp.set("text",temp.toString()+"° F");
            } else {
                log("weatherTemp not found!");
            }
            
            var weatherIcon = (findObjs({ _subtype: "token", _id: "-Kfh1maPCumjGoVUE9Fn" }))[0];
            if (weatherIcon&&weather[3]){
                weatherIcon.set("imgsrc",weather[3]);
            } else {
                log("weatherIcon not found!");
            }
            
            var campaign = findObjs({ type: "campaign" })[0];
            var playlists = JSON.parse(campaign.get("_jukeboxfolder"));
            for(i=0; i<playlists.length; i++){
                if(weather[0]&&weather[0]==playlists[i].n){
                    playJukeboxPlaylist(playlists[i].id);
                }
            }
            sendChat("api","!weather");
        } else {
            log("Environment not found!");
        }
    }
});

//New temp: -Kfh4DLDB1vCV3nfzR7m

// Each month should have monthResults possible results. The possible results for any given month
// is based on month*monthResults (which puts it into that month's "segment"), varying by up to
// weatherVariance "downwards" (so up to one month back) or 2*weatherVariance "upwards" (so up
// to one month ahead)


weatherVariance = 5 // How much variance is allowed when looking for weather results
monthResults = 5 // Number of results possible for each month

weatherTable = [//Senael
                 ["Sunny",65,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
                ,["Rainy",55,5,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
                ,["Windy",63,17,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
                ,["Cloudy",65,16,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
                ,["Cloudy",60,16,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
                //Melael
               ,["Sunny",70,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Rainy",60,5,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               ,["Windy",68,17,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",70,16,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Rainy",55,5,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               //Lunel
               ,["Sunny",75,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Rainy",65,5,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               ,["Windy",73,17,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",75,16,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Thunderstorm",70,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               //Dorael
               ,["Sunny",80,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Rainy",70,10,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               ,["Windy",78,17,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",80,10,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Thunderstorm",80,10,"https://s3.amazonaws.com/files.d20.io/images/25060259/hkTjbcjc-1tH5dS0p4KtRQ/thumb.png?1478617780"]
               //Verel
               ,["Sunny",85,10,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Rainy",70,15,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               ,["Windy",83,7,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",85,5,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Stormy",83,7,"https://s3.amazonaws.com/files.d20.io/images/25060259/hkTjbcjc-1tH5dS0p4KtRQ/thumb.png?1478617780"]
               //Lecail
               ,["Sunny",85,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Rainy",75,10,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               ,["Windy",83,17,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",85,10,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Stormy",85,10,"https://s3.amazonaws.com/files.d20.io/images/25060259/hkTjbcjc-1tH5dS0p4KtRQ/thumb.png?1478617780"]
               //Mikiel
               ,["Sunny",75,25,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Rainy",65,20,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               ,["Windy",73,27,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",75,26,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Windy",78,27,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/max.png?1478619386"]
               //Jemael
               ,["Sunny",55,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Rainy",45,5,"https://s3.amazonaws.com/files.d20.io/images/25060401/MVgppWwLVMjqLdtIKImnwQ/thumb.png?1478618305"]
               ,["Windy",53,17,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",50,16,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Cloudy",45,16,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               //Narol
               ,["Sunny",45,25,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Snowy",40,10,"https://s3.amazonaws.com/files.d20.io/images/25060621/uVGAsAEyZBQdR0EFcK9eSg/thumb.png?1478619132"]
               ,["Windy",43,22,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",45,21,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Windy",43,22,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               //Mirel
               ,["Cloudy",30,10,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Snow",25,5,"https://s3.amazonaws.com/files.d20.io/images/25060574/2y-irLqt2fY7324t0km4ig/thumb.png?1478618988"]
               ,["Windy",28,12,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",30,5,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Cloudy",25,5,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               //Trel
               ,["Cloudy",20,10,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Snow",10,15,"https://s3.amazonaws.com/files.d20.io/images/25060574/2y-irLqt2fY7324t0km4ig/thumb.png?1478618988"]
               ,["Windy",10,10,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",15,15,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Snow",10,15,"https://s3.amazonaws.com/files.d20.io/images/25060574/2y-irLqt2fY7324t0km4ig/thumb.png?1478618988"]
               //Folmael
               ,["Sunny",20,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Snow",10,20,"https://s3.amazonaws.com/files.d20.io/images/25060574/2y-irLqt2fY7324t0km4ig/thumb.png?1478618988"]
               ,["Windy",10,15,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",15,20,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Snow",10,20,"https://s3.amazonaws.com/files.d20.io/images/25060574/2y-irLqt2fY7324t0km4ig/thumb.png?1478618988"]
               //Faeral
               ,["Sunny",20,15,"https://s3.amazonaws.com/files.d20.io/images/25060634/2s9uz4m3Pw5QPEFPR0qACg/thumb.png?1478619211"]
               ,["Snow",10,20,"https://s3.amazonaws.com/files.d20.io/images/25060574/2y-irLqt2fY7324t0km4ig/thumb.png?1478618988"]
               ,["Windy",10,15,"https://s3.amazonaws.com/files.d20.io/images/25060691/fWEgdXom0HJsMAqH00i7OQ/thumb.png?1478619386"]
               ,["Cloudy",15,20,"https://s3.amazonaws.com/files.d20.io/images/25060694/q67sV6fb67igd7-lhocQ7g/thumb.png?1478619401"]
               ,["Snow",10,20,"https://s3.amazonaws.com/files.d20.io/images/25060574/2y-irLqt2fY7324t0km4ig/thumb.png?1478618988"]]/*
               ]*/
