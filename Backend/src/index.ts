import express from "express";
const app = express();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectToDB, UserModel } from "./db";
import { JWT_SECRET, PORT } from "./config";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ContentModel, ShareModel, TagModel } from "./db";
import { AuthMiddleware, validateSignupInputs } from "./middleware";
import { randomBytes } from "crypto";

app.use(express.json());

connectToDB();

app.post(
  "/api/v1/signup",
  validateSignupInputs,
  async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
      const existingUser = await UserModel.findOne({ username });
      if (existingUser) {
        res.status(403).json({
          message: "User already exists with this username",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await UserModel.create({ username, password: hashedPassword });

      res.status(200).json({
        message: "Signed up",
      });
    } catch (e) {
      console.error("Signup error:", e);
      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

app.post("/api/v1/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      res.status(403).json({ message: "Wrong email password" });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(403).json({ message: "Wrong email password" });
      return;
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (e) {
    console.error("Signin error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get(
  "/api/v1/content",
  AuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const contents = await ContentModel.find({ userID: (req as any).userID })
        .populate("tags")
        .populate("userID", "username");

      const formattedContents = contents.map((content: any) => ({
        id: content._id,
        type: content.type,
        link: content.link,
        title: content.title,
        tags: content.tags.map((tag: any) => tag.name),
      }));

      res.status(200).json({ content: formattedContents });
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ error: "Failed to fetch content" });
    }
  }
);

app.post(
  "/api/v1/content",
  AuthMiddleware,
  async (req: Request, res: Response) => {
    const { type, link, title, tags } = req.body;
    const userID = (req as any).userID;

    if (!["document", "tweet", "youtube", "link"].includes(type)) {
      res.status(400).json({ error: "Invalid content type" });
      return;
    }

    try {
      const tagIds = [];
      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          let tag = await TagModel.findOne({ name: tagName });
          if (!tag) {
            tag = await TagModel.create({ name: tagName });
          }
          tagIds.push(tag._id);
        }
      }

      const newContent = await ContentModel.create({
        type,
        title,
        link,
        tags: tagIds,
        userID,
      });

      res.status(201).json(newContent);
    } catch (error) {
      console.error("Error creating content:", error);
      res.status(500).json({ error: "Failed to create content" });
    }
  }
);

app.post(
  "/api/v1/brain/share",
  AuthMiddleware,
  async (req: Request, res: Response) => {
    const { share } = req.body;
    const userId = (req as any).userID;

    try {
      let shareDoc = await ShareModel.findOne({ userId });

      if (shareDoc) {
        shareDoc.isActive = share;
        await shareDoc.save();
      } else if (share) {
        const shareLink = randomBytes(16).toString("hex");
        shareDoc = await ShareModel.create({
          userId,
          shareLink,
          isActive: true,
        });
      } else {
        res.status(200).json({ message: "Sharing is already disabled" });
        return;
      }

      if (!share) {
        res.json({ message: "Sharing disabled successfully" });
        return;
      }

      res.json({
        link: shareDoc.shareLink,
      });
    } catch (error) {
      console.error("Error managing share:", error);
      res.status(500).json({ error: "Failed to manage sharing settings" });
    }
  }
);

app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response) => {
  const { shareLink } = req.params;

  try {
    const share = await ShareModel.findOne({
      shareLink,
      isActive: true,
    });

    if (!share) {
      res.status(404).json({
        error: "If the share link is invalid or sharing is disabled",
      });
      return;
    }

    const user = await UserModel.findById(share.userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const contents = await ContentModel.find({ userID: share.userId })
      .populate("tags")
      .lean();

    const formattedContents = contents.map((content) => {
      return {
        id: content._id,
        type: content.type,
        link: content.link,
        title: content.title,
        tags: content.tags.map((tag: any) => tag.name),
      };
    });

    res.json({
      username: user.username,
      content: formattedContents,
    });
  } catch (error) {
    console.error("Error fetching shared content:", error);
    res.status(500).json({ error: "Failed to fetch shared content" });
  }
});

app.delete(
  "/api/v1/content",
  AuthMiddleware,
  async (req: Request, res: Response) => {
    const { contentId } = req.body;
    const userID = (req as any).userID;

    try {
      const content = await ContentModel.findById(contentId);

      if (!content) {
        res.status(404).json({ error: "Content not found" });
        return;
      }

      if (content.userID.toString() !== userID) {
        res.status(403).json({ error: "Trying to delete a doc you don't own" });
        return;
      }

      await ContentModel.deleteOne({ _id: contentId });

      res.status(200).json({ message: "Delete succeeded" });
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ error: "Failed to delete content" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
