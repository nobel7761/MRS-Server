export default () => ({
  mongodb: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
  },
  bcrypt: {
    saltRounds: 10,
  },
  timezone: process.env.TIMEZONE || 'UTC',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    from:
      process.env.EMAIL_FROM ||
      `"National Ideal College Alumni Association" <${process.env.EMAIL_USER}>`,
    secure: process.env.EMAIL_SECURE === 'true',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'nicaa',
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
});
