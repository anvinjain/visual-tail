//Init for phaser engine
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var $ = require('jquery');
var Bogey = require('./lib/bogey');
var Pong = require('./lib/vis/pong');
var HttpStreamingJsonSource = require('./lib/datasource/http-streaming-json-source');
var PongPayload = require('./lib/vis/pong/payload');

var FkProfRequests = require('./examples/fk-prof-requests');
var VaradhiConsumerMessages = require('./examples/varadhi-consumer-messages');

var container = $('div.bogey-visualization-container').get(0);
var api = "10.47.5.141";

// var fkpBackendRequests = new FkProfRequests(container, api, "fk-prof", "fk-prof-backend_request");
// fkpBackendRequests.run();

var varadhiConsumerMessages = new VaradhiConsumerMessages(container, api, "prod-varadhi", "HttpMessageProcessor", "varadhi");
varadhiConsumerMessages.run();