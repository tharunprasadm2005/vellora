const { MongoClient } = require("mongodb");
require("dotenv").config();

async function run() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    
    const dbName = process.env.MONGO_URI.split('/').pop().split('?')[0] || "ecommerce";
    const db = client.db(dbName);
    const collection = db.collection("products");

    const realPrices = {
        "Apple AirTag 4-pack": {
            basePrice: 3790,
            variants: { "4-Pack": 9110, "1-Pack": 0 }
        },
        "OnePlus 12": {
            basePrice: 48502,
            systemMemory: { "16 GB": 5087, "12 GB": 0 },
            variants: { "512 GB": 0, "256 GB": 0 } // handled all in RAM modifier for simplicity since variant 16/512 are linked
        },
        "Apple iPhone 16 Pro Max": {
            basePrice: 127490,
            systemMemory: { "8 GB": 0 },
            variants: { "256 GB": 0, "512 GB": 18500, "1 TB": 37500 }
        },
        "Samsung Galaxy S24 Ultra": {
            basePrice: 98900,
            systemMemory: { "12 GB": 0 },
            variants: { "256 GB": 0, "512 GB": 11100, "1 TB": 36100 }
        },
        "Google Pixel 9 Pro XL": {
            basePrice: 89999,
            systemMemory: { "16 GB": 0 },
            variants: { "256 GB": 0, "512 GB": 20000 }
        },
        "Sony PlayStation 5 Slim": {
            basePrice: 44990,
            systemMemory: { "16 GB": 0 },
            variants: { "Digital Edition": 0, "Disc Edition": 10000 }
        },
        "Xbox Series X": {
            basePrice: 52000,
            systemMemory: { "16 GB": 0 },
            variants: { "1 TB SSD": 0 }
        },
        "Apple MacBook Air M3 13-inch": {
            basePrice: 88999,
            systemMemory: { "8 GB": 0, "16 GB": 10000 },
            variants: { "256 GB, 13 Inch": 0, "512 GB, 13 Inch": 15000, "256 GB, 15 Inch": 15000, "512 GB, 15 Inch": 30000 }
        },
        "Dell XPS 13 9340": {
            basePrice: 168990,
            systemMemory: { "16 GB": 0, "32 GB": 8000 },
            variants: { "512 GB, 13.4 Inch": 0, "1 TB, 13.4 Inch": 8000 }
        },
        "HP Spectre x360 14-eu0000tu": {
            basePrice: 157750,
            systemMemory: { "16 GB": 0, "32 GB": 10000 },
            variants: { "1 TB, 14 Inch OLED": 0, "2 TB, 14 Inch OLED": 10000 }
        },
        "Lenovo Yoga Slim 7x 14Q8X9": {
            basePrice: 119990,
            systemMemory: { "16 GB": 0, "32 GB": 9000 },
            variants: { "512 GB, 14.5 Inch": 0, "1 TB, 14.5 Inch": 9000 }
        },
        "ASUS ROG Zephyrus G14 GA403": {
            basePrice: 172990,
            systemMemory: { "16 GB": 0, "32 GB": 10000 },
            variants: { "1 TB, 14 Inch OLED": 0 }
        }
    };

    let updatedCount = 0;

    for (const [name, data] of Object.entries(realPrices)) {
        const product = await collection.findOne({ name });
        if (!product) continue;

        let changed = false;

        if (product.price !== data.basePrice) {
            product.price = data.basePrice;
            changed = true;
        }

        if (Array.isArray(product.systemMemory) && data.systemMemory) {
            product.systemMemory = product.systemMemory.map(mem => {
                let modifier = data.systemMemory[mem.ram];
                if (modifier !== undefined && mem.priceModifier !== modifier) {
                    changed = true;
                    return { ...mem, priceModifier: modifier };
                }
                return mem;
            });
        }

        if (Array.isArray(product.variants) && data.variants) {
            product.variants = product.variants.map(v => {
                let modifier = data.variants[v.variant];
                if (modifier !== undefined && v.priceModifier !== modifier) {
                    changed = true;
                    return { ...v, priceModifier: modifier };
                }
                return v;
            });
        }

        if (changed) {
            await collection.updateOne(
                { _id: product._id },
                { $set: { 
                    price: product.price, 
                    systemMemory: product.systemMemory, 
                    variants: product.variants 
                } }
            );
            updatedCount++;
            console.log(`Updated real pricing for: ${name}`);
        }
    }

    console.log(`Successfully updated exact real prices for ${updatedCount} products.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
