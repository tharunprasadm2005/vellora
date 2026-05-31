import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { Heart, Trash2, ShoppingCart, ArrowRight, RefreshCw, Sparkles, Star, PackageX, PackageCheck, ListX, ListPlus } from "lucide-react";

const productImageFallback = "";

// Helper to resolve images from your MongoDB array structure
const getImageUrl = (product) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
    }
    return product.image || productImageFallback;
};

/* ─── Robust number formatter ─── */
const fmt = (n) => {
    if (n === null || n === undefined) return "0";
    if (typeof n === "number") return n.toLocaleString("en-IN");
    const parsed = Number(n);
    return isNaN(parsed) ? String(n) : parsed.toLocaleString("en-IN");
};

/* ─── Advanced Interactive Particle Void Backing ─── */
function ParticleVoid() {
    const ref = useRef();
    const { mouse } = useThree();
    
    const points = new Float32Array(2000);
    for (let i = 0; i < 2000; i++) {
        points[i] = (Math.random() - 0.5) * 8;
    }

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta * 0.04;
        ref.current.rotation.y -= delta * 0.02;
        
        ref.current.position.x += (mouse.x * 0.4 - ref.current.position.x) * 0.02;
        ref.current.position.y += (mouse.y * 0.4 - ref.current.position.y) * 0.02;
    });

    return (
        <group rotation={[0, 0, Math.PI / 6]}>
            <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#f43f5e"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                />
            </Points>
        </group>
    );
}

/* ─── Realistic 3D Tilt Card Wrapper with dynamic Glare ─── */
function HighFidelityTilt({ children, className }) {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        const angleX = (yc - y) / 12;
        const angleY = (x - xc) / 12;

        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.03, 1.03, 1.03)`;
        
        const percentageX = (x / rect.width) * 100;
        const percentageY = (y / rect.height) * 100;
        card.style.setProperty('--glare-x', `${percentageX}%`);
        card.style.setProperty('--glare-y', `${percentageY}%`);
        card.style.setProperty('--glare-opacity', '0.15');
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        card.style.setProperty('--glare-opacity', '0');
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`${className} relative transition-all duration-300 ease-out preserve-3d`}
            style={{
                transformStyle: "preserve-3d",
                backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)`
            }}
        >
            <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[inherit]"
                style={{
                    background: `radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.3) 0%, transparent 60%)`,
                    opacity: 'var(--glare-opacity, 0)',
                    mixBlendMode: 'overlay',
                    zIndex: 10
                }}
            />
            {children}
        </div>
    );
}

function Wishlist() {
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchWishlist = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const { data } = await axios.get("http://localhost:5000/api/wishlist", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setWishlist(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        queueMicrotask(fetchWishlist);
    }, [fetchWishlist]);
    

    const removeFromWishlist = async (id, silent = false) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/wishlist/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
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
                { headers: { Authorization: `Bearer ${token}` } }
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
            alert(`Moved ${count} items to cart!`);
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
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020208] flex items-center justify-center text-xs font-black tracking-widest uppercase text-gray-500">
                <RefreshCw size={14} className="animate-spin text-cyan-400 mr-3" />
                Accessing core data records...
            </div>
        );
    }

    const items = wishlist?.items || [];

    return (
        <div className="min-h-screen bg-[#020208] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden antialiased selection:bg-rose-500/30">
            
            {/* BACKGROUND 3D CANVAS BACKDROP */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 2.5], fov: 65 }}>
                    <ambientLight intensity={1.2} />
                    <directionalLight position={[4, 4, 4]} intensity={1.5} />
                    <ParticleVoid />
                </Canvas>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020208_95%)] pointer-events-none" />
            </div>

            {/* CYBERPUNK AMBIENT GLOW ORBS */}
            <div className="absolute top-10 left-[8%] w-80 h-80 bg-rose-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-20 right-[8%] w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                
                {/* HEADER ROW MODULE */}
                <div className="flex items-center gap-4 mb-12">
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

                {items.length === 0 ? (
                    <div className="bg-white/[0.01] border border-white/5 backdrop-blur-3xl rounded-2xl p-12 text-center max-w-xl mx-auto shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                        <Heart className="h-12 w-12 text-rose-500/40 mx-auto mb-4" />
                        <h3 className="text-lg font-bold uppercase tracking-tight mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 text-xs tracking-wide mb-6">Save items you like to buy them later.</p>
                        <Link to="/" className="inline-flex items-center gap-2 bg-white text-black py-3 px-8 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-cyan-400 transition duration-300 shadow-xl">
                            Start Shopping <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <HighFidelityTilt key={item.product._id} className="group flex flex-col justify-between bg-[#040409] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors duration-300">
                                
                                <Link to={`/product/${item.product._id}`} className="block flex-shrink-0 relative overflow-hidden bg-neutral-950/60" style={{ transformStyle: "preserve-3d" }}>
                                    <img
                                        src={getImageUrl(item.product)}
                                        alt={item.product.name}
                                        className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-102"
                                        onError={(e) => { e.currentTarget.src = productImageFallback; }}
                                    />
                                </Link>

                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4" style={{ transformStyle: "preserve-3d" }}>
                                    <div className="space-y-1">
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
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase border ${item.product.countInStock > 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
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
                                </div>

                            </HighFidelityTilt>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Wishlist;