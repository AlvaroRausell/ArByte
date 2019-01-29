//npm i --save usb-detection drivelist

var usbDetect = require('usb-detection');
var drivelist = require('drivelist');
const { exec } = require('child_process');
const process = require("process");
const p = __dirname+'/../server/files/';
var drivenames= [p+"USB_A", p+"USB_B",p+ "USB_C",p+ "USB_E",p+ "USB_F", p+"USB_G"];
var lastdrive = 0;
var already_connected_devices = [];

/*  Check for drives when application starts */
init();

/*        USB DETECTION FUNCTIONS       */
usbDetect.startMonitoring();
usbDetect.on('add', function (device) {
    console.log('         !!!!DEVICE DETECTED!!!!        ');
    init();
});
async function init() {
    console.log("INITIALISING...");
    await sleep(2500);
    update_drives();
console.log('DRIVE UTILITY INITIALISED.  AWAITING FOR NEW DRIVES');
}
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}



/**
 * Search drives and mount new ones
 */
function update_drives() {
    drivelist.list((error, drives) => {
        if (error) {
//            throw error;
return;
        }

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


/*        MOUNTING AND MOUNTING FUNCTIONS       */
/**
 * On exit, unmount drives and remove folders
 */
process.on("exit", function () {
    drivenames.forEach((drive) => {
       unmount_drive(drive);
    });
});


async function mount_drive(drive) {
    var driveloc = drive.device;
    console.log(drive.description);
    console.log(drive.device);

    await exec(`mkdir ${drivenames[lastdrive]}`, (err, stdout, stderr) => {
        if (err) {
            //console.log(stderr);
  //          throw err;
		return;
        }
        //console.log(stdout);

    });
	//await sleep(1000)   
    await exec(`sudo mount ${drive.device}1 ${drivenames[lastdrive]}`, (err, stdout, stderr) => {
        if (err) {
            //console.log(stderr);
    //        throw err;
return;
        }
      //  console.log(stdout);

    });

    await exec(`sudo chmod ugo+wx ${drivenames[lastdrive]}`, (err, stdout, stderr) => {
        if (err) {
          //  console.log(stderr);
           return;
        }
	//console.log('succes!');
        //console.log(stdout);

    });

	lastdrive++;

}

function unmount_drive(drive) {
    console.log(`UNMOUNTING ${drive}`);
    exec(`sudo umount ${drive}`, (err, stdout, stderr) => {
        if (err) {
          //  console.log(stderr);
            return;
        }
        //console.log(stdout);
    });
    console.log(`Deleting folder ${drive}`);

    exec(`sudo rmdir ${drive}`, (err, stdout, stderr) => {
        if (err) {
          //  console.log(stderr);
            return;
        }
        //console.log(stdout);
    });
    //console.log("Unmount complete!");
}
