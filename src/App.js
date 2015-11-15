import React, { Component } from 'react';
import ChessApp from './ChessApp';

export class App extends Component {
  render() {
    console.log(ChessApp);
    return (
      <div>
        <ChessApp />
      </div>
    );
  }
}
