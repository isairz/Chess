var express = require('express');
var fs = require('fs');
var child_process = require('child_process');

var stockfish = child_process.spawn('./Stockfish/src/stockfish');

var resQueue = [];
stockfish.stdout.on('data', (data) => {
  var str = '' + data;
  console.log('stdout: ' + str);
  var match = str.match(/bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
  if(match && resQueue.length) {
    resQueue.shift().json({
      from: match[1],
      to: match[2],
      promotion: match[3],
    });
  }
});

var command = function(cmd) {
  console.log('cmd: ' + cmd);
  stockfish.stdin.write(cmd + '\n');
}
//cmd('uci\n');
command('uci');

var app = express();

app.get('/reset', (req, res) => {
  res.end();
});

app.get('/setSkillLevel/:level', (req, res) => {
  var level = req.params.level;
  ///NOTE: Stockfish level 20 does not make errors (intentially), so these numbers have no effect on level 20.
  /// Level 0 starts at 1
  var err_prob = Math.round((level * 6.35) + 1);
  /// Level 0 starts at 5
  var max_err = Math.round((level * -0.25) + 5);

  command('setoption name Skill Level value ' + level);
  command("setoption name Skill Level Maximum Error value " + max_err);
  command("setoption name Skill Level Probability value " + err_prob);
  res.end();
});

app.get('/setContempt/:contempt', (req, res) => {
  command('setoption name Contempt value ' + req.params.contempt);
  res.end();
});

app.get('/setAggressiveness/:value', (req, res) => {
  command('setoption name Contempt value ' + req.params.value);
  res.end();
});

app.get('/start', (req, res) => {
  command('ucinewgame');
  command('isready');
  res.end();
});

app.get('/move/:moves', (req, res) => {
  command('position startpos moves ' + req.params.moves.replace(/_/g, ' '));
  command('go movetime 1000');
  resQueue.push(res);
});

app.listen(3040, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3040');
});
