import React from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
// import data from './data.json'
import real_data from './real_data.json'
import createGeoJson from '../create-geojson.js'

let addressArray = []
real_data.forEach((item) => {
  addressArray.push(item.address);
});

console.log(addressArray);

var geojsonFeature = {
  "type": "Feature",
  "properties": {
    "name": "Coors Field",
    "amenity": "Baseball Stadium",
    "popupContent": "This is where the Rockies play!"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-104.99404, 39.75621]
  }
};

let coordinateArray = [];

const testData = {
  "type": "FeatureCollection",
    "crs": {
    "type": "name",
      "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": "ak16994521",
        "mag": 2.3,
        "time": 1507425650893,
        "felt": null,
        "tsunami": 0
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -151.5129,
          63.1016,
          0.0
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": "ak16994519",
        "mag": 1.7,
        "time": 1507425289659,
        "felt": null,
        "tsunami": 0
      },
      "geometry": {
        "type": "Point",
        "coordinates": [
          -150.4048,
          63.1224,
          105.5
        ]
      }
    }
  ]
}


// TODO: make this code asynchronous
async function getCoordinates() {
  try {
    addressArray.forEach((address) => {
      var request = new XMLHttpRequest();
      request.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(request.responseText);
          if (data[0] == undefined) {
            console.error(`Geogratis failed to find coordinates for the following address: ${data[0]}`);
          }
          coordinateArray.push(data[0].geometry.coordinates);
        }
      };
      request.open("GET", "https://www.geogratis.gc.ca/services/geolocation/en/locate?q=" + address, true);
      request.send();
    });
  } catch (err) {
    console.log(err)
  }
}

getCoordinates().then(createGeoJson('abc'));

// var request = new XMLHttpRequest();
// request.onreadystatechange = function () {
//   if (this.readyState == 4 && this.status == 200) {
//     var data = JSON.parse(request.responseText);
//     if (data[0] == undefined) {
//     }
//     var coordinates = data[0].geometry.coordinates;
//     console.log(coordinates);
//   }
// };
// request.open("GET", "https://www.geogratis.gc.ca/services/geolocation/en/locate?q=" + real_data[0].address, true);
// request.send();



export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lng: -95,
      lat: 54,
      zoom: 3.8,
    };
  }
  componentDidMount() {
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
        data: testData,
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
            20,
            100,
            30,
            750,
            40
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
          'circle-radius': 4,
          'circle-stroke-width': 1,
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
