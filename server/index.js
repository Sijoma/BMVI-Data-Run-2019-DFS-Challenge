var express = require("express");
var app = express();
var http = require("http").Server(app);
const bodyParser = require("body-parser");

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 9851;
const redis = require("redis");
const client = redis.createClient(REDIS_PORT, REDIS_HOST);
client.on("error", error => {
  console.log(
    `Error establishing Redis connection to ${REDIS_HOST}:${REDIS_PORT}. Retrying...`
  );
});
client.on("connect", () => {
  console.log(
    `Successfully connected to redis on  ${REDIS_HOST}:${REDIS_PORT}`
  );
});
var fs = require("fs");

const PORT = 8080;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

const airspaces = JSON.parse(
  fs.readFileSync(`${__dirname}/assets/geojsons/airspaces_DFS.json`)
);

const windmills = JSON.parse(
  fs.readFileSync(`${__dirname}/assets/geojsons/windmills_DFS.json`)
);

const airports = JSON.parse(
  fs.readFileSync(`${__dirname}/assets/geojsons/airports_DFS.json`)
);

_addFeatureCollection("airspaces", "IDENT", airspaces.features);
_addFeatureCollection("windmills", "IDENT", windmills.features, true);
_addFeatureCollection("airports", "IDENT", airports.features);

app.use(express.static(`${__dirname}/src`));

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

app.post("/data/:collectionName", function(req, res) {
  const collectionName = req.params.collectionName;
  const minLat = req.body.minLat;
  const minLon = req.body.minLon;
  const maxLat = req.body.maxLat;
  const maxLon = req.body.maxLon;
  const limit = req.body.limit ? req.body.limit : 1000000;

  try {
    client.send_command(
      "WITHIN",
      [
        collectionName,
        "LIMIT",
        limit,
        "BOUNDS",
        minLat,
        minLon,
        maxLat,
        maxLon
      ],
      (err, reply) => {
        if (err) {
          res.sendStatus(400, "there was an error querying the data");
        } else {
          res.json(reply);
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

app.post("/BOS/restrictAirspacePeople", function(req, res) {
  const title = req.body.title;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  // zeit berechnen in s für expire
  let geoJson = req.body.geojson; // Polyline

  // client.send_command(
  //   'NEARBY', ['uav', 'FENCE', 'ROAM', 'restrictions', '*', '50000000000']
  // )
  res.sendStatus(200);

  coords = geoJson.features[0].geometry.coordinates;
  for (let i = 0; i < coords.length; i++) {
    setTimeout(() => {
      client.send_command("SET", [
        "restrictions",
        "airspace" + title,
        "POINT",
        coords[i][0],
        coords[i][1]
      ]);
    }, i * 3000);
  }
});

function _addFeatureCollection(key, id, features, withIndex = false) {
  features.forEach((element, index) => {
    let objectId = withIndex
      ? `${element.properties[id]}_${index}`
      : element.properties[id];

    // set geometry
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

    // add properties
    client.send_command(
      "JSET",
      [key, `${objectId}`, "properties", JSON.stringify(element.properties)], // noch ohne properties
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
