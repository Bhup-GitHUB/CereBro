import dotenv from "dotenv";
dotenv.config();

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const MONGO_URI = getEnvVar("MONGO_URI");
export const JWT_SECRET = getEnvVar("JWT_SECRET");
export const PORT = getEnvVar("PORT", "3000");
