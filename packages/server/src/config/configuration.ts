export default () => ({
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/cargo'
  },
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
    region: process.env.S3_REGION
  },
  auth: {
    publicKeyUri: process.env.AUTH_PUBLIC_KEY_URI
  }
});
