var HttpStreamingJsonSource = require('../lib/datasource/http-streaming-json-source');
var Announces = require('../lib/vis/announces');
var AnnouncePayload = require('../lib/vis/announces/payload');

class TrackerAnnounces {
  constructor(container, api, appId, groupBy) {
    this.url = api + "?app_id=" + appId + "&substr=obj@chihaya";
    this.announces = new Announces(container, groupBy);
  }

  run() {
    var datasource = new HttpStreamingJsonSource(this.url, this.transform(), this.getHandler());
    datasource.runWithRepeat();
  }

  transform() {
    return function(msg) {
      //console.log("hoola", msg);
      if(msg.message == "obj" && msg.object["chihaya"]) {
        var log = msg.object["chihaya"];
        if (log.msg == "generated announce response" && log.req) {
          var req = log.req;
          return new AnnouncePayload(req.peer.IP, req.infoHash, req.left, req.downloaded, req.uploaded, new Date(log.time));
        }
        console.error("Cannot transform, invalid announce response ", msg);
        return null;
      }
      console.error("Cannot transform, invalid log ", msg);
      return null;
    }.bind(this);
  }

  getHandler() {
    let handler = this.announces.requestHandler();
    return function(entry) {
      switch(entry.type) {
        case "data":
          if(entry.msg) {
            setTimeout(() => handler(entry.msg), 0);
          }
          break;
        case "error":
            console.error(entry);
            break;
        case "stat_chunk":
            break;
        default:
            console.error("Not sure how to handle the emitted entry", entry);
      }
    }.bind(this);
  }
}

module.exports = TrackerAnnounces;