var wifi = require("node-wifi");
var express = require("express");
var http = require("http");
var getmac = require("getmac");
var socketio = require("socket.io");
var app = express();
var server = http.Server(app);
server.listen(3001);
const io = socketio(server);

const client = require("socket.io-client");

socketCli = client.connect(
  "http://localhost:3016",
  mac
);
/*exports.default = function printWhatever(thingy) {
  console.log("Hey", thingy);
};

*/
const local = require("local-devices");
const fs = require("fs");
//fs.readFile("mac.json", "utf8");

const server2 = http.Server(app);
server2.listen(3002);

const io2 = socketio(server2);
io2.on("connection", socket => {
  console.log("Whooo");
  getIPByMac(mac, ip => {
    console.log(ip);
    if (ip !== -1) {
      console.log(ip);
      io2.emit("ip", ip);
    } else {
      io2.emit("ip", -1);
    }
  });
});

var json = require("../../../config.json");
var mac = json.device.mac;

var devices = [];
async function getIPByMac(mac, cb) {
  devices = await local();
  for (var i = 0; i < devices.length; i++) {
    var device = devices[i];
    console.log(device.mac, "vs", mac);
    if (device.mac === mac) {
      return cb(device.ip);
    }
  }
  return cb(-1);
}
//exports.default = getIPByMac;
var server3 = http.Server(app);
server3.listen(3004);
const io3 = socketio(server3);

io3.on("connection", data => {
  console.log("Hellooooo");
  getmac.getMac((err, address) => io3.emit("mac", address));
});
io.on("connection", data => {
  console.log("connected!");
  wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
  });
  wifi.scan(function(err, networks) {
    if (err) {
      io.emit("error", err);
    } else {
      console.log("networks!");
      io.emit("networks", networks);
    }
  });
  io.on("request", data => {
    console.log("requested");
    // Scan networks
  });
});

// Initialize wifi module
// Absolutely necessary even to set interface to null
