var Pong = require('../lib/vis/pong');
var HttpStreamingJsonSource = require('../lib/datasource/http-streaming-json-source');

class DgrepToPong {
  constructor(bogey, api, appId, searchStr) {
    this.api = api;
    this.appId = appId;
    this.searchStr = searchStr;
    this.url = "http://" + api + "/query?app_id=" + appId + "&substr=" + searchStr;
    this.smoothening = false;

    this.bogey = bogey;
    Pong.run(this.bogey);
  }

  enableSmoothening() {
    this.smoothening = true;
  }

  disableSmoothening() {
    this.smoothening = false;
  }

  run(transformer) {
    var datasource = new HttpStreamingJsonSource(this.url, transformer, this.getHandler());
    datasource.runWithRepeat();
  }

  getHandler() {
    var handler = this.bogey.requestHandler();

    //Params required for smoothening since http chunks give us log entries in batches and we want to space them out in visualization
    var batchStartTime = null, batchDuration = null, avgEntriesInBatch = null, entryCounter = 0;
    var bucketDuration = null, totalBuckets = null, minEntriesInBucket = null, modEntriesInBucket = null;

    function smootheningParams(elapsedSinceLastChunk) {
        batchStartTime = (new Date()).getTime();
        batchDuration = batchDuration ? (batchDuration + elapsedSinceLastChunk) / 2 : elapsedSinceLastChunk;
        avgEntriesInBatch = entryCounter > 0
            ? parseInt((entryCounter + (avgEntriesInBatch ? avgEntriesInBatch : entryCounter)) / 2)
            : avgEntriesInBatch ? avgEntriesInBatch : 1;
        entryCounter = 0;

        totalBuckets = parseInt(batchDuration / 10);
        if(avgEntriesInBatch < totalBuckets) {
            totalBuckets = avgEntriesInBatch;
            bucketDuration = parseInt(batchDuration / avgEntriesInBatch);
        } else {
            bucketDuration = 10;
        }

        minEntriesInBucket = parseInt(avgEntriesInBatch / totalBuckets);
        modEntriesInBucket = avgEntriesInBatch % totalBuckets;
    }

    function smootheningDelay() {
      var delay = 0;
      if(batchStartTime != null) {
        var currentTime = (new Date()).getTime();
        var elapsed = currentTime - batchStartTime;
        if(elapsed < batchDuration) {
          var currentBucket = parseInt(elapsed / bucketDuration);
          var expectedBucket = entryCounter <= modEntriesInBucket * (minEntriesInBucket + 1)
              ? parseInt((entryCounter - 1) / (minEntriesInBucket + 1))
              : modEntriesInBucket + parseInt((entryCounter - 1 - (modEntriesInBucket * (minEntriesInBucket + 1))) / minEntriesInBucket);
          if(expectedBucket < totalBuckets && currentBucket < expectedBucket) {
              delay = (expectedBucket - currentBucket) * bucketDuration;
          }
        }
      }
      return delay;
    }

    return function(entry) {
      switch(entry.type) {
        case "data":
            if(entry.msg) {
                entryCounter++;
                if(this.smoothening) {
                  setTimeout(() => handler(entry.msg), smootheningDelay());
                } else {
                  setTimeout(() => handler(entry.msg), 0);
                }
            } else { //error while transforming msg so received null
                console.warn("Invalid payload received, skipping it");
            }
            break;
        case "error":
            this.bogey.flashMessage(entry.msg, 2000);
            console.error(entry.err);
            break;
        case "stat_chunk":
            if(this.smoothening) {
              smootheningParams(entry.msg.elapsed);
            }
            break;
        default:
            console.error("Not sure how to handle the emitted entry", entry);
      }
    }.bind(this);
  }
}

module.exports = DgrepToPong;