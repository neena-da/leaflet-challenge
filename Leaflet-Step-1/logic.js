// Store our API endpoint inside queryUrl

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  } 

  function radiusMap(magnitude) {
    return magnitude * 10000
  }

  function circleColor(depth) {
    if ((depth >=-10) && (depth <10)){
      return "#B5FF33"
    }
    else if ((depth >=10) && (depth <30)) {
      return "#E0FF33"
    }
    else if ((depth >=30) && (depth <50)) {
      return "#FFE633"
    }
    else if ((depth >=-50) && (depth <70)) {
      return "#FFC733"
    }
    else if ((depth >=-70) && (depth <90)) {
      return "#FF9333"
    }
    else if (depth >= 90) {
      return "#FF4C33"
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array

  var earthquakes = L.geoJSON(earthquakeData, {

    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusMap(earthquakeData.properties.mag),
        color: "gray",
        fillColor: circleColor(earthquakeData.geometry.coordinates[2]),
        fillOpacity: 1
        
      });
    },
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "light-v10",
    accessToken: API_KEY
  });


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [lightmap, earthquakes]
  });


 // Set up the legend
 const legend = L.control({ position: 'bottomright' });
 legend.onAdd = function () {
   const div = L.DomUtil.create('div', 'info legend');
   const mags = [-10, 10, 30, 50, 70, 90];
   const magsColour = ["#B5FF33", "#E0FF33", "#FFE633", "#FFC733", "#FF9333", "#FF4C33"]
   mags.forEach((mag, i) => {
     const next = mags[i + 1] ? '&ndash; ' + mags[i + 1] + '<br>' : '+';
     div.innerHTML += `<div class="legend-range" style="background: ${magsColour[i]}">${mags[i]} ${next}</div>`;
   });

   return div;
 }

 // Adding legend to the map
 legend.addTo(myMap);
};
