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

    bounds = map.getBounds()

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
            "limit": 0
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
            console.log('hi')
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
            "limit": 500,
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
    map.removeLayer(AIPs, POIs)
})

$(document).ready(function () {
    getPOIs();
    getAIPs();
    console.log('loaded')
})

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

// Start SIMON
let polyline = {
    "type": "FeatureCollection",
    "properties": {
        "name": "DronyMcDroneface"
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [
                52.68429152697491,
                13.569145202636719,
            ],
            [
                52.686164607072655,
                13.600044250488281,
            ],
            [
                52.687413282506085,
                13.613433837890625,
            ],
            [
                52.68866192223463,
                13.626823425292969,
            ],
            [
                52.6906388621178,
                13.641071319580076,
            ],
            [
                52.69261571249358,
                13.655319213867188,
            ],
            [
                52.69573687295826,
                13.67042541503906,
            ],
            [
                52.69729736951359,
                13.677978515625,
            ],
            [
                52.698857810285325,
                13.685531616210938,
            ],
            [
                52.70249862182125,
                13.698749542236328,
            ],
            [
                52.70613912966181,
                13.711967468261719,
            ],
            [
                52.71227529829819,
                13.723812103271484,
            ],
            [
                52.718410604024996,
                13.735656738281248,
            ]
        ]
    }
}

var polylineLayer = L.polyline(polyline.geometry.coordinates, {
    color: 'red'
}).addTo(map)

$('#startDemo').on('click', function () {

    jQuery.ajax({
        url: "http://localhost:8080/mock",
        type: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
        contentType: "application/json",
        data: JSON.stringify({
            "data": {
                "type": "FeatureCollection",
                "properties": {
                    "name": "DronyMcDroneface"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [
                            52.68429152697491,
                            13.56914520263672
                        ],
                        [
                            52.68616460707266,
                            13.60004425048828
                        ],
                        [
                            52.68741328250609,
                            13.61343383789062
                        ],
                        [
                            52.68866192223463,
                            13.62682342529297
                        ],
                        [
                            52.6906388621178,
                            13.64107131958008
                        ],
                        [
                            52.69261571249358,
                            13.65531921386719
                        ],
                        [
                            52.69573687295826,
                            13.67042541503906
                        ],
                        [
                            52.69729736951359,
                            13.677978515625
                        ],
                        [
                            52.69885781028533,
                            13.68553161621094
                        ],
                        [
                            52.70249862182125,
                            13.69874954223633
                        ],
                        [
                            52.70613912966181,
                            13.71196746826172
                        ],
                        [
                            52.71227529829819,
                            13.72381210327148
                        ],
                        [
                            52.718410604025,
                            13.73565673828125
                        ]
                    ]
                }
            }
        })
    })
        .done(function (data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            console.log(data);

            polylineLayer.addTo(map);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
        })
        .always(function () {
            /* ... */
        });

})

let uavMarker = {
    radius: 10,
    fillColor: "blue",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

let marker;
let fenceGroup = L.layerGroup().addTo(map)

jQuery.ajax({
    url: "http://localhost:8080/data/windmills",
    type: "POST",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    contentType: "application/json",
    data: JSON.stringify({
        "minLon": 13.5420,
        "maxLat": 52.7325,
        "maxLon": 13.7892,
        "minLat": 52.6576,
    })
}).done((data, textStatus, jqXHR) => {
    console.log("hello")
    data[1].forEach(e => {
        const windmill = JSON.parse(e[1])
        const windmillCoords = windmill.coordinates.reverse()

        var socket = new WebSocket(
            `ws://localhost:9851/NEARBY+uav+FENCE+POINT+${windmillCoords[0]}+${windmillCoords[1]}+${550}`
        );
        socket.onmessage = event => {

            let msg = JSON.parse(event.data);
            const date = new Date().toISOString();

            if ("object" in msg) {
                if (marker == null) {
                    marker = L.circleMarker(L.latLng(msg.object.coordinates[1], msg.object.coordinates[0]), uavMarker).addTo(map)
                } else {
                    marker.setLatLng(L.latLng(msg.object.coordinates[1], msg.object.coordinates[0]));
                }

                if (msg.detect == "inside") {
                    fenceGroup.clearLayers()
                    console.log(windmill, msg)
                    var geojsonFenceOptions = {
                        radius: 500,
                        fillColor: "red",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    };
                    L.circle(windmillCoords, geojsonFenceOptions).addTo(map)

                }
            }

        };

        var defaultFenceOptions = {
            radius: 500,
            fillColor: "lightgreen",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.2
        };
        L.circle(windmillCoords, defaultFenceOptions).addTo(map);
    })
})





//return map;