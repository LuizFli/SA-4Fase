
export const env = {
  accessSecret: process.env.ACCESS_SECRET || 'change_this_access_secret',
  refreshSecret: process.env.REFRESH_SECRET || 'change_this_refresh_secret',
  accessTtl: process.env.ACCESS_TTL || '3600', // seconds or string like '1h'
  refreshTtl: process.env.REFRESH_TTL || '86400',
};
