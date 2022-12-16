export default () => {
  const PORT = parseInt(process.env.PORT, 10) || 5000;
  const POSTGRES_URI = process.env.POSTGRES_URI;
  const MONGO_URI = process.env.MONGO_URI;

  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  const ACCESS_TOKEN_LIFE_TIME = process.env.ACCESS_TOKEN_LIFE_TIME;
  const REFRESH_TOKEN_LIFE_TIME = process.env.REFRESH_TOKEN_LIFE_TIME;

  const EMAIL_FROM = process.env.EMAIL_FROM;
  const EMAIL_FROM_PASSWORD = process.env.EMAIL_FROM_PASSWORD;
  const READ_EMAIL = process.env.READ_EMAIL;
  const READ_EMAIL_PASSWORD = process.env.READ_EMAIL_PASSWORD;
  const THROTTLE_TTL = parseInt(process.env.THROTTLE_TTL, 10) || 10;
  const THROTTLE_LIMIT = parseInt(process.env.THROTTLE_LIMIT, 10) || 5;

  const EMAIL_CONFIRMATION_URL = process.env.EMAIL_CONFIRMATION_URL; //homework-nestjs.vercel.app/api/auth/registration-confirmation

  return {
    PORT,
    POSTGRES_URI,
    MONGO_URI,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_LIFE_TIME,
    REFRESH_TOKEN_LIFE_TIME,
    EMAIL_FROM,
    EMAIL_FROM_PASSWORD,
    READ_EMAIL,
    READ_EMAIL_PASSWORD,
    THROTTLE_TTL,
    THROTTLE_LIMIT,
    EMAIL_CONFIRMATION_URL,
  };
};
