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

app.put('/data/', function(req, res) {
  const data = req.body.data;
  // Vll timestmap zu data hinzufügen
  const timestamp = Date.now()
  const collectionName = req.body.collectionName;
  const geofenceName = req.body.geofenceName;
  // tile38 verbindung
  try {
    client.send_command(
      "SET",
      [collectionName, geofenceName, "OBJECT", JSON.stringify(data)],
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
  // Marks code reinschreiben

  


});

http.listen(PORT, function() {
  console.log(`Running on http://localhost:${PORT}`);
});
