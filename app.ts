import { fetchAndStorePhotos } from "./fetchPhotos";
import "dotenv/config";
const express = require("express");
const app = express();
const port = 3001;

require("dotenv").config({ path: "./.env" });

app.get("/", (req: any, res: any) => {
  res.send("live and working");
});

app.get("/getphotos", async (req: any, res: any) => {
  try {
    await fetchAndStorePhotos();
    res.send("Photos fetched and stored successfully.");
  } catch (error) {
    console.error("Error fetching and storing photos:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`server is listening on port: ${port}`);
});

// photo is linked in struct of https://www.flickr.com/photos/{userID}/{PhotoId}
