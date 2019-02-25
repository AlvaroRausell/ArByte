var wifi = require("node-wifi");
var express = require("express");
var http = require("http");
var getmac = require("getmac");
var socketio = require("socket.io");
var app = express();
var server = http.Server(app);
server.listen(3016);
const io = socketio(server);

io.on("connection", response => {
  const mac = response.handshake.query.mac;
  console.log(mac);

  io.emit("confirmation", mac === "ac:de:48:00:11:22");
});
