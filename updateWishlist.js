const fs = require('fs');

const filePath = 'frontend-vite/src/pages/Wishlist.jsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add new icons
content = content.replace(
    /import \{ Heart, Trash2, ShoppingCart, ArrowRight, RefreshCw, Sparkles \} from "lucide-react";/,
    `import { Heart, Trash2, ShoppingCart, ArrowRight, RefreshCw, Sparkles, Star, PackageX, PackageCheck, ListX, ListPlus } from "lucide-react";`
);

// 2. Update removeFromWishlist and addToCart with silent mode, and add clearWishlist and moveAllToCart and moveToCart
const functionsRegex = /const removeFromWishlist = async \(\id\) => \{([\s\S]*?)const addToCart = async \(productId\) => \{([\s\S]*?)catch \(error\) \{\s*console.error\(error\);\s*alert\(error.response\?\.data\?\.message \|\| "Error adding to cart"\);\s*\}\s*\};/m;

const newFunctions = `const removeFromWishlist = async (id, silent = false) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(\`http://localhost:5000/api/wishlist/\${id}\`, {
                headers: { Authorization: \`Bearer \${token}\` },
            });
            window.dispatchEvent(new Event("wishlist:updated"));
            if (!silent) fetchWishlist();
        } catch (error) {
            console.error(error);
            if (!silent) alert("Error removing item");
        }
    };

    const addToCart = async (productId, silent = false) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                if (!silent) { alert("Please login first"); navigate("/login"); }
                return false;
            }

            const { data } = await axios.post(
                "http://localhost:5000/api/cart",
                { productId, quantity: 1 },
                { headers: { Authorization: \`Bearer \${token}\` } }
            );

            window.dispatchEvent(new CustomEvent("cart:updated", { detail: data }));
            if (!silent) alert("Added to cart!");
            return true;
        } catch (error) {
            console.error(error);
            if (!silent) alert(error.response?.data?.message || "Error adding to cart");
            return false;
        }
    };

    const moveToCart = async (productId) => {
        const added = await addToCart(productId, true);
        if (added) {
            await removeFromWishlist(productId, false); // false to refresh after remove
            alert("Moved to cart!");
        }
    };

    const moveAllToCart = async () => {
        if (!wishlist?.items?.length) return;
        setLoading(true);
        try {
            let count = 0;
            for (const item of wishlist.items) {
                if (item.product.countInStock > 0) {
                    const added = await addToCart(item.product._id, true);
                    if (added) {
                        await removeFromWishlist(item.product._id, true);
                        count++;
                    }
                }
            }
            alert(\`Moved \${count} items to cart!\`);
            fetchWishlist();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const clearWishlist = async () => {
        if (!wishlist?.items?.length) return;
        if (!window.confirm("Are you sure you want to clear your wishlist?")) return;
        setLoading(true);
        try {
            for (const item of wishlist.items) {
                await removeFromWishlist(item.product._id, true);
            }
            fetchWishlist();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };`;

content = content.replace(functionsRegex, newFunctions);

// 3. Replace the HEADER ROW MODULE
const headerRegex = /\{\/\* HEADER ROW MODULE \*\/\}([\s\S]*?)<\/div>\n                    <\/div>\n                <\/div>/;
const newHeader = `{/* HEADER ROW MODULE */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/[0.01] border border-white/10 backdrop-blur-xl p-4 rounded-xl shadow-2xl">
                            <Heart className="h-6 w-6 text-rose-500 fill-rose-500/20 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-rose-400">
                                <Sparkles size={12} />
                                <span className="text-[10px] font-black tracking-widest uppercase">Vellora Store</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Your Wishlist</h1>
                        </div>
                    </div>
                    {items.length > 0 && (
                        <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                            <button onClick={clearWishlist} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/[0.02] border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-gray-400 px-4 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300">
                                <ListX size={14} /> Clear
                            </button>
                            <button onClick={moveAllToCart} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] px-5 py-2.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300">
                                <ListPlus size={14} /> Move All to Cart
                            </button>
                        </div>
                    )}
                </div>`;
content = content.replace(headerRegex, newHeader);

// 4. Update the Product Card Info
const productInfoRegex = /<div className="space-y-1">([\s\S]*?)<\/p>\n                                    <\/div>\n\n                                    <div style={{ transformStyle: "preserve-3d" }}>([\s\S]*?)<\/div>\n                                <\/div>/;
const newProductInfo = `<div className="space-y-1">
                                        <div className="flex justify-between items-start gap-2 transform translate-z-[20px]">
                                            <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors line-clamp-1 uppercase">
                                                {item.product.name}
                                            </h3>
                                        </div>
                                        {item.product.brand && (
                                            <p className="text-[10px] text-cyan-400 font-black tracking-widest uppercase transform translate-z-[15px]">
                                                {item.product.brand}
                                            </p>
                                        )}
                                        
                                        {/* Ratings */}
                                        <div className="flex items-center gap-1 mt-1 transform translate-z-[15px]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} className={i < Math.round(item.product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-neutral-800"} />
                                            ))}
                                            <span className="text-gray-500 text-[10px] font-bold ml-1">({item.product.numReviews || 0})</span>
                                        </div>
                                    </div>

                                    <div style={{ transformStyle: "preserve-3d" }}>
                                        <div className="flex justify-between items-end mb-4 transform translate-z-[15px]">
                                            <span className="text-xl font-black text-cyan-400 tracking-tight">₹{fmt(item.product.price)}</span>
                                            <div className={\`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase border \${item.product.countInStock > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}\`}>
                                                {item.product.countInStock > 0 ? <><PackageCheck size={10}/> In Stock</> : <><PackageX size={10}/> Out of Stock</>}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 transform translate-z-[25px]">
                                            <button
                                                onClick={(e) => { e.preventDefault(); removeFromWishlist(item.product._id); }}
                                                className="bg-white/[0.01] border border-white/5 p-3 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 transition-all duration-200"
                                                title="Remove from Wishlist"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); moveToCart(item.product._id); }}
                                                disabled={item.product.countInStock <= 0}
                                                className="flex-1 bg-white hover:bg-cyan-500 disabled:bg-white/10 disabled:text-white/30 text-black text-[10px] font-black tracking-widest uppercase py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart size={12} /> Move to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>`;
content = content.replace(productInfoRegex, newProductInfo);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Success");
