var app = require("express")();
var http = require("http").Server(app);
const bodyParser = require("body-parser");
const redis = require('redis');
const client = redis.createClient(9851, 'localhost');

const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.put('/data/windmills', function(req, res) {
  let data = req.body.data;
  const collectionName = 'Windmills'
  try {
  data.features.forEach(element => {
    client.send_command(
      "SET",
      [collectionName, element.properties.IDENT, "OBJECT", JSON.stringify(element.geometry)],
      (err, reply) => {
        if (err) {
          console.log("error geojson", err ,reply);
        } else {
          console.log("inserting geojson", reply);
        }
      }
    );
  });
  } catch (e) {
    res.sendStatus(400, 'There was an error updating the information: ' + e)
  };
});

app.get('/data/:collectionName', function(req, res) {
  const collectionName = req.param.collectionName
  const minLat = req.body.lowerLat;
  const minLon = req.body.lowerLong;
  const maxLat = req.body.upperLat;
  const maxLon = req.body.upperLong;

  try {
    client.send_command(
      "WITHIN",
      [collectionName, 'BOUNDS', minLat, minLon, maxLat, maxLon],
      (err, reply) => {
        if (err) {
          res.sendStatus(400, 'there was an error querying the data')
        } else {
          res.sendStatus(200, reply)
        }
      }
    );
  } catch (e) {
    res.sendStatus(400, 'There was an error updating the information: ' + e)
  }
})

app.put('/data/fireHazards', function(req, res) {
  const longitude = req.body.longitude;
  const latitude = req.body.latitude;
  const metadata = req.body.metadata;
  const collectionName = 'fireHazards';
  const geofenceName = 'fire_' + Math.random().toString(36).substr(2, 9);
  // tile38 verbindung
  try {
    client.send_command(
      "SET",
      [collectionName, geofenceName, "POINT", longitude, latitude],
      (err, reply) => {
        if (err) {
          console.log("error geojson", err ,reply);
        } else {
          console.log("inserting geojson", reply);
          // antworten mit IDs
          res.sendStatus(200, reply)
        }
      }
    );
  } catch (e) {
    res.sendStatus(400, 'There was an error updating the information: ' + e)
  }
});



http.listen(PORT, function() {
  console.log(`Running on http://localhost:${PORT}`);
});