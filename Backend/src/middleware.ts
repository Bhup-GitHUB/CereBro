import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWTPASSWORD = "cerebro";

export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWTPASSWORD) as { id: string };
    (req as any).userID = decoded.id; // ✅ Assign to userID to match index.ts
    next();
  } catch (err) {
    res.status(401).json({
      message: "Invalid token",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
