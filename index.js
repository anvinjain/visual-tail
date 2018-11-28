//Init for phaser engine
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var $ = require('jquery');
var Util = require('./lib/util');
var FkProfRequests = require('./examples/fk-prof-requests');
var VaradhiConsumerMessages = require('./examples/varadhi-consumer-messages');
var CfgSvcRequests = require('./examples/config-svc-requests');
var ShatabdiTrackerAnnounces = require('./examples/tracker-announces');

var container = $('div.bogey-visualization-container').get(0);
var api = "http://10.47.5.141/query";

var visualizations = ["fkp-backend-requests", "fkp-userapi-requests", "varadhi-consumer-messages", "cfgsvc-api-ch-requests", "shatabdi-tracker-announces"];
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
    case "cfgsvc-api-ch-requests":
        var cfgsvcApiCHRequests = new CfgSvcRequests(container, api, "config-service", "config-service-api-requests");
        cfgsvcApiCHRequests.run();
        break;
    case "shatabdi-tracker-announces":
        window.location.href = "/tracker_announces.html?app=shatabdi";
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