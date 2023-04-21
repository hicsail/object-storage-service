export default () => ({
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/cargo'
  },
  auth: {
    publicKeyUri: process.env.AUTH_PUBLIC_KEY_URI
  }
});
