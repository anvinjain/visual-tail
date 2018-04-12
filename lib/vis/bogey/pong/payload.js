var Payload = function(status, uri, clientIp) {
  this.status = status;
  this.uri = uri;
  this.clientIp = clientIp;
}

module.exports = Payload;