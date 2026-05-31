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
    let updatedCount = 0;

    for (let product of products) {
        let changed = false;

        let systemMemory = product.systemMemory;
        let variants = product.variants;

        if (Array.isArray(systemMemory)) {
            systemMemory = systemMemory.map(mem => {
                let modifier = mem.priceModifier || 0;
                const ramLower = (mem.ram || "").toLowerCase();
                
                if (typeof mem.priceModifier === "undefined" || mem.priceModifier === 0) {
                    if (ramLower.includes("12 gb") || ramLower.includes("12gb")) modifier = 3000;
                    if (ramLower.includes("16 gb") || ramLower.includes("16gb")) modifier = 5000;
                    if (ramLower.includes("32 gb") || ramLower.includes("32gb")) modifier = 10000;
                    if (ramLower.includes("64 gb") || ramLower.includes("64gb")) modifier = 20000;
                }
                
                if (mem.priceModifier !== modifier) {
                    changed = true;
                }
                
                return { ...mem, priceModifier: modifier };
            });
        }

        if (Array.isArray(variants)) {
            variants = variants.map(v => {
                let modifier = v.priceModifier || 0;
                const vLower = (v.variant || "").toLowerCase();
                
                if (typeof v.priceModifier === "undefined" || v.priceModifier === 0) {
                    // Storage
                    if (vLower.includes("512 gb") || vLower.includes("512gb")) modifier = 5000;
                    if (vLower.includes("1 tb") || vLower.includes("1tb")) modifier = 15000;
                    if (vLower.includes("2 tb") || vLower.includes("2tb")) modifier = 30000;
                    
                    // AirTags
                    if (vLower === "4-pack") modifier = 8000; // Assuming base price is 1-pack
                    
                    // PlayStation
                    if (vLower === "disc edition") modifier = 10000; // Disc edition is more expensive than digital
                    
                    // Laptops with screen sizes
                    if (vLower.includes("15 inch")) modifier += 10000;
                    if (vLower.includes("14 inch") || vLower.includes("14.5 inch")) modifier += 5000;
                }
                
                if (v.priceModifier !== modifier) {
                    changed = true;
                }

                return { ...v, priceModifier: modifier };
            });
        }

        if (changed) {
            await collection.updateOne(
                { _id: product._id },
                { $set: { systemMemory, variants } }
            );
            updatedCount++;
        }
    }

    console.log(`Successfully updated variants for ${updatedCount} products.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
