//Init for phaser engine
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var $ = require('jquery');
var Bogey = require('./lib/bogey');
var Pong = require('./lib/vis/pong');
var HttpStreamingJsonSource = require('./lib/datasource/http-streaming-json-source');
var PongPayload = require('./lib/vis/pong/payload');

var apiEndpoint = "10.47.5.141";
var appId = "fk-prof";
var messageObj = "fk-prof-backend_request";
var searchStr = "obj@" + messageObj;

var container = $('div.bogey-visualization-container').get(0);
var bogey = new Bogey(container, null);
Pong.run(bogey);

var messageHandler = function() {
    var handler = bogey.requestHandler();
    return function(entry) {
        switch(entry.type) {
            case "data":
                if(entry.msg) {
                    handler(entry.msg);
                } else { //error while transforming msg so received null
                    console.warn("Invalid payload received, skipping it");
                }
                break;
            case "error":
                bogey.flashMessage(entry.msg, 2000);
                console.error(entry.err);
                break;
            default:
                console.info("Not sure how to handle the emitted entry", entry);
        }
    }
}

var messageTransformer = function(msg) {
    if(msg.message == "obj" && msg.object[messageObj]) {
        var log = msg.object[messageObj];
        return new PongPayload(log.status, log.verb + " " + log.url, log.client_ip);
    }
    console.log("Cannot transform ", msg);
    return null;
}

var url = "http://" + apiEndpoint + "/query?app_id=" + appId + "&substr=" + searchStr;
var datasource = new HttpStreamingJsonSource(url, messageTransformer, messageHandler());
datasource.runWithRepeat();
