import React, { Component } from 'react';
import ChessBoard from 'chessboardjs';
import EngineGame from './EngineGame';

export default class ChessApp extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    //this.interval = setInterval(() => this.tick(), 1000);
  }

  init() {
    const game = new EngineGame();
    function newGame() {
      var baseTime = parseFloat($('#timeBase').val()) * 60;
      var inc = parseFloat($('#timeInc').val());
      var skill = parseInt($('#skillLevel').val());
      game.reset();
      game.setTime(baseTime, inc);
      game.setSkillLevel(skill);
      game.setPlayerColor($('#color-white').hasClass('active') ? 'white' : 'black');
      game.setDisplayScore($('#showScore').is(':checked'));
      game.start();
    }

    game.setSkillLevel

    /*document.getElementById("skillLevel").addEventListener("change", function ()
    {
      game.setSkillLevel(parseInt(this.value, 10));
    });*/

    newGame();
    this.game = game;
  }

  tick() {
    console.log('tick');
    this.setState({
      counter: this.state.counter + this.props.increment
    });
  }

  componentDidMount() {
    this.init();
  }

  componentWillUnmount() {
    //clearInterval(this.interval);
  }

  render() {
    return (
    <div className="row">
      <div className="col-sm-7 col-md-6">
        <span className="h3" id="time1">0:05:00</span>
        <div id="board" style={{width: 400}}></div>
        <span className="h3" id="time2">0:05:00</span>
        <hr/>
        <div id="engineStatus">...</div>
      </div>
      <div className="col-sm-5 col-md-6">
        <h3>Moves:</h3>
        <div id="pgn"></div>
        <hr/>
        <form className="form-horizontal">
          <div className="form-group">
            <label for="timeBase" className="control-label col-xs-4 col-sm-6 col-md-4">Base time (min)</label>
            <div className="col-xs-4 col-sm-6 col-md-4">
              <input type="number" className="form-control" id="timeBase" value="5"/>
            </div>
          </div>
          <div className="form-group">
            <label for="timeInc" className="control-label col-xs-4 col-sm-6 col-md-4">Increment (sec)</label>
            <div className="col-xs-4 col-sm-6 col-md-4">
              <input type="number" className="form-control" id="timeInc" value="2"/>
            </div>
          </div>
          <div className="form-group">
            <label for="skillLevel" className="control-label col-xs-4 col-sm-6 col-md-4">Skill Level (0-20)</label>
            <div className="col-xs-4 col-sm-6 col-md-4">
              <input type="number" className="form-control" id="skillLevel" value="0"/>
            </div>
          </div>
          <div className="form-group">
            <label for="color" className="control-label col-xs-4 col-sm-6 col-md-4">I play</label>
            <div className="col-xs-4 col-sm-6 col-md-4">
              <div className="btn-group" data-toggle="buttons">
                <label className="btn btn-primary active" id="color-white"><input type="radio" name="color"/>White</label>
                <label className="btn btn-primary" id="color-black"><input type="radio" name="color"/>Black</label>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label for="showScore" className="control-label col-xs-4 col-sm-6 col-md-4">Show score</label>
            <div className="col-xs-4 col-sm-6 col-md-4">
              <input type="checkbox" className="form-control" id="showScore" checked />
            </div>
          </div>
          <div className="form-group">
            <label for="color" className="control-label col-xs-4 col-sm-6 col-md-4"></label>
            <div className="col-xs-4 col-sm-6 col-md-4">
              <button type="button" className="btn btn-primary" onclick="newGame()">New Game</button>
            </div>
          </div>
          
          <div className="form-group">
            <label for="color" className="control-label col-xs-4 col-sm-6 col-md-4">Promote to</label>
            <div className="col-xs-4 col-sm-6 col-md-4">
              <select id="promote">
                <option value="q" selected>Queen</option>
                <option value="r">Rook</option>
                <option value="b">Bishop</option>
                <option value="n">Knight</option>
              </select>
            </div>
          </div>
        </form>
        <h5>Evaluation</h5>
        <pre id="evaluation"></pre>
      </div>
    </div>);
  }
}
