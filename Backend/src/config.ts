// src/config.ts
import dotenv from "dotenv";
dotenv.config();

const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const MONGO_URI = getEnvVar("MONGO_URI");
export const JWT_SECRET = getEnvVar("JWT_SECRET");
export const PORT = process.env.PORT || "3000";
