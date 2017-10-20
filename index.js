//Init for phaser engine™¡
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var Bogey = require('./lib/bogey');
var Pong = require('./lib/pong');
var $ = require('jquery');

var container = $('div.bogey-visualization-container').get(0);
var bogey = new Bogey(container, null);
Pong.run(bogey);

//Generate mock data
var counter = 1;
var callback = bogey.requestHandler();
window.setInterval(function() {
    callback({
        parsed: {
            'ip': [ "ip" + counter ],
            'uri': [ "uri" + counter],
            'statusCode': [ "300" ]
        }
    });
    counter++;
}.bind(this), 250);
