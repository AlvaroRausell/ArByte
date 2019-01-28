var io = require("socket.io").listen(3000);
var ss = require("socket.io-stream");
var path = require("path");
var fs = require("fs-extra");
var fsr = require("fs");
const { exec } = require('child_process');
const watch = require('watch');
var connected_sockets = [];

const _MS = 1000;
create_server_monitor();


const child = exec(`node ${__dirname + "/../drives/drives.js"}`)
child.stdout.on('data', (data) => { console.log(`drivers.js stdout>${data}`) })
child.stderr.on('data', (data) => { console.log(`drivers.js stderr>${data}`) })


async function create_server_monitor() {
  watch.createMonitor(__dirname + "/files", function (monitor) {
    monitor.files[__dirname + "/files" + '.zshrc'];
    monitor.on("created", async function (f, stat) {
      console.log("server found new file at : "+f);
      
      if (path.extname(f) == "") {//directory
        console.log("substring gives: "+path.basename(f).substring(0, 3));
        
        if (path.basename(f).substring(0, 3) === "USB") {
          io.emit("create_dir", "/files/"+path.basename(f))
          await sleep(500);
          fs.readdirSync(f).forEach(file => {
            var fi = path.basename(f) + "/" + file
            console.log(fi);
            
           io.emit("receive_new_file", {name:fi})
            
          })
        }
      }
    });
  });
}

io.on("connection", function (socket) {

  connected_sockets.push(socket);


  /*var code;
  var users;
 
  ss(socket).on("codeGeneration", function(numberOfusers){
    code=Math.random(10000);
    users=numberOfusers;
  })
 
  ss(socket).on("joinRequest", function(addr,inputCode){
    console.log(`UNMOUNTING ${drive}`);
    exec(`sudo umount ${drive}`, (err, stdout, stderr) => {
        if (err) {
            console.log(stderr);
            return;
       
    console.log(`UNMOUNTING ${drive}`);
    exec(`sudo umount ${drive}`, (err, stdout, stderr) => {
        if (err) {
            console.log(stderr);
            return;
       
    if(inputCode==code)
    {
      fsr.appendFile('macs.txt', addr);
    }
    else {
        ss(socket).emit("exit");
    }
  });*/

  ss(socket).on("create_dir", async function (currentDir) {
    ss(socket).emit("create_dir", currentDir);
    currentDir = __dirname + currentDir;
    await exec(`mkdir -p ${currentDir}`);
    connected_sockets.forEach((s) => {
      async function f(so) {
        await sleep(_MS);
        console.log("SENT");
        so.emit('create_dir', currentDir.replace(__dirname, ""));
      }
      if (s.id != socket.id)
        f(s);
    });
  });
/*
  ss(socket).on("login", function (addr) {
    console.log(addr)
    fsr.stat('macs.txt', function (err, stat) {
      if (err == null) {
        fsr.readFile('macs.txt', function (err, data) {
          if (data.indexOf(addr) < 0) {
            ss(socket).emit("exit");
          }
        });
      }
      else if (err.code === 'ENOENT') {
        fsr.writeFile('macs.txt', addr + "\n", function (err) {
          if (err) {
            return console.log(err);
          }
          console.log("The file was saved!");
        });
      }
      else {
        ss(socket).emit("exit");
      }
    });
  });

*/
  console.log("connected");

  ss(socket).on("request_file", async function (data) {
    console.log("data is:", data);

    var filename = data.name;
    var stream = ss.createStream();

    ss(socket).emit("new_file", stream, filename);
    var readStream = fs.createReadStream("files/" + filename)
    await readStream.pipe(stream);
  })

  //CREATE NEW FILE
  ss(socket).on("create_file", async function (stream, data) {

    console.log(`creating new file with name ${"files/" + data.name}`);
    var filename = data.name
    console.log(filename);
    await stream.pipe(fs.createWriteStream("files/" + filename));
    console.log("Waiting 5s .......");
    connected_sockets.forEach((s) => {
      async function f(so) {
        await sleep(_MS);
        so.emit('receive_new_file', { name: filename })
      }
      if (s.id != socket.id)
        f(s);
    });
  });
  //UPDATE EXISTING FILE
  ss(socket).on("update_file", async function (stream, data) {
    let filename = data.name;
    //remove old filefiles/" + filename)
    console.log(`removing file at path ${filename}`);

    fs.remove(filename).then(
      async () => {
        console.log(`updating file at path ${filename}`);
        await sleep(_MS)
        await stream.pipe(fs.createWriteStream("files/" + filename));
        connected_sockets.forEach((s) => {
          async function f(so) {

            await sleep(_MS);
            so.emit('receive_new_file', { name: filename })
          }
          if (s.id != socket.id)
            f(s);
        });
      }
    )
      .catch(err => {
        console.log("error!");
        console.error(err)
      })
  });
  //REMOVE FILE
  ss(socket).on("remove_file", function (data) {
    var filename = data.name
    console.log(`removing new file with name ${data.name}`);
    fs.remove(__dirname+"/files"+data.name).then(
      () => { io.emit('remove_file', { name: data.name }) }
    )
      .catch(err => {
        console.error(err)
      })
  });
});


function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}


var express = require("express");
var http = require("http");
var socketio = require("socket.io");
var app = express();
var server = http.Server(app);
server.listen(3016);
const io45 = socketio(server);

io45.on("connection", response => {
 const mac = response.handshake.query.mac;
 console.log(mac);
 fs.readFile("./macs.txt", (err, data) => {
   if (!err) {
     if (data.indexOf(mac) >= 0) io45.emit("confirmation", true);
   } else if (err.code === "ENOENT") {
     fsr.writeFile("macs.txt", mac + "\n", function(err) {
       if (err) {
         return console.log(err);
       }
       getmac.getMac((err, address) => io45.emit("mac", address));
       console.log("The file was saved!");
     });
   } else {
     ss(socket).emit("confirmation", false);
   }
 });
});