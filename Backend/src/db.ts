import mongoose from "mongoose";
import { MONGO_URI } from "./config";

export const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: {
    type: String,
    required: true,
  },
});

export const UserModel = mongoose.model("User", UserSchema);
