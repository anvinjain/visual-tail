var Bogey = require('../lib/bogey');
var DgrepToPong = require('./dgrep-to-pong');
var PongPayload = require('../lib/vis/pong/payload');

class FkProfRequests {
  constructor(container, api, appId, messageObj) {
    this.messageObj = messageObj;
    this.bogey = new Bogey(container, null);
    this.pipeline = new DgrepToPong(this.bogey, api, appId, "obj@" + this.messageObj);
    this.pipeline.enableSmoothening();
  }

  run() {
    this.pipeline.run(this.getTransformer());
  }

  getTransformer() {
    return function(msg) {
      if(msg.message == "obj" && msg.object[this.messageObj]) {
          var log = msg.object[this.messageObj];
          return new PongPayload(log.status, log.verb + " " + log.url, log.client_ip);
      }
      console.log("Cannot transform ", msg);
      return null;
    }.bind(this);
  }

}

module.exports = FkProfRequests;