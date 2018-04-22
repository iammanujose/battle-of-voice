const strings = require('./../strings');
const bus = require('./../bus');
module.exports = {
    'LaunchRequest': function() {
        this.attributes.gameMode = false;
        this.attributes.gameModeLevel = 1;
        this.attributes.userTextReply = false;
        this.attributes.grocery = false;
        this.emit('StartGameIntent');
    },
    'StartGameIntent': function() {
        var speakTxt='';
        if(bus.currentUserProcess=='mode'){
            speakTxt= strings.HELP_GAME_INFO;
        }else{
            speakTxt = strings.WELCOME_TUNE+strings.WELCOME + strings.HELP_GAME_INFO;
        }
        bus.currentUserProcess = 'start';
        this.response.speak(speakTxt)
            .listen(strings.REPROMPT);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function() {
        const speechOutput = strings.HELP_MESSAGE;
        const reprompt = strings.HELP_REPROMPT;
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function() {
        this.response.speak(strings.STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {
        this.response.speak('You got '+(bus.modeOneCounter*10+bus.modeTwoScore) +' points. \n'+strings.STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'Unhandled': function() {
        this.emit(':ask', strings.UNHANDLED_MESSAGE, strings.REPROMPT);
    },
}