var $ = require('jquery');
var Util = require('./lib/util');
var TrackerAnnounces = require('./examples/tracker-announces');

var container = $('.vis-container').get(0);
var api = "http://10.47.5.141/query";
var appId = Util.getUrlParameter('app');

var trackerAnnounces = new TrackerAnnounces(container, api, appId);
trackerAnnounces.run();