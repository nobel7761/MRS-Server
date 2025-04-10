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
});
