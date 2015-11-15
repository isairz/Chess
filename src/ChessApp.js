import React, { Component } from 'react';
import ChessBoard from 'chessboardjs';

export default class ChessApp extends Component {
  constructor(props) {
    super(props);
    this.state = { counter: 0 };
    //this.interval = setInterval(() => this.tick(), 1000);
  }

  tick() {
    console.log('tick');
    this.setState({
      counter: this.state.counter + this.props.increment
    });
  }

  componentDidMount() {
    this.board = ChessBoard('board', 'start');
  }

  componentWillUnmount() {
    //clearInterval(this.interval);
  }

  render() {
    return (
      <div id="board" style={{width: 400}}></div>
    );
  }
}
