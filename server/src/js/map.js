var initMap = function () {
    let AIPs = L.layerGroup()
    let POIs = L.layerGroup()

    let map = L.map('mapid').setView([52.529, 13.377], 10);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: config.mapboxKey
    }).addTo(map);

    var drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            polygon: false,
            marker: false,
            circle: false,
            rectangle: false
        }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
        var type = e.layerType,
            layer = e.layer;

        // Do whatever else you need to. (save to db; add to map etc) -> ok!
        map.addLayer(layer);
    });


    // Retrieves POIs e.g. Windmills
    function getPOIs() {

        POIs.clearLayers()

        bounds = map.getBounds().pad(20)

        minlat = bounds.getSouthWest().lat
        maxlat = bounds.getNorthEast().lat
        maxlng = bounds.getNorthEast().lng
        minlng = bounds.getSouthWest().lng

        jQuery.ajax({
                url: "http://localhost:8080/data/windmills",
                type: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                contentType: "application/json",
                data: JSON.stringify({
                    "minLon": minlng,
                    "maxLat": maxlat,
                    "maxLon": maxlng,
                    "minLat": minlat,
                    "limit": 350,
                })
            })
            .done(function (data, textStatus, jqXHR) {
                console.log("HTTP Request Succeeded: " + jqXHR.status);

                objects = data[1]
                geojsons = []

                var geojsonMarkerOptions = {
                    radius: 100,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };

                objects.forEach(element => {
                    geojsons.push(JSON.parse(element[1]))
                });

                L.geoJSON(geojsons, {
                    pointToLayer: function (feature, latlng) {
                        return L.circle(latlng, geojsonMarkerOptions);
                    }
                }).addTo(POIs);

                POIs.addTo(map)
                console.log('windmills')
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log("HTTP Request Failed");
            })
            .always(function () {
                /* ... */
            });

    }

    // Retrieves the restricted airspaces
    function getAIPs() {
        AIPs.clearLayers()

        bounds = map.getBounds().pad(20)

        minlat = bounds.getSouthWest().lat
        maxlat = bounds.getNorthEast().lat
        maxlng = bounds.getNorthEast().lng
        minlng = bounds.getSouthWest().lng

        jQuery.ajax({
                url: "http://localhost:8080/data/airspaces",
                type: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                contentType: "application/json",
                data: JSON.stringify({
                    "minLon": minlng,
                    "maxLat": maxlat,
                    "maxLon": maxlng,
                    "minLat": minlat,
                    "limit": 350,
                })
            })
            .done(function (data, textStatus, jqXHR) {
                console.log("HTTP Request Succeeded: " + jqXHR.status);

                objects = data[1]
                geojsons = []

                var geojsonMarkerOptions = {
                    radius: 100,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };

                objects.forEach(element => {
                    geojsons.push(JSON.parse(element[1]))
                });

                L.geoJSON(geojsons, {
                    pointToLayer: function (feature, latlng) {
                        return L.polygon(latlng, geojsonMarkerOptions);
                    }
                }).addTo(AIPs);
                AIPs.addTo(map)

            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log("HTTP Request Failed");
            })
            .always(function () {
                /* ... */
            });
    }

    map.on('dragend', function (e) { 
        getAIPs()
        getPOIs()
    })

    map.on('zoom', function (e) {
        map.removeLayer(AIPs,POIs)
        getAIPs()
        getPOIs()
    })

    getPOIs(); 
    getAIPs();

    /**
    * Websocket for streaming data
    */

    var socket = new WebSocket(
        "ws://localhost:9851/GET+restriction+airspace_"
    );
    socket.onmessage = event => {
        let msg = JSON.parse(event.data);
        const date = new Date().toISOString();
        console.log(date, msg);
        if ("object" in msg) {
            if (marker == null) {
                marker = L.marker(msg.object.coordinates.reverse()).addTo(mymap);
            } else {
                marker.setLatLng(msg.object.coordinates.reverse());
            }
        }
    };

    // TODO: Add layer für Flugverbotszonen
    return map;
}