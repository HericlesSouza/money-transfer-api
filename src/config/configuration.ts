export interface AppConfig {
  api: {
    port: number;
  };
  database: {
    path: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export default (): AppConfig => ({
  api: {
    port: parseInt(process.env.API_PORT!) || 3000,
  },
  database: {
    path: process.env.DATABASE_PATH!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN!,
  },
});
