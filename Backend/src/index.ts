import express from "express";
const app = express();
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

app.use(express.json());

app.post("/api/v1/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  res.send("welcome bro");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
