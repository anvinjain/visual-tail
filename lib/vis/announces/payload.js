var Payload = function(peerIP, infohash, leftBytes, downBytes, upBytes, ts) {
  this.peerIP = peerIP;
  this.infohash = infohash;
  this.leftBytes = leftBytes;
  this.downBytes = downBytes;
  this.upBytes = upBytes;
  this.ts = ts;
}

module.exports = Payload;