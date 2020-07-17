import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import './components/Map.css';
import Map from './components/Map.js'

mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWpzaW0iLCJhIjoiY2thdmF0Ym9kMGNhbTJ6a3l5dzl3ZmdrcCJ9.YcSMrFRPTc7hCZgYkJeoSQ';

class Application extends React.Component {
  render() {
    return (
      <div>
        <Map />
      </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
