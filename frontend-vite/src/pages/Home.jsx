import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Points, PointMaterial } from "@react-three/drei";
import {
    ShoppingCart, Star, Truck, ShieldCheck, Clock, RefreshCw,
    Heart, Sparkles, Box, Zap, TrendingUp, Layers, Flame,
    ArrowRight, Search, SlidersHorizontal, X, ChevronDown,
    Eye, ArrowUpDown, MessageSquare, Award, Tag, ThumbsUp, Medal
} from "lucide-react";

const productImageFallback = "";

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

const fmt = (n) => {
    if (n === null || n === undefined) return "0";
    if (typeof n === "number") return n.toLocaleString("en-IN");
    const parsed = Number(n);
    return isNaN(parsed) ? String(n) : parsed.toLocaleString("en-IN");
};

/* ─── Particle Background ─── */
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

/* ─── Floating Blob ─── */
function FloatingBlob() {
    const blobRef = useRef();
    useFrame(() => {
        if (blobRef.current) {
            blobRef.current.rotation.x += 0.002;
            blobRef.current.rotation.y += 0.003;
        }
    });
    return (
        <Float speed={4} rotationIntensity={2} floatIntensity={2}>
            <mesh ref={blobRef} position={[0, 0, 0]}>
                <sphereGeometry args={[1.3, 64, 64]} />
                <MeshDistortMaterial color="#4f46e5" attach="material" distort={0.45} speed={2.5} roughness={0.1} metalness={0.9} clearcoat={1} />
            </mesh>
        </Float>
    );
}

/* ─── Realistic Tilt Card ─── */
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
                style={{ background: `radial-gradient(circle at var(--glare-x,50%) var(--glare-y,50%), rgba(255,255,255,0.4) 0%, transparent 60%)`, opacity: 'var(--glare-opacity,0)', mixBlendMode: 'overlay', zIndex: 5 }} />
            {children}
        </div>
    );
}

