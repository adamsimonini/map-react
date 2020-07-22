// 
export default function createGeoJson(data) {
  // console.log(data);
  let geoJSON = {
    "type": "FeatureCollection",
    "features": [
      {
        "geometry": {
          "type": "Point",
          "coordinates": [
            -151.5129,
            63.1016,
          ]
        }
      },
      {
        "geometry": {
          "type": "Point",
          "coordinates": [
            -150.4048,
            63.1224,
          ]
        }
      },
      {
        "geometry": {
          "type": "Point",
          "coordinates": [
            -155.4048,
            63.1224,
          ]
        }
      },
      {
        "geometry": {
          "type": "Point",
          "coordinates": [
            -10.4048,
            93.1224,
          ]
        }
      }
    ]
  }
  return '123';
}