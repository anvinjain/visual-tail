var $ = require('jquery');

class Announces {
  constructor(container) {
    // announce expiry routine will run periodically after expiryMs
    // should be greater than announce interval configured on clients
    this.expireMs = 1 * 60 * 1000;

    this.container = container;
    this.db = [];

    this.domTemplates = {
      ih: $("#ih-container-tmpl"),
      peer: $("#peer-tmpl")
    }

    setInterval(function() {
      this.expire();
    }.bind(this), this.expireMs);
  }

  expire() {
    var expireThreshold = new Date(new Date().getTime() - this.expireMs);
    // console.log("expiring announces", new Date(), expireThreshold, this.db.length);

    this.db.forEach(elem => {
      // console.log("be", elem.ih, elem.peers.length);
      elem.peers = elem.peers.filter(p => {
        if (p.ts >= expireThreshold) {
          return true;
        }
        p.dom.remove();
        return false;
      });
      // console.log("ae", elem.ih, elem.peers.length);
    });
    this.db = this.db.filter(elem => {
      if(elem.peers.length > 0) {
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

      let ihEntry = this.db.find(entry => entry.ih == data.infohash);
      if(ihEntry == null) {
        ihEntry = {
          ih: data.infohash,
          peers: []
        };
        ihEntry.dom = this.domInsertInfohash(this.container, ihEntry);
        this.db.push(ihEntry);
      }

      let pEntry = ihEntry.peers.find(p => p.ip == data.peerIP);
      if(pEntry == null) {
        pEntry = {
          ip: data.peerIP
        };
        pEntry.dom = this.domInsertPeer(ihEntry.dom, pEntry);
        ihEntry.peers.push(pEntry); 
      }

      pEntry.left = data.leftBytes;
      pEntry.up = data.upBytes;
      pEntry.down = data.downBytes;
      pEntry.ts = data.ts;
      this.domUpdatePeer(pEntry.dom, pEntry);

    }.bind(this);
  }

  domInsertInfohash(parent, ihEntry) {
    let dom = $('<div class="ih-container"></div>');
    dom.html(this.domTemplates.ih.html());
    $(dom.find(".ih-header").get(0)).text(ihEntry.ih);
    $(parent).append(dom);
    return dom;
  }

  domInsertPeer(parent, pEntry) {
    let container = $(parent.find(".ih-body").get(0));
    let dom = $('<div class="peer"></div>');
    dom.html(this.domTemplates.peer.html());
    $(dom.find(".peer-ip").get(0)).text(pEntry.ip);
    $(container).append(dom);
    return dom;
  }

  domUpdatePeer(dom, pEntry) {
    let leftMB = Math.ceil((pEntry.left * 1.0) / 1024 / 1024);
    let downMB = Math.ceil((pEntry.down * 1.0) / 1024 / 1024);
    let upMB = Math.ceil((pEntry.up * 1.0) / 1024 / 1024);

    $(dom.find(".peer-left").get(0)).text(leftMB + " MB");
    $(dom.find(".peer-down").get(0)).text(downMB + " MB");
    $(dom.find(".peer-up").get(0)).text(upMB + " MB");

    if(pEntry.left == 0) {
      dom.removeClass("leecher");
      dom.addClass("seeder");
    } else {
      dom.removeClass("seeder");
      dom.addClass("leecher");
    }
  }
}

module.exports = Announces;