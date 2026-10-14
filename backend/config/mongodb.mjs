import { MongoClient } from 'mongodb';

const dbPassword = process.env.DB_PASSWORD || process.env.MONGO_PASSWORD || '<db_password>';
const rawUri = process.env.MONGO_URI || `mongodb+srv://sahan:${dbPassword}@cluster0.ih4jabk.mongodb.net/?appName=Cluster0`;
const uri = rawUri.replace('<db_password>', dbPassword);

const client = new MongoClient(uri);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}

export default client;
