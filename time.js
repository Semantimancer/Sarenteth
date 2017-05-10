on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!time") == 0){
        var environment = findObjs({_type: "character", name: "Environment" })[0];
        if(environment){
            var month = parseInt(getAttrByName(environment.id,"Month","current"));
            var day = getAttrByName(environment.id,"Date","current");
            var year = getAttrByName(environment.id,"Year","current");
            switch(day){
                case 1: 
                    phase = "Full"; break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    phase = "Waning Gibbous"; break;
                case 7:
                    phase = "Waning Quarter"; break;
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                    phase = "Waning Crescent"; break;
                case 15:
                    phase = "New"; break;
                case 16:
                case 17:
                case 18:
                case 19:
                case 20:
                case 21:
                    phase = "Waxing Crescent"; break;
                case 22:
                    phase = "Waxing Quarter"; break;
                default:
                    phase = "Waxing Gibbous";
            }
            
            sendChat("Today's Date",""+months[month-1]+" "+day+", "+year);
            sendChat("Moon Phase",phase);
            sendChat("Cycle","It is the "+years[year%11]+" year.");
        } else {
            sendChat("Error","Environment not found!");
        }
    }
});

on("chat:message", function(msg){
    if (msg.type=="api"&&msg.content.indexOf("!advance-date") == 0&&playerIsGM(msg.playerid)){
        var args = msg.content.split(" ");
        if (args[1]) {
            var mod = parseInt(args[1]);
            var environment = findObjs({_type: "character", name: "Environment" })[0];
            
            if(environment){
                var day = parseInt(getAttrByName(environment.id,"Date","current"));
                var dayAttribute = findObjs({_type: "attribute", name: "Date", _characterid: environment.id})[0];
                var monthAttribute = findObjs({_type: "attribute", name: "Month", _characterid: environment.id})[0];
                var yearAttribute = findObjs({_type: "attribute", name: "Year", _characterid: environment.id})[0];
                
                var newDay = Math.max((day+mod)%28,1);
                dayAttribute.set("current",newDay);
                
                if(day+mod>27){
                    //if (day+mod!=30){ dayAttribute.set("current",newDay+1); }
                    var month = parseInt(getAttrByName(environment.id,"Month","current"));
                    var newMonth = Math.max((month+((day+mod)/27))%13,1);
                    monthAttribute.set("current",newMonth);
                    
                    if(month==12){
                        var year = parseInt(getAttrByName(environment.id,"Year","current"));
                        yearAttribute.set("current",year+1);
                    }
                }
                var dateText = findObjs({ _type: "text", _id: "-Kfh5o7n6U1eY0vyLtSE" })[0];
                var finalMonth = parseInt(getAttrByName(environment.id,"Month","current"));
                
                var text = months[finalMonth-1] + " " + newDay + ", " + yearAttribute.get("current") + "\n\n  ";
                var specialText = dayFacts[finalMonth-1][newDay-1];
                
                log("finalMonth: "+finalMonth);
                log("newDay: "+newDay);
                if (specialText.length > 2){
                    dateText.set("text",text + specialText);
                } else {
                    dateText.set("text",text);
                }

                sendChat("api","!time");
                sendChat("Date",dateText.get("text"));
            } else { 
                sendChat("Error","Environment not found!");
            }
        } else { 
            sendChat("api","!time"); 
        }
    }
});

/*
    So at the moment, this calendar is not automatic and will need to be re-programmed by the GM every in-game year.
    This is because the Sallen calendar is a lunisolar calendar (as opposed to the Julian calendar, which is solar).
    
    The Sallen calendar is 11 days shy of a full year (ours is .25 days shy). To account for this, we keep track of
    the "epact," which is the number of days by which the Sallen calendar is off; so after one year it has an epact
    of 11, after two 22, and so on. Once the epact is >=30 (the rough length of a Sallen month), we subtract 30 and
    add an intercalary month, Faeral, between Folmael and Senael. But because 30%11 =/= 0, one intercalary month of
    30 days still leaves us with an epact. In fact, it leaves us with enough of an epact that the Sallen calendar
    only "syncs up" with the solar calendar (meaning it has an epact of 0) every eleven years. The people of Sareth
    know this, of course, and they account for it by expressing years not just in terms of the total number of years
    since the last Age, but also through cycles. Each cycle consists of eleven years, beginning in a year with an
    epact of zero. The third, sixth, ninth, and eleventh years of a cycle all feature the intercalary month. But this
    still isn't enough, because even our 365-day calendar needs an update every so often (we call this leap-time). So
    the third year of every cycle features an "evil month," in which Senael doesn't start until the day after the full
    moon, meaning the Feast Day of Senill falls in the month of the fae instead of Senill's own month. The third year
    is considered the unluckiest year of each cycle, and the first month of that year the unluckiest month.
    
    And yes, if you've been doing the math, this calendar STILL doesn't work. They should be adding three days every
    twelve years, rather than adding one every eleven. This, however, takes quite a while to notice (exacerbated by
    the fact that the lengths of Sallen months are not standardized) and is relatively easy to fix when someone
    finally tells the local king about it; since the calendar naturally bleeds slightly less than two days every
    eleven years, sometimes they will have to go in and add some. Most rulers throw feast-days which count as being
    outside the month, or else they just say "after the Xth, instead of going to the Yth, we will go to the Zth"
    and skip a few days to get everyone caught up. This normally happens in or around Faeral, because Faeral is
    supposed to be the weird month anyway and everyone likes the other months, given that they're all associated
    with gods, to be fairly strict and orderly. Although at least one king has blamed the time shift on Jeim
    drunkenly pushing the sun out of its natural path (a proclamation which greatly displeased the local druids)
    and so righted it with a date-shift. But these things only happen once a century, at their most frequent.
    
    The point of all that explanation is to say that, at this time, the GM is going to need to re-program some of
    this calendar when it's time for a new in-game year to start. The main difficulty is that there are some
    holidays (Ostar, Beltane, Midsummer Feast, Lughnasadh, Feast of Gathering, Yule, and Imbolc) which are entirely
    dependent on the solar year, and therefore don't line up with a lunisolar calendar. In these cases, to find the
    actual date on which these holidays fall you'll need to take their "actual" date and subtract the new year's
    epact. Since this can sometimes shift holidays across months or even years, it's best to work all of this out
    a little early.
    
*/

