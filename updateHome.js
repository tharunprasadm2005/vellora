const fs = require('fs');

const filePath = 'frontend-vite/src/pages/Home.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add new icons
content = content.replace(
    /ArrowUpDown\n\} from "lucide-react";/,
    `ArrowUpDown, MessageSquare, Award, Tag, ThumbsUp, Medal\n} from "lucide-react";`
);

// 2. Extract ProductCard logic (just text from the file)
const productCardRegex = /<RealisticTilt key=\{product\._id\} className="group flex flex-col justify-between bg-white\/\[0\.01\] border border-white\/5 rounded-2xl overflow-hidden hover:border-white\/10 transition-all duration-300">([\s\S]*?)<\/RealisticTilt>/;
const match = content.match(productCardRegex);
if (!match) {
    console.error("Could not find product card logic to extract.");
    process.exit(1);
}

const productCardInner = match[0]
    .replace(/key=\{product\._id\}/g, "")
    .replace(/addToWishlist\(product\._id\)/g, "onAddToWishlist(product._id)")
    .replace(/addToCart\(product\._id\)/g, "onAddToCart(product._id)")
    .replace(/setQuickViewProduct\(product\)/g, "onQuickView(product)");

const productCardComponent = `
function ProductCard({ product, onQuickView, onAddToCart, onAddToWishlist }) {
    const resolvedImg = cleanImageUrl(product.image || product.images?.[0]);
    return (
        ${productCardInner}
    );
}
`;

