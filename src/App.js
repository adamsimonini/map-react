import React from 'react';
import logo from './logo.svg';
import './App.css';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWpzaW0iLCJhIjoiY2thdmF0Ym9kMGNhbTJ6a3l5dzl3ZmdrcCJ9.YcSMrFRPTc7hCZgYkJeoSQ';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
