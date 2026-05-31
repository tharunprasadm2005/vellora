import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { 
    Heart, 
    Star, 
    Search as SearchIcon, 
    ShoppingCart, 
    Zap, 
    X, 
    SlidersHorizontal, 
    ArrowUpDown, 
    ChevronDown, 
    Eye,
    Sliders,
    TrendingUp
} from "lucide-react";

const productImageFallback = "";

/* ─── Safe URL Sanitizer ─── */
const cleanImageUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    if (url.startsWith("[")) {
        const bracketMatch = url.match(/\[(.*?)\]/);
        if (bracketMatch && bracketMatch[1] && bracketMatch[1].startsWith("http")) return bracketMatch[1].trim();
    }
    const parenMatch = url.match(/\((.*?)\)/);
    if (parenMatch && parenMatch[1] && parenMatch[1].startsWith("http") && !parenMatch[1].includes("google.com")) return parenMatch[1].trim();
    return url.replace(/[\[\]]/g, "").trim();
};

/* ─── Indian Currency Localized Formatter ─── */
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
                <PointMaterial transparent color="#06b6d4" size={0.025} sizeAttenuation depthWrite={false} opacity={0.4} />
            </Points>
        </group>
    );
}

/* ─── 3D Tilt Wrapper Card ─── */
function RealisticTilt({ children, className }) {
    const cardRef = useRef(null);
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const angleX = (rect.height / 2 - y) / 10;
        const angleY = (x - rect.width / 2) / 10;
        cardRef.current.style.transform = `perspective(1200px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.04,1.04,1.04)`;
        cardRef.current.style.setProperty('--glare-x', `${(x / rect.width) * 100}%`);
        cardRef.current.style.setProperty('--glare-y', `${(y / rect.height) * 100}%`);
        cardRef.current.style.setProperty('--glare-opacity', '0.15');
    };
    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
        cardRef.current.style.setProperty('--glare-opacity', '0');
    };
    return (
        <div ref={cardRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
            className={`${className} relative transition-all duration-300 ease-out`}
            style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[inherit]"
                style={{ background: `radial-gradient(circle at var(--glare-x,50%) var(--glare-y,50%), rgba(255,255,255,0.3) 0%, transparent 60%)`, opacity: 'var(--glare-opacity,0)', mixBlendMode: 'overlay', zIndex: 5 }} />
            {children}
        </div>
    );
}

