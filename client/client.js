const fs = require("fs-extra");
const {exec} = require('child_process');
const io = require("socket.io-client");
const ss = require("socket.io-stream");
const socket = io.connect("http://1f2eebba.ngrok.io");
const watch = require('watch');
const macaddress = require('node-macaddress');
const path = require("path")
const FILES_PATH = __dirname + '/files';


var monitor = null;

initialise_listeners();
start_frontend();
start_monitor();


/**
 * Mac address login request to server
 */
macaddress.all(function(err, all) {
    ss(socket).emit("login", Object.entries(all)[0][1].mac);
});

/**
 * LISTENERS FOR UPDATES FROM SERVER
 */
function initialise_listeners() {
    //CREATE NEW FILE
    socket.on("receive_new_file", function(data) {
        console.log("data name in client is:" + data.name);
        var filename = data.name;
        ss(socket).emit("request_file", {
            name: filename
        })
    });
    ss(socket).on("new_file", async function(stream, filename) {
        await monitor.stop();
        console.log("new_file command arrived");
        await stream.pipe(fs.createWriteStream(FILES_PATH + filename));
        await sleep(1000);
        await start_monitor();
    })

    //REMOVE FILE
    socket.on("remove_file", function(data) {
        console.log(`removing new file with name ${data.name}`);
        fs.remove(FILES_PATH + data.name)
            .catch(err => {
                console.error(err)
            })
    });

    // CREATE A NEW DIRECTORY
    socket.on("create_dir", async function(currentDir) {
        currentDir = FILES_PATH + currentDir;
        await exec(`mkdir -p ${currentDir}`);
    });

    ss(socket).on("exit", function() {
        socket.disconnect();
    })
}

/**
 * Start a monitor which checks for file changes in the specified directory
 * and emits signal to server to request synchronisation
 */
function start_monitor() {
    return new Promise(resolve => {
        watch.createMonitor(FILES_PATH, function(m) {
            monitor = m;
            //there can only be one monitor active at one time
            monitor.files[FILES_PATH + '.zshrc'];


            /**
             * File or directory created
             */
            monitor.on("created", async function(f, stat) {
                var stream = ss.createStream();
                console.log(`created event at location:${f}`);
                var allDir = path.dirname(f);
                await exec(`mkdir -p ${allDir}`);
                await sleep(1000);
                var filename = path.basename(f);
                if (path.extname(f) == "") //directory
                {
                    var currentDir = (allDir + "/" + filename).replace(__dirname, "");
                    console.log("Directory: " + currentDir);
                    ss(socket).emit("create_dir", currentDir);
                    await exec(`mkdir -p ${currentDir}`);
                } else //file
                {
                    ss(socket).emit("create_file", stream, {
                        name: f.replace(__dirname, "").replace("/files", "")
                    });
                    var readStream = fs.createReadStream(f);
                    await readStream.pipe(stream);
                }
            });

            /**
             * File or directory changed
             */
            monitor.on("changed", async function(f, curr, prev) {

                var stream = ss.createStream();
                console.log(`changed event at location:${f}`);
                var filename = path.basename(f);

                if (path.extname(f) == "") //directory
                {
                    //todo: Write code for directory name change
                } else { //file
                    ss(socket).emit("update_file", stream, {
                        name: f.replace(__dirname, "").replace("/files", "")
                    });
                    var readStream = fs.createReadStream(f);
                    await readStream.pipe(stream);
                }
            })

            /**
             * File or directory removed
             */
            monitor.on("removed", function(f, stat) {
                console.log(`removed event at location:${f}`);
                var filename = path.basename(f)
                console.log(filename);
                ss(socket).emit("remove_file", {
                    name: f.replace(__dirname, "").replace("/files", "")
                });
            })
        })
    })
}

/**
 * Executes scripts for frontend connection
 */
function start_frontend() {
    exec('sudo node frontend_client.js') //todo: use module requests
}

/**
 * Thread sleeps for specified ms if called in
 * async function
 * @param {seconds to wait} ms 
 */
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}