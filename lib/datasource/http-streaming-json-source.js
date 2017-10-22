var fetch = require('isomorphic-fetch');

/**
 * Parses data sent over http where response stream is contiguous JSON objects (without separated by any character)
 * Drops JSON messages which are received partially across chunks
 */
class HttpStreamingJsonSource {
  constructor(url, transformer, callback, repeat) {
    this.repeat = repeat;
    this.url = url;
    this.transformer = transformer;
    this.callback = callback;
  }

  runWithRepeat() {
    this.run().then(() => {
      setTimeout(() => this.runWithRepeat(), 0);
    }).catch(err => {
      this.callback({type: "error", msg: err.message, err: err});
      setTimeout(() => this.runWithRepeat(), 5000);
    });
  }

  run() {
    return fetch(this.url, {method: 'GET', mode: 'cors'}).then(response => {
      if(response.ok) {
        var reader = response.body.getReader();
        var chunkHandler = this.getChunkHandler();

        function responseReader() {
          return reader.read()
            .then(chunkHandler)
            .then(result => result ? true : responseReader());   
        }
        return responseReader();
      } else {
        throw new Error("Non ok response received from " + this.url);
      }
    });
  }

  // Returns chunk handler with following return codes:
  // false to indicate further chunks can be processed
  // true to indicate all chunks have been processed
  // Throws error to indicate a non-recoverable state and to terminate chunk processing
  getChunkHandler() {
    console.log("Instantiating chunk handler");
    var decoder = new TextDecoder();
    var partial = false;
    return (data) => {
      if(data.done) {
        return true;
      }

      var chunk = decoder.decode(data.value || new Uint8Array, {stream: !data.done});
      var startIdx = 0, msg;
      if(partial) {
        var partialEnd = chunk.indexOf("}{", startIdx);
        if(partialEnd == -1) {
            console.log("Another partial received in entirety, skipping chunk");
            startIdx = chunk.length;
        } else {
            console.log("Partial dropped from the start of chunk");
            startIdx = partialEnd + 1;
        }
      }

      if(startIdx < chunk.length) {
        if (chunk[startIdx] != '{') {
            throw new Error("Invalid chunk received, cannot process this request further");
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
                this.callback({ type: "data", msg: this.transformer(msg)});
            } catch (err) {
                console.log("Invalid JSON, partial received at the end. Dropping it");
                partial = true;
            }
            startIdx = chunk.length;
          } else {
            try {
                msg = JSON.parse(chunk.substring(startIdx, msgEnd + 1));
                this.callback({ type: "data", msg: this.transformer(msg)});
            } catch (err) {
                throw new Error("Invalid JSON which was unexpected here");              
            }
            startIdx = msgEnd + 1;
          }
        }
      }
      return false;
    };
  }

}

module.exports = HttpStreamingJsonSource;