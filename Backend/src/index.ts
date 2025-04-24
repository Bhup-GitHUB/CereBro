import express from "express";
const app = express();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectToDB, UserModel } from "./db";
import { JWT_SECRET } from "./config";

app.use(express.json());

connectToDB();

app.post("/api/v1/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    await UserModel.create({ username, password });

    res.json({
      message: "User created successfully",
    });
  } catch (e) {
    res.status(411).json({
      message: "User already exists or error occurred",
    });
  }
});
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
