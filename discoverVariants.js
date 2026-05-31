const { MongoClient } = require("mongodb");
require("dotenv").config();

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0] || "ecommerce";
    const db = client.db(dbName);
    const collection = db.collection("products");

    const products = await collection.find({}).toArray();
    
    const uniqueRams = new Set();
    const uniqueVariants = new Set();
    
    for (let product of products) {
        if (Array.isArray(product.systemMemory)) {
            product.systemMemory.forEach(mem => {
                if (mem.ram) uniqueRams.add(mem.ram);
            });
        }
        if (Array.isArray(product.variants)) {
            product.variants.forEach(v => {
                if (v.variant) uniqueVariants.add(v.variant);
            });
        }
    }

    console.log("Unique RAMs:", Array.from(uniqueRams));
    console.log("Unique Variants:", Array.from(uniqueVariants));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
