import { verifyAccess } from "../utils/jwt.js";

export function auth(req, res, next) {
  const hdr = req.headers && req.headers.authorization;
  if (!hdr || !hdr.startsWith("Bearer "))
    return res.status(401).json({ error: "missing token" });
  try {
    const token = hdr.slice("Bearer ".length);
    const payload = verifyAccess(token);
    if (!payload) return res.status(401).json({ error: "invalid token" });

    // Attach payload to request if needed (optional)
    req.user = payload;

    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}
