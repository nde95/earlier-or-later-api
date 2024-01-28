const express = require("express");
const app = express();
const port = 3001;

app.get("/", (req, res) => {
  res.send("live and working");
});

app.listen(port, () => {
  console.log("server is live at:", port);
});
