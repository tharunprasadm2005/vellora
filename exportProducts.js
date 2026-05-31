const { MongoClient } = require("mongodb");
const fs = require("fs");
require("dotenv").config();

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0] || "ecommerce";
    const db = client.db(dbName);
    const collection = db.collection("products");

    const products = await collection.find({}, { projection: { name: 1, systemMemory: 1, variants: 1, price: 1, mrp: 1 } }).toArray();
    
    fs.writeFileSync("products_for_research.json", JSON.stringify(products, null, 2));
    console.log(`Exported ${products.length} products to products_for_research.json`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
