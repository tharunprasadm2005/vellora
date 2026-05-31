import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { Heart, ShoppingCart, Star, Zap, ArrowLeft, SlidersHorizontal, ArrowUpDown, Check, Eye, TrendingUp, Filter, X, ChevronDown, AlertCircle } from "lucide-react";
import RealisticTilt from "../components/RealisticTilt";

const productImageFallback = "";

/* ─── Integrated image URL cleaner matching Home/Search logic ─── */
const cleanImageUrl = (url) => {
    if (!url || typeof url !== "string") return productImageFallback;
    
    if (url.startsWith("[")) {
        const bracketMatch = url.match(/\[(.*?)\]/);
        if (bracketMatch && bracketMatch[1] && bracketMatch[1].startsWith("http")) {
            return bracketMatch[1].trim();
        }
    }
    
    const parenMatch = url.match(/\((.*?)\)/);
    if (parenMatch && parenMatch[1] && parenMatch[1].startsWith("http") && !parenMatch[1].includes("google.com")) {
        return parenMatch[1].trim();
    }
    
    const clean = url.replace(/[\[\]"']/g, "").trim();
    return clean.startsWith("http") ? clean : productImageFallback;
};

/* ─── Robust Indian Currency Localized Formatter ─── */
const fmt = (n) => {
    if (n === null || n === undefined) return "0";
    if (typeof n === "number") return n.toLocaleString("en-IN");
    const parsed = Number(n);
    return isNaN(parsed) ? String(n) : parsed.toLocaleString("en-IN");
};

/* ─── Dynamic Aurora Particle Swarm Backdrop ─── */
function ParticleBackground() {
    const ref = useRef();
    const { mouse } = useThree();
    const myPoints = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) myPoints[i] = (Math.random() - 0.5) * 8;

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta * 0.05;
        ref.current.rotation.y -= delta * 0.03;
        ref.current.position.x += (mouse.x * 0.5 - ref.current.position.x) * 0.02;
        ref.current.position.y += (mouse.y * 0.5 - ref.current.position.y) * 0.02;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={myPoints} stride={3} frustumCulled={false}>
                <PointMaterial transparent color="#38bdf8" size={0.025} sizeAttenuation depthWrite={false} opacity={0.6} />
            </Points>
        </group>
    );
}



/* ─── Price Range Slider ─── */
function PriceRangeFilter({ minPrice, maxPrice, onPriceChange }) {
    const [localMin, setLocalMin] = useState(minPrice);
    const [localMax, setLocalMax] = useState(maxPrice);

    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), localMax - 1000);
        setLocalMin(value);
        onPriceChange(value, localMax);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), localMin + 1000);
        setLocalMax(value);
        onPriceChange(localMin, value);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Min: ₹{fmt(localMin)}</label>
                <input
                    type="range"
                    min="0"
                    max="500000"
                    step="5000"
                    value={localMin}
                    onChange={handleMinChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Max: ₹{fmt(localMax)}</label>
                <input
                    type="range"
                    min="0"
                    max="500000"
                    step="5000"
                    value={localMax}
                    onChange={handleMaxChange}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
            </div>
        </div>
    );
}

