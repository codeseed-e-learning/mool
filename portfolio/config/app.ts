export default {
  name: process.env.APP_NAME ?? "Mool",
  env: process.env.APP_ENV ?? "local",
  port: Number(process.env.PORT) || 3000,
};