/* ─── Quick View Modal ─── */
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
            style={{ background: "rgba(2,2,8,0.85)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="relative w-full max-w-3xl bg-[#0c0c18] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                style={{ animation: "modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>

                {/* Close Button */}
                <button onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white hover:border-transparent transition-all duration-200">
                    <X size={16} />
                </button>

                {/* Image Panel */}
                <div className="md:w-5/12 relative bg-neutral-900/60 flex items-center justify-center min-h-[280px]">
                    {product.originalPrice && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md z-10 uppercase">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                    )}
                    <img src={resolvedImg || productImageFallback} alt={product.name}
                        onError={(e) => { e.currentTarget.src = productImageFallback; }}
                        className="w-full h-full object-cover max-h-[360px]" />
                </div>

                {/* Info Panel */}
                <div className="md:w-7/12 p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-1.5">
                            <Zap size={12} className="text-yellow-400 fill-yellow-400/10" />
                            <span className="text-yellow-400 text-[10px] font-black tracking-widest uppercase">{product.category || "Standard Tier"}</span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-tight">{product.name}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={13} className={i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-neutral-700"} />
                                ))}
                            </div>
                            <span className="text-gray-500 text-xs font-bold">({product.numReviews || 0} reviews)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-end gap-3 pt-2">
                            <span className="text-3xl font-black text-cyan-400">₹{fmt(product.price)}</span>
                            {product.originalPrice && (
                                <span className="text-base text-gray-600 line-through mb-0.5">₹{fmt(product.originalPrice)}</span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black tracking-widest border ${product.countInStock > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.countInStock > 0 ? "bg-emerald-400" : "bg-red-400"}`}></span>
                            {product.countInStock > 0 ? `${product.countInStock} UNITS IN STOCK` : "OUT OF STOCK"}
                        </div>
                    </div>

                    {/* Actions */}
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

/* ─── Sort Dropdown ─── */
const SORT_OPTIONS = [
    { value: "default", label: "Default" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
    { value: "rating_desc", label: "Top Rated" },
    { value: "newest", label: "Newest First" },
];

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
                className="flex items-center gap-2 bg-white/[0.02] border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all duration-200">
                <ArrowUpDown size={13} className="text-cyan-400" />
                {current?.label}
                <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0e0e1c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-30"
                    style={{ animation: "dropIn 0.15s ease" }}>
                    {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                            className={`w-full text-left px-4 py-3 text-xs font-bold tracking-wider transition-all duration-150 flex items-center justify-between
                                ${value === opt.value ? "bg-cyan-500/10 text-cyan-400" : "text-gray-400 hover:bg-white/[0.04] hover:text-white"}`}>
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

/* ─── Main Home Component ─── */

function ProductCard({ product, onQuickView, onAddToCart, onAddToWishlist }) {
    const resolvedImg = cleanImageUrl(product.image || product.images?.[0]);
    return (
        <RealisticTilt className="group flex flex-col justify-between bg-white/[0.01] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
            <div className="relative overflow-hidden bg-neutral-900/50">
                <Link to={`/product/${product._id}`} className="block">
                    {product.originalPrice && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md z-10 uppercase">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                    )}
                    <img
                        src={resolvedImg}
                        alt={product.name}
                        onError={(e) => { e.currentTarget.src = productImageFallback; }}
                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Action overlay buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToWishlist(product._id); }}
                        className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 hover:bg-red-500 hover:border-transparent text-white transition-all duration-300">
                        <Heart size={14} />
                    </button>
                    {/* Quick View button */}
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
                        className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 hover:bg-cyan-500 hover:border-transparent text-white transition-all duration-300"
                        title="Quick View">
                        <Eye size={14} />
                    </button>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Zap size={12} className="text-yellow-400 fill-yellow-400/10" />
                        <span className="text-yellow-400 text-[10px] font-black tracking-widest uppercase">{product.category || "Standard Tier"}</span>
                    </div>
                    <h3 className="text-sm font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors line-clamp-1 uppercase">{product.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium mt-1">{product.description}</p>
                    <div className="flex items-center gap-1 pt-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-neutral-800"} />
                        ))}
                        <span className="text-gray-600 text-[10px] font-bold ml-1">({product.numReviews || 0})</span>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-end pt-2 mb-3">
                        <div>
                            <p className="text-lg font-black text-cyan-400 tracking-tight">₹{fmt(product.price)}</p>
                            {product.originalPrice && <p className="text-[10px] text-gray-600 line-through">₹{fmt(product.originalPrice)}</p>}
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest border ${product.countInStock > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                        </div>
                    </div>
                    <button onClick={(e) => { e.preventDefault(); onAddToCart(product._id); }}
                        disabled={product.countInStock <= 0}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-transparent text-white text-xs font-black tracking-widest uppercase py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-30 disabled:pointer-events-none">
                        <ShoppingCart size={14} className="group-hover/btn:scale-110 transition-transform" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </RealisticTilt>
    );
}


function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [visibleCount, setVisibleCount] = useState(8);
    const [quickViewProduct, setQuickViewProduct] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:5000/api/products")
            .then((res) => {
                if (res.data && Array.isArray(res.data)) setProducts(res.data);
                else if (res.data && Array.isArray(res.data.products)) setProducts(res.data.products);
                else setProducts([]);
                setLoading(false);
            })
            .catch(() => { setProducts([]); setLoading(false); });
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

    const addToWishlist = async (productId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) { alert("Please login first"); navigate("/login"); return; }
            await axios.post("http://localhost:5000/api/wishlist", { productId }, { headers: { Authorization: `Bearer ${token}` } });
            alert("Added to wishlist!");
        } catch { alert("Error adding to wishlist"); }
    };

    const handleLoadMore = () => {
        setLoadingMore(true);
        setTimeout(() => { setVisibleCount(prev => prev + 4); setLoadingMore(false); }, 600);
    };

    // Reset visible count when filters change
    useEffect(() => { setVisibleCount(8); }, [selectedCategory, searchQuery, sortBy]);

    const safeProducts = Array.isArray(products) ? products : [];
    const categories = ["All", ...new Set(safeProducts.map((p) => p.category).filter(Boolean))];
    const featuredProducts = [...safeProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    const bestSellers = [...safeProducts].sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0)).slice(0, 4);
    const newArrivals = [...safeProducts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 4);

    // Filter
    let displayedProducts = selectedCategory === "All" ? safeProducts : safeProducts.filter(p => p.category === selectedCategory);

    // Search
    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        displayedProducts = displayedProducts.filter(p =>
            p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
        );
    }

    // Sort
    displayedProducts = [...displayedProducts].sort((a, b) => {
        if (sortBy === "price_asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
        if (sortBy === "rating_desc") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return 0;
    });

    const totalFiltered = displayedProducts.length;
    const visibleProducts = displayedProducts.slice(0, visibleCount);
    const hasMore = visibleCount < totalFiltered;

    return (
        <div className="bg-[#020208] text-white overflow-hidden min-h-screen antialiased selection:bg-cyan-500/40">

            {/* Quick View Modal */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onAddToCart={(id) => { addToCart(id); setQuickViewProduct(null); }}
                    onAddToWishlist={(id) => { addToWishlist(id); }}
                />
            )}

            {/* HERO SECTION */}
            <div className="relative min-h-screen flex items-center justify-center">
                <div className="absolute inset-0 z-0">
                    <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                        <ambientLight intensity={1.2} />
                        <directionalLight position={[5, 5, 5]} intensity={1.5} />
                        <ParticleBackground />
                    </Canvas>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#020208_90%)] pointer-events-none" />
                </div>

                <div className="absolute top-10 left-[10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-10 right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[180px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center w-full pt-20">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 backdrop-blur-3xl px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                            <Sparkles className="text-cyan-400 animate-spin" size={14} style={{ animationDuration: '3s' }} />
                            <span className="text-xs font-bold tracking-widest text-cyan-300 uppercase">Vellora Store</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
                            The Next <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 filter drop-shadow-[0_0_30px_rgba(6,182,212,0.35)]">Generation</span>
                        </h1>

                        <p className="text-gray-400 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                            Discover top deals on electronics, gadgets, and accessories. Shop from trusted brands with fast delivery, easy returns, and secure checkout.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                                className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-extrabold text-sm tracking-wider uppercase overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] transition-all duration-300 transform hover:-translate-y-0.5">
                                <span className="relative z-10 flex items-center gap-2">Shop Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                            </button>
                            <button onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
                                className="border border-white/10 backdrop-blur-md bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300">
                                Browse Categories
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-10">
                            {[
                                { val: "1K+", title: "Customer Reviews", label: "text-cyan-400" },
                                { val: "99.8%", title: "Customer Satisfaction", label: "text-purple-400" },
                                { val: "24/7", title: "Customer Support", label: "text-fuchsia-400" }
                            ].map((stat, i) => (
                                <div key={i} className="border-l-2 border-white/5 pl-4 py-1">
                                    <h3 className={`text-2xl md:text-3xl font-black ${stat.label} tracking-tight`}>{stat.val}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-0.5">{stat.title}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex justify-center items-center h-[500px]">
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <Canvas camera={{ position: [0, 0, 2.5] }}>
                                <ambientLight intensity={1.5} />
                                <directionalLight position={[3, 5, 2]} intensity={2} />
                                <FloatingBlob />
                            </Canvas>
                        </div>
                        <RealisticTilt className="z-10 w-[350px] h-[450px] backdrop-blur-2xl bg-white/[0.02] border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col justify-between">

                            {/* Top */}
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-black px-2.5 py-1 rounded-md tracking-widest">
                                    LIVE ORDER TRACKING
                                </span>
                                <Flame className="text-fuchsia-500 animate-pulse" size={20} />
                            </div>

                            {/* 🔥 Product Image Section (NEW) */}
                            <div className="flex flex-col items-center justify-center my-auto">
                                <img
                                    src="https://www.indiaistore.com/themes/frontend/custom/images/product/apple-watch-series-11-coming-soon/a-plus/hero_small.png"
                                    alt="Apple Watch"
                                    className="w-[220px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] hover:scale-105 transition-transform duration-500"
                                />

                                {/* Optional small title */}
                                <h3 className="mt-4 text-lg font-bold text-white">
                                    Apple Watch Series
                                </h3>

                                <p className="text-[11px] text-gray-400">
                                    Smart fitness tracking with premium design
                                </p>
                            </div>

                            {/* Bottom */}
                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-xl font-black text-cyan-400">₹45,999</span>
                                <span className="text-[11px] text-gray-500 font-medium">
                                    Limited Time Offer
                                </span>
                            </div>

                        </RealisticTilt>
                    </div>
                </div>
            </div>




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
                        <img src="https://images.pexels.com/photos/30707661/pexels-photo-30707661.jpeg?q=80&w=1200&auto=format&fit=crop" alt="Appliances" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 to-transparent"></div>
                        <div className="absolute inset-0 p-8 flex flex-col justify-center">
                            <span className="bg-white text-red-600 text-[10px] font-black px-2 py-1 rounded w-fit mb-3">40% OFF</span>
                            <h3 className="text-3xl font-black text-white uppercase mb-2">Home Appliances</h3>
                            <p className="text-sm text-white/80 font-medium mb-4">Upgrade your home with smart and powerful appliances</p>
                            <button onClick={() => navigate("/category/Appliances")} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase w-fit hover:bg-gray-200 transition">
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
                            <button onClick={() => navigate("/category/Wearables")} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-bold text-xs uppercase w-fit hover:bg-gray-200 transition">
                                Grab Deal <ArrowRight size={14} />
                            </button>
                        </div>
                    </RealisticTilt>
                </div>
            </div>


            {/* CATEGORIES */}
            <div id="categories" className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-cyan-400">
                            <Layers size={16} />
                            <span className="text-xs font-black tracking-widest uppercase">Shop by Category</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight uppercase">Browse Categories</h2>
                    </div>
                    <p className="text-gray-500 text-sm max-w-sm mt-2 md:mt-0 leading-relaxed">Explore products across top categories</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Smartphones", count: "4 ITEMS", img: "https://images.pexels.com/photos/27350774/pexels-photo-27350774.jpeg?q=80&w=1200&auto=format&fit=crop" },
                        { name: "Laptops", count: "5 ITEMS", img: "https://images.pexels.com/photos/6063/laptop-notebook-technology-computer.jpg?q=80&w=1200&auto=format&fit=crop" },
                        { name: "Gaming", count: "2 ITEMS", img: "https://images.pexels.com/photos/12718979/pexels-photo-12718979.jpeg?q=80&w=1200&auto=format&fit=crop" },
                        { name: "Audio", count: "4 ITEMS", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop" },
                        { name: "Cameras", count: "3 ITEMS", img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop" },
                        { name: "Wearables", count: "3 ITEMS", img: "https://images.pexels.com/photos/18259149/pexels-photo-18259149.jpeg?q=80&w=1200&auto=format&fit=crop" }
                    ].map((cat, index) => (
                        <RealisticTilt key={index} className="group relative h-[300px] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020208] via-[#020208]/30 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{cat.name}</h3>
                                    <p className="text-gray-500 text-[10px] font-bold tracking-widest mt-0.5">{cat.count}</p>
                                </div>
                                <button onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-cyan-500 hover:text-black hover:border-transparent transition-all duration-300">
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </RealisticTilt>
                    ))}
                </div>
            </div>


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


            {/* ─── PRODUCTS SECTION ─── */}
            <div id="products" className="max-w-7xl mx-auto px-6 pb-28 relative z-10">
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2 text-fuchsia-400">
                        <TrendingUp size={16} />
                        <span className="text-xs font-black tracking-widest uppercase">Trending Products</span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Popular Items</h2>
                </div>

                {/* ── SEARCH + SORT BAR ── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for products, brands, and more..."
                            className="w-full bg-white/[0.02] border border-white/10 hover:border-white/20 focus:border-cyan-500/50 focus:outline-none rounded-xl pl-10 pr-10 py-2.5 text-xs font-bold tracking-widest text-white placeholder-gray-600 transition-all duration-200"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Sort Dropdown */}
                    <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((category) => (
                        <button key={category} onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all duration-300 ${selectedCategory === category
                                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                : "bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.06] hover:text-white"}`}>
                            {category}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                {!loading && (
                    <div className="mb-6 flex items-center gap-2">
                        <SlidersHorizontal size={13} className="text-gray-600" />
                        <span className="text-xs text-gray-600 font-bold tracking-widest">
                            {searchQuery
                                ? `${totalFiltered} RESULT${totalFiltered !== 1 ? "S" : ""} FOR "${searchQuery.toUpperCase()}"`
                                : `${totalFiltered} PRODUCTS${totalFiltered !== 1 ? "S" : ""} AVAILABLE`}
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
                    </div>
                ) : totalFiltered === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Search size={40} className="text-gray-700" />
                        <p className="text-gray-600 font-black tracking-widest uppercase text-sm">No products found</p>
                        <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSortBy("default"); }}
                            className="text-xs text-cyan-500 hover:text-cyan-300 font-black tracking-widest uppercase transition-colors">
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {visibleProducts.map((product) => (
                                <ProductCard key={product._id} product={product} onQuickView={setQuickViewProduct} onAddToCart={addToCart} onAddToWishlist={addToWishlist} />
                            ))}
                        </div>

                        {/* ── LOAD MORE ── */}
                        {hasMore && (
                            <div className="flex flex-col items-center mt-14 space-y-3">
                                <p className="text-gray-600 text-xs font-bold tracking-widest">
                                    SHOWING {visibleProducts.length} OF {totalFiltered} PRODUCTS
                                </p>
                                {/* Progress bar */}
                                <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                                        style={{ width: `${(visibleProducts.length / totalFiltered) * 100}%` }} />
                                </div>
                                <button onClick={handleLoadMore} disabled={loadingMore}
                                    className="mt-4 group flex items-center gap-3 bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 hover:bg-white/[0.06] text-white px-8 py-4 rounded-xl font-black text-xs tracking-widest uppercase transition-all duration-300 disabled:opacity-50">
                                    {loadingMore ? (
                                        <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <ChevronDown size={16} className="text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                                    )}
                                    {loadingMore ? "Loading..." : `Load More PRODUCTS (${totalFiltered - visibleProducts.length} remaining)`}
                                </button>
                            </div>
                        )}

                        {/* All loaded message */}
                        {!hasMore && totalFiltered > 8 && (
                            <div className="flex items-center justify-center mt-14 gap-4">
                                <div className="h-px flex-1 bg-white/5"></div>
                                <span className="text-gray-700 text-[10px] font-black tracking-widest">ALL {totalFiltered} PRODUCTS LOADED</span>
                                <div className="h-px flex-1 bg-white/5"></div>
                            </div>
                        )}
                    </>
                )}
            </div>


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

            {/* FEATURES */}
            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { icon: <Truck className="text-cyan-400" size={24} />, title: "FAST CHECKOUT", desc: "Quick and secure checkout with multiple payment options.", glow: "hover:border-cyan-500/30" },
                        { icon: <ShieldCheck className="text-emerald-400" size={24} />, title: "SECURE PAYMENTS", desc: "100% secure transactions with encrypted payment protection.", glow: "hover:border-emerald-500/30" },
                        { icon: <RefreshCw className="text-purple-400" size={24} />, title: "EASY RETURNS", desc: "Hassle-free returns within 7 days of delivery.", glow: "hover:border-purple-500/30" },
                        { icon: <Clock className="text-fuchsia-400" size={24} />, title: "24/7 SUPPORT", desc: "Dedicated support team available anytime to assist you.", glow: "hover:border-fuchsia-500/30" }
                    ].map((item, index) => (
                        <div key={index} className={`bg-white/[0.01] border border-white/5 rounded-2xl p-6 backdrop-blur-3xl transition-all duration-300 hover:bg-white/[0.03] ${item.glow}`}>
                            <div className="w-12 h-12 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-center mb-4">{item.icon}</div>
                            <h4 className="text-xs font-black tracking-widest text-white mb-1">{item.title}</h4>
                            <p className="text-gray-400 text-xs leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

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


            {/* NEWSLETTER */}
            <div className="px-6 pb-24 relative z-10">
                <div className="max-w-5xl mx-auto bg-gradient-to-b from-white/[0.02] to-transparent border border-white/10 backdrop-blur-3xl rounded-3xl p-8 md:p-14 text-center relative overflow-hidden shadow-2xl">
                    <Box size={40} className="mx-auto text-cyan-400 mb-4 animate-pulse" />
                    <h2 className="text-3xl font-black uppercase tracking-tight">Subscribe / Get Updates</h2>
                    <p className="text-gray-400 text-xs max-w-md mx-auto mb-6 leading-relaxed font-medium">
                        Subscribe to get the latest deals, new arrivals, and exclusive offers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input type="email" placeholder="Enter your email address"
                            className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition text-xs font-bold text-white tracking-widest placeholder-gray-600" />
                        <button className="bg-cyan-500 text-black px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="border-t border-white/5 py-12 text-center text-gray-600 text-xs tracking-widest font-bold relative z-10 bg-[#010104]">
                <h2 className="text-xl font-black text-white mb-2 tracking-widest uppercase">VELLORA</h2>
                <p className="opacity-40">© {new Date().getFullYear()} Safe & Secure Shopping | Fast Delivery | Easy Returns</p>
            </footer>
        </div>
    );
}

export default Home;