/* ─── Quick View Engine Modal ─── */
function QuickViewModal({ product, onClose, onAddToCart, onAddToWishlist }) {
    const resolvedImg = cleanImageUrl(product.image || product.images?.[0]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="relative w-full max-w-3xl bg-[#0f172a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                style={{ animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>

                <button onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white hover:border-transparent transition-all duration-200">
                    <X size={16} />
                </button>

                <div className="md:w-5/12 relative bg-slate-950 flex items-center justify-center min-h-[280px]">
                    {product.originalPrice && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md z-10 uppercase">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                    )}
                    <img src={resolvedImg || productImageFallback} alt={product.name}
                        onError={(e) => { e.currentTarget.src = productImageFallback; }}
                        className="w-full h-full object-cover max-h-[360px]" />
                </div>

                <div className="md:w-7/12 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-1.5">
                            <Zap size={12} className="text-amber-400 fill-amber-400/10" />
                            <span className="text-amber-400 text-[10px] font-black tracking-widest uppercase">{product.category || "Standard Tier"}</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-tight">{product.name}</h2>
                        <p className="text-slate-400 text-sm leading-relaxed">{product.description}</p>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={13} className={i < Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-700"} />
                                ))}
                            </div>
                            <span className="text-slate-500 text-xs font-bold">({product.numReviews || 0} reviews)</span>
                        </div>

                        <div className="flex items-end gap-3 pt-2">
                            <span className="text-3xl font-black text-cyan-400">₹{fmt(product.price)}</span>
                            {product.originalPrice && (
                                <span className="text-base text-slate-600 line-through mb-0.5">₹{fmt(product.originalPrice)}</span>
                            )}
                        </div>

                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest border ${product.countInStock > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.countInStock > 0 ? "bg-emerald-400" : "bg-red-400"}`}></span>
                            {product.countInStock > 0 ? `${product.countInStock} UNITS IN STOCK` : "OUT OF STOCK"}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                        <button onClick={() => onAddToCart(product._id)} disabled={product.countInStock <= 0}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3.5 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none">
                            <ShoppingCart size={16} /> Add to Cart
                        </button>
                        <button onClick={() => onAddToWishlist(product._id)}
                            className="w-full bg-white/[0.03] border border-white/10 text-white py-3 rounded-xl font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300">
                            <Heart size={16} /> Save to Wishlist
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        </div>
    );
}

/* ─── Advanced Modular Sorting Dropdown ─── */
const SORT_OPTIONS = [
    { value: "default", label: "Relevance" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating_desc", label: "Top Rated" },
    { value: "newest", label: "Newest Arrivals" },
    { value: "popularity", label: "Popularity" }
];

function SearchSidebar({ brands, selectedBrands, toggleBrand, minRating, setMinRating, priceRange, setPriceRange }) {
    return (
        <div className="w-full lg:w-64 shrink-0 space-y-6 bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-fit sticky top-24">
            {/* Price Filter */}
            <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Price Range
                </h4>
                <div className="flex justify-between text-[10px] font-black text-slate-400 tracking-wider mb-2">
                    <span>Max Price</span>
                    <span className="text-cyan-400">₹{fmt(priceRange)}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="250000"
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* Brands Filter */}
            <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                    <SlidersHorizontal size={14} /> Brands
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {brands.map(brand => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={selectedBrands.includes(brand)}
                                onChange={() => toggleBrand(brand)}
                                className="w-4 h-4 rounded border-white/20 bg-slate-800 accent-cyan-500 cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* Rating Filter */}
            <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
                    <Star size={14} /> Customer Rating
                </h4>
                <div className="space-y-3">
                    {[4, 3, 2, 1].map(rating => (
                        <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="radio" 
                                name="ratingFilter"
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
                            name="ratingFilter"
                            checked={minRating === 0}
                            onChange={() => setMinRating(0)}
                            className="w-4 h-4 accent-cyan-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-400">All Ratings</span>
                    </label>
                </div>
            </div>
        </div>
    );
}

function SortDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const current = SORT_OPTIONS.find(o => o.value === value);

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white/[0.02] border border-white/10 hover:border-white/20 text-white px-4 py-3 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200">
                <ArrowUpDown size={13} className="text-cyan-400" />
                {current?.label}
                <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-30"
                    style={{ animation: "dropIn 0.15s ease" }}>
                    {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wider transition-all duration-150 flex items-center justify-between
                                ${value === opt.value ? "bg-cyan-500/10 text-cyan-400" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}>
                            {opt.label}
                            {value === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                        </button>
                    ))}
                </div>
            )}
            <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}

/* ─── Search Main Component ─── */
function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [localSearch, setLocalSearch] = useState(query);
    const [sortBy, setSortBy] = useState("default");
    const [priceRange, setPriceRange] = useState(250000);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        setLocalSearch(query);
    }, [query]);

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/products")
            .then((res) => {
                if (res.data && Array.isArray(res.data)) setProducts(res.data);
                else if (res.data && Array.isArray(res.data.products)) setProducts(res.data.products);
                else setProducts([]);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setProducts([]);
                setLoading(false);
            });
    }, []);

    const addToCart = async (productId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) { alert("Please login first"); navigate("/login"); return; }
            const { data } = await axios.post("http://localhost:5000/api/cart", { productId, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } });
            window.dispatchEvent(new CustomEvent("cart:updated", { detail: data }));
            alert("Added to cart!");
        } catch (error) {
            if (error.response?.status === 401) { localStorage.removeItem("token"); alert("Session expired. Please login again."); navigate("/login"); return; }
            alert(error.response?.data?.message || "Error adding to cart");
        }
    };

    const toggleWishlist = async (productId) => {
        if (wishlistItems.includes(productId)) {
            setWishlistItems(wishlistItems.filter(id => id !== productId));
            alert("Removed from wishlist!");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            if (!token) { alert("Please login first"); navigate("/login"); return; }
            await axios.post("http://localhost:5000/api/wishlist", { productId }, { headers: { Authorization: `Bearer ${token}` } });
            setWishlistItems([...wishlistItems, productId]);
            alert("Added to wishlist!");
        } catch { alert("Error updating wishlist"); }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchParams({ q: localSearch });
    };

    const safeProducts = Array.isArray(products) ? products : [];
    const brands = [...new Set(safeProducts.map((p) => p.brand).filter(Boolean))];

    const toggleBrand = (brand) => {
        setSelectedBrands(prev => 
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    // Multi-Layer Filtering Pipeline Mechanics
    const searchQueryNormalized = query.trim().toLowerCase();
    let filteredProducts = safeProducts.filter((product) => {
        const matchesQuery = !searchQueryNormalized || 
            (product.name && product.name.toLowerCase().includes(searchQueryNormalized)) ||
            (product.description && product.description.toLowerCase().includes(searchQueryNormalized)) ||
            (product.brand && product.brand.toLowerCase().includes(searchQueryNormalized)) ||
            (product.category && product.category.toLowerCase().includes(searchQueryNormalized));

        const matchesPrice = (product.price || 0) <= priceRange;
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        const matchesRating = (product.rating || 0) >= minRating;

        return matchesQuery && matchesPrice && matchesBrand && matchesRating;
    });

    // Sort Sorting Executions
    filteredProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        if (sortBy === "popularity") return (b.numReviews || 0) - (a.numReviews || 0);
        return 0;
    });

    return (
        /* THE GRAND GRADIENT MATRIX FRAMEWORK BACKGROUND COLOR UNIFICATION */
        <div className="bg-[#020208] text-white overflow-hidden min-h-screen antialiased selection:bg-cyan-500/40 py-16 relative">
            
            {/* 3D PARTICLE SYSTEMS LAYER */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[5, 5, 5]} intensity={1.5} />
                    <ParticleBackground />
                </Canvas>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0f172a_90%)]" />
            </div>

            {/* NEON ORB EMISSIONS */}
            <div className="absolute top-20 left-[5%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none"></div>
            <div className="absolute bottom-20 right-[5%] w-[450px] h-[450px] bg-sky-600/5 rounded-full blur-[160px] pointer-events-none"></div>

            {/* Quick View Engine Trigger */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={(id) => { addToCart(id); setQuickViewProduct(null); }}
                    onAddToWishlist={(id) => toggleWishlist(id)}
                />
            )}

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                
                {/* HEADLINE MATRIX RUNTIME SEARCH CONSOLE */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                        <SearchIcon size={16} />
                        <span className="text-xs font-black tracking-widest uppercase">Search Results</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase mb-8">
                        {query ? `Showing results for "${query.toUpperCase()}"` : "Query All Modules"}
                    </h2>

                    {/* DYNAMIC MULTI-STAGE CONTROL CONSOLE PANEL */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6 shadow-2xl">
                        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-4 top-3.5 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                    placeholder="Search products..."
                                    className="w-full bg-[#050816] border border-white/[0.05] rounded-xl pl-11 pr-10 py-3 outline-none focus:border-cyan-500 transition text-sm font-bold tracking-widest text-white placeholder-slate-600"
                                />
                                {localSearch && (
                                    <button type="button" onClick={() => setLocalSearch("")} className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <SortDropdown value={sortBy} onChange={setSortBy} />
                        </form>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <SearchSidebar 
                        brands={brands}
                        selectedBrands={selectedBrands}
                        toggleBrand={toggleBrand}
                        minRating={minRating}
                        setMinRating={setMinRating}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1">

                {/* META INFORMATION LOOP COUNT */}
                {!loading && (
                    <div className="mb-8 flex items-center gap-2">
                        <Sliders size={13} className="text-slate-500" />
                        <span className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                            {filteredProducts.length} Products Found
                        </span>
                    </div>
                )}

                {/* THE CORE PRODUCT GRID GRID SYSTEM */}
                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 bg-slate-900/10 border border-dashed border-white/5 rounded-3xl backdrop-blur-md">
                        <SearchIcon size={40} className="text-slate-700 mb-3 animate-pulse" />
                        <p className="text-slate-500 font-black tracking-widest uppercase text-xs mb-4">Zero Database Nodes Matched Query Parameters</p>
                        <button onClick={() => { setLocalSearch(""); setSearchParams({}); setSelectedCategory("All"); setSortBy("default"); setPriceRange(250000); }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-black tracking-widest uppercase transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                            Clear System Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const resolvedImg = cleanImageUrl(product.image || product.images?.[0]);
                            const isWishlisted = wishlistItems.includes(product._id);
                            return (
                                <RealisticTilt key={product._id} className="group flex flex-col justify-between bg-white/[0.01] border border-white/[0.05] rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.02)]">
                                    
                                    <div className="relative overflow-hidden bg-slate-950">
                                        <Link to={`/product/${product._id}`} className="block">
                                            {product.originalPrice && product.originalPrice > product.price && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md z-10 uppercase backdrop-blur-md">
                                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Matrix Cut
                                                </div>
                                            )}
                                            <img
                                                src={resolvedImg}
                                                alt={product.name}
                                                onError={(e) => { e.currentTarget.src = productImageFallback; }}
                                                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-103"
                                            />
                                        </Link>

                                        {/* Action Overlay Buttons Outside Anchor To Prevent Intersections */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                                            <button onClick={() => toggleWishlist(product._id)}
                                                className={`backdrop-blur-md p-2 rounded-xl border transition-all duration-300 ${
                                                    isWishlisted 
                                                    ? "bg-red-500 border-transparent text-white" 
                                                    : "bg-black/60 border-white/10 text-white hover:bg-red-500 hover:border-transparent"
                                                }`}>
                                                <Heart size={14} className={isWishlisted ? "fill-white" : ""} />
                                            </button>
                                            <button onClick={() => setQuickViewProduct(product)}
                                                className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 hover:bg-cyan-500 hover:border-transparent text-white transition-all duration-300"
                                                title="Quick View Module">
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <Zap size={12} className="text-amber-400 fill-amber-400/10" />
                                                <span className="text-amber-400 text-[10px] font-black tracking-widest uppercase">{product.category || "Standard Tier"}</span>
                                            </div>
                                            <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors line-clamp-1 uppercase">{product.name}</h3>
                                            <p className="text-cyan-400 text-xs font-semibold mt-0.5 tracking-wide">{product.brand}</p>
                                            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium mt-2">{product.description}</p>
                                            
                                            <div className="flex items-center gap-1 pt-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={10} className={i < Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-slate-700"} />
                                                ))}
                                                <span className="text-slate-500 text-[10px] font-bold ml-1">({product.numReviews || 0} REVIEWS)</span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-end pt-2 mb-3">
                                                <div>
                                                    <p className="text-lg font-black text-cyan-400 tracking-tight">₹{fmt(product.price)}</p>
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <p className="text-[10px] text-slate-500 line-through">₹{fmt(product.originalPrice)}</p>
                                                    )}
                                                </div>
                                                <div className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${product.countInStock > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                                                    {product.countInStock > 0 ? "IN STOCK" : "OUT OF STOCK"}
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => addToCart(product._id)}
                                                disabled={product.countInStock <= 0}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] hover:bg-cyan-600 hover:text-white hover:border-transparent text-white text-xs font-black tracking-widest uppercase py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-30 disabled:pointer-events-none"
                                            >
                                                <ShoppingCart size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>

                                </RealisticTilt>
                            );
                        })}
                    </div>
                )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Search;