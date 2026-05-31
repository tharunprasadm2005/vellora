import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import {
    ShoppingCart,
    Search,
    Heart,
    Menu,
    User,
    Package,
    LogOut,
    Settings,
    MapPin,
    Home as HomeIcon
} from "lucide-react";

function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [showProfile, setShowProfile] = useState(false);
    const [user, setUser] = useState(null);

    const navigate = useNavigate();

    // FETCH USER
    const fetchUser = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data } = await axios.get(
                "http://localhost:5000/api/users/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(data);
        } catch (error) {
            console.log(error);
        }
    };

    // FETCH WISHLIST
    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data } = await axios.get(
                "http://localhost:5000/api/wishlist",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setWishlistCount(data?.items?.length || 0);
        } catch (error) {
            console.log(error);
        }
    };

    // FETCH CART
    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data } = await axios.get(
                "http://localhost:5000/api/cart",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setCartCount(data?.items?.length || 0);
        } catch (error) {
            console.log(error);
        }
    };

    // SEARCH
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        alert("Logged out successfully");
        navigate("/login");
        window.location.reload();
    };

    useEffect(() => {
        const refreshCart = () => fetchCart();
        const refreshWishlist = () => fetchWishlist();
        const refreshProfile = () => fetchUser();

        window.addEventListener("cart:updated", refreshCart);
        window.addEventListener("wishlist:updated", refreshWishlist);
        window.addEventListener("profile:updated", refreshProfile);

        queueMicrotask(() => {
            fetchUser();
            fetchWishlist();
            fetchCart();
        });

        return () => {
            window.removeEventListener("cart:updated", refreshCart);
            window.removeEventListener("wishlist:updated", refreshWishlist);
            window.removeEventListener("profile:updated", refreshProfile);
        };
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-[#020208] border-b border-white/5 tracking-wider font-medium">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">

                {/* LEFT CONSOLE - LOGO & PORTALS */}
                <div className="flex items-center gap-6">
                    <button className="md:hidden text-white bg-white/5 border border-white/10 p-2.5 rounded-xl backdrop-blur-xl hover:bg-white/10 transition duration-300">
                        <Menu size={20} />
                    </button>

                    <Link to="/" className="flex items-center gap-3 group">
                        <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-widest drop-shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:scale-102 transition-transform duration-300">
                            Vellora
                        </h1>
                    </Link>

                    {/* INTERACTIVE HOME ICON PORTAL */}
                    <Link to="/">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-white/[0.02] border border-white/5 backdrop-blur-xl p-3 rounded-xl text-gray-400 hover:text-white hover:border-white/20 transition-all duration-300 shadow-xl">
                                <HomeIcon size={18} />
                            </div>
                        </div>
                    </Link>
                </div>

                {/* MATRIX SEARCH BAY INTERFACE */}
                <form
                    onSubmit={handleSearch}
                    className="hidden md:flex items-center w-[38%] relative group"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-md rounded-xl opacity-40 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-center bg-[#05050b] border border-white/5 focus-within:border-cyan-500/50 rounded-xl px-4 py-2.5 w-full transition-all duration-300 shadow-2xl">
                        <Search className="text-cyan-400/80 group-hover:text-cyan-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Explore the Latest Electronics & Gadgets"
                            className="bg-transparent outline-none ml-3 w-full text-[10px] font-black tracking-widest uppercase text-white placeholder-gray-600 focus:placeholder-gray-400 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </form>

                {/* RIGHT SYSTEM UTILITY TERMINALS */}
                <div className="flex items-center gap-4">

                    {/* WISHLIST HUD LINK */}
                    <Link to="/wishlist">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-red-500/10 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-white/[0.02] border border-white/5 backdrop-blur-xl p-3 rounded-xl text-gray-400 hover:text-white hover:border-white/15 transition-all duration-300 shadow-xl">
                                <Heart size={18} className="group-hover:scale-105 transition-transform" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded bg-red-500/90 text-white text-[9px] font-black flex items-center justify-center tracking-normal shadow-lg shadow-red-500/20 animate-pulse">
                                        {wishlistCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* CART DATA STORAGE TERMINAL */}
                    <Link to="/cart">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-cyan-500/10 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-white/[0.02] border border-white/5 backdrop-blur-xl p-3 rounded-xl text-gray-400 hover:text-white hover:border-white/15 transition-all duration-300 shadow-xl">
                                <ShoppingCart size={18} className="group-hover:scale-105 transition-transform" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded bg-cyan-500 text-black text-[9px] font-black flex items-center justify-center tracking-normal shadow-lg shadow-cyan-500/20">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>

                    {/* PORTAL REQUISITIONS LOGS (ORDERS) */}
                    <Link to="/orders" className="hidden sm:block">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-purple-500/10 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition duration-300"></div>
                            <div className="relative bg-white/[0.02] border border-white/5 backdrop-blur-xl p-3 rounded-xl text-gray-400 hover:text-white hover:border-white/15 transition-all duration-300 shadow-xl">
                                <Package size={18} className="group-hover:scale-105 transition-transform" />
                            </div>
                        </div>
                    </Link>

                    {/* PROFILE GATE NODE CONTROL */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfile(!showProfile)}
                            className="flex items-center gap-3 bg-white/[0.02] border border-white/5 backdrop-blur-3xl px-3 py-1.5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 shadow-2xl"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-black text-xs text-white shadow-xl">
                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="hidden lg:block text-left pr-1">
                                <p className="text-gray-200 font-bold text-xs uppercase tracking-wider line-clamp-1 max-w-[80px]">
                                    {user?.name || "GUEST"}
                                </p>
                                <p className="text-gray-600 text-[8px] font-black tracking-widest uppercase mt-0.5">
                                    My Account
                                </p>
                            </div>
                        </button>

                        {/* HIGH FIDELITY CORE GLASS DROPDOWN CONSOLE */}
                        {showProfile && (
                            <div className="absolute right-0 mt-4 w-72 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-3xl bg-[#040409]/95 shadow-[0_20px_50px_rgba(0,0,0,0.7)] transform origin-top-right transition-all duration-300 animate-fade-in">
                                
                                {/* TOP NODE BANNER */}
                                <div className="relative p-5 border-b border-white/5 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5"></div>
                                    <div className="relative flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-lg font-black text-white shadow-xl">
                                            {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h2 className="text-sm font-black text-white uppercase tracking-wider truncate">
                                                {user?.name || "Guest Core"}
                                            </h2>
                                            <p className="text-gray-500 text-[10px] font-medium truncate mt-0.5">
                                                {user?.email || "offline_node@system"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* TERMINAL MENU COMPONENT MATRIX BUTTONS */}
                                <div className="p-3 space-y-1 text-xs font-bold tracking-widest text-gray-400 uppercase">
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowProfile(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200"
                                    >
                                        <User size={16} className="text-cyan-400" />
                                        Profile
                                    </Link>

                                    <Link
                                        to="/orders"
                                        onClick={() => setShowProfile(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200"
                                    >
                                        <Package size={16} className="text-blue-400" />
                                        Orders
                                    </Link>

                                    <Link
                                        to="/address"
                                        onClick={() => setShowProfile(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200"
                                    >
                                        <MapPin size={16} className="text-purple-400" />
                                        Saved Address
                                    </Link>

                                    {user?.isAdmin && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setShowProfile(false)}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 transition-all duration-200"
                                        >
                                            <Settings size={16} className="text-cyan-400" />
                                            Admin Panel
                                        </Link>
                                    )}

                                    <Link
                                        to="/settings"
                                        onClick={() => setShowProfile(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 hover:text-white transition-all duration-200"
                                    >
                                        <Settings size={16} className="text-pink-400" />
                                        Settings
                                    </Link>

                                    <button
                                        onClick={() => {
                                            setShowProfile(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all duration-200 mt-2 border border-red-500/10"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;