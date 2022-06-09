import express from "express";
import { ObjectId } from "mongodb";
import { getClient } from "../db";
import ShoutOut, { User } from "../models/ShoutOut";

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

shoutOutRouter.get("/to/:to", async (req, res) => {
  const to: string = req.params.to;
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .find({ to: to })
      .toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutOutRouter.get("/me/:me", async (req, res) => {
  const me: string = req.params.me;
  try {
    const client = await getClient();
    const results = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .find({ $or: [{ to: me }, { from: me }] })
      .toArray();
    res.json(results);
  } catch (err) {
    errorResponse(err, res);
  }
});

shoutOutRouter.put("/upvote/:id", async (req, res) => {
  const id: string = req.params.id;
  const user: User = req.body;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .updateOne({ _id: new ObjectId(id) }, { $push: { likes: user } });
    if (result.modifiedCount === 0) {
      res.status(404).json({ message: "Id not found" });
    } else {
      res.status(201).json(user);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

// shoutOutRouter.put("/upvote/:id", async (req, res) => {
//   const id: string = req.params.id;
//   const user: any = req.body;
//   try {
//     const client = await getClient();
//     const update = await client
//       .db()
//       .collection<ShoutOut>("shoutouts")
//       .updateOne(
//         { _id: new ObjectId(id) },
//         { $push: { likes: { displayName: user.displayName, uid: user.uid } } }
//       );
//     if (update.modifiedCount === 0) {
//       res.status(404).json({ message: `id not found` });
//     } else {
//       res.status(201).json(user);
//     }
//   } catch (err) {
//     errorResponse(err, res);
//   }
// });
shoutOutRouter.put("/downvote/:id", async (req, res) => {
  const id: string = req.params.id;
  const user: any = req.body;
  try {
    const client = await getClient();
    const update = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .updateOne(
        { _id: new ObjectId(id) },
        { $pull: { likes: { displayName: user.displayName, uid: user.uid } } }
      );
    if (update.modifiedCount === 0) {
      res.status(404).json({ message: `id not found` });
    } else {
      res.status(201).json(user);
    }
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

shoutOutRouter.delete("/:id", async (req, res) => {
  const id: string = req.params.id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<ShoutOut>("shoutouts")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: `shoutout with id: ${id} not found` });
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default shoutOutRouter;