// Insert ProductCard component before Home
content = content.replace(/function Home\(\) \{/, `${productCardComponent}\n\nfunction Home() {`);

// 3. Replace the old product card mapping
const mapRegex = /\{visibleProducts\.map\(\(product\) => \{[\s\S]*?return \([\s\S]*?<\/RealisticTilt>\n\s*\);\n\s*\}\)\}/;
content = content.replace(mapRegex, `{visibleProducts.map((product) => (
                                <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} />
                            ))}`);

// 4. Add computed lists
content = content.replace(
    /const categories = \["All", \.\.\.new Set\(safeProducts\.map\(\(p\) => p\.category\)\.filter\(Boolean\)\)\];/,
    `const categories = ["All", ...new Set(safeProducts.map((p) => p.category).filter(Boolean))];
    const featuredProducts = [...safeProducts].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    const bestSellers = [...safeProducts].sort((a,b) => (b.numReviews || 0) - (a.numReviews || 0)).slice(0, 4);
    const newArrivals = [...safeProducts].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);`
);

// 5. Add new sections
const featuresSectionRegex = /\{\/\* FEATURES \*\/\}([\s\S]*?)<\/div>\n            <\/div>/;
const featuresMatch = content.match(featuresSectionRegex);

// Remove existing features to re-insert them in order
if (featuresMatch) {
    content = content.replace(featuresSectionRegex, "");
}

// We will insert DEALS / OFFERS right before CATEGORIES
const dealsSection = `
            {/* DEALS / OFFERS */}
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-red-500">
                            <Flame size={16} className="animate-pulse" />
                            <span className="text-xs font-black tracking-widest uppercase">Hot Deals</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight uppercase">Limited Time Offers</h2>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RealisticTilt className="relative h-[250px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop" alt="Shoes" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-transparent"></div>
                        <div className="absolute inset-0 p-8 flex flex-col justify-center">
                            <span className="bg-white text-red-600 text-[10px] font-black px-2 py-1 rounded w-fit mb-3">50% OFF</span>
                            <h3 className="text-3xl font-black text-white uppercase mb-2">Premium Sneakers</h3>
                            <p className="text-sm text-white/80 font-medium mb-4">Step up your game with our new collection.</p>
                            <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase w-fit hover:bg-gray-200 transition">
                                Shop Now <ArrowRight size={14} />
                            </button>
                        </div>
                    </RealisticTilt>
                    <RealisticTilt className="relative h-[250px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1200&auto=format&fit=crop" alt="Watch" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-transparent"></div>
                        <div className="absolute inset-0 p-8 flex flex-col justify-center">
                            <span className="bg-white text-blue-600 text-[10px] font-black px-2 py-1 rounded w-fit mb-3">FLAT ₹2000 OFF</span>
                            <h3 className="text-3xl font-black text-white uppercase mb-2">Smart Watches</h3>
                            <p className="text-sm text-white/80 font-medium mb-4">Track your fitness with precision.</p>
                            <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase w-fit hover:bg-gray-200 transition">
                                Grab Deal <ArrowRight size={14} />
                            </button>
                        </div>
                    </RealisticTilt>
                </div>
            </div>
`;

content = content.replace(/\{\/\* CATEGORIES \*\/\}/, dealsSection + '\n\n            {/* CATEGORIES */}');

const featuredAndBestSellersSection = `
            {/* FEATURED PRODUCTS */}
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <Award size={16} />
                        <span className="text-xs font-black tracking-widest uppercase">Editor's Choice</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Featured Products</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} />
                    ))}
                </div>
            </div>

            {/* BEST SELLERS */}
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                        <Medal size={16} />
                        <span className="text-xs font-black tracking-widest uppercase">Top Rated</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Best Sellers</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bestSellers.map((product) => (
                        <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} />
                    ))}
                </div>
            </div>
`;

content = content.replace(/\{\/\* ─── PRODUCTS SECTION ─── \*\/\}/, featuredAndBestSellersSection + '\n\n            {/* ─── PRODUCTS SECTION ─── */}');

const bannerAndNewArrivalsAndFeaturesAndReviews = `
            {/* BANNER SECTION */}
            <div className="py-16 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-neutral-900 group">
                        <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop" alt="Banner" className="w-full h-[300px] md:h-[400px] object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020208] via-transparent to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                            <span className="text-cyan-400 font-black tracking-widest text-sm uppercase mb-4 animate-bounce">Huge Savings</span>
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6 drop-shadow-2xl">Mega Clearance Sale</h2>
                            <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-black text-sm tracking-widest uppercase hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300">
                                Explore All Offers
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW ARRIVALS */}
            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2 text-fuchsia-400">
                        <Tag size={16} />
                        <span className="text-xs font-black tracking-widest uppercase">Just Dropped</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">New Arrivals</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {newArrivals.map((product) => (
                        <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} />
                    ))}
                </div>
            </div>

            ${featuresMatch ? featuresMatch[0] : ""}

            {/* CUSTOMER REVIEWS */}
            <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-2 mb-2 text-emerald-400">
                        <MessageSquare size={16} />
                        <span className="text-xs font-black tracking-widest uppercase">Testimonials</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">What Our Customers Say</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: "Rahul S.", review: "Amazing quality and fast delivery. The customer service was exceptionally helpful when I had questions about my order.", rating: 5 },
                        { name: "Priya M.", review: "I absolutely love the interface and how easy it is to find what I'm looking for. The products are top-notch!", rating: 5 },
                        { name: "Amit K.", review: "Great value for money. The electronics arrived in perfect condition and work flawlessly. Highly recommended.", rating: 4 }
                    ].map((rev, i) => (
                        <RealisticTilt key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-md">
                            <div className="flex gap-1 mb-4 text-yellow-400">
                                {[...Array(5)].map((_, idx) => <Star key={idx} size={14} className={idx < rev.rating ? "fill-yellow-400" : "text-gray-700"} />)}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">"{rev.review}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center font-black text-black">
                                    {rev.name.charAt(0)}
                                </div>
                                <span className="text-white font-bold text-xs uppercase tracking-wider">{rev.name}</span>
                            </div>
                        </RealisticTilt>
                    ))}
                </div>
            </div>
`;

content = content.replace(/\{\/\* NEWSLETTER \*\/\}/, bannerAndNewArrivalsAndFeaturesAndReviews + '\n\n            {/* NEWSLETTER */}');

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Success");
