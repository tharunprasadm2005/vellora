const { MongoClient } = require("mongodb");
require("dotenv").config();

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");
    
    // Extract the db name from URI or use default
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0] || "ecommerce";
    const db = client.db(dbName);
    const collection = db.collection("products");

    const products = await collection.find({}).toArray();
    let updatedCount = 0;

    for (let product of products) {
        let changed = false;

        let systemMemory = product.systemMemory;
        let variants = product.variants;
        let colors = product.colors;

        if (Array.isArray(systemMemory)) {
            systemMemory = systemMemory.map(mem => {
                if (typeof mem.priceModifier === "undefined" && typeof mem.price === "undefined") {
                    let modifier = 0;
                    const ramLower = (mem.ram || "").toLowerCase();
                    if (ramLower.includes("16 gb") || ramLower.includes("16gb")) modifier = 5000;
                    if (ramLower.includes("32 gb") || ramLower.includes("32gb")) modifier = 10000;
                    if (ramLower.includes("64 gb") || ramLower.includes("64gb")) modifier = 20000;
                    changed = true;
                    return { ...mem, priceModifier: modifier };
                }
                return mem;
            });
        }

        if (Array.isArray(variants)) {
            variants = variants.map(v => {
                if (typeof v.priceModifier === "undefined" && typeof v.price === "undefined") {
                    let modifier = 0;
                    const vLower = (v.variant || "").toLowerCase();
                    if (vLower.includes("512 gb") || vLower.includes("512gb")) modifier = 5000;
                    if (vLower.includes("1 tb") || vLower.includes("1tb")) modifier = 15000;
                    if (vLower.includes("2 tb") || vLower.includes("2tb")) modifier = 30000;
                    changed = true;
                    return { ...v, priceModifier: modifier };
                }
                return v;
            });
        }

        if (Array.isArray(colors)) {
            colors = colors.map(c => {
                if (typeof c.priceModifier === "undefined" && typeof c.price === "undefined") {
                    changed = true;
                    return { ...c, priceModifier: 0 };
                }
                return c;
            });
        }

        if (changed) {
            await collection.updateOne(
                { _id: product._id },
                { $set: { systemMemory, variants, colors } }
            );
            updatedCount++;
        }
    }

    console.log(`Successfully added realistic price modifiers to ${updatedCount} products.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
