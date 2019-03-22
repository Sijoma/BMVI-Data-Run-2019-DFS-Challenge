
let getAIP = function() {

    // TODO: Contact API

}


var initMap = function () {

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




    //bounds = map.getBounds()
    //console.log(bounds)

    function getAIPs(){
        bounds = map.getBounds()
        
        minlat = bounds.getSouthWest().lat
        maxlat = bounds.getNorthEast().lat
        maxlng = bounds.getNorthEast().lng
        minlng = bounds.getSouthWest().lng

        //map.setView([bounds.getCenter().lat, bounds.getCenter().lng], 11);

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
        .done(function(data, textStatus, jqXHR) {
            console.log("HTTP Request Succeeded: " + jqXHR.status);
            
            objects = data[1]
            geojsons = []
    
    
            var geojsonMarkerOptions = {
                radius: 10,
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
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
            console.log(data);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.log("HTTP Request Failed");
        })
        .always(function() {
            /* ... */
        });

    }

    map.on('dragend', function(e){
        getAIPs()
    })

    getAIPs()
    // TODO: Add layer für Flugverbotszonen

    


    return map;


}