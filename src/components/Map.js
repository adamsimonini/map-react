import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
// import data from './data.json'
import real_data from './real_data.json'
import createGeoJson from '../createGeoJson.js';

let addressArray = []
real_data.forEach((item) => {
  addressArray.push(item.address);
});
// console.log(addressArray);
console.log('creating coordinate Array....')

export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -95,
      lat: 54,
      zoom: 3.8,
      coordinates: [],
      geoJSONFeatures: [],
    }
  }

  getCoordinates = async () => {
    let coordinateArray = [];
    for (const address of addressArray) {
      await fetch(`https://www.geogratis.gc.ca/services/geolocation/en/locate?q=${address}`)
        .then(response => {
          response.json()
            .then(data => {
              console.log(data[0].geometry.coordinates);
              coordinateArray.push(data[0].geometry.coordinates);
            });
        })
        .catch((err) => {
          console.log(err);
        })
    }
    this.setState({ coordinates: coordinateArray })
    // console.log(`Length of coordinateArray after getCoordinates async call: ${coordinateArray.length}`)
  }

  createGeoJSON = async () => {
    console.log("I'm createGeoJSON, & I come after getCoordinates");
    let features = this.state.coordinates.map((coordinates) => {
      return {
        'type': 'Feature',
        'gometry': {
          'type': "Point",
          'coordinates': [
            coordinates[0],
            coordinates[1]
          ]
        }
      }
    });
    this.setState({ geoJSONFeatures: features });
  }

  componentDidMount() {
    (async () => {
      await this.getCoordinates();
      await this.createGeoJSON();
      let geoJSONFeatures = this.state.geoJSONFeatures;
      console.log(geoJSONFeatures);
      const map = new mapboxgl.Map({
        container: this.mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.state.lng, this.state.lat],
        zoom: this.state.zoom
      });
      map.on('load', function () {
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        map.addSource('earthquakes', {
          type: 'geojson',
          // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
          // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
          data:
          {
            "type": "FeatureCollection",
            // "features": geoJSONFeatures,
            'features': geoJSONFeatures,
            // [
            //   {
            //     "type": "Feature",
            //     "geometry": {
            //       "type": "Point",
            //       "coordinates": [-79.391194826999921, 43.69]
            //     },
            //     "properties": {
            //       "name": "Dinagat Islands"
            //     }
            //   },
            // ],
          },
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'earthquakes',
          filter: ['has', 'point_count'],
          paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#51bbd6',
              100,
              '#f1f075',
              750,
              '#f28cb1'
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              10,
              100,
              20,
              750,
              30
            ]
          }
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'earthquakes',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }
        });

        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'earthquakes',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 20,
            'circle-stroke-width': 5,
            'circle-stroke-color': '#fff'
          }
        });

        // inspect a cluster on click
        map.on('click', 'clusters', function (e) {
          var features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          var clusterId = features[0].properties.cluster_id;
          map.getSource('earthquakes').getClusterExpansionZoom(
            clusterId,
            function (err, zoom) {
              if (err) return;

              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
            }
          );
        });

        // When a click event occurs on a feature in
        // the unclustered-point layer, open a popup at
        // the location of the feature, with
        // description HTML from its properties.
        map.on('click', 'unclustered-point', function (e) {
          var coordinates = e.features[0].geometry.coordinates.slice();
          var mag = e.features[0].properties.mag;
          var tsunami;

          if (e.features[0].properties.tsunami === 1) {
            tsunami = 'yes';
          } else {
            tsunami = 'no';
          }

          // Ensure that if the map is zoomed out such that
          // multiple copies of the feature are visible, the
          // popup appears over the copy being pointed to.
          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              'magnitude: ' + mag + '<br>Was there a tsunami?: ' + tsunami
            )
            .addTo(map);
        });

        map.on('mouseenter', 'clusters', function () {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'clusters', function () {
          map.getCanvas().style.cursor = '';
        });
      });
    })();
  }
  render() {
    return (
      <div>
        <div className='sidebarStyle'>
          <div>Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}</div>
        </div>
        <div ref={el => this.mapContainer = el} className="mapContainer" />
      </div>
    )
  }
}
