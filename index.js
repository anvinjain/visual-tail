//Init for phaser engine
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var $ = require('jquery');
var Bogey = require('./lib/bogey');
var Util = require('./lib/util');
var Pong = require('./lib/vis/pong');
var HttpStreamingJsonSource = require('./lib/datasource/http-streaming-json-source');
var PongPayload = require('./lib/vis/pong/payload');

var FkProfRequests = require('./examples/fk-prof-requests');
var VaradhiConsumerMessages = require('./examples/varadhi-consumer-messages');

var container = $('div.bogey-visualization-container').get(0);
var api = "http://10.47.5.141/query";

var visualizations = ["fkp-backend-requests", "fkp-userapi-requests", "varadhi-consumer-messages"];
var name = Util.getUrlParameter('name');
switch(name) {
    case "fkp-backend-requests":
        var fkpBackendRequests = new FkProfRequests(container, api, "fk-prof", "fk-prof-backend_request");
        fkpBackendRequests.run();
        break;
    case "fkp-userapi-requests":
        var fkpUserapiRequests = new FkProfRequests(container, api, "fk-prof", "fk-prof-userapi_request");
        fkpUserapiRequests.run();
        break;
    case "varadhi-consumer-messages":
        var varadhiConsumerMessages = new VaradhiConsumerMessages(container, api, "prod-varadhi", "HttpMessageProcessor", "varadhi");
        varadhiConsumerMessages.run();
        break;
    default:
        var links = visualizations.map(v => {
            return '<li><a href="' + window.location.toString() + '?name=' + v + '">' + v + '</a></li>';
        });
        $(container)
        .css("color", "#ddd")
        .css("padding", "20px")
        .css("line-height", "2")
        .html("Available visualizations<ul>" + links.join("") + "</ul>");
}