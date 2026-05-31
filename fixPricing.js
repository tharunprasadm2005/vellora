const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB.");
    const products = await Product.find({});
    let updatedCount = 0;

    for (let product of products) {
        let changed = false;

        // Clone the arrays because Mongoose strict:false mixed types can be tricky
        let systemMemory = product.get('systemMemory');
        let variants = product.get('variants');
        let colors = product.get('colors');

        if (Array.isArray(systemMemory)) {
            let newMemory = systemMemory.map(mem => {
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
            if (changed) product.set('systemMemory', newMemory);
        }

        if (Array.isArray(variants)) {
            let newVariants = variants.map(v => {
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
            if (changed) product.set('variants', newVariants);
        }

        if (Array.isArray(colors)) {
            let newColors = colors.map(c => {
                if (typeof c.priceModifier === "undefined" && typeof c.price === "undefined") {
                    changed = true;
                    return { ...c, priceModifier: 0 };
                }
                return c;
            });
            if (changed) product.set('colors', newColors);
        }

        if (changed) {
            await product.save();
            updatedCount++;
        }
    }

    console.log(`Successfully added realistic price modifiers to ${updatedCount} products.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