var dayFacts = [//Senael
                ["Feast Day of Senill"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night"
                ,"16","17","18","19","20","21","22","23","24","25","26","27","28"]
                //Melael
               ,["Feast Day of Mele"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5"
                 //Vernal Equinox is on Melael 16, minus current epact
                ,"Ostar\n\nThe vernal equinox, the first time in the year that day and night are equal,\nwhich is celebrated with feasting and games involving eggs. It is Spring's\nholy day to the druids."
                ,"7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17","18","19","20","21","22","23","24","25","26","27","28"]
               //Lunel
               ,["Beltane\n\nThe day which marks the first stirrings of summer. It is celebrated with\nfeasting and by making series of great bonfires, between which cattle\nare driven."
                ,"Feast Day of Lugeln"
                ,"3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Dorael
               ,["Feast Day of Dorn"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night"
                //Midsummer Feast is on Dorael 22, minus current epact
                ,"Midsummer Feast\n\nThe summer solstice, when the sun hangs longest in the sky. The day is\nmarked by feasting, games of skill, and mock combats. It is Summer's\nholy day to the druids."
                ,"17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Verel
               ,["Feast Day of Vaer"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Lecail
               ,["Lughnasadh\nThe day which marks the first stirrings of autumn and the start of the harvest\nseason. It is celebrated with match-making, trading, and playing in games\nof skill and athletics."
                ,"Feast Day of Lecna"
                ,"3"
                ,"Hellnic Day\nit is recommended that worshipers give sacrifices to all the gods in return\nfor their continued patronage on this day. Gods who are spurned on this day\noften make their displeasure known."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Mikiel
               ,["Feast Day of Meliki"
                ,"2","3","4","5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21"
                //Autumnal Equinox is on Mikiel 28, minus current epact
                ,"Feast of Gathering\n\nThe autumnal equinox, the second time in the year that day and night are\nequal, which is celebrated with feasting and giving thanks for the year's\nbounty. It is Autumn's holy day to the druids."
                ,"23","24","25","26","27","28"]
               //Jemael
               ,["Feast Day of Jeim"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Narol
               ,["Samhain\n\nThe day which marks the first stirrings of winter, and the beginning of the\ndarker half of the year. It is celebrated with drinking, feasting, and bringing\nin the last harvests. Fairies are said to be most dangerous on Samhain."
                ,"Feast Day of Naroth"
                ,"3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Mirel
               ,["Feast Day of Myrr"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22"
                //Yule is on Trel 1, minus current epact
                ,"Yule\n\nThe winter solstice, when the night is longest. The Yule Lads are said to be\nout in force and the Wild Hunt rides across the sky. It is Winter's holy\nday to the druids."
                ,"24","25","26","27","28"] 
               //Trel
               ,["Feast Day of the Trine"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Folmael
               ,["Imbolc\n\nThe day which marks the first stirrings of spring, and the beginning of the\nnew year. It is celebrated with divinations, the reading of omens, and the\nlighting of fires."
                ,"Feast Day of Folimen"
                ,"3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               //Faeral
               ,["Start of the Intercalary Month"
                ,"2","3"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"5","6","7","8","9","10","11","12","13","Fire's Eve","Fire's Night","16","17"
                ,"Market Day\nEvery town and city will be flooded with people come to buy, to sell, and to exchange information."
                ,"19","20","21","22","23","24","25","26","27","28"]
               ];

var months = ["Senael","Melael","Lunel","Dorael","Verel","Lecail","Mikiel","Jemael","Narol","Mirel","Trel","Folmael","Faeral"];

var years = ["eleventh and last","first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth"];
