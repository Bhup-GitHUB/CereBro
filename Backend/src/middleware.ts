import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(403).json({ message: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    (req as any).userID = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({
      message: "Authentication failed",
    });
  }
};

export const validateSignupInputs = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { username, password } = req.body;

  if (!username || typeof username !== "string") {
    res.status(411).json({ message: "Username is required" });
    return;
  }

  if (username.length < 3 || username.length > 10) {
    res.status(411).json({
      message: "Username should be 3-10 letters",
    });
    return;
  }

  if (!password || typeof password !== "string") {
    res.status(411).json({ message: "Password is required" });
    return;
  }

  if (password.length < 8 || password.length > 20) {
    res.status(411).json({
      message: "Password should be 8 to 20 letters",
    });
    return;
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasSpecialChar || !hasNumber) {
    res.status(411).json({
      message:
        "Password should have at least one uppercase, one lowercase, one special character, one number",
    });
    return;
  }

  next();
};
