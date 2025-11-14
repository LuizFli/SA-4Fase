import jwt from "jsonwebtoken";
import { env } from "../env.js";

export function signAccessToken(payload) {
  return jwt.sign(payload, env.accessSecret, { expiresIn: env.accessTtl });
}
export function signRefreshToken(payload) {
  return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshTtl });
}
export function verifyAccess(token) {
  return jwt.verify(token, env.accessSecret);
}
export function verifyRefresh(token) {
  return jwt.verify(token, env.refreshSecret);
}
