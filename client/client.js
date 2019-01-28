const fs = require("fs-extra");
const { exec } = require('child_process');
const io = require("socket.io-client");
const ss = require("socket.io-stream");
const socket = io.connect("http://1f2eebba.ngrok.io");
const watch = require('watch');
const os = require('os').networkInterfaces();
const macaddress = require('node-macaddress');
const path = require("path")
var monitor = null;
start_monitor();

/**
 * CHECK UPDATES FROM SERVER
 */

//CREATE NEW FILE
socket.on("receive_new_file", function (data) {
  console.log("data name in client is:" + data.name);
  var filename = data.name;

  ss(socket).emit("request_file", { name: filename })
});

//UPDATE FILE
ss(socket).on("new_file", async function (stream, filename) {
  await monitor.stop();
  console.log("new_file command arrived");
  
  await stream.pipe(fs.createWriteStream("files/" + filename));
  await sleep(1000);
  await start_monitor();
})

//REMOVE FILE
socket.on("remove_file", function (data) {
  console.log(`removing new file with name ${data.name}`);
  fs.remove(__dirname+"/files"+data.name)
    .catch(err => {
      console.error(err)
    })
});

socket.on("create_dir", async function(currentDir){
  currentDir=__dirname+currentDir;
  await exec(`mkdir -p ${currentDir}`);
 });

//monitor checks for file changes
function start_monitor() {
  return new Promise(resolve => {
    watch.createMonitor(__dirname + "/files", function (m) {
      monitor = m;
      monitor.files[__dirname + "/files" + '.zshrc'];
      monitor.on("created", async function (f, stat) {
        var stream = ss.createStream();
        console.log(`created event at location:${f}`);
        var allDir = path.dirname(f);
        await exec(`mkdir -p ${allDir}`);
        await sleep(1000);
        var filename = path.basename(f);
        if(path.extname(f)=="")//directory
        {
          var currentDir = (allDir+"/"+filename).replace(__dirname,"");
          console.log("Directory: "+currentDir);
          ss(socket).emit("create_dir",currentDir);
          await exec(`mkdir -p ${currentDir}`);
        }
        else //file
        {
          ss(socket).emit("create_file", stream, { name: f.replace(__dirname, "").replace("/files","") });
          var readStream = fs.createReadStream(f);
          await readStream.pipe(stream);
        }
      });

      monitor.on("changed",async function (f, curr, prev) {

        var stream = ss.createStream();
        console.log(`changed event at location:${f}`);
        var filename = path.basename(f);

        if(path.extname(f)=="")//directory
        {
          /*
          var currentDir = (allDir+"/"+filename).replace(__dirname,"");
          console.log("Directory: "+currentDir);
          ss(socket).emit("create_dir",currentDir);
          await exec(`mkdir -p ${currentDir}`);*/
        }
        else //file
        {
          ss(socket).emit("update_file", stream, { name: f.replace(__dirname, "").replace("/files","") });
          var readStream = fs.createReadStream(f);
          await readStream.pipe(stream);
        }
      })
      
      monitor.on("removed", function (f, stat) {
        console.log(`removed event at location:${f}`);
        var filename = path.basename(f)
        console.log(filename);
        ss(socket).emit("remove_file", { name: f.replace(__dirname,"").replace("/files","") });
      })
    })


    macaddress.all(function (err, all) {
      ss(socket).emit("login", Object.entries(all)[0][1].mac);
    });


    //console.log(fs.readFile('/etc/wpa_supplicant/wpa_supplicant.conf'));
    ss(socket).on("exit", function () {
      socket.disconnect();
    })
  })
}






function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

//-----------------------------

var wifi = require("node-wifi");
var express = require("express");
var http = require("http");
var getmac = require("getmac");
var socketio = require("socket.io");
var app = express();
var server = http.Server(app);
server.listen(3005);
const server2 = http.Server(app);
server2.listen(3006);
var server3 = http.Server(app);
server3.listen(3007);
const ioo = socketio(server);

/*exports.default = function printWhatever(thingy) {
 console.log("Hey", thingy);
};

*/
const local = require("local-devices");

//fs.readFile("mac.json", "utf8");

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

var json = require("./config.json");
var mac = json.device.mac;

var devices = [];
async function getIPByMac(mac, cb) {
 devices = await local();
 console.log(devices);

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

const io3 = socketio(server3);

io3.on("connection", data => {
 getmac.getMac((err, address) => io3.emit("mac", address));
});
ioo.on("connection", data => {
 console.log("connected!");
 wifi.init({
   iface: null // network interface, choose a random wifi interface if set to null
 });
 wifi.scan(function(err, networks) {
   if (err) {
     ioo.emit("error", err);
   } else {
     console.log("networks!");
     ioo.emit("networks", networks);
   }
 });
 ioo.on("request", data => {
   console.log("requested");
   // Scan networks
 });
});

// Initialize wifi module
// Absolutely necessary even to set interface to null