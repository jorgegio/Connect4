import React, { Component } from 'react';
import './App.css';
import Connect4 from './components/Game/connect4';

class App extends Component {
  render() {
    return (
      <div className='container'>
        <h1>Connect 4</h1>
        <Connect4 />
      </div>
    );
  }
}

export default App;
