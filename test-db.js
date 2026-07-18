const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://codernest_portal:10620731Tu@cluster0.sgkc8ap.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch(e) {
    console.error("Connection failed:", e);
  } finally {
    await client.close();
  }
}
run();
