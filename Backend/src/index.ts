import express from "express";
const app = express();
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectToDB, UserModel } from "./db";
import { JWT_SECRET } from "./config";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ContentModel, ShareModel } from "./db";
import { AuthMiddleware } from "./middleware";
import { randomBytes } from "crypto";

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

app.get(
  "/api/v1/content",
  AuthMiddleware,
  async (req: Request, res: Response) => {
    try {
      const contents = await ContentModel.find()
        .populate("tags")
        .populate("userID");

      res.status(200).json(contents);
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
    const { title, link, tags } = req.body;
    const userId = req.body.userId;

    try {
      const newContent = await ContentModel.create({
        title,
        link,
        tags,
        userID: userId,
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
      res.status(500).json({ error: "Failed to create share link" });
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
        error: "Share link not found or sharing is disabled",
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
      let type = "link";
      if (
        content.link.includes("youtube.com") ||
        content.link.includes("youtu.be")
      ) {
        type = "youtube";
      } else if (
        content.link.includes("twitter.com") ||
        content.link.includes("x.com")
      ) {
        type = "tweet";
      } else if (
        content.link.endsWith(".pdf") ||
        content.link.endsWith(".doc") ||
        content.link.endsWith(".docx") ||
        content.title.toLowerCase().includes("document")
      ) {
        type = "document";
      }

      return {
        id: content._id,
        type,
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
    const { title, link, tags } = req.body;
    const userId = (req as any).userID;
    try {
      const newContent = await ContentModel.deleteOne({
        title,
        link,
        tags,
        userID: userId,
      });
      res.status(200).json(newContent);
    } catch (error) {
      console.error("Error deleting content:", error);
      res.status(500).json({ error: "Failed to delete content" });
    }
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
