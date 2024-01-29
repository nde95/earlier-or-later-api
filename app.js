var express = require("express");
var app = express();
var port = 3001;
app.get("/", function (req, res) {
    res.send("live and working");
});
app.listen(port, function () {
    console.log("server is live at:", port);
});
