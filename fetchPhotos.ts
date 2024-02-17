import axios from "axios";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

require("dotenv").config({ path: "./.env" });

const prisma = new PrismaClient();

export async function fetchAndStorePhotos(): Promise<void> {
  try {
    const searchResponse = await axios.get(
      "https://api.flickr.com/services/rest/",
      {
        params: {
          method: "flickr.groups.pools.getPhotos",
          api_key: process.env.FLICKR_KEY,
          group_id: "950727@N20",
          tags: "",
          format: "json",
          nojsoncallback: 1,
          page: 1,
          per_page: 30,
        },
      }
    );
    console.log("Search response:", searchResponse.data);

    const photos = searchResponse.data.photos.photo;
    console.log("Photos array:", photos);

    for (const photo of photos) {
      // Get date information and username/title/realname if they all exist from API call using info from first call
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

      const uploader = infoResponse.data.photo.owner.username;
      const uploaderName = infoResponse.data.photo.owner.realname;
      const takenDate = infoResponse.data.photo.dates.taken;
      const format = infoResponse.data.photo.originalformat;
      const picSecret = infoResponse.data.photo.secret;
      const serverId = infoResponse.data.photo.server;
      const url = infoResponse.data.photo.urls.url[0]._content;
      const linktype = infoResponse.data.photo.urls.url[0].type;

      // Store info in db schema
      await prisma.image.create({
        data: {
          userId: photo.owner,
          imageId: photo.id,
          username: uploader,
          realName: uploaderName,
          title: photo.title,
          takenDate: new Date(takenDate),
          format: format,
          picSecret: picSecret,
          url: url,
          pageType: linktype,
          serverId: serverId,
        },
      });
    }

    console.log("Photos fetched and stored successfully.");
  } catch (error) {
    console.error("Error fetching and storing photos:", error);
  }
}

// https://live.staticflickr.com/{server-id}/{id}_{secret}_b.jpg
