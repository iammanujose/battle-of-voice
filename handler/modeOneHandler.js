const googleWords = require('./../data/google.json');
const dictionaryWords = require('./../data/google.json');
const strings = require('./../strings');
var bus = require('./../bus');
var constants = require('./../constants');
var usedWords = [];

let getRandomWord = function(letter, length) {
    var word = false;

    if (!letter) {
        while (!word) {
            var _testWord = googleWords[Math.floor((Math.random() * googleWords.length))];
            if (_testWord.length >= 4) {
                word = _testWord;
            }
        }

    }
    else {
        while (!word) {
            var startWords = googleWords.filter(function(item, index) {
                return (item.indexOf(letter) == 0 && item.length >= 3 && usedWords.indexOf(item) == -1);
            });
            var _testWord = startWords[Math.floor((Math.random() * startWords.length))];
            word = _testWord;
        }
    }
    return word;
}

module.exports = {
    'GameModeOne': function() {
        var speakTxt = '';
        if (bus.currentUserProcess == 'mode') {
            speakTxt = speakTxt + strings.MODE1;
            speakTxt = speakTxt + strings.MODE1_HELP_QUSETION;
            this.attributes.yesNo = "mode1Help";
        }
        else if (bus.currentUserProcess == 'mode1-help-yes') {
            speakTxt = speakTxt + strings.HELP_GAME_MODE_1 + strings.SHALL_START;
            this.attributes.yesNo = "mode1Start";
        }
        else {
            bus.currentUserProcess = 'mode1-start';
            speakTxt = speakTxt + strings.LETS_START;
            speakTxt = speakTxt + '<break time="400ms"/> ';
            var word = getRandomWord(false, false);

            if (word) {
                this.attributes.wordReply = true;
                this.attributes.wordReplyLastLetter = word.charAt(word.length - 1);
                var firstLetter = word.charAt(0);
                speakTxt = speakTxt + firstLetter + ' for ' + word + '.';
            }
            else {
                speakTxt = speakTxt + 'Sorry!!! I can\'t find a word.';
            }

        }

        this.response.speak(speakTxt).listen(strings.REPROMPT);
        this.emit(':responseReady');
    },
    'GameModeOneNext': function() {
        var speakTxt = '';
        var prevLetter = this.attributes.wordReplyLastLetter;
        speakTxt = speakTxt + '<break time="400ms"/> ';
        if (bus.currentUserProcess == 'mode1-continue') {
            speakTxt = bus.modeOneLastWord;
            bus.currentUserProcess = 'mode1';
        }
        else {
            var word = getRandomWord(prevLetter, false);
            if (word) {
                this.attributes.wordReply = true;
                this.attributes.wordReplyLastLetter = word.charAt(word.length - 1);
                bus.modeOneCounter = bus.modeOneCounter + 1;
                speakTxt = speakTxt + prevLetter + ' for ' + word + '.';
                bus.modeOneLastWord = speakTxt;
                usedWords.push(word);

                if (bus.modeOneCounter > 1 && (bus.modeOneCounter % 5) == 0) {
                    bus.currentUserProcess = 'mode1';
                    var good = constants.CONGRATS[Math.floor((Math.random() * constants.CONGRATS.length))];
                    speakTxt = "<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_excited_cheer_01.mp3'/>" +
                        '<say-as interpret-as="interjection">' + good + '.</say-as> You have ' + (bus.modeOneCounter * 10) + ' points!. Let\'s continue. ' + speakTxt;
                }
                else {
                    speakTxt = "<audio src='https://s3.amazonaws.com/ask-soundlibrary/human/amzn_sfx_crowd_applause_02.mp3'/>" + speakTxt;
                }
            }
            else {
                speakTxt = speakTxt + 'Sorry!!! I can\'t find  a word.';
            }
        }

        this.response.speak(speakTxt).listen('tell me a word starting with last letter?');

        this.emit(':responseReady');
    },
    'userWordReply': function() {
        var intent = this.event.request.intent;
        var sorry = constants.OOPS[Math.floor((Math.random() * constants.OOPS.length))] + '! ';

        if (this.event.session.attributes.wordReply) {
            var lastLetter = this.event.session.attributes.wordReplyLastLetter;
            var userWord = intent.slots.word.value.toLowerCase();
            if (userWord && lastLetter) {

                var pattern = /^[a-zA-Z]+$/;
                if (pattern.test(userWord) && userWord.charAt(0) == lastLetter) {
                    if (dictionaryWords.indexOf(userWord) !== -1) {
                        if (usedWords.indexOf(userWord) == -1) {
                            //bus++;
                            this.attributes.wordReplyLastLetter = userWord.substr(userWord.length - 1);
                            usedWords.push(userWord);
                            this.emit('GameModeOneNext');
                        }
                        else {
                            this.attributes.yesNo = "mode1Continue";
                            this.attributes.wordReplyLastLetter = lastLetter;
                            this.response.speak(strings.SORRY_TUNE + sorry + userWord + ' is already used. Do you want to continue?').listen(strings.REPROMPT);
                            this.emit(':responseReady');
                        }
                    }
                    else {
                        //this.attributes.yesNo = "mode1Continue";
                        this.attributes.wordReplyLastLetter = lastLetter;
                        this.response.speak(strings.SORRY_TUNE + sorry + userWord + ' is not in our list. Please tell another one?').listen(strings.REPROMPT);
                        this.emit(':responseReady');
                    }

                }
                else {

                    this.attributes.yesNo = "mode1Continue";
                    this.attributes.wordReplyLastLetter = lastLetter;
                    this.response.speak(strings.SORRY_TUNE + sorry + userWord + ' is not found. Do you want to continue?').listen(strings.REPROMPT);
                    this.emit(':responseReady');
                }
            }
            else {
                this.emit('StartGameIntent');
            }

        }
        else {
            this.emit('StartGameIntent');
        }
    }
}