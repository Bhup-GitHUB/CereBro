import express from "express";
const app = express();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectToDB, UserModel } from "./db";
import { JWT_SECRET } from "./config";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";

app.use(express.json());

connectToDB();

app.post("/api/v1/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await UserModel.create({ username, password: hashedPassword });

    res.json({
      message: "User created successfully",
    });
  } catch (e) {
    res.status(411).json({
      message: "User already exists or error occurred",
    });
  }
});

app.post("/api/v1/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Signin successful", token });
  } catch (e) {
    console.error("Signin error:", e);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
