var app = require("express")();
var http = require("http").Server(app);
const bodyParser = require("body-parser");
const redis = require("redis");
const client = redis.createClient(9851, "localhost");
var fs = require("fs");

const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const airspaces = JSON.parse(
  fs.readFileSync(`${__dirname}/assets/geojsons/airspaces_DFS.json`)
);

const windmills = JSON.parse(
  fs.readFileSync(`${__dirname}/assets/geojsons/windmills_DFS.json`)
);

_addFeatureCollection("airspaces", "IDENT", airspaces.features);
_addFeatureCollection("windmills", "IDENT", windmills.features, true);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.put("/data/:key", function(req, res) {
  try {
    let data = req.body.data;
    let key = req.param.key;
    _addFeatureCollection(key, "IDENT", data.features);
    res.send(200);
  } catch (e) {
    res.sendStatus(400, "There was an error updating the information: " + e);
  }
});

app.get("/data/:collectionName", function(req, res) {
  const collectionName = req.param.collectionName;
  const minLat = req.body.lowerLat;
  const minLon = req.body.lowerLong;
  const maxLat = req.body.upperLat;
  const maxLon = req.body.upperLong;
  const limit = req.body.limit;

  try {
    client.send_command(
      "WITHIN",
      [collectionName,"LIMIT", req.body.limit ? limit : 1000000, "BOUNDS", minLat, minLon, maxLat, maxLon],
      (err, reply) => {
        if (err) {
          res.sendStatus(400, "there was an error querying the data");
        } else {
          res.sendStatus(200, reply);
        }
      }
    );
  } catch (e) {
    res.sendStatus(400, "There was an error updating the information: " + e);
  }
});

app.put("/data/fireHazards", function(req, res) {
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  const metadata = req.body.metadata;
  const collectionName = "fireHazards";
  const geofenceName =
    "fire_" +
    Math.random()
      .toString(36)
      .substr(2, 9);
  // tile38 verbindung
  try {
    client.send_command(
      "SET",
      [collectionName, geofenceName, "POINT", longitude, latitude],
      (err, reply) => {
        if (err) {
          console.log("error geojson", err, reply);
        } else {
          console.log("inserting geojson", reply);
          // antworten mit IDs
          res.sendStatus(200, reply);
        }
      }
    );
  } catch (e) {
    res.sendStatus(400, "There was an error updating the information: " + e);
  }
});

function _addFeatureCollection(key, id, features, withIndex = false) {
  features.forEach((element, index) => {
    let objectId = withIndex
      ? `${element.properties[id]}_${index}`
      : element.properties[id];

    let data = {
      type: "Feature",
      geometry: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: element.geometry,
            properties: {}
          }
        ]
      },
      properties: element.properties
    };

    client.send_command(
      "SET",
      [key, objectId, "OBJECT", JSON.stringify(element.geometry)], // noch ohne properties
      (err, reply) => {
        if (err) {
          console.log("error geojson", err, reply);
        } else {
          // console.log("inserting geojson", reply);
        }
      }
    );
  });
}

http.listen(PORT, function() {
  console.log(`Running on http://localhost:${PORT}`);
});
