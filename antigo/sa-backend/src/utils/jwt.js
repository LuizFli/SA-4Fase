import jwt from "jsonwebtoken";
import { env } from "../env.js";

// Sign an access token. payload should be a plain object (userId, email, name...)
export function signAccessToken(payload) {
  return jwt.sign(payload, env.accessSecret, {
    expiresIn: Number(env.accessTtl) || env.accessTtl,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.refreshSecret, {
    expiresIn: Number(env.refreshTtl) || env.refreshTtl,
  });
}

export function verifyAccess(token) {
  return jwt.verify(token, env.accessSecret);
}

export function verifyRefresh(token) {
  return jwt.verify(token, env.refreshSecret);
}