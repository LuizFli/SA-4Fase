export const env = {
  accessSecret: process.env.ACCESS_TOKEN_SECRET || "dev_access_secret",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || "dev_refresh_secret",
  // Accept human strings like "15m" or numbers (seconds)
  accessTtl: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshTtl: process.env.JWT_REFRESH_EXPIRES_IN || "8h",
  simulatorUrl: process.env.SIMULATOR_URL || "",
};
