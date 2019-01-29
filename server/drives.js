var usbDetect = require('usb-detection');
var drivelist = require('drivelist');
const {exec} = require('child_process');
const process = require("process");
const p = __dirname + '/files/';
var drivenames = [p + "USB_A", p + "USB_B", p + "USB_C", p + "USB_E", p + "USB_F", p + "USB_G"];
var lastdrive = 0;
var already_connected_devices = [];

/*  Check for drives when application starts */
check_new_drives();

/*        USB DETECTION FUNCTIONS       */
usbDetect.startMonitoring();
usbDetect.on('add', function(device) {
    console.log('         !!!!DEVICE DETECTED!!!!        ');
    check_new_drives();
});

/**
 * Check for new drives and mount them
 */
async function check_new_drives() {
    console.log("INITIALISING...");
    await sleep(2500);
    update_drives();
    console.log('DRIVE UTILITY INITIALISED.  AWAITING FOR NEW DRIVES');
}

/**
 * Search drives and mount new ones
 */
function update_drives() {
    drivelist.list((error, drives) => {
        if (error) {
           console.err(error);
            return;
        }
        //check if there is a new USB drive
        drives.forEach((drive) => {
            if (drive.isUSB === true) {
                if (!already_connected_devices.includes(drive.description)) {
                    already_connected_devices.push(drive.description);
                    console.log("        Mounting drive =========>", drive.description);
                    mount_drive(drive);
                }
            }
        });
    });
}


//---------------------- MOUNTING AND MOUNTING FUNCTIONS ----------------------

/**
 * On exit, unmount drives and remove folders
 */
process.on("exit", function() {
    drivenames.forEach((drive) => {
        unmount_drive(drive);
    });
});

/**
 * Mount a new drive and add it to file sharing
 * folder in server
 * @param {drive to mount} drive 
 */
async function mount_drive(drive) {
    console.log(drive.description);
    console.log(drive.device);

    //MAKE NEW DIRECTORY FOR MOUNTING DRIVE
    await exec(`mkdir ${drivenames[lastdrive]}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return;
        }
        console.log(stdout);
    });

    //MOUNT DRIVE TO NEWLY CREATE DIRECTORY
    await exec(`sudo mount ${drive.device}1 ${drivenames[lastdrive]}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return;
        }
        console.log(stdout);
    });

    //SET DIRECTORY ACCESS RIGHTS
    await exec(`sudo chmod ugo+wx ${drivenames[lastdrive]}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return;
        }
        console.log(stdout);
    });

    lastdrive++;

}


/**
 * Unmount drive from directory
 * @param {drive to unmount} drive 
 */
function unmount_drive(drive) {
    console.log(`UNMOUNTING ${drive}`);

    //UNMOUND DRIVE
    exec(`sudo umount ${drive}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return;
        }
        console.log(stdout);
    });

    //DELETE FOLDER IN WHICH DRIVE WAS MOUNTED
    exec(`sudo rmdir ${drive}`, (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return;
        }
        console.log(stdout);
    });
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