import Chess from 'chess.js'
import ChessBoard from 'chessboardjs';

function engineGame(options) {
    options = options || {}
    var game = new Chess();
    var board;
    /// We can load Stockfish via Web Workers or via STOCKFISH() if loaded from a <script> tag.
    //var engine = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || 'stockfish.js');
    //var evaler = typeof STOCKFISH === "function" ? STOCKFISH() : new Worker(options.stockfishjs || 'stockfish.js');
    var engineStatus = {};
    var displayScore = false;
    var time = { wtime: 300000, btime: 300000, winc: 2000, binc: 2000 };
    var playerColor = 'white';
    var clockTimeoutID = null;
    var isEngineRunning = false;
    var evaluation_el = document.getElementById("evaluation");
    var announced_game_over;
    // do not pick up pieces if the game is over
    // only pick up pieces for White
    var onDragStart = function(source, piece, position, orientation) {
        var re = playerColor == 'white' ? /^b/ : /^w/
            if (game.game_over() ||
                piece.search(re) !== -1) {
                return false;
            }
    };

    setInterval(function ()
    {
        if (announced_game_over) {
            return;
        }
        
        if (game.game_over()) {
            announced_game_over = true;
            alert("Game Over");
        }
    }, 1000);

    function sendCommand(cmd)
    {
      console.log('cmd: ' + cmd);
      fetch('/api/' + cmd);
    }

    function sendMove(moves) {
      fetch('/api/move/' + moves)
      .then((res) => res.json())
      .then((json) => {
        isEngineRunning = false;
        game.move(json);
        prepareMove();
        //uciCmd("eval", evaler)
        evaluation_el.textContent = "";
        //uciCmd("eval");
      });
    }

    function uciCmd(cmd, which) {
        console.log("UCI: " + cmd);
        
        //(which || engine).postMessage(cmd);
        //sendCommand(cmd);
    }
    uciCmd('uci');
    
    ///TODO: Eval starting posistions. I suppose the starting positions could be different in different chess varients.

    function displayStatus() {
        var status = 'Engine: ';
        if(!engineStatus.engineLoaded) {
            status += 'loading...';
        } else if(!engineStatus.engineReady) {
            status += 'loaded...';
        } else {
            status += 'ready.';
        }
        
        if(engineStatus.search) {
            status += '<br>' + engineStatus.search;
            if(engineStatus.score && displayScore) {
                status += (engineStatus.score.substr(0, 4) === "Mate" ? " " : ' Score: ') + engineStatus.score;
            }
        }
        $('#engineStatus').html(status);
    }

    function displayClock(color, t) {
        var isRunning = false;
        if(time.startTime > 0 && color == time.clockColor) {
            t = Math.max(0, t + time.startTime - Date.now());
            isRunning = true;
        }
        var id = color == playerColor ? '#time2' : '#time1';
        var sec = Math.ceil(t / 1000);
        var min = Math.floor(sec / 60);
        sec -= min * 60;
        var hours = Math.floor(min / 60);
        min -= hours * 60;
        var display = hours + ':' + ('0' + min).slice(-2) + ':' + ('0' + sec).slice(-2);
        if(isRunning) {
            display += sec & 1 ? ' <--' : ' <-';
        }
        $(id).text(display);
    }

    function updateClock() {
        displayClock('white', time.wtime);
        displayClock('black', time.btime);
    }

    function clockTick() {
        updateClock();
        var t = (time.clockColor == 'white' ? time.wtime : time.btime) + time.startTime - Date.now();
        var timeToNextSecond = (t % 1000) + 1;
        clockTimeoutID = setTimeout(clockTick, timeToNextSecond);
    }

    function stopClock() {
        if(clockTimeoutID !== null) {
            clearTimeout(clockTimeoutID);
            clockTimeoutID = null;
        }
        if(time.startTime > 0) {
            var elapsed = Date.now() - time.startTime;
            time.startTime = null;
            if(time.clockColor == 'white') {
                time.wtime = Math.max(0, time.wtime - elapsed);
            } else {
                time.btime = Math.max(0, time.btime - elapsed);
            }
        }
    }

    function startClock() {
        if(game.turn() == 'w') {
            time.wtime += time.winc;
            time.clockColor = 'white';
        } else {
            time.btime += time.binc;
            time.clockColor = 'black';
        }
        time.startTime = Date.now();
        clockTick();
    }
    
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

    function prepareMove() {
        stopClock();
        $('#pgn').text(game.pgn());
        board.position(game.fen());
        updateClock();
        var turn = game.turn() == 'w' ? 'white' : 'black';
        if(!game.game_over()) {
            if(turn != playerColor) {
                sendMove(get_moves());
                evaluation_el.textContent = "";
                
                if (time && time.wtime) {
                    uciCmd("go " + (time.depth ? "depth " + time.depth : "") + " wtime " + time.wtime + " winc " + time.winc + " btime " + time.btime + " binc " + time.binc);
                } else {
                    uciCmd("go " + (time.depth ? "depth " + time.depth : ""));
                }
                isEngineRunning = true;
            }
            if(game.history().length >= 2 && !time.depth && !time.nodes) {
                startClock();
            }
        }
    }
    /*
    evaler.onmessage = function(event) {
        var line;
        
        if (event && typeof event === "object") {
            line = event.data;
        } else {
            line = event;
        }
        
        console.log("evaler: " + line);
        
        /// Ignore some output.
        if (line === "uciok" || line === "readyok" || line.substr(0, 11) === "option name") {
            return;
        }
        
        if (evaluation_el.textContent) {
            evaluation_el.textContent += "\n";
        }
        evaluation_el.textContent += line;
    }*/

    /*
    engine.onmessage = function(event) {
        var line;
        
        if (event && typeof event === "object") {
            line = event.data;
        } else {
            line = event;
        }
        console.log("Reply: " + line)
        if(line == 'uciok') {
            engineStatus.engineLoaded = true;
        } else if(line == 'readyok') {
            engineStatus.engineReady = true;
        } else {
        var match = line.match(/^bestmove ([a-h][1-8])([a-h][1-8])([qrbk])?/);
            /// Did the AI move?
            if(match) {
                isEngineRunning = false;
                game.move({from: match[1], to: match[2], promotion: match[3]});
                prepareMove();
                uciCmd("eval", evaler)
                evaluation_el.textContent = "";
                //uciCmd("eval");
            /// Is it sending feedback?
            } else if(match = line.match(/^info .*\bdepth (\d+) .*\bnps (\d+)/)) {
                engineStatus.search = 'Depth: ' + match[1] + ' Nps: ' + match[2];
            }
            
            /// Is it sending feed back with a score?
            if(match = line.match(/^info .*\bscore (\w+) (-?\d+)/)) {
                var score = parseInt(match[2]) * (game.turn() == 'w' ? 1 : -1);
                /// Is it measuring in centipawns?
                if(match[1] == 'cp') {
                    engineStatus.score = (score / 100.0).toFixed(2);
                /// Did it find a mate?
                } else if(match[1] == 'mate') {
                    engineStatus.score = 'Mate in ' + Math.abs(score);
                }
                
                /// Is the score bounded?
                if(match = line.match(/\b(upper|lower)bound\b/)) {
                    engineStatus.score = ((match[1] == 'upper') == (game.turn() == 'w') ? '<= ' : '>= ') + engineStatus.score
                }
            }
        }
        displayStatus();
    };*/

    var onDrop = function(source, target) {
        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: document.getElementById("promote").value
        });

        // illegal move
        if (move === null) return 'snapback';

        prepareMove();
    };

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    var onSnapEnd = function() {
        board.position(game.fen());
    };

    var cfg = {
        showErrors: true,
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };

    board = new ChessBoard('board', cfg);

    return {
        reset: function() {
            game.reset();
            this.setSkillLevel(0);
            sendCommand('reset');
            //uciCmd('setoption name King Safety value 0'); /// Agressive 100 (it's now symetric)
        },
        loadPgn: function(pgn) { game.load_pgn(pgn); },
        setPlayerColor: function(color) {
            playerColor = color;
            board.orientation(playerColor);
        },
        setSkillLevel: function(skill) {
          sendCommand('setSkillLevel/'+skill);
        },
        setTime: function(baseTime, inc) {
            time = { wtime: baseTime * 1000, btime: baseTime * 1000, winc: inc * 1000, binc: inc * 1000 };
        },
        setDepth: function(depth) {
            time = { depth: depth };
        },
        setNodes: function(nodes) {
            time = { nodes: nodes };
        },
        setContempt: function(contempt) {
            sendCommand('setContempt/' + contempt);
        },
        setAggressiveness: function(value) {
            sendCommand('setAggressiveness/' + value);
        },
        setDisplayScore: function(flag) {
            displayScore = flag;
            displayStatus();
        },
        start: function() {
            sendCommand('start');
            engineStatus.engineReady = false;
            engineStatus.search = null;
            displayStatus();
            prepareMove();
            announced_game_over = false;
        },
        undo: function() {
            if(isEngineRunning)
                return false;
            game.undo();
            game.undo();
            engineStatus.search = null;
            displayStatus();
            prepareMove();
            return true;
        }
    };
}

export default engineGame;
