import React, { Component } from 'react';
import './App.css';
import Board from './components/Board';

class App extends Component {
  render() {
    return (
      <div className='container'>
        <h1>Connect 4</h1>
        <Board />
      </div>
    );
  }
}

export default App;
