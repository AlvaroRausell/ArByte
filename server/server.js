const io = require("socket.io").listen(3000);
const ss = require("socket.io-stream");
const path = require("path");
const fs = require("fs-extra");
const {exec} = require('child_process');
const watch = require('watch');
var connected_sockets = []; //all connected clients
const _MS = 3000;
const FILES_PATH = __dirname + '/files';


show_welcome_message();
create_server_monitor();
initialise_drive_manager();
exec(`sudo rm macs.txt`); //remove previously accepted macs when server is started


/**
 * Initialise a file system monitor
 * which checks for new files
 */
async function create_server_monitor() {
    watch.createMonitor(FILES_PATH, function(monitor) {
        monitor.files[FILES_PATH + "/files" + '.zshrc'];
        monitor.on("created", async function(f, stat) {
            console.log("SERVER LOG >> FIND FILE AT : " + f);

            if (path.extname(f) == "") { //directory
                if (path.basename(f).substring(0, 3) === "USB") {
                    io.emit("create_dir", "/files/" + path.basename(f))
                    await sleep(500);
                    fs.readdirSync(f).forEach(file => {
                        var fi = path.basename(f) + "/" + file
                        console.log("FSYSTEM >> ", fi);

                        io.emit("receive_new_file", {
                            name: fi
                        })

                    })
                }
            }
        });
    });
}


/** 
 * All responses to client requests
 */
io.on("connection", function(socket) {

    connected_sockets.push(socket); //update connected sockets lists


    //--------------------------CLIENT CREATED DIRECTORY----------------------------------
    /**
     * When client creates a new directory,
     * update all other clients
     */
    ss(socket).on("create_dir", async function(currentDir) {
        ss(socket).emit("create_dir", currentDir);
        currentDir = __dirname + currentDir;
        await exec(`sudo mkdir -m 777 -p ${currentDir}`);
        connected_sockets.forEach((s) => {
            async function f(so) {
                await sleep(_MS);
                so.emit('create_dir', currentDir.replace(__dirname, ""));
            }
            if (s.id != socket.id)
                f(s);
        });
    });
    //--------------------------CLIENT REQUESTS FILE----------------------------------
    // Send back file if requested by client

    ss(socket).on("request_file", async function(data) {
        console.log("DATA IS BEING MOVED! D:  >> :", data);

        var filename = data.name;
        var stream = ss.createStream();

        ss(socket).emit("new_file", stream, filename);
        var readStream = fs.createReadStream("files/" + filename)
        await readStream.pipe(stream);
    })
    //--------------------------CLIENT CREATED FILE----------------------------------
    //When client creates a new file, update other clients

    ss(socket).on("create_file", async function(stream, data) {

        console.log(`FSYSTEM >>  ${"files/" + data.name}`);
        var filename = data.name
        await stream.pipe(fs.createWriteStream("files/" + filename));
        connected_sockets.forEach((s) => {
            async function f(so) {
                await sleep(_MS);
                so.emit('receive_new_file', {
                    name: filename
                })
            }
            if (s.id != socket.id)
                f(s);
        });
    });

    //--------------------------CLIENT UPDATED FILE----------------------------------
    //When client updates a file, update other clients
    ss(socket).on("update_file", async function(stream, data) {
        let filename = data.name;

        fs.remove(filename).then(
                async () => {
                    console.log(`FYSTEM >> UPDATING ${filename}`);
                    await sleep(_MS)
                    await stream.pipe(fs.createWriteStream("files/" + filename));
                    connected_sockets.forEach((s) => {
                        async function f(so) {

                            await sleep(_MS);
                            so.emit('receive_new_file', {
                                name: filename
                            })
                        }
                        if (s.id != socket.id)
                            f(s);
                    });
                }
            )
            .catch(err => {
                console.error(err)
            })
    });

    //--------------------------CLIENT REMOVED FILE----------------------------------
    //When client deletes a file, update other clients
    ss(socket).on("remove_file", function(data) {
        var filename = data.name
        console.log(`FSYSTEM >> REMOVING ${filename}`);
        fs.remove(__dirname + "/files" + data.name).then(
                () => {
                    io.emit('remove_file', {
                        name: data.name
                    })
                }
            )
            .catch(err => {
                console.error(err)
            })
    });
});

/** 
 * Start drive manager which checks for newly 
 * mounted USB drives
 */
function initialise_drive_manager() {
    const child = exec(`sudo node drives.js`)
    child.stdout.on('data', (data) => {
        console.log(`DRIVERS UTILITY LOG >>>>   ${data}`)
    })
    child.stderr.on('data', (data) => { console.log(`DRIVERS UTILITY LOG >>>>   ${data}`) })
}

/**
 * Logs welcome message
 */
function show_welcome_message() {

    console.log(
        `     
@authors: Alvaro Christine Danilo Mateusz




_______  ______    _______  __   __  _______  _______                          _______        _______        ____  
|   _   ||    _ |  |  _    ||  | |  ||       ||       |                        |  _    |      |  _    |      |    | 
|  |_|  ||   | ||  | |_|   ||  |_|  ||_     _||    ___|                        | | |   |      | | |   |       |   | 
|       ||   |_||_ |       ||       |  |   |  |   |___                         | | |   |      | | |   |       |   | 
|       ||    __  ||  _   | |_     _|  |   |  |    ___|                        | |_|   | ___  | |_|   | ___   |   | 
|   _   ||   |  | || |_|   |  |   |    |   |  |   |___                         |       ||   | |       ||   |  |   | 
|__| |__||___|  |_||_______|  |___|    |___|  |_______|                        |_______||___| |_______||___|  |___| 

                                         
`
    )
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