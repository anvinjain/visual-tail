var Bogey = require('../lib/bogey');
var DgrepToPong = require('./dgrep-to-pong');
var PongPayload = require('../lib/vis/pong/payload');

class VaradhiConsumerMessages {
  constructor(container, api, appId, searchStr, messageObj) {
    this.messageObj = messageObj;
    this.bogey = new Bogey(container, null);
    this.pipeline = new DgrepToPong(this.bogey, api, appId, searchStr);
    this.pipeline.setSampling(0.01);
  }

  run() {
    this.pipeline.run(this.getTransformer());
  }

  getTransformer() {
    var re = /^Response status to call (.+) is (\d+) and the call took (\d+)ms/;
    return function(msg) {
      if(msg.message == "obj" && msg.object[this.messageObj] && msg.object[this.messageObj].msg) {
          var log = msg.object[this.messageObj].msg;
          var matches = re.exec(log);
          if(matches != null) {
            return new PongPayload(matches[2], matches[1], msg.sndr);
          }
      }
      console.debug("Cannot transform ", msg);
      return null;
    }.bind(this);
  }

}

module.exports = VaradhiConsumerMessages;