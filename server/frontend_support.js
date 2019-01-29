var express = require("express");
var http = require("http");
var socketio = require("socket.io");
var app = express();
var server = http.Server(app);
server.listen(3016);
const io45 = socketio(server);
var getmac = require("getmac")
io45.on("connection", response => {
  const mac = response.handshake.query.mac;

  fs.readFile("./macs.txt", (err, data) => {
    if (!err) {
      if (data.indexOf(mac) >= 0) io45.emit("confirmation", true);
    } else if (err.code === "ENOENT") {
      fsr.writeFile("macs.txt", mac + "\n", function (err) {
        if (err) {
          return console.log(err);
        }
        getmac.getMac((err, address) => io45.emit("mac", address));
        /*       
        console.log("!!! NEW USER HAS BEEN REGISTERED !!!");
          console.log('Mac Address => ', mac);
          console.log('passcode_id => ','34bjf9afng54');    
         
        */
      });
    } else {
      ss(socket).emit("confirmation", false);
    }
  });
});
