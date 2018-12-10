var $ = require('jquery');

// groupBy = infohash|peer
class Announces {
  constructor(container, groupBy) {
    // announce expiry routine will run periodically after expiryMs
    // should be greater than announce interval configured on clients
    this.expireMs = 1 * 60 * 1000;

    this.container = container;
    this.groupBy = groupBy === "peer" ? "peer" : "infohash";
    this.db = [];

    this.domTemplates = {
      l1: $("#l1-tmpl"),
      l2: $("#l2-tmpl")
    }

    $("#groupby-infohash").click(() => window.location.href = "/tracker_announces.html?app=shatabdi&group=infohash");
    $("#groupby-peer").click(() => window.location.href = "/tracker_announces.html?app=shatabdi&group=peer");

    if (this.groupBy == "infohash") {
      $("#groupby-infohash").addClass("selected");
    } else {
      $("#groupby-peer").addClass("selected");
    }

    setInterval(function() {
      this.expire();
    }.bind(this), this.expireMs);
  }

  expire() {
    var expireThreshold = new Date(new Date().getTime() - this.expireMs);
    // console.log("expiring announces", new Date(), expireThreshold, this.db.length);

    this.db.forEach(elem => {
      // console.log("be", elem.l1, elem.vals.length);
      elem.vals = elem.vals.filter(v => {
        if (v.ts >= expireThreshold) {
          return true;
        }
        v.dom.remove();
        return false;
      });
      // console.log("ae", elem.l1, elem.vals.length);
    });
    this.db = this.db.filter(elem => {
      if(elem.vals.length > 0) {
        return true;
      }
      elem.dom.remove();
      return false;
    });
    // console.log("expired announces", this.db.length);
  }

  requestHandler() {
    return function(data) {
      //console.log("announce entry", data);
      let l1data = data.infohash, l2data = data.peerIP;
      if(this.groupBy == "peer") {
        l1data = data.peerIP;
        l2data = data.infohash;
      }

      let l1entry = this.db.find(entry => entry.l1 == l1data);
      if(l1entry == null) {
        l1entry = {
          l1: l1data,
          vals: []
        };
        l1entry.dom = this.domInsertL1(this.container, l1entry);
        this.db.push(l1entry);
      }

      let l2entry = l1entry.vals.find(v => v.l2 == l2data);
      if(l2entry == null) {
        l2entry = {
          l2: l2data
        };
        l2entry.dom = this.domInsertL2(l1entry.dom, l2entry);
        l1entry.vals.push(l2entry); 
      }

      l2entry.left = data.leftBytes;
      l2entry.up = data.upBytes;
      l2entry.down = data.downBytes;
      l2entry.ts = data.ts;
      this.domUpdateL2(l2entry.dom, l2entry);

    }.bind(this);
  }

  domInsertL1(parent, l1entry) {
    let dom = $('<div class="l1-container"></div>');
    dom.html(this.domTemplates.l1.html());
    $(dom.find(".l1-header").get(0)).text(l1entry.l1);
    $(parent).append(dom);
    return dom;
  }

  domInsertL2(parent, l2entry) {
    let container = $(parent.find(".l1-body").get(0));
    let dom = $('<div class="l2-container"></div>');
    dom.html(this.domTemplates.l2.html());
    $(dom.find(".l2-header").get(0)).text(l2entry.l2);
    $(container).append(dom);
    return dom;
  }

  domUpdateL2(dom, l2entry) {
    let leftMB = Math.ceil((l2entry.left * 1.0) / 1024 / 1024);
    let downMB = Math.ceil((l2entry.down * 1.0) / 1024 / 1024);
    let upMB = Math.ceil((l2entry.up * 1.0) / 1024 / 1024);

    $(dom.find(".torrent-left").get(0)).text(leftMB + " MB");
    $(dom.find(".torrent-down").get(0)).text(downMB + " MB");
    $(dom.find(".torrent-up").get(0)).text(upMB + " MB");

    if(l2entry.left == 0) {
      dom.removeClass("leecher");
      dom.addClass("seeder");
    } else {
      dom.removeClass("seeder");
      dom.addClass("leecher");
    }
  }
}

module.exports = Announces;