var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var sp = new SerialPort("/dev/tty.usbmodem1411", {
  baudrate: 115200,
  parser: serialport.parsers.readline("\r\n"),
}, false); // this is the openImmediately flag [default is true]

var cmdQueue = ['E 1'];
var waitResponse = 'I\'m fine.';

function pushCommand(cmd) {
	cmdQueue.push(cmd);
	if(cmdQueue.length === 1) {
    setTimeout(doCommand, 1000);
  }
}

function doCommand() {
	if (!cmdQueue.length) {
		return;
  }

	var cmd = cmdQueue.shift();
	console.log('  Request: ' + cmd);

	switch(cmd[0]) {
	case 'M':
		waitResponse = 'Magnet';
		break;
	case 'S':
	  waitResponse = 'Moved';
	  break;
	case 'R':
	  waitResponse = 'Board';
	  break;
  }

  sp.write(cmd + '\n');
}

sp.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    sp.on('data', function(data) {
      console.log('  Response: ' + data);
    	if (data.indexOf(waitResponse) != -1) {
    		setTimeout(doCommand, 0);
      }
    });
  }
});


function move(fx, fy, tx, ty) {
	console.log(`Move ${fx},${fy} -> ${tx},${ty}`);
	pushCommand('S ' + fx + ' ' + fy);
	pushCommand('M 1');
	pushCommand('S ' + tx + ' ' + ty);
	pushCommand('M 0');
	pushCommand('M 1');
	pushCommand('M 0');
}

process.stdin.on('readable', function() {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		try {
		  eval('' + chunk);
    } catch(e) {
    	console.error(e);
    }
	}
});
