console.info("Configuration", config);

//Init for phaser engine
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var $ = require('jquery');
var Util = require('./lib/util');
var FkProfRequests = require('./examples/fk-prof-requests');
var VaradhiConsumerMessages = require('./examples/varadhi-consumer-messages');
var CfgSvcRequests = require('./examples/config-svc-requests');

var container = $('div.bogey-visualization-container').get(0);
var api = config.logsApi;

var visualizations = [
//    ["fkp-backend-requests", "Fk-Prof Backend Requests"],
//    ["fkp-userapi-requests", "Fk-Prof Userapi Requests"],
    ["varadhi-consumer-messages", "Varadhi Consumer Messages (1% sampling)"],
    ["cfgsvc-api-ch-requests", "Config API Requests (10% sampling)"],
    ["shatabdi-tracker-announces", "Shatabdi Tracker Announces"],
];

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
        window.location.href = "/tracker_announces.html?app=shatabdi&group=infohash";
        break;
    default:
        var links = visualizations.map(v => {
            return '<div id="vis-list-item"><a href="' + window.location.toString() + '?name=' + v[0] + '">' + v[1] + '</a></div>';
        });
        var linkContainer = $('<div id="vis-list"></div>');
        linkContainer.html(links.join(""));
        var heading = $("<h1>Visualizations over DGrep</h1>");
        $(container).append(heading).append(linkContainer);
}