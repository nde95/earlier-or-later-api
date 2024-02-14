import prisma from "./libs/prismadb";
import { fetchAndStorePhotos } from "./fetchPhotos";
import "dotenv/config";
import { getRandomPhotos } from "./getRandomPhotos";
const express = require("express");
const app = express();
const port = 3001;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var cors = require("cors");

app.use(cors());
app.use(express.json());

require("dotenv").config({ path: "./.env" });

app.get("/", (req: any, res: any) => {
  res.send("live and working");
});

app.get("/fetchphotos", async (req: any, res: any) => {
  try {
    await fetchAndStorePhotos();
    res.send("Photos fetched and stored successfully.");
  } catch (error) {
    console.error("Error fetching and storing photos:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getphotos", async (req: any, res: any) => {
  try {
    await prisma.image.findMany({ take: 20 }).then(photos => {
      photos.sort(() => Math.random() - 0.5);
      res.status(200).send(photos);
      console.log("Photos fetched successfully.");
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getrandomphotos", async (req: any, res: any) => {
  try {
    await getRandomPhotos().then(photos => {
      res.send(photos);
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", async (req: any, res: any) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await prisma.registeredUser.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        hashedPassword: hashedPassword,
        highScore: req.body.highScore || 0,
      },
    });
    return res.status(201).send("User registered successfully.");
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req: any, res: any) => {
  try {
    const user = await prisma.registeredUser.findUnique({
      where: {
        username: req.body.username,
      },
    });
    if (user === null) {
      res.status(404).send("User not found.");
    } else {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.hashedPassword
      );
      if (passwordMatch) {
        const accessToken = jwt.sign(
          { userId: user.userId },
          process.env.ACCESS_TOKEN_SECRET
        );
        res.status(200).json({ accessToken: accessToken });
      } else {
        res.status(401).send("Invalid User.");
      }
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Internal Server Error");
  }
});

function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.patch("/updatehighscore", authenticateToken, async (req: any, res: any) => {
  try {
    await prisma.registeredUser.update({
      where: {
        userId: req.user.userId,
      },
      data: {
        highScore: req.body.highScore,
      },
    });
    res.status(200).send("High score updated successfully.");
  } catch (error) {
    console.error("Error updating high score:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`server is listening on port: ${port}`);
});