/* ─── Advanced Filter Sidebar ─── */
function FilterSidebar({ isOpen, onClose, brands, selectedBrands, toggleBrand, minRating, setMinRating, onPriceChange, minPrice, maxPrice, priceRange, stockFilter, setStockFilter }) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed lg:relative left-0 top-0 h-full w-80 bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl p-6 z-50 lg:z-10 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
                <div className="flex items-center justify-between mb-6 lg:hidden">
                    <h3 className="text-lg font-bold uppercase tracking-wider">Filters</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Brand Filter */}
                <div className="mb-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                        <SlidersHorizontal size={14} /> Brands
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {brands.map(brand => {
                            if(brand === 'all') return null;
                            return (
                                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedBrands.includes(brand)}
                                        onChange={() => toggleBrand(brand)}
                                        className="w-4 h-4 rounded border-white/20 bg-slate-800 accent-cyan-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{brand}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Price Range Filter */}
                <div className="mb-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                        <TrendingUp size={14} /> Price Range
                    </h4>
                    <PriceRangeFilter 
                        minPrice={priceRange.min} 
                        maxPrice={priceRange.max} 
                        onPriceChange={onPriceChange}
                    />
                </div>

                {/* Stock Status Filter */}
                <div className="mb-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
                        <AlertCircle size={14} /> Availability
                    </h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <input type="checkbox" checked={stockFilter.inStock} onChange={(e) => setStockFilter({ ...stockFilter, inStock: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
                            <span className="text-sm text-slate-300">In Stock</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                            <input type="checkbox" checked={stockFilter.outOfStock} onChange={(e) => setStockFilter({ ...stockFilter, outOfStock: e.target.checked })} className="w-4 h-4 accent-cyan-500" />
                            <span className="text-sm text-slate-300">Out of Stock</span>
                        </label>
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                        <Star size={14} /> Customer Rating
                    </h4>
                    <div className="space-y-3">
                        {[4, 3, 2, 1].map(rating => (
                            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="catRatingFilter"
                                    checked={minRating === rating}
                                    onChange={() => setMinRating(rating)}
                                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                                />
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-700"} />
                                    ))}
                                    <span className="text-xs font-bold text-slate-400 ml-1">& Up</span>
                                </div>
                            </label>
                        ))}
                        <label className="flex items-center gap-3 cursor-pointer group pt-1">
                            <input 
                                type="radio" 
                                name="catRatingFilter"
                                checked={minRating === 0}
                                onChange={() => setMinRating(0)}
                                className="w-4 h-4 accent-cyan-500 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-slate-400">All Ratings</span>
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
}

function CategoryProducts() {
    const { categoryName } = useParams();
    const navigate = useNavigate();

    const categoryMap = {
        "mobiles": "Smartphones",
        "smartphones": "Smartphones",
        "laptops": "Laptops",
        "audio": "Audio",
        "cameras": "Cameras",
        "smart-home": "Smart Home",
        "smart-tvs": "Smart TVs",
        "monitors": "Monitors",
        "peripherals": "Peripherals",
        "appliances": "Appliances",
        "storage": "Storage",
        "wearables": "Wearables",
        "networking": "Networking",
        "tablets": "Tablets",
        "accessories": "Accessories",
        "gaming": "Gaming"
    };

    const targetCategory = categoryMap[categoryName?.toLowerCase()] || categoryName;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [addingStates, setAddingStates] = useState({}); 
    const [wishlistItems, setWishlistItems] = useState([]);
    const [quickViewProduct, setQuickViewProduct] = useState(null);

    const [sortBy, setSortBy] = useState("default");
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 });
    const [stockFilter, setStockFilter] = useState({ inStock: true, outOfStock: true });
    const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // grid or list

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        setLoading(true);
        axios
            .get("http://localhost:5000/api/products")
            .then((res) => {
                setProducts(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading inventory:", err);
                setProducts([]);
                setLoading(false);
            });
    }, [categoryName]);

    const filteredAndSortedProducts = products
        .filter((product) => {
            if (!product || !product.category) return false;
            const matchesCategory = product.category.toLowerCase() === targetCategory.toLowerCase();
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
            const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
            const matchesRating = (product.rating || 0) >= minRating;
            
            let matchesStock = false;
            if (stockFilter.inStock && product.countInStock > 0) matchesStock = true;
            if (stockFilter.outOfStock && product.countInStock <= 0) matchesStock = true;

            return matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock;
        })
        .sort((a, b) => {
            if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
            if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
            if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
            if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            if (sortBy === "popularity") return (b.numReviews || 0) - (a.numReviews || 0);
            return 0;
        });

    const toggleBrand = (brand) => {
        setSelectedBrands(prev => 
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const availableBrands = [
        "all",
        ...new Set(
            products
                .filter(p => p.category?.toLowerCase() === targetCategory?.toLowerCase() && p.brand)
                .map(p => p.brand)
        )
    ];

    const handleAddToCart = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const token = localStorage.getItem("token");
            if (!token) { 
                alert("Please login first"); 
                navigate("/login");
                return; 
            }
            
            await axios.post(
                "http://localhost:5000/api/cart",
                { productId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setAddingStates(prev => ({ ...prev, [productId]: true }));
            setTimeout(() => {
                setAddingStates(prev => ({ ...prev, [productId]: false }));
            }, 2000);
            
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            alert(error.response?.data?.message || "Error adding to cart");
        }
    };

    const toggleWishlist = async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (wishlistItems.includes(productId)) {
            setWishlistItems(wishlistItems.filter(id => id !== productId));
            alert("Removed from wishlist!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) { 
                alert("Please login first"); 
                navigate("/login"); 
                return; 
            }
            
            await axios.post(
                "http://localhost:5000/api/wishlist",
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setWishlistItems([...wishlistItems, productId]);
            alert("Added to wishlist!");
        } catch (error) {
            alert(error.response?.data?.message || "Error modifying wishlist preference");
        }
    };

    return (
        <div className="bg-[#020208] text-white overflow-hidden min-h-screen antialiased selection:bg-cyan-500/40 py-16 px-4 md:px-8 relative">
            
            {/* 3D PARTICLE SYSTEMS LAYER */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[5, 5, 5]} intensity={1.5} />
                    <ParticleBackground />
                </Canvas>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0f172a_90%)]" />
            </div>

            <div className="absolute top-10 left-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-10 right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                
                {/* Back Link Component */}
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-cyan-400 bg-white/[0.02] border border-white/[0.05] px-4 py-2.5 rounded-xl mb-12 transition-all duration-300 backdrop-blur-md group"
                >
                    <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" /> 
                    Back to Exploration
                </Link>

                {/* Header with Filter & Sort Controls */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-6 border-b border-white/[0.06]">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
                            {targetCategory} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 filter drop-shadow-[0_0_30px_rgba(6,182,212,0.35)]">Collection</span>
                        </h1>
                        <p className="text-gray-400 mt-3 text-xs tracking-widest uppercase font-bold">
                            {loading ? "Scanning matrix..." : `Discovered ${filteredAndSortedProducts.length} premium modules`}
                        </p>
                    </div>
                    
                    {/* Control Panel */}
                    {!loading && products.filter(p => p.category?.toLowerCase() === targetCategory.toLowerCase()).length > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                            {/* View Mode Toggle */}
                            <div className="bg-slate-900/50 border border-white/10 p-1 rounded-xl backdrop-blur-xl flex gap-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewMode === "grid" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
                                >
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewMode === "list" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"}`}
                                >
                                    List
                                </button>
                            </div>

                            {/* Filter Toggle (Mobile) */}
                            <button
                                onClick={() => setFilterSidebarOpen(!filterSidebarOpen)}
                                className="lg:hidden bg-slate-900/50 border border-white/10 text-white px-4 py-2.5 rounded-xl backdrop-blur-xl text-xs font-bold uppercase flex items-center gap-2 hover:border-white/20 transition-colors"
                            >
                                <Filter size={16} /> Filters
                            </button>

                            {/* Sort Dropdown */}
                            <div className="bg-white/[0.02] border border-white/[0.05] p-2 rounded-2xl backdrop-blur-xl shadow-2xl flex items-center gap-2 px-2">
                                <ArrowUpDown size={14} className="text-cyan-400" />
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-[10px] font-black tracking-widest text-gray-300 focus:outline-none cursor-pointer uppercase"
                                >
                                    <option value="default" className="bg-[#0f172a] text-white">Relevance</option>
                                    <option value="price_asc" className="bg-[#0f172a] text-white">Price: Low to High</option>
                                    <option value="price_desc" className="bg-[#0f172a] text-white">Price: High to Low</option>
                                    <option value="rating_desc" className="bg-[#0f172a] text-white">Top Rated</option>
                                    <option value="newest" className="bg-[#0f172a] text-white">Newest Arrivals</option>
                                    <option value="popularity" className="bg-[#0f172a] text-white">Popularity</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-8">
                    {/* Filter Sidebar */}
                    <FilterSidebar 
                        isOpen={filterSidebarOpen}
                        onClose={() => setFilterSidebarOpen(false)}
                        brands={availableBrands}
                        selectedBrands={selectedBrands}
                        toggleBrand={toggleBrand}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        onPriceChange={(min, max) => setPriceRange({ min, max })}
                        minPrice={priceRange.min}
                        maxPrice={priceRange.max}
                        priceRange={priceRange}
                        stockFilter={stockFilter}
                        setStockFilter={setStockFilter}
                    />

                    {/* Products Container */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
                                <p className="text-xs tracking-widest text-cyan-400/70 font-mono uppercase animate-pulse">Retrieving Data...</p>
                            </div>
                        ) : filteredAndSortedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-28 bg-slate-900/10 border border-dashed border-white/5 rounded-3xl backdrop-blur-md">
                                <Zap size={40} className="text-slate-700 mb-3 animate-pulse" />
                                <h3 className="text-xl font-bold tracking-tight mb-2 uppercase">No hardware matches found</h3>
                                <p className="text-slate-500 max-w-md mx-auto text-xs text-center uppercase tracking-wider">
                                    We couldn't locate any items matching your selected configuration criteria. Try adjusting your filter parameters.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Grid View */}
                                {viewMode === "grid" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                        {filteredAndSortedProducts.map((product) => {
                                            const isAdded = addingStates[product._id];
                                            const isLiked = wishlistItems.includes(product._id);
                                            const resolvedImg = cleanImageUrl(Array.isArray(product.images) ? product.images[0] : product.image);
                                            
                                            return (
                                                <RealisticTilt 
                                                    key={product._id} 
                                                    className="group flex flex-col justify-between bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 shadow-[0_0_25px_rgba(6,182,212,0.05)] hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                                                >
                                                    <div className="relative overflow-hidden bg-neutral-900/50">
                                                        <Link to={`/product/${product._id}`} className="block">
                                                            {product.originalPrice && product.originalPrice > product.price && (
                                                                <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md z-10 uppercase backdrop-blur-md">
                                                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Cut
                                                                </div>
                                                            )}
                                                            <img
                                                                src={resolvedImg}
                                                                alt={product.name}
                                                                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                loading="lazy"
                                                            />
                                                        </Link>

                                                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                                            <button 
                                                                onClick={(e) => toggleWishlist(e, product._id)}
                                                                className={`backdrop-blur-md p-2 rounded-xl border transition-all duration-300 ${
                                                                    isLiked 
                                                                    ? "bg-red-500 border-transparent text-white" 
                                                                    : "bg-black/60 border-white/10 text-white hover:bg-red-500 hover:border-transparent"
                                                                }`}
                                                            >
                                                                <Heart size={14} className={isLiked ? "fill-white" : ""} />
                                                            </button>
                                                            <Link
                                                                to={`/product/${product._id}`}
                                                                className="backdrop-blur-md p-2 rounded-xl border bg-black/60 border-white/10 text-white hover:bg-cyan-500 hover:border-transparent transition-all duration-300"
                                                            >
                                                                <Eye size={14} />
                                                            </Link>
                                                        </div>

                                                        
                                                    </div>

                                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                                <span className="text-cyan-400 text-[10px] font-black tracking-widest uppercase">
                                                                    {product.brand || "Premium"}
                                                                </span>
                                                                <div className="flex items-center gap-1 text-yellow-400 text-[10px] font-bold">
                                                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                                    <span>
                                                                        {product.rating || "4.8"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-1 uppercase">
                                                                {product.name}
                                                            </h3>
                                                            
                                                            <p className="text-slate-400 text-xs line-clamp-2 mt-1 leading-relaxed font-medium">
                                                                {product.description || "Premium hardware component"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <div className="flex justify-between items-end pt-2 mb-3">
                                                                <div>
                                                                    <p className="text-lg font-black text-cyan-400 tracking-tight">₹{fmt(product.price)}</p>
                                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                                        <p className="text-[10px] text-gray-500 line-through">₹{fmt(product.originalPrice)}</p>
                                                                    )}
                                                                </div>
                                                                <div className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${product.countInStock > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                                                    {product.countInStock > 0 ? "Instock" : "Out of Stock"}
                                                                </div>
                                                            </div>
                                                            
                                                            <button 
                                                                onClick={(e) => handleAddToCart(e, product._id)}
                                                                disabled={product.countInStock <= 0}
                                                                className={`w-full border text-[10px] font-black tracking-widest uppercase py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-30 disabled:pointer-events-none ${
                                                                    isAdded 
                                                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                                                                        : "bg-white/[0.05] border-white/10 hover:bg-white hover:text-black hover:border-transparent text-white"
                                                                }`}
                                                            >
                                                                {isAdded ? (
                                                                    <>
                                                                        <Check size={14} className="scale-110" />
                                                                        Added
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShoppingCart size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                                        Add to Cart
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </RealisticTilt>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* List View */}
                                {viewMode === "list" && (
                                    <div className="space-y-4">
                                        {filteredAndSortedProducts.map((product) => {
                                            const isAdded = addingStates[product._id];
                                            const isLiked = wishlistItems.includes(product._id);
                                            const resolvedImg = cleanImageUrl(Array.isArray(product.images) ? product.images[0] : product.image);
                                            
                                            return (
                                                <div key={product._id} className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 flex gap-6 hover:border-white/10 transition-all duration-300 group">
                                                    {/* Product Image */}
                                                    <Link to={`/product/${product._id}`} className="flex-shrink-0 relative">
                                                        <img
                                                            src={resolvedImg}
                                                            alt={product.name}
                                                            className="w-32 h-32 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                        {product.originalPrice && product.originalPrice > product.price && (
                                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase">
                                                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                            </div>
                                                        )}
                                                    </Link>

                                                    {/* Product Details */}
                                                    <div className="flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                                <div>
                                                                    <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                                        {product.name}
                                                                    </h3>
                                                                    <p className="text-sm text-indigo-400 font-mono uppercase">{product.brand || "Premium"}</p>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-amber-400 text-xs bg-amber-400/5 px-2 py-1 rounded border border-amber-400/10">
                                                                    <Star size={12} fill="currentColor" />
                                                                    {product.rating || "4.8"}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-slate-400 line-clamp-2">{product.description}</p>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-4">
                                                            <div>
                                                                <p className="text-2xl font-black text-indigo-400">₹{fmt(product.price)}</p>
                                                                {product.originalPrice && product.originalPrice > product.price && (
                                                                    <p className="text-xs text-slate-500 line-through">₹{fmt(product.originalPrice)}</p>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <button 
                                                                    onClick={(e) => toggleWishlist(e, product._id)}
                                                                    className={`p-2.5 rounded-lg border transition-all ${isLiked ? "bg-red-500 border-transparent" : "border-white/10 hover:border-red-500"}`}
                                                                >
                                                                    <Heart size={16} className={isLiked ? "fill-white text-white" : "text-slate-400"} />
                                                                </button>
                                                                <button 
                                                                    onClick={(e) => handleAddToCart(e, product._id)}
                                                                    disabled={product.countInStock <= 0}
                                                                    className={`px-6 py-2.5 rounded-lg font-bold text-sm uppercase transition-all ${
                                                                        isAdded 
                                                                            ? "bg-emerald-600 text-white" 
                                                                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                                                                    } disabled:opacity-50`}
                                                                >
                                                                    {isAdded ? "Added" : "Add to Cart"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryProducts;
