import cors from "cors";

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

// Adiciona origens extras via variável de ambiente (separadas por vírgula)
if (process.env.CORS_ALLOWED_ORIGINS) {
  const extras = process.env.CORS_ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  allowedOrigins.push(...extras);
}

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser tools
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  credentials: false,
};

export const corsMiddleware = cors(corsOptions);
