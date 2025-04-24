import mongoose, { Schema } from "mongoose";
import { MONGO_URI } from "./config";

export const connectToDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 10,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index({ username: 1 });

const ContentSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["document", "tweet", "youtube", "link"],
  },
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index for userID and title
ContentSchema.index({ userID: 1, title: 1 });

const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

TagSchema.index({ name: 1 });

const ShareSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  shareLink: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ShareSchema.index({ shareLink: 1, isActive: 1 });

export const UserModel = mongoose.model("User", UserSchema);
export const ContentModel = mongoose.model("Content", ContentSchema);
export const TagModel = mongoose.model("Tag", TagSchema);
export const ShareModel = mongoose.model("Share", ShareSchema);
