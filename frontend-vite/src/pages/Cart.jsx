import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
    Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, CreditCard,
    User, Phone, MapPin, Wallet, Heart, Plus, Minus, Tag, ChevronDown,
    RotateCcw, X, Zap, Package, Clock, Star, AlertTriangle, CheckCircle,
    Gift, ChevronRight, Info, RefreshCw
} from "lucide-react";

/* ─── helpers ─── */
const productImageFallback = "";

const getImageUrl = (product) => {
    if (product?.images?.length > 0) return product.images[0];
    return product?.image || productImageFallback;
};

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/* ─── mock coupons ─── */
const COUPONS = [
    { code: "SAVE10", label: "10% off (max ₹200)", type: "percent", value: 10, max: 200 },
    { code: "FLAT150", label: "Flat ₹150 off on orders above ₹999", type: "flat", value: 150, min: 999 },
    { code: "NEWUSER", label: "₹250 off for new users", type: "flat", value: 250 },
];

/* ─── real recommended products will be passed as props ─── */

/* ─── Toast ─── */
function Toast({ toasts, dismiss }) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="flex items-center gap-3 bg-gray-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl pointer-events-auto animate-slide-up text-sm font-semibold"
                >
                    {t.type === "success" ? <CheckCircle size={16} className="text-green-400" /> : <Info size={16} className="text-cyan-400" />}
                    {t.msg}
                    <button onClick={() => dismiss(t.id)} className="ml-2 text-gray-400 hover:text-white"><X size={14} /></button>
                </div>
            ))}
        </div>
    );
}

