//Init for phaser engine™¡
window.PIXI = require('phaser/build/custom/pixi');
window.p2 = require('phaser/build/custom/p2');
window.Phaser = require('phaser/build/custom/phaser-split');

var Bogey = require('./lib/bogey');
var Pong = require('./lib/vis/pong');
var DgrepFetcher = require('./lib/ds/dgrep');
var PongPayload = require('./lib/vis/pong/payload');
var $ = require('jquery');

var dgrepApi = "10.47.5.141";
var appId = "fk-prof";
var messageObj = "fk-prof-backend_request";
var searchStr = "obj@" + messageObj;

var container = $('div.bogey-visualization-container').get(0);
var bogey = new Bogey(container, null);
Pong.run(bogey);

var getCallback = function() {
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

var transformer = function(msg) {
    if(msg.message == "obj" && msg.object[messageObj]) {
        var log = msg.object[messageObj];
        return new PongPayload(log.status, log.verb + " " + log.url, log.client_ip);
    }
    console.log("Cannot transform ", msg);
    return null;
}

var url = "http://" + dgrepApi + "/query?app_id=" + appId + "&substr=" + searchStr;
var callback = getCallback();
var fetcher = new DgrepFetcher(url, transformer, callback);
fetcher.runWithRepeat();


// fetcher.run().then(x => {
//     console.log("hooba", x);
// }).catch(err => {
//     console.log("dooba");
//     callback({type: "error", msg: "Error while doing fetch request " + this.url, err: err});
// });
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


// function parseLogMessage(msg) {
//     if(msg.message == "obj" && msg.object["fkpbackend_request"]) {
//         var log = msg.object["fkpbackend_request"];
//         return {
//             host: msg.host,
//             host_ip: msg.sndr,
//             parsed: {
//                 ip: [ log.client_ip ],
//                 uri: [ log.verb + " " + log.url ],
//                 statusCode: [ log.status.toString() ]
//             }
//         }
//     }
//     return null;
// }

// function dgrepFetcher(url, callback) {
//     fetch(url, {method: 'GET', mode: 'cors'}).then(response => {
//         if(response.ok) {
//             var reader = response.body.getReader();
//             var decoder = new TextDecoder();
//             var partial = false;
//             function chunkHandler() {
//                 return reader.read().then(result => {
//                     if(result.done) {
//                         console.log("Chunks are done, restart fetch");
//                         return;
//                     }
//                     var chunk = decoder.decode(result.value || new Uint8Array, {stream: !result.done});
//                     var startIdx = 0, msg;
//                     if(partial) {
//                         var partialEnd = chunk.indexOf("}{", startIdx);
//                         if(partialEnd == -1) {
//                             console.log("Another partial received in entirety, skipping chunk");
//                             startIdx = chunk.length;
//                         } else {
//                             console.log("Partial dropped from the start of chunk");
//                             startIdx = partialEnd + 1;
//                         }
//                     }
//                     if(startIdx < chunk.length) {
//                         if (chunk[startIdx] != '{') {
//                             console.error("Invalid chunk, terminating processing of this request");
//                             reader.cancel();
//                             return;
//                         }
//                         while(true) {
//                             if(startIdx == chunk.length) {
//                                 console.log("Processing complete for chunk");
//                                 break;
//                             }
//                             var msgEnd = chunk.indexOf("}{", startIdx);
//                             if(msgEnd == -1) {
//                                 try {
//                                     msg = JSON.parse(chunk.substring(startIdx));
//                                     partial = false;
//                                     var payload = parseLogMessage(msg);
//                                     if(payload) {
//                                         callback(payload);
//                                     } else {
//                                         console.warn("Invalid log message received, skipping it");
//                                     }
//                                 } catch (err) {
//                                     console.log("Invalid JSON, partial received at the end. Dropping it");
//                                     partial = true;
//                                 }
//                                 startIdx = chunk.length;
//                             } else {
//                                 try {
//                                     msg = JSON.parse(chunk.substring(startIdx, msgEnd + 1));
//                                     var payload = parseLogMessage(msg);
//                                     if(payload) {
//                                         callback(payload);
//                                     } else {
//                                         console.warn("Invalid log message received, skipping it");
//                                     }                               
//                                 } catch (err) {
//                                     console.error("Invalid JSON which was unexpected here. Terminating processing of this request");
//                                     reader.cancel();
//                                     return;
//                                 }
//                                 startIdx = msgEnd + 1;
//                             }
//                         }
//                     }
//                     return chunkHandler();
//                 }).catch(err => {
//                     console.error("Error reading chunks", err);
//                 });
//             }
//             chunkHandler();
//         } else {
//             console.error("Non ok response received", response);
//         }
//     }).catch(err => {
//         console.error("Error in connection", err);
//     });
// }

// dgrepFetcher(url, callback);