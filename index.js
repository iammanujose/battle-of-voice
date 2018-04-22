/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This supports Single lauguage. (en-IN).
 **/

'use strict';
const Alexa = require('alexa-sdk');
var constants = require('./constants');
let mainHandler = require('./handler/mainHandler');
let modeHandler = require('./handler/modeHandler');
let modeOneHandler = require('./handler/modeOneHandler');
let modeTwoHandler = require('./handler/modeTwoHandler');
exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = constants.APP_ID;
    alexa.registerHandlers(mainHandler,modeHandler,modeOneHandler,modeTwoHandler);
    alexa.execute();
};