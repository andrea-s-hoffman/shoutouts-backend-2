import express from "express";
import { getClient } from "../db";
import ShoutOut from "../models/ShoutOut";

const shoutOutRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

shoutOutRouter.get("/", async (req, res) => {
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .find()
      .toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutOutRouter.post("/", async (req, res) => {
  const newShoutOut: ShoutOut = req.body;
  try {
    const client = await getClient();
    await client.db().collection<ShoutOut>("shoutouts").insertOne(newShoutOut);
    res.status(201).json(newShoutOut);
  } catch (err) {
    errorResponse(err, res);
  }
});

export default shoutOutRouter;
