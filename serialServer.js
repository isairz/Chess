var Chess = require('chess.js');
var serialport = require("serialport");
var SerialPort = serialport.SerialPort;
var sp = new SerialPort("/dev/tty.usbmodem1411", {
  baudrate: 115200,
  parser: serialport.parsers.readline("\r\n"),
}, false); // this is the openImmediately flag [default is true]

var game = new Chess();
    function get_moves()
    {
        var moves = '';
        var history = game.history({verbose: true});
        
        for(var i = 0; i < history.length; ++i) {
            var move = history[i];
            moves += '_' + move.from + move.to + (move.promotion ? move.promotion : '');
        }
        
        return moves;
    }
    function sendMove() {
      var moves = get_moves();
      fetch('http://localhost:3040/move/' + moves);
      .then((res) => res.json())
      .then((json) => {
        game.move(json);
        move(json.from, json.to, json.promotion);
      });
    }
var cmdQueue = [];
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
	case 'E':
		waitResponse = 'ENABLE';
		break;
	case 'M':
		waitResponse = 'Magnet';
		break;
	case 'S':
	  waitResponse = 'Moved';
	  break;
	case 'B':
	  waitResponse = 'Board';
	  break;
  }
  console.log('    Waiting: ' + waitResponse);

  sp.write(cmd + '\n');
}

var moved = '';
sp.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    sp.on('data', function(data) {
      console.log('      Response: ' + data);
      if (data.indexOf(waitResponse) != -1) {
        if (waitResponse == 'Board') {
          board = data.replaceWith(/Board: (.*)/, '$1').trim().split(' ');
          var moves = readBoard(board);
          if (moves) {
            game.move(moves);
            sendMove();
          }
        }
        setTimeout(doCommand, 0);
      }
    });
  }
});

function enableMoter(sw) {
	pushCommand('E ' + sw);
}
function enableMagnet(sw) {
	pushCommand('M ' + sw);
}
function scanBoard() {
    pushCommand('B 1');
}

function move(from, to) {
    var fx = from[0].charCodeAt() - 'a';
    var fy = (from[1]|0) - 1;
    var tx = to[0].charCodeAt() - 'a';
    var ty = (to[1]|0) - 1;
	console.log(`Move ${fx},${fy} -> ${tx},${ty}`);
	pushCommand('S ' + fx + ' ' + fy);
	pushCommand('M 1');
	pushCommand('S ' + tx + ' ' + ty);
	pushCommand('M 0');
	pushCommand('M 1');
	pushCommand('M 0');
}


var lastBoard = [];
var state = 1;
var x1, y1, x2, y2;

function findDiff(board) {
  if (lastBoard) {
    var x,y;
    for(y=0;y<8;y++){
      for(x=0;x<8;x++){
        if (lastBoard[y][x] != board[y][x]) {
            return {
              type: lastBoard[i][j] == 'O' ? 'Removed' : 'Added',
              x: x,
              y: y,
            }
        }
      }
    }
  }
}

function A1 (x, y){
  return String.fromCharCode(97+x) + (y+1);
}

function readBoard(board) {
  var diff == findDiff(board);
  var moves = null;
  console.log('  State: ' + state);
  switch(state) {
    case 1:
      if(diff.type == 'Removed') {
        x1 = diff.type.x;
        y1 = diff.type.y;
      }
      break;
    case 2:
      if(diff.type == 'Added') {
        x2 = diff.type.x;
        y2 = diff.type.y;
        if (x1 == x2 && y1 == y2) {
          state = 1;
        } else {
          state = 1;
          moves = {from: A1(x1,y1), to: A1(x2,y2)};
        }
      }
      else if(diff.type == 'Removed') {
        state = 3;
        x2 = diff.type.x;
        y2 = diff.type.y;
      }
      break;
    case 3:
      if(diff.type == 'Added') {
        x3 = diff.type.x;
        y3 = diff.type.y;
        if (x1 == x2 && y1 == y2) {
          state = 1;
          moves = {from: A1(x1,y1), to: A1(x3,y3)};
        } else if (x1 == x3 && y1 == y3) {
          state = 1;
          moves = {from: A1(x1,y1), to: A1(x2,y2)};
        }
      }
      break;
    case 4: // Castling
      break;
  }
  console.log(moves);
  return moves;
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

function reset () {
  game.reset();
  fetch('http://localhost:3040/reset');
}

enableMoter(1);
enableMagnet(0);
scanBoard();
reset();
fetch('http://localhost:3040/start');
