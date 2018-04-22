const strings = require('./../strings');
const bus = require('./../bus');
module.exports  = {
    'GameModes': function() {
        
        var intent = this.event.request.intent;
        if (intent && intent.name == 'GameModes' && intent.slots && intent.slots.modeNumber && intent.slots.modeNumber.value) {
            bus.currentUserProcess = 'mode';
            var mode = intent.slots.modeNumber.value || false;
            if (mode == 1) {
                this.emit('GameModeOne');
            } else if (mode == 2) {
                this.emit('GameModeTwo');
            } else {
                this.response.speak(strings.REPROMPT).listen(strings.REPROMPT);
                this.emit(':responseReady');
            }

        } else {
            if(bus.currentUserProcess =='mode2startWaitAnswer'){
                 this.response.speak(strings.MODE2_REPROMPT).listen(strings.REPROMPT);
            }else{
                this.response.speak(strings.REPROMPT).listen(strings.REPROMPT);
            }
            this.emit(':responseReady');
        }

    },
    'AMAZON.YesIntent': function() {
        switch (this.event.session.attributes.yesNo) {
            case 'mode2NextLevel':
                bus.userGoNextLevel = true;
                bus.userLevel++;
                this.emit('GameModeTwo');
                break;
            case 'mode1Help':
                bus.currentUserProcess = 'mode1-help-yes';
                this.emit('GameModeOne');
                break;
                
            case 'mode1Start':
                bus.currentUserProcess = 'mode1-start';
                this.emit('GameModeOne');
                break;
            
            case 'mode1Continue':
                bus.currentUserProcess = 'mode1-continue';
                this.emit('GameModeOneNext');
                break;
                
            case 'mode2Help':
                bus.currentUserProcess = 'mode2-help-yes';
                this.emit('GameModeTwo');
                break;
                
            case 'mode2Start':
                bus.currentUserProcess = 'mode2-start';
                this.emit('GameModeTwo');
                break;
            
            case 'mode2Continue':
                bus.currentUserProcess = 'mode2-continue';
                this.emit('GameModeTwo');
                break;    
                
            default:
                this.response.speak(strings.STOP_MESSAGE);
                this.emit(':responseReady');
        }

    },
    'AMAZON.NoIntent': function() {
        switch (this.event.session.attributes.yesNo) {
            case 'mode2NextLevel':
                // code
                break;

            case 'mode1Help':
                bus.currentUserProcess = 'mode1-help-no';
                this.emit('GameModeOne');
                break;
                
             case 'mode1Start':
                bus.currentUserProcess = 'mode';
                this.emit('StartGameIntent');
                break;
                
            case 'mode2Help':
                bus.currentUserProcess = 'mode2-help-no';
                this.emit('GameModeTwo');
                break;
                
             case 'mode2Start':
                bus.currentUserProcess = 'mode';
                this.emit('StartGameIntent');
                break;     
                

            default:
                this.response.speak(strings.STOP_MESSAGE);
                this.emit('AMAZON.StopIntent');
        }
    },
}