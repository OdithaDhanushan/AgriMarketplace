const dns = require('dns');
const path = require('path');
const { MongoClient } = require('mongodb');

// Ensure DNS SRV records resolve correctly
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI || "mongodb+srv://sahan:agri12345@cluster0.ih4jabk.mongodb.net/agrimarketplace?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
async function disconnectFromMongoDB() {
  await client.close();
}

module.exports = {
  client,
  connectToMongoDB,
  disconnectFromMongoDB,
};
