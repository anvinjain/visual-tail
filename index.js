//Init for phaser engine™¡
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var Bogey = require('./lib/bogey');
var Pong = require('./lib/pong');
var $ = require('jquery');
var fetch = require('isomorphic-fetch');

var container = $('div.bogey-visualization-container').get(0);
var bogey = new Bogey(container, null);
Pong.run(bogey);

var url = "http://10.47.5.141/query?app_id=fk-prof&substr=obj@fkpbackend_request";
var callback = bogey.requestHandler();

// //Generate mock data
// var counter = 1;
// window.setInterval(function() {
//     callback({
//         parsed: {
//             'ip': [ "ip" + counter ],
//             'uri': [ "uri" + counter],
//             'statusCode': [ "300" ]
//         }
//     });
//     counter++;
// }.bind(this), 250);


function parseLogMessage(msg) {
    if(msg.message == "obj" && msg.object["fkpbackend_request"]) {
        var log = msg.object["fkpbackend_request"];
        return {
            host: msg.host,
            host_ip: msg.sndr,
            parsed: {
                ip: [ log.client_ip ],
                uri: [ log.verb + " " + log.url ],
                statusCode: [ log.status.toString() ]
            }
        }
    }
    return null;
}

function dgrepFetcher(url, callback) {
    fetch(url, {method: 'GET', mode: 'cors'}).then(response => {
        if(response.ok) {
            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var partial = false;
            function chunkHandler() {
                return reader.read().then(result => {
                    if(result.done) {
                        console.log("Chunks are done, restart fetch");
                        return;
                    }
                    var chunk = decoder.decode(result.value || new Uint8Array, {stream: !result.done});
                    var startIdx = 0, msg;
                    if(partial) {
                        var partialEnd = chunk.indexOf("}{", startIdx);
                        if(partialEnd == -1) {
                            console.error("Another partial received in entirety, skipping chunk");
                            startIdx = chunk.length;
                        } else {
                            console.log("Partial dropped from the start of chunk");
                            startIdx = partialEnd + 1;
                        }
                    }
                    if(startIdx < chunk.length) {
                        if (chunk[startIdx] != '{') {
                            console.error("Invalid chunk, terminating processing of this request");
                            return;
                        }
                        while(true) {
                            if(startIdx == chunk.length) {
                                console.log("Processing complete for chunk");
                                break;
                            }
                            var msgEnd = chunk.indexOf("}{", startIdx);
                            if(msgEnd == -1) {
                                try {
                                    msg = JSON.parse(chunk.substring(startIdx));
                                    partial = false;
                                    var payload = parseLogMessage(msg);
                                    if(payload) {
                                        callback(payload);
                                    } else {
                                        console.error("Invalid log message received, skipping it");
                                    }
                                } catch (err) {
                                    console.error("Invalid JSON, partial received at the end. Dropping it");
                                    partial = true;
                                }
                                startIdx = chunk.length;
                            } else {
                                try {
                                    msg = JSON.parse(chunk.substring(startIdx, msgEnd + 1));
                                    var payload = parseLogMessage(msg);
                                    if(payload) {
                                        callback(payload);
                                    } else {
                                        console.error("Invalid log message received, skipping it");
                                    }                               
                                } catch (err) {
                                    console.error("Invalid JSON which was unexpected here. Terminating processing of this request");
                                    return;
                                }
                                startIdx = msgEnd + 1;
                            }
                        }
                    }
                    return chunkHandler();
                }).then(x => console.log("Sfsdf", x)).catch(err => {
                    console.error("Error reading chunks", err);
                });
            }
            chunkHandler();
        } else {
            console.error("Non ok response received", response);
        }
    }).catch(err => {
        console.error("Error in connection", err);
    });
}


dgrepFetcher(url, callback);