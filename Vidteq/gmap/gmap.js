/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
function initMap() {
  const myLatlng = { "lat": 12.276453, "lng": 76.672894 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 16,
    center: myLatlng,
    //mapTypeId: google.maps.MapTypeId.HYBRID  
  });
  // Create the initial InfoWindow.
  let infoWindow = new google.maps.InfoWindow({
    content: "Click the map to get Lat/Lng!",
    position: myLatlng,
  });

  infoWindow.open(map);
  // Configure the click listener.
  map.addListener("click", (mapsMouseEvent) => {
    // Close the current InfoWindow.
    infoWindow.close();
    // Create a new InfoWindow.
    infoWindow = new google.maps.InfoWindow({
      position: mapsMouseEvent.latLng,
    });
    infoWindow.setContent(
      JSON.stringify(mapsMouseEvent.latLng.toJSON(), null, 2)
    );
    infoWindow.open(map);
  });

  google.maps.event.addListener(map, 'click', function (event) {
    placeMarker(map, event.latLng);
  });

  var ll = [];
  google.maps.event.addListener(map, 'mousemove', function (event) {
    let location = event.latLng;
    console.log(event)
    console.log({ lat: location.lat(), lon: location.lng() })
    ll.push({ x: location.lat(), y: location.lng(), z: Math.random() * 100 })
    localStorage.setItem('ll', JSON.stringify(ll));
    /*
    $.get(`https://maps.googleapis.com/maps/api/elevation/json?locations=${location.lat()}%2C${location.lng()}&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&v=weekly`,
      function (res) { 
        console.log(res)
      });
*/

  });

  function placeMarker(map, location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map
    });
    console.log({ lat: location.lat(), lon: location.lng() })

    var infowindow = new google.maps.InfoWindow({
      content: 'Latitude: ' + location.lat() +
        '<br>Longitude: ' + location.lng()
    });
    infowindow.open(map, marker);
  }
}

window.initMap = initMap;

function get() {
  $('#data').text(localStorage.getItem('ll'))

}
function clear1() {
  localStorage.clear()
  $('#data').text('')

}
function copy() {
  selectText('data');

}
function selectText(token) {
  if (document.selection) {
    // IE
    var range = document.body.createTextRange();
    range.moveToElementText(document.getElementById(token));
    range.select();
  } else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(document.getElementById(token));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
  }
}
