import type { Request, Response, NextFunction } from "express";
import { verifyAccess } from "../utils/jwt.ts";
export function auth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer "))
    return res.status(401).json({ error: "missing token" });
  try {
    const token = hdr.slice("Bearer ".length);
    const payload = verifyAccess(token);
    if (!payload) return res.status(401).json({ error: "invalid token" });

    next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

// export function requireRole(...roles: Array<"USER" | "ADMIN">) {
//   return (req: RequestExtend, res: Response, next: NextFunction) => {
//     if (!req.user) return res.status(401).json({ error: "unauthenticated" });
//     // if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
//     next();
//   };
// }
