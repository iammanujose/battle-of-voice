var constants = require('./../constants');
var bus = require('./../bus');
const strings = require('./../strings');

var getRandomGroceryList = function() {
    const groceryItems = constants.GROCERY_ITEMS;
    var result = [];
    var _tmp = [];
    for (let i = 0; i < (bus.modeOneUserLevel + 1); i++) {
        _tmp.push(groceryItems[Math.floor((Math.random() * groceryItems.length))]);
    }
    result = _tmp.filter(function(item, i, ar) { return ar.indexOf(item) === i; });
    bus.groceryList = result;
    return result;
};

function ordinalSuffixOf(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

module.exports = {
    'GameModeTwo': function() {

        var speakTxt = '';
        if (bus.currentUserProcess == 'mode') {
            speakTxt = speakTxt + strings.MODE2;
            speakTxt = speakTxt + strings.MODE2_HELP_QUSETION;
            this.attributes.yesNo = "mode2Help";
        }
        else if (bus.currentUserProcess == 'mode2-help-yes') {
            speakTxt = speakTxt + strings.HELP_GAME_MODE_2 + strings.SHALL_START;
            this.attributes.yesNo = "mode2Start";
        }
        else {
            bus.currentUserProcess == 'mode2start';
            var list = getRandomGroceryList();
            var listLabel = list.join(', <break time="400ms"/>');
            this.attributes.userTextReply = true;
            this.attributes = list;
            if (bus.userGoNextLevel) {
                speakTxt = speakTxt + 'Level ' + bus.modeOneUserLevel+'.';
            }
            var random = Math.floor((Math.random() * list.length));
            bus.userGroceryList = random+1;
            var item = list[random].toLowerCase();
            speakTxt = speakTxt + ' Your grocery list is <break time="300ms"/>' + listLabel + ' <break time="300ms"/>. What was the position of <say-as interpret-as="interjection">' + item + '</say-as> in the list?';
            bus.currentUserProcess = 'mode2startWaitAnswer';
        }

        this.response.speak(speakTxt).listen(strings.REPROMPT);
        this.emit(':responseReady');


    },
    'userTextReply': function() {
        bus.currentUserProcess == 'mode2start';
        var intent = this.event.request.intent;
        var reply = (intent.slots && intent.slots.userReply && intent.slots.userReply.value) ? intent.slots.userReply.value : false;
        
        var speakTxt ='';
        if (reply) {
            if(bus.userGroceryList == (reply)){
                this.attributes.yesNo = "mode2NextLevel";
                 bus.modeTwoScore = bus.modeTwoScore + bus.groceryList.length * 5;
                var good = constants.CONGRATS[Math.floor((Math.random() * constants.CONGRATS.length))];
                    speakTxt = "<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_applause_02.mp3'/>" +
                        '<say-as interpret-as="interjection">' + good + '.</say-as> You got '+bus.modeTwoScore +' points. Shall we go to next level?';
                        bus.modeOneUserLevel++;
                        bus.userGoNextLevel = true;
                        this.attributes.yesNo = "mode2Continue";
            }else{
                bus.userGoNextLevel = false;
                var sorry = constants.OOPS[Math.floor((Math.random() * constants.OOPS.length))] + '! ';
                speakTxt = strings.SORRY_TUNE + sorry +'<break time="300ms"/>' + reply +' is wrong. Shall we try again?' ;
                this.attributes.yesNo = "mode2Continue";
            }
            this.response.speak(speakTxt).listen(strings.REPROMPT);
            this.emit(':responseReady');
        }
        else {
            this.response.speak(strings.REPROMPT).listen(strings.REPROMPT);
            this.emit(':responseReady');
        }
    }

}