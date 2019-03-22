var app = require("express")();
var http = require("http").Server(app);
const bodyParser = require("body-parser");

const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

http.listen(PORT, function() {
  console.log(`Running on http://localhost:${PORT}`);
});
