$(document).ready(function () {
    let map = L.map('small_map').setView([52.529, 13.377], 13);

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
    
        // Send to backend

        data = {
            title: "TEST",
            reason: "MyReason",
            startDate: "01.01.2019",
            endDate: "01.02.2019",
            geojson: e.layer.toGeoJSON()
        }

        console.log(data)

        $.ajax({
            type: "post",
            url: "http://localhost:8080/bos/restrictAirspace",
            data: data,
            success: function (response) {
                console.log('sent')
                console.log(response)
            }
        });


        // Do whatever else you need to. (save to db; add to map etc) -> ok!
        map.addLayer(layer);
    
        map.removeControl(drawControl);
        
    });

});

