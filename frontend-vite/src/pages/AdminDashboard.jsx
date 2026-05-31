import { useState, useEffect } from "react";
import axios from "axios";
import {
  Package, ShoppingCart, Users, Settings,
  Edit, Trash2, Plus, RefreshCw, Box,
  TrendingUp, Tag, ShieldCheck, CheckCircle, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [prodRes, orderRes] = await Promise.all([
        axios.get("http://localhost:5000/api/products"),
        axios.get("http://localhost:5000/api/admin/orders", config)
      ]);
      
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data.products || []));
      setOrders(orderRes.data || []);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Not authorized as admin or session expired.");
        navigate("/");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/admin/orders/${orderId}/status`, 
        { status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(); // refresh
    } catch (err) {
      alert("Error updating order status");
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // refresh
    } catch (err) {
      alert("Error deleting product");
    }
  };

  const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020208] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500"></div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-[#020208] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white/[0.01] border-r border-white/[0.05] p-6 flex flex-col hidden md:flex shadow-[0_0_50px_rgba(6,182,212,0.03)] z-10 relative">
        <div className="flex items-center gap-3 mb-10">
          <ShieldCheck className="text-cyan-400" size={28} />
          <h2 className="text-xl font-black uppercase tracking-widest">Admin Panel</h2>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition ${activeTab === "dashboard" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-gray-400 hover:bg-white/[0.02] hover:text-white border border-transparent"}`}>
            <TrendingUp size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab("products")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition ${activeTab === "products" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-gray-400 hover:bg-white/[0.02] hover:text-white border border-transparent"}`}>
            <Package size={18} /> Products
          </button>
          <button onClick={() => setActiveTab("orders")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest uppercase transition ${activeTab === "orders" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-gray-400 hover:bg-white/[0.02] hover:text-white border border-transparent"}`}>
            <ShoppingCart size={18} /> Orders
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.03)]">
                <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-3xl font-black text-cyan-400">{fmt(totalRevenue)}</p>
                </div>
                <TrendingUp size={32} className="text-cyan-500/50" />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.03)]">
                <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Total Orders</p>
                  <p className="text-3xl font-black text-purple-400">{orders.length}</p>
                </div>
                <ShoppingCart size={32} className="text-purple-500/50" />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] p-6 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.03)]">
                <div>
                  <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Total Products</p>
                  <p className="text-3xl font-black text-emerald-400">{products.length}</p>
                </div>
                <Package size={32} className="text-emerald-500/50" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tight">Products Management</h1>
              {/* Future addition: add product modal trigger here */}
            </div>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.03)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/10 text-xs uppercase font-black tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={p.image || (p.images && p.images[0])} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/[0.05]" />
                        <span className="font-bold line-clamp-1">{p.name}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-cyan-400">{fmt(p.price)}</td>
                      <td className="px-6 py-4 text-gray-300">{p.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${p.countInStock > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                          {p.countInStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteProduct(p._id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Orders Management</h1>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.03)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/10 text-xs uppercase font-black tracking-widest text-gray-400">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {orders.map(o => (
                    <tr key={o._id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 font-mono text-gray-400">{o._id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-bold">{o.user?.name || "Guest"}</td>
                      <td className="px-6 py-4 font-bold text-cyan-400">{fmt(o.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${o.paymentMethod === "Cash on Delivery" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400"}`}>
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={o.orderStatus || "Processing"}
                          onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                          className="bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1 text-sm outline-none focus:border-cyan-400"
                        >
                          <option value="Processing" className="text-black">Processing</option>
                          <option value="Packed" className="text-black">Packed</option>
                          <option value="Shipped" className="text-black">Shipped</option>
                          <option value="Delivered" className="text-black">Delivered</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedOrder(o)} className="text-cyan-400 hover:text-cyan-300 text-xs font-bold uppercase tracking-widest transition">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#050816] border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <ShoppingCart size={20} /> Order Details
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition"><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
              <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.02)]">
                <p className="text-gray-400 mb-1 uppercase tracking-widest text-[10px] font-black">Order ID</p>
                <p className="font-mono text-xs">{selectedOrder._id}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.02)]">
                <p className="text-gray-400 mb-1 uppercase tracking-widest text-[10px] font-black">User / Guest</p>
                <p className="font-bold">{selectedOrder.user?.name || "Guest"}</p>
                {selectedOrder.user?.email && <p className="text-xs text-gray-400">{selectedOrder.user.email}</p>}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl mb-6 text-sm shadow-[0_0_15px_rgba(6,182,212,0.02)]">
              <p className="text-gray-400 mb-3 uppercase tracking-widest text-[10px] font-black">Shipping Address</p>
              <p className="font-bold">{selectedOrder.shippingAddress?.fullName}</p>
              <p className="text-gray-300 mt-1">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
              <p className="text-gray-300">{selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.postalCode}</p>
              <p className="text-cyan-400 mt-2 font-mono text-xs">Phone: {selectedOrder.shippingAddress?.phone}</p>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 mb-3 uppercase tracking-widest text-[10px] font-black">Order Items</p>
              <div className="space-y-3">
                {selectedOrder.orderItems?.map(item => (
                  <div key={item._id} className="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] shadow-[0_0_15px_rgba(6,182,212,0.02)]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/[0.05] rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.05]">
                         <img src={item.product?.image || (item.product?.images && item.product.images[0]) || ""} alt="Product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{item.product?.name || "Deleted Product"}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-cyan-400 text-sm">{fmt(item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl text-sm flex justify-between items-center shadow-[0_0_15px_rgba(6,182,212,0.02)]">
              <p className="text-gray-400 uppercase tracking-widest text-[10px] font-black">Total Amount</p>
              <div className="text-right">
                <p className="font-black text-xl text-cyan-400">{fmt(selectedOrder.totalPrice)}</p>
                {selectedOrder.couponDiscount > 0 && (
                  <p className="text-[10px] text-green-400 mt-0.5">Includes Coupon Discount: {fmt(selectedOrder.couponDiscount)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
