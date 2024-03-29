import "dotenv/config";
import { ServerApiVersion, MongoClient } from "mongodb";

require("dotenv").config({ path: "./.env" });

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env.local"
  );
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function getRandomPhotos() {
  let count = 0;
  try {
    await client.connect();
    const database = client.db("test");
    const collection = database.collection("Image");

    const randomImages = await collection
      .aggregate([{ $sample: { size: 20 } }])
      .toArray();

    return randomImages;
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw error;
  } finally {
    await client.close();
  }
}
