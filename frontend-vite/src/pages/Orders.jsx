import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Package, ArrowRight, CheckCircle, Clock, CreditCard, MapPin, Phone, Truck, X, RefreshCw, FileText } from "lucide-react";

const productImageFallback = "";

// --- FIXED: Image Helper to handle array or string ---
const getImageUrl = (product) => {
    // If product is null/undefined or if product.images array doesn't exist, use fallback.
    // Check if product.images is an array and has at least one element.
    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0]; // Use the first image from the array
    }
    // Fallback to product.image string, or finally the fallback URL
    return product?.image || productImageFallback;
};

function Orders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
    const navigate = useNavigate();
    const [reorderingId, setReorderingId] = useState(null);

    const handleReorder = async (item) => {
        if (!item.product) return;
        setReorderingId(item._id);
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/cart", {
                productId: item.product._id,
                quantity: item.quantity || 1,
                price: item.price || item.product.price,
                selectedColor: item.selectedColor,
                selectedRam: item.selectedRam,
                selectedVariant: item.selectedVariant
            }, { headers: { Authorization: `Bearer ${token}` } });
            navigate("/cart");
        } catch (err) {
            console.error("Reorder failed", err);
            alert("Failed to add to cart.");
        } finally {
            setReorderingId(null);
        }
    };

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const res = await axios.get("http://localhost:5000/api/orders", {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Ensure res.data is an array before attempting reverse()
            setOrders(Array.isArray(res.data) ? res.data.reverse() : []);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        queueMicrotask(fetchOrders);
    }, [fetchOrders]);

    const formatDate = (id) => {
        try {
            const date = new Date(parseInt(id.substring(0, 8), 16) * 1000);
            return isNaN(date.getTime())
                ? "Recently"
                : date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
        } catch { return "Recently"; }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#020208] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020208] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" />
            <div className="absolute top-24 left-16 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-16 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-xl">
                            <Package className="h-8 w-8 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest">My Orders</h2>
                            <p className="text-gray-400 mt-2">Track your Vellora purchases</p>
                        </div>
                    </div>
                    <Link
                        to="/"
                        className="text-cyan-400 font-bold inline-flex items-center group bg-white/10 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-xl hover:bg-white/15 transition-all"
                    >
                        Continue Shopping <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white/5 rounded-[35px] shadow-2xl p-12 sm:p-16 text-center max-w-2xl mx-auto border border-white/10 backdrop-blur-2xl">
                        <div className="bg-white/10 w-32 h-32 rounded-[35px] flex items-center justify-center mx-auto mb-8 border border-white/10">
                            <Package className="h-16 w-16 text-cyan-400" />
                        </div>
                        <h3 className="text-3xl font-extrabold mb-3">No orders found</h3>
                        <p className="text-gray-400 mb-10 max-w-md mx-auto text-lg">
                            You haven't placed any orders yet. Discover our latest products and treat yourself!
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-10 rounded-2xl transition duration-300 shadow-xl shadow-cyan-500/20 hover:scale-105"
                        >
                            Explore Products <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white/5 rounded-[35px] shadow-2xl overflow-hidden hover:-translate-y-2 transition duration-500 border border-white/10 backdrop-blur-2xl"
                            >
                                <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-b border-white/10 p-5 sm:p-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-green-500/10 p-3 rounded-2xl border border-green-500/20">
                                            <CheckCircle className="h-6 w-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-0.5">Order Placed</p>
                                            <p className="font-bold text-lg">{formatDate(order._id)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-8 w-full sm:w-auto justify-between sm:justify-end bg-white/5 p-4 sm:p-0 rounded-2xl sm:rounded-none border sm:border-none border-white/10">
                                        <div>
                                            <p className="text-sm font-medium text-gray-400 mb-0.5">Total Amount</p>
                                            <p className="font-extrabold text-cyan-400 text-xl">₹{order.totalPrice}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-400 mb-0.5">Order ID</p>
                                            <p className="font-mono font-bold text-gray-200 bg-white/10 px-2 py-0.5 rounded">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-7 bg-white/[0.02] border-t border-white/[0.05]">
                                    <div className="space-y-6">
                                        {order.orderItems.map((item, itemIdx) => (
                                            <div key={item._id || itemIdx} className="flex items-center gap-4 sm:gap-6 group">
                                                <div className="h-24 w-24 bg-white/10 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                                    {/* --- CHANGED THIS IMAGE SECTION ONLY --- */}
                                                    <img
                                                        src={getImageUrl(item.product || {})} // FIXED: Use the image helper
                                                        alt={item.product?.name || "Product"}
                                                        onError={(e) => {
                                                            e.currentTarget.src = productImageFallback;
                                                        }}
                                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-extrabold text-lg mb-1">{item.product?.name || "Product"}</h4>
                                                    {(item.selectedColor || item.selectedRam || item.selectedVariant) && (
                                                        <div className="flex flex-wrap gap-2 mb-2 mt-1">
                                                            {item.selectedColor && <span className="text-[10px] uppercase font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/5">{item.selectedColor}</span>}
                                                            {item.selectedRam && <span className="text-[10px] uppercase font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/5">{item.selectedRam}</span>}
                                                            {item.selectedVariant && <span className="text-[10px] uppercase font-bold text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/5">{item.selectedVariant}</span>}
                                                        </div>
                                                    )}
                                                    <p className="text-gray-400 text-sm font-medium flex items-center gap-4">
                                                        <span>Qty: <span className="text-gray-200 bg-white/10 px-2 py-0.5 rounded-full ml-1">{item.quantity}</span></span>
                                                        <span className="text-cyan-400 font-extrabold text-base">₹{((item.price || item.product?.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col justify-between items-end gap-2">
                                                    <button 
                                                        onClick={() => handleReorder(item)}
                                                        disabled={reorderingId === item._id}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all disabled:opacity-50"
                                                    >
                                                        <RefreshCw size={12} className={reorderingId === item._id ? "animate-spin" : ""} />
                                                        {reorderingId === item._id ? "Adding..." : "Reorder"}
                                                    </button>
                                                    <Link to={`/product/${item.product?._id}#reviews`} className="inline-block text-xs font-bold text-cyan-400 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-colors">
                                                        Write Review
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-7 pt-7 border-t border-white/10">
                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.03)]">
                                            <div className="flex items-center gap-3 mb-4">
                                                <MapPin className="text-cyan-400" size={22} />
                                                <h4 className="font-bold text-lg">Delivery Details</h4>
                                            </div>
                                            {order.shippingAddress ? (
                                                <div className="space-y-2 text-sm text-gray-300">
                                                    <p className="font-semibold text-white">{order.shippingAddress.fullName}</p>
                                                    <p className="flex items-center gap-2">
                                                        <Phone size={15} className="text-cyan-400" />
                                                        {order.shippingAddress.phone}
                                                    </p>
                                                    <p>{order.shippingAddress.address}</p>
                                                    <p>
                                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400">Delivery details were not saved for this older order.</p>
                                            )}
                                        </div>

                                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.03)]">
                                            <div className="flex items-center gap-3 mb-4">
                                                <CreditCard className="text-cyan-400" size={22} />
                                                <h4 className="font-bold text-lg">Payment</h4>
                                            </div>
                                            <div className="space-y-2 text-sm text-gray-300">
                                                <p>
                                                    Method: <span className="font-semibold text-white">{order.paymentMethod || "Not recorded"}</span>
                                                </p>
                                                <p>
                                                    Payment Status: <span className={`font-semibold ${order.paymentStatus === 'Paid' || order.orderStatus === 'Delivered' ? 'text-green-400' : 'text-orange-400'}`}>
                                                        {order.orderStatus === 'Delivered' ? 'Paid' : (order.paymentStatus || 'Pending')}
                                                    </span>
                                                </p>
                                                <p>
                                                    Order Status: <span className="font-semibold text-cyan-400">{order.orderStatus || "Processing"}</span>
                                                </p>
                                                <p>
                                                    Shipping: <span className="font-semibold text-white">{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice || 0}`}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] border-t border-white/[0.05] p-5 px-7 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center text-sm font-medium text-gray-300 gap-2">
                                        <Clock className="h-5 w-5 text-orange-400" />
                                        <span>Estimated delivery in <strong className="text-white">3-5 business days</strong></span>
                                    </div>
                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button 
                                            className="flex-1 sm:flex-none text-sm font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText size={14} /> Invoice
                                        </button>
                                        <button 
                                            onClick={() => setSelectedTrackOrder(order)}
                                            className="flex-1 sm:flex-none text-sm font-bold bg-white/10 text-white border border-white/10 hover:border-cyan-400/60 px-6 py-2.5 rounded-xl transition-colors"
                                        >
                                            Track Package
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* TRACKING MODAL */}
            {selectedTrackOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#050816] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                                <Truck size={20} className="text-cyan-400" /> Tracking Info
                            </h3>
                            <button onClick={() => setSelectedTrackOrder(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Tracking ID</p>
                                    <p className="font-mono font-bold text-sm text-cyan-400">TRK{selectedTrackOrder._id.slice(-10).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Carrier</p>
                                    <p className="font-bold text-sm">BlueDart Express</p>
                                </div>
                            </div>

                            <div className="relative pl-8 border-l border-white/10 space-y-8 pb-2 ml-2">
                                {/* Processing Step */}
                                <div className="relative">
                                    <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-4 border-[#050816] flex items-center justify-center ${selectedTrackOrder.orderStatus ? 'bg-cyan-400 text-black' : 'bg-white/10 text-transparent'}`}>
                                        {selectedTrackOrder.orderStatus && <CheckCircle size={12} />}
                                    </div>
                                    <h4 className={`text-sm font-bold ${selectedTrackOrder.orderStatus ? 'text-white' : 'text-gray-500'}`}>Order Processing</h4>
                                    <p className="text-xs text-gray-400 mt-1">We are preparing your order at our fulfillment center.</p>
                                    <p className="text-[10px] text-gray-500 font-mono mt-1">{formatDate(selectedTrackOrder._id)}</p>
                                </div>
                                {/* Packed Step */}
                                <div className="relative">
                                    <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-4 border-[#050816] flex items-center justify-center ${['Packed', 'Shipped', 'Delivered'].includes(selectedTrackOrder.orderStatus) ? 'bg-cyan-400 text-black' : 'bg-white/10 text-transparent'}`}>
                                        {['Packed', 'Shipped', 'Delivered'].includes(selectedTrackOrder.orderStatus) && <CheckCircle size={12} />}
                                    </div>
                                    <h4 className={`text-sm font-bold ${['Packed', 'Shipped', 'Delivered'].includes(selectedTrackOrder.orderStatus) ? 'text-white' : 'text-gray-500'}`}>Order Packed</h4>
                                    <p className="text-xs text-gray-400 mt-1">Your items have been securely packed and await courier pickup.</p>
                                </div>
                                {/* Shipped Step */}
                                <div className="relative">
                                    <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-4 border-[#050816] flex items-center justify-center ${['Shipped', 'Delivered'].includes(selectedTrackOrder.orderStatus) ? 'bg-cyan-400 text-black' : 'bg-white/10 text-transparent'}`}>
                                        {['Shipped', 'Delivered'].includes(selectedTrackOrder.orderStatus) && <CheckCircle size={12} />}
                                    </div>
                                    <h4 className={`text-sm font-bold ${['Shipped', 'Delivered'].includes(selectedTrackOrder.orderStatus) ? 'text-white' : 'text-gray-500'}`}>Order Shipped</h4>
                                    <p className="text-xs text-gray-400 mt-1">Handed over to BlueDart. In transit to your city.</p>
                                </div>
                                {/* Delivered Step */}
                                <div className="relative">
                                    <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-4 border-[#050816] flex items-center justify-center ${selectedTrackOrder.orderStatus === 'Delivered' ? 'bg-green-400 text-black' : 'bg-white/10 text-transparent'}`}>
                                        {selectedTrackOrder.orderStatus === 'Delivered' && <CheckCircle size={12} />}
                                    </div>
                                    <h4 className={`text-sm font-bold ${selectedTrackOrder.orderStatus === 'Delivered' ? 'text-white' : 'text-gray-500'}`}>Delivered</h4>
                                    <p className="text-xs text-gray-400 mt-1">Package has arrived securely at your delivery address.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedTrackOrder(null)}
                            className="w-full mt-8 bg-white/10 text-white font-bold py-3 rounded-xl transition hover:bg-white/20 text-sm uppercase tracking-widest"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;