/* ─── Coupon Panel ─── */
function CouponPanel({ subtotal, coupon, setCoupon }) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [err, setErr] = useState("");

    const apply = (code) => {
        const found = COUPONS.find((c) => c.code === code.toUpperCase().trim());
        if (!found) { setErr("Invalid coupon code."); return; }
        if (found.min && subtotal < found.min) { setErr(`Minimum order ₹${found.min} required.`); return; }
        setCoupon(found);
        setErr("");
        setOpen(false);
        setInput("");
    };

    const discount = coupon
        ? coupon.type === "percent"
            ? Math.min((subtotal * coupon.value) / 100, coupon.max || Infinity)
            : coupon.value
        : 0;

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4">
            <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
                    <Tag size={16} className="text-cyan-400" />
                    {coupon ? <span className="text-green-400">{coupon.code} applied · saved {fmt(discount)}</span> : "Coupons & Offers"}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="mt-4 space-y-3 animate-fade-in">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => { setInput(e.target.value); setErr(""); }}
                            placeholder="Enter coupon code"
                            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 transition"
                        />
                        <button
                            onClick={() => apply(input)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition"
                        >Apply</button>
                    </div>
                    {err && <p className="text-red-400 text-xs">{err}</p>}
                    <div className="space-y-2 pt-1">
                        {COUPONS.map((c) => (
                            <button
                                key={c.code}
                                onClick={() => apply(c.code)}
                                className="w-full flex items-center justify-between bg-white/5 border border-dashed border-white/10 rounded-xl px-4 py-3 text-left hover:border-cyan-400/50 transition group"
                            >
                                <div>
                                    <p className="font-bold text-cyan-400 text-sm">{c.code}</p>
                                    <p className="text-xs text-gray-400">{c.label}</p>
                                </div>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-cyan-400 transition">APPLY</span>
                            </button>
                        ))}
                    </div>
                    {coupon && (
                        <button onClick={() => setCoupon(null)} className="text-red-400 text-xs underline">Remove coupon</button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─── Cart Item Card ─── */
function CartItemCard({ item, onRemove, onQtyChange, onSaveForLater, undoItem }) {
    const product = item.product;
    const price = item.price || product?.price || 0;
    const mrp = product?.mrp || Math.round(price * 1.3);
    const discPct = Math.round(((mrp - price) / mrp) * 100);
    const lowStock = product?.stock && product.stock <= 3;
    const deliveryDate = new Date(Date.now() + 2 * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

    return (
        <div className="relative bg-white/[0.01] border border-white/[0.05] rounded-3xl p-5 flex flex-col sm:flex-row gap-5 hover:border-white/10 transition-all duration-300 group overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.05)] hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
            {/* shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 group-hover:opacity-100 transition" />

            {/* Image */}
            <div className="relative h-28 w-28 flex-shrink-0 bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden self-center">
                <img
                    src={getImageUrl(product)}
                    alt={product?.name}
                    onError={(e) => { e.currentTarget.src = productImageFallback; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {discPct > 0 && (
                    <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg">
                        -{discPct}%
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <Link to={`/product/${product?._id}`} className="font-bold text-base hover:text-cyan-400 transition line-clamp-1">
                    {product?.name}
                </Link>
                {(item.selectedColor || item.selectedRam || item.selectedVariant) && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {[item.selectedColor, item.selectedRam, item.selectedVariant].filter(Boolean).map((v, i) => (
                            <span key={i} className="text-[10px] uppercase font-bold text-gray-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/5">{v}</span>
                        ))}
                    </div>
                )}

                {/* Price & Quantity Row */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-3">
                        <span className="text-xl font-extrabold text-cyan-400">{fmt(price * (item.quantity || 1))}</span>
                        {mrp > price && <span className="text-sm text-gray-500 line-through">{fmt(mrp * (item.quantity || 1))}</span>}
                        {discPct > 0 && <span className="text-xs font-bold text-green-400">{discPct}% off</span>}
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
                        <button 
                            onClick={() => onQtyChange(item, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                            className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition p-1"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity || 1}</span>
                        <button 
                            onClick={() => onQtyChange(item, (item.quantity || 1) + 1)}
                            className="text-gray-400 hover:text-white transition p-1"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {/* Delivery & stock */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Truck size={12} className="text-cyan-400" /> Delivery by {deliveryDate}
                    </span>
                    {lowStock && (
                        <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold animate-pulse">
                            <AlertTriangle size={12} /> Only {product.stock} left!
                        </span>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                        onClick={() => onRemove(item)}
                        className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-red-400 transition border border-white/10 hover:border-red-400/40 px-3 py-2 rounded-xl"
                    >
                        <Trash2 size={13} /> Remove
                    </button>
                    <button
                        onClick={() => onSaveForLater(item)}
                        className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-cyan-400 transition border border-white/10 hover:border-cyan-400/40 px-3 py-2 rounded-xl"
                    >
                        <Heart size={13} /> Save for Later
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Saved For Later Strip ─── */
function SavedItems({ items, onMoveToCart }) {
    if (!items.length) return null;
    return (
        <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Heart size={14} className="text-pink-400" /> Saved for Later ({items.length})
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {items.map((item) => (
                    <div key={item._id} className="min-w-[160px] bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3 flex-shrink-0">
                        <img src={getImageUrl(item.product)} alt={item.product?.name} className="w-full h-24 object-cover rounded-xl mb-2" />
                        <p className="text-xs font-bold line-clamp-1">{item.product?.name}</p>
                        <p className="text-cyan-400 font-bold text-sm">{fmt(item.price || item.product?.price)}</p>
                        <button onClick={() => onMoveToCart(item)} className="mt-2 text-xs bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 w-full py-1.5 rounded-xl font-bold hover:bg-cyan-500/30 transition">
                            Move to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Recommended Strip ─── */
function Recommended({ products }) {
    if (!products || products.length === 0) return null;
    return (
        <div className="mt-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" /> You may also like
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {products.map((p) => {
                    const price = p.price || 0;
                    const mrp = p.mrp || Math.round(price * 1.3);
                    const disc = Math.round(((mrp - price) / mrp) * 100);
                    return (
                        <Link to={`/product/${p._id}`} key={p._id} className="min-w-[160px] bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3 flex-shrink-0 hover:border-cyan-400/30 transition group block">
                            <div className="relative overflow-hidden rounded-xl mb-2 h-24">
                                <img src={getImageUrl(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                {disc > 0 && <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg">-{disc}%</span>}
                            </div>
                            <p className="text-xs font-bold line-clamp-1">{p.name}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-[10px] text-gray-400">{p.rating || 4.5}</span>
                            </div>
                            <p className="text-cyan-400 font-bold text-sm">{fmt(price)}</p>
                            <button className="mt-2 text-[10px] font-black uppercase tracking-widest bg-white/[0.05] border border-white/[0.05] text-white w-full py-2 rounded-xl hover:bg-cyan-500/20 hover:border-cyan-400/30 transition pointer-events-none">
                                View Details
                            </button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

/* ─── Payment Modal ─── */
function PaymentModal({ method, total, onPay, onCancel }) {
    const [details, setDetails] = useState("");
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#050816] border border-white/[0.05] rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                        <Wallet size={20} className="text-cyan-400" /> {method} Payment
                    </h3>
                    <button onClick={onCancel} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl mb-6 text-center shadow-inner">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount to Pay</p>
                    <p className="text-3xl font-extrabold text-cyan-400">{fmt(total)}</p>
                </div>
                
                {method === "UPI" ? (
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase">Enter UPI ID</label>
                        <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="example@upi" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-cyan-400 transition" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase">Card Details</label>
                        <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Card Number" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-cyan-400 transition" />
                        <div className="flex gap-2">
                            <input placeholder="MM/YY" className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-cyan-400 transition" />
                            <input placeholder="CVV" type="password" maxLength={3} className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-cyan-400 transition" />
                        </div>
                    </div>
                )}
                
                <button
                    onClick={() => {
                        if (!details) return;
                        onPay();
                    }}
                    disabled={!details}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 px-6 rounded-2xl transition duration-300 hover:scale-[1.02] shadow-xl shadow-cyan-500/20 disabled:opacity-50 uppercase tracking-widest text-sm"
                >
                    Pay Now
                </button>
            </div>
        </div>
    );
}

/* ─── Trust Badges ─── */
function TrustBadges() {
    const badges = [
        { icon: ShieldCheck, label: "Secure Payment", sub: "256-bit SSL" },
        { icon: RotateCcw, label: "Easy Returns", sub: "10-day policy" },
        { icon: Truck, label: "Free Delivery", sub: "Orders above ₹999" },
        { icon: Package, label: "Genuine Products", sub: "100% authentic" },
    ];
    return (
        <div className="grid grid-cols-2 gap-3 mt-4">
            {badges.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl px-3 py-2.5">
                    <Icon size={18} className="text-cyan-400 flex-shrink-0" />
                    <div>
                        <p className="text-xs font-bold">{label}</p>
                        <p className="text-[10px] text-gray-500">{sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Main Cart ─── */
function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkingOut, setCheckingOut] = useState(false);
    const [savedItems, setSavedItems] = useState([]);
    const [coupon, setCoupon] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [undoQueue, setUndoQueue] = useState([]);
    const [pincode, setPincode] = useState("");
    const [pincodeStatus, setPincodeStatus] = useState(null);
    const [couponOpen, setCouponOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [recommended, setRecommended] = useState([]);
    const toastCounter = useRef(0);

    const [checkoutDetails, setCheckoutDetails] = useState({
        fullName: "", phone: "", address: "", city: "", state: "",
        postalCode: "", paymentMethod: "Cash on Delivery",
    });

    const navigate = useNavigate();

    const toast = (msg, type = "info") => {
        const id = ++toastCounter.current;
        setToasts((t) => [...t, { id, msg, type }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    };
    const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) { navigate("/login"); return; }
            const h = { Authorization: `Bearer ${token}` };
            const [cr, pr, rec] = await Promise.all([
                axios.get("http://localhost:5000/api/cart", { headers: h }),
                axios.get("http://localhost:5000/api/users/profile", { headers: h }),
                axios.get("http://localhost:5000/api/products")
            ]);
            setCart(cr.data);
            setRecommended(rec.data?.slice(0, 8) || []);
            setCheckoutDetails((d) => ({
                ...d,
                fullName: pr.data?.name || "",
                phone: pr.data?.phone || "",
                address: pr.data?.address || "",
                city: pr.data?.city || "",
                state: pr.data?.state || "",
                postalCode: pr.data?.postalCode || "",
                paymentMethod: pr.data?.paymentMethod || "Cash on Delivery",
            }));
            setLoading(false);
        } catch (err) {
            if (err.response?.status === 401) { localStorage.removeItem("token"); navigate("/login"); }
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const refreshCart = async () => {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/cart", { headers: { Authorization: `Bearer ${token}` } });
        setCart(data);
    };

    const handleRemove = async (item) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/cart/${item._id || item.product._id}`, { headers: { Authorization: `Bearer ${token}` } });
            await refreshCart();
            toast("Item removed", "info");
        } catch { toast("Error removing item"); }
    };

    const handleQtyChange = async (item, newQty) => {
        if (newQty < 1) return;
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/cart/${item._id}`, { quantity: newQty }, { headers: { Authorization: `Bearer ${token}` } });
            await refreshCart();
        } catch { toast("Error updating quantity"); }
    };

    const handleSaveForLater = async (item) => {
        try {
            const token = localStorage.getItem("token");
            // Add to wishlist (mimicking Save for Later backend)
            await axios.post("http://localhost:5000/api/wishlist", { productId: item.product._id }, { headers: { Authorization: `Bearer ${token}` } });
            // Remove from cart
            await axios.delete(`http://localhost:5000/api/cart/${item._id || item.product._id}`, { headers: { Authorization: `Bearer ${token}` } });
            
            setSavedItems((s) => [...s, item]);
            await refreshCart();
            toast("Saved for later", "success");
        } catch { toast("Error saving item for later"); }
    };

    const handleMoveToCart = async (item) => {
        try {
            const token = localStorage.getItem("token");
            // Remove from wishlist
            await axios.delete(`http://localhost:5000/api/wishlist/${item.product._id}`, { headers: { Authorization: `Bearer ${token}` } });
            // Add back to cart
            await axios.post("http://localhost:5000/api/cart", { productId: item.product._id, quantity: 1 }, { headers: { Authorization: `Bearer ${token}` } });
            
            setSavedItems((s) => s.filter((x) => x._id !== item._id));
            await refreshCart();
            toast("Moved back to cart", "success");
        } catch { toast("Error moving item back to cart"); }
    };

    const handleClearCart = async () => {
        if (!window.confirm("Clear all items from cart?")) return;
        const token = localStorage.getItem("token");
        const items = cart?.items || [];
        for (const item of items) {
            await axios.delete(`http://localhost:5000/api/cart/${item._id || item.product._id}`, { headers: { Authorization: `Bearer ${token}` } });
        }
        await refreshCart();
        toast("Cart cleared", "info");
    };

    const checkPincode = () => {
        if (pincode.length !== 6) { setPincodeStatus("error"); return; }
        setPincodeStatus("loading");
        setTimeout(() => {
            setPincodeStatus(parseInt(pincode) % 2 === 0 ? "available" : "unavailable");
        }, 800);
    };

    const handleCheckoutChange = (e) => {
        const { name, value } = e.target;
        setCheckoutDetails((d) => ({ ...d, [name]: value }));
    };

    const handlePlaceOrderClick = (e) => {
        e.preventDefault();
        placeOrder();
    };

    const placeOrder = async () => {
        setCheckingOut(true);
        try {
            const token = localStorage.getItem("token");
            const h = { Authorization: `Bearer ${token}` };
            await axios.put("http://localhost:5000/api/users/profile", { ...checkoutDetails, name: checkoutDetails.fullName }, { headers: h });
            await axios.post("http://localhost:5000/api/orders", {
                shippingAddress: {
                    fullName: checkoutDetails.fullName,
                    phone: checkoutDetails.phone,
                    address: checkoutDetails.address,
                    city: checkoutDetails.city,
                    state: checkoutDetails.state,
                    postalCode: checkoutDetails.postalCode,
                },
                paymentMethod: checkoutDetails.paymentMethod,
                couponDiscount: couponDiscount // Sending coupon discount to backend
            }, { headers: h });
            window.dispatchEvent(new Event("profile:updated"));
            window.dispatchEvent(new Event("cart:updated"));
            navigate("/orders");
        } catch (err) {
            toast(err.response?.data?.message || "Failed to place order");
            setCheckingOut(false);
        }
    };

    /* ─── derived numbers ─── */
    const cartItems = cart?.items || [];
    const totalMRP = cartItems.reduce((a, i) => {
        const price = i.price || i.product?.price || 0;
        const mrp = i.product?.mrp || Math.round(price * 1.3);
        return a + mrp * i.quantity;
    }, 0);
    const subtotal = cartItems.reduce((a, i) => a + (i.price || i.product?.price || 0) * i.quantity, 0);
    const productDiscount = totalMRP - subtotal;
    const shipping = subtotal > 999 || subtotal === 0 ? 0 : 99;
    const couponDiscount = coupon
        ? coupon.type === "percent"
            ? Math.min((subtotal * coupon.value) / 100, coupon.max || Infinity)
            : coupon.value
        : 0;
    const platformFee = subtotal > 0 ? 5 : 0;
    const total = subtotal + shipping - couponDiscount;
    const totalSaved = productDiscount + couponDiscount + (shipping === 0 && subtotal > 0 ? 99 : 0);
    const freeDeliveryGap = 999 - subtotal;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020208] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500" />
                    <p className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">Loading Cart…</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
                .animate-slide-up { animation: slideUp .3s ease both; }
                .animate-fade-in  { animation: fadeIn .25s ease both; }
                .no-scrollbar::-webkit-scrollbar { display:none; }
                .no-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
            `}</style>

            <Toast toasts={toasts} dismiss={dismissToast} />

            <div className="min-h-screen bg-[#020208] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* ambient blobs */}
                <div className="absolute top-24 left-12 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-20 right-12 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-xl">
                                <ShoppingBag className="h-7 w-7 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-widest">Shopping Cart</h1>
                                <p className="text-gray-400 mt-1 text-sm">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart</p>
                            </div>
                        </div>
                        {cartItems.length > 0 && (
                            <button onClick={handleClearCart} className="flex items-center gap-2 text-sm text-red-400 border border-red-400/20 hover:border-red-400/50 hover:bg-red-400/10 px-4 py-2 rounded-xl transition">
                                <Trash2 size={14} /> Clear Cart
                            </button>
                        )}
                    </div>

                    {/* Empty */}
                    {cartItems.length === 0 ? (
                        <div className="bg-white/5 rounded-[35px] shadow-2xl p-16 text-center max-w-2xl mx-auto border border-white/10 backdrop-blur-2xl">
                            <div className="bg-white/10 w-32 h-32 rounded-[35px] flex items-center justify-center mx-auto mb-8 border border-white/10">
                                <ShoppingBag className="h-16 w-16 text-cyan-400" />
                            </div>
                            <h3 className="text-3xl font-extrabold mb-3">Your cart is empty</h3>
                            <p className="text-gray-400 mb-10 max-w-md mx-auto">Add items to your cart to proceed with checkout.</p>
                            <Link to="/" className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-cyan-500/20 hover:scale-105 transition">
                                Start Shopping <ArrowRight size={20} />
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row gap-8 items-start">

                            {/* LEFT: Items */}
                            <div className="flex-1 min-w-0">
                                {/* Free delivery bar */}
                                {freeDeliveryGap > 0 && (
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl px-5 py-3 flex items-center gap-3 mb-5 text-sm">
                                        <Truck size={16} className="text-cyan-400 flex-shrink-0" />
                                        <span>Add <strong className="text-cyan-400">{fmt(freeDeliveryGap)}</strong> more for <strong className="text-green-400">FREE delivery</strong></span>
                                        <div className="flex-1 bg-white/10 rounded-full h-1.5 ml-2">
                                            <div
                                                className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                                                style={{ width: `${Math.min(100, (subtotal / 999) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Cart items */}
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <CartItemCard
                                            key={item._id || item.product._id}
                                            item={item}
                                            onRemove={handleRemove}
                                            onQtyChange={handleQtyChange}
                                            onSaveForLater={handleSaveForLater}
                                        />
                                    ))}
                                </div>

                                <SavedItems items={savedItems} onMoveToCart={handleMoveToCart} />


                                {/* Pincode checker */}
                                <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-5">
                                    <p className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MapPin size={14} className="text-cyan-400" /> Check Delivery Availability
                                    </p>
                                    <div className="flex gap-2">
                                        <input
                                            value={pincode}
                                            onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); setPincodeStatus(null); }}
                                            placeholder="Enter PIN code"
                                            className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 transition"
                                        />
                                        <button onClick={checkPincode} className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-cyan-500/30 transition">
                                            {pincodeStatus === "loading" ? <RefreshCw size={14} className="animate-spin" /> : "Check"}
                                        </button>
                                    </div>
                                    {pincodeStatus === "available" && <p className="text-green-400 text-xs mt-2 flex items-center gap-1"><CheckCircle size={12} /> Delivery available! Estimated 2–3 days.</p>}
                                    {pincodeStatus === "unavailable" && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><X size={12} /> Delivery not available for this PIN.</p>}
                                    {pincodeStatus === "error" && <p className="text-amber-400 text-xs mt-2">Enter a valid 6-digit PIN code.</p>}
                                </div>

                                {/* Recommended */}
                                <Recommended products={recommended} />
                            </div>

                            {/* RIGHT: Checkout sidebar */}
                            <div className="w-full lg:w-[420px] flex-shrink-0">
                                <div className="sticky top-24 space-y-4">

                                    {/* Coupon */}
                                    <CouponPanel subtotal={subtotal} coupon={coupon} setCoupon={setCoupon} />

                                    {/* Price Summary */}
                                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.03)]">
                                        <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 text-cyan-400">Price Details</h2>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between text-gray-300">
                                                <span className="font-medium">Total MRP ({cartItems.length} items)</span>
                                                <span className="font-bold">{fmt(totalMRP)}</span>
                                            </div>
                                            <div className="flex justify-between text-green-400">
                                                <span className="font-medium">Product Discount</span>
                                                <span className="font-bold">− {fmt(productDiscount)}</span>
                                            </div>
                                            {coupon && (
                                                <div className="flex justify-between text-green-400">
                                                    <span className="font-medium">Coupon ({coupon.code})</span>
                                                    <span className="font-bold">− {fmt(couponDiscount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-gray-300">
                                                <span className="font-medium">Delivery</span>
                                                {shipping === 0
                                                    ? <span className="text-green-400 font-bold uppercase tracking-widest text-[10px]">FREE</span>
                                                    : <span className="font-bold">{fmt(shipping)}</span>}
                                            </div>
                                            <div className="border-t border-white/[0.05] pt-4 flex justify-between items-center">
                                                <span className="font-black text-xs uppercase tracking-widest">Total Amount</span>
                                                <span className="text-2xl font-extrabold text-cyan-400">{fmt(total)}</span>
                                            </div>
                                        </div>
                                        {totalSaved > 0 && (
                                            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5 text-[10px] font-black tracking-widest uppercase text-emerald-400 flex items-center gap-2">
                                                <Gift size={14} /> You'll save {fmt(totalSaved)} on this order 🎉
                                            </div>
                                        )}
                                    </div>

                                    {/* Checkout form */}
                                    <form onSubmit={handlePlaceOrderClick} className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 shadow-[0_0_30px_rgba(147,51,234,0.03)]">
                                        <h2 className="text-[10px] font-black uppercase tracking-widest mb-4 text-purple-400">Delivery Details</h2>

                                        <div className="space-y-3">
                                            {/* Full Name */}
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={15} />
                                                <input name="fullName" value={checkoutDetails.fullName} onChange={handleCheckoutChange} required placeholder="Full name" className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition" />
                                            </div>
                                            {/* Phone */}
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" size={15} />
                                                <input name="phone" type="tel" value={checkoutDetails.phone} onChange={handleCheckoutChange} required placeholder="Phone number" className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition" />
                                            </div>
                                            {/* Address */}
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-cyan-400" size={15} />
                                                <textarea name="address" value={checkoutDetails.address} onChange={handleCheckoutChange} required rows="2" placeholder="House no, street, area" className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition resize-none" />
                                            </div>
                                            {/* City / State */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <input name="city" value={checkoutDetails.city} onChange={handleCheckoutChange} required placeholder="City" className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 px-4 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition" />
                                                <input name="state" value={checkoutDetails.state} onChange={handleCheckoutChange} required placeholder="State" className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 px-4 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition" />
                                            </div>
                                            {/* Postal */}
                                            <input name="postalCode" value={checkoutDetails.postalCode} onChange={handleCheckoutChange} required placeholder="PIN code" className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl py-2.5 px-4 text-white placeholder-gray-500 text-sm outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition" />
                                            {/* Payment Accordion */}
                                            <div className="space-y-2 pt-2">
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-3 mt-2 text-cyan-400 flex items-center gap-1.5"><Wallet size={12} /> Payment Options</p>
                                                
                                                {/* UPI */}
                                                <div className={`border rounded-xl transition-all ${checkoutDetails.paymentMethod === 'UPI' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                                    <label className="flex items-center gap-3 p-3.5 cursor-pointer">
                                                        <input type="radio" name="paymentMethod" value="UPI" checked={checkoutDetails.paymentMethod === 'UPI'} onChange={handleCheckoutChange} className="w-4 h-4 accent-cyan-500" />
                                                        <span className="text-sm font-bold flex-1 text-white tracking-wide">UPI (Google Pay, PhonePe)</span>
                                                    </label>
                                                    {checkoutDetails.paymentMethod === 'UPI' && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-white/10 mt-1 animate-fade-in">
                                                            <input required placeholder="Enter UPI ID (e.g. name@upi)" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-cyan-400 text-white placeholder-slate-500" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Credit/Debit Card */}
                                                <div className={`border rounded-xl transition-all ${checkoutDetails.paymentMethod === 'Card' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                                    <label className="flex items-center gap-3 p-3.5 cursor-pointer">
                                                        <input type="radio" name="paymentMethod" value="Card" checked={checkoutDetails.paymentMethod === 'Card'} onChange={handleCheckoutChange} className="w-4 h-4 accent-cyan-500" />
                                                        <span className="text-sm font-bold flex-1 text-white tracking-wide">Credit / Debit Card</span>
                                                    </label>
                                                    {checkoutDetails.paymentMethod === 'Card' && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-white/10 mt-1 space-y-3 animate-fade-in">
                                                            <input required placeholder="Card Number" maxLength={16} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-cyan-400 text-white placeholder-slate-500" />
                                                            <div className="flex gap-3">
                                                                <input required placeholder="MM/YY" maxLength={5} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-cyan-400 text-white placeholder-slate-500" />
                                                                <input required placeholder="CVV" type="password" maxLength={3} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-cyan-400 text-white placeholder-slate-500" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Net Banking */}
                                                <div className={`border rounded-xl transition-all ${checkoutDetails.paymentMethod === 'Net Banking' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                                    <label className="flex items-center gap-3 p-3.5 cursor-pointer">
                                                        <input type="radio" name="paymentMethod" value="Net Banking" checked={checkoutDetails.paymentMethod === 'Net Banking'} onChange={handleCheckoutChange} className="w-4 h-4 accent-cyan-500" />
                                                        <span className="text-sm font-bold flex-1 text-white tracking-wide">Net Banking</span>
                                                    </label>
                                                    {checkoutDetails.paymentMethod === 'Net Banking' && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-white/10 mt-1 animate-fade-in">
                                                            <select className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-xs outline-none focus:border-cyan-400 text-white cursor-pointer appearance-none">
                                                                <option className="bg-[#0f172a]">HDFC Bank</option>
                                                                <option className="bg-[#0f172a]">ICICI Bank</option>
                                                                <option className="bg-[#0f172a]">State Bank of India</option>
                                                                <option className="bg-[#0f172a]">Axis Bank</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Cash on Delivery */}
                                                <div className={`border rounded-xl transition-all ${checkoutDetails.paymentMethod === 'Cash on Delivery' ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                                                    <label className="flex items-center gap-3 p-3.5 cursor-pointer">
                                                        <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={checkoutDetails.paymentMethod === 'Cash on Delivery'} onChange={handleCheckoutChange} className="w-4 h-4 accent-cyan-500" />
                                                        <span className="text-sm font-bold flex-1 text-white tracking-wide">Cash on Delivery</span>
                                                    </label>
                                                    {checkoutDetails.paymentMethod === 'Cash on Delivery' && (
                                                        <div className="px-4 pb-4 pt-2 border-t border-white/10 mt-1 animate-fade-in">
                                                            <p className="text-xs text-gray-400 flex items-center gap-2"><Info size={14} className="text-cyan-400"/> Pay via cash or UPI at your doorstep.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <button
                                            type="submit"
                                            disabled={checkingOut}
                                            className="w-full mt-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black py-4 px-6 rounded-2xl transition duration-300 flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 hover:scale-[1.02] disabled:opacity-70 text-sm uppercase tracking-widest"
                                        >
                                            {checkingOut
                                                ? <><RefreshCw size={16} className="animate-spin" /> Processing…</>
                                                : <><CreditCard size={16} /> Place Order · {fmt(total)}</>
                                            }
                                        </button>

                                        <p className="text-center text-[10px] text-gray-500 mt-3 flex items-center justify-center gap-1">
                                            <ShieldCheck size={11} className="text-green-400" /> Secured by 256-bit SSL encryption
                                        </p>
                                    </form>

                                    {/* Trust badges */}
                                    <TrustBadges />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {paymentModalOpen && (
                <PaymentModal 
                    method={checkoutDetails.paymentMethod} 
                    total={total} 
                    onPay={placeOrder} 
                    onCancel={() => setPaymentModalOpen(false)} 
                />
            )}
        </>
    );
}

export default Cart;