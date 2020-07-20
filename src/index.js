import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import './components/Map.css';
import Map from './components/Map.js'
import Button from '@material-ui/core/Button';
require('dotenv').config()

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

class Application extends React.Component {
  render() {
    return (
      <div>
        <Map />
        <Button variant="contained" color="primary">
          {process.env.NODE_ENV}
        </Button>
      </div>
    )
  }
}

ReactDOM.render(<Application />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
