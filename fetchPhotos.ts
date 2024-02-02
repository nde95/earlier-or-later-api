import axios from "axios";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

require("dotenv").config({ path: "./.env" });

const prisma = new PrismaClient();

export async function fetchAndStorePhotos(): Promise<void> {
  try {
    // Fetch photos from Flickr API
    const searchResponse = await axios.get(
      "https://api.flickr.com/services/rest/",
      {
        params: {
          method: "flickr.photos.search",
          api_key: process.env.FLICKR_KEY,
          tags: "people",
          format: "json",
          nojsoncallback: 1,
        },
      }
    );

    console.log("API Key:", process.env.FLICKR_KEY);

    console.log("Search response:", searchResponse.data);

    // Process each photo
    const photos = searchResponse.data.photos.photo;
    console.log("Photos array:", photos); // Check the structure of photos array

    for (const photo of photos) {
      // Get detailed information for each photo
      const infoResponse = await axios.get(
        "https://api.flickr.com/services/rest/",
        {
          params: {
            method: "flickr.photos.getInfo",
            api_key: process.env.FLICKR_KEY,
            photo_id: photo.id,
            format: "json",
            nojsoncallback: 1,
          },
        }
      );

      // Extract uploader information and taken date
      const uploader = infoResponse.data.photo.owner.username;
      const uploaderName = infoResponse.data.photo.owner.realname;
      const takenDate = infoResponse.data.photo.dates.taken;

      // Store photo data in your database using Prisma
      await prisma.image.create({
        data: {
          userId: photo.owner,
          imageId: photo.id,
          username: uploader,
          realName: uploaderName,
          takenDate: new Date(takenDate),
        },
      });
    }

    console.log("Photos fetched and stored successfully.");
  } catch (error) {
    console.error("Error fetching and storing photos:", error);
  }
}
