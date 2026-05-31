import { useState, useEffect } from "react";
import axios from "axios";
import { User, Bell, Shield, LogOut, Save, RefreshCw, Smartphone } from "lucide-react";

function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);
    
    // Form States
    const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
    const [notifications, setNotifications] = useState({ orderUpdates: true, promoEmails: false });

    // Fetch initial profile records
    const fetchProfileSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const { data } = await axios.get("http://localhost:5000/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProfile({
                name: data?.name || "",
                email: data?.email || "",
                phone: data?.phone || ""
            });
        } catch (error) {
            console.error("Error loading account parameters:", error);
        } finally {
            setLoading(false);
        }
    };

    // Save profile edits
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/users/profile", profile, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Profile settings modified successfully!");
            window.dispatchEvent(new Event("profile:updated"));
        } catch (error) {
            console.error("Error saving configuration changes:", error);
            alert("Failed to sync profile changes.");
        }
    };

    useEffect(() => {
        fetchProfileSettings();
    }, []);

    return (
        <div className="min-h-screen bg-[#050816] text-white p-6 md:p-12 relative overflow-hidden">
            {/* BACKGROUND BLUR GLOWS */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    System Control Panel
                </h1>
                <p className="text-gray-400 text-sm mb-8">Optimize your profile preferences, telemetry communications, and security states.</p>

                {loading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <RefreshCw size={16} className="animate-spin text-cyan-400" />
                        Accessing configuration arrays...
                    </div>
                ) : (
                    <div className="grid md:grid-cols-12 gap-8 items-start">
                        
                        {/* LEFT: SETTINGS SIDEBAR NAVIGATION */}
                        <div className="md:col-span-4 bg-white/[0.01] border border-white/[0.05] p-4 rounded-3xl space-y-1 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.03)]">
                            <button 
                                onClick={() => setActiveTab("profile")}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition ${
                                    activeTab === "profile" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:bg-white/[0.02] hover:text-white border border-transparent"
                                }`}
                            >
                                <User size={18} /> Personal Footprint
                            </button>
                            <button 
                                onClick={() => setActiveTab("notifications")}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition ${
                                    activeTab === "notifications" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:bg-white/[0.02] hover:text-white border border-transparent"
                                }`}
                            >
                                <Bell size={18} /> Alert Telemetry
                            </button>
                            <button 
                                onClick={() => setActiveTab("sessions")}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition ${
                                    activeTab === "sessions" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-gray-400 hover:bg-white/[0.02] hover:text-white border border-transparent"
                                }`}
                            >
                                <Shield size={18} /> Active Sessions
                            </button>
                        </div>

                        {/* RIGHT: SETTINGS MAIN VIEWPORT */}
                        <div className="md:col-span-8 bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.03)]">
                            
                            {/* TAB 1: PERSONAL FOOTPRINT MODULE */}
                            {activeTab === "profile" && (
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-cyan-400">Personal Footprint</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">Manage your user registration credentials.</p>
                                    </div>
                                    <div className="space-y-4 border-t border-white/[0.05] pt-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">Account Display Name</label>
                                            <input 
                                                type="text" value={profile.name} required
                                                onChange={(e) => setProfile({...profile, name: e.target.value})}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-white outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">Email Terminal Address</label>
                                            <input 
                                                type="email" value={profile.email} disabled
                                                className="w-full bg-white/[0.01] border border-white/[0.02] rounded-xl p-3 text-gray-500 outline-none cursor-not-allowed text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">Mobile Contact Phone Number</label>
                                            <input 
                                                type="text" value={profile.phone} placeholder="Add your contact number"
                                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-white outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl hover:opacity-90 transition flex items-center gap-2 ml-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                        <Save size={16} /> Save Profiles Logs
                                    </button>
                                </form>
                            )}

                            {/* TAB 2: ALERT TELEMETRY MODULE */}
                            {activeTab === "notifications" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-cyan-400">Alert Telemetry</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">Configure how you receive dispatch arrays and promotions.</p>
                                    </div>
                                    <div className="space-y-4 border-t border-white/[0.05] pt-4">
                                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                                            <div>
                                                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Order Tracking Despatch</h3>
                                                <p className="text-xs text-gray-400 mt-1">Receive instantaneous tracking emails upon checkout and item delivery.</p>
                                            </div>
                                            <input 
                                                type="checkbox" checked={notifications.orderUpdates}
                                                onChange={(e) => setNotifications({...notifications, orderUpdates: e.target.checked})}
                                                className="w-4 h-4 accent-cyan-400 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                                            <div>
                                                <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Promotional Transmissions</h3>
                                                <p className="text-xs text-gray-400 mt-1">Be alerted regarding platform events, product sales, and futuristic hardware drops.</p>
                                            </div>
                                            <input 
                                                type="checkbox" checked={notifications.promoEmails}
                                                onChange={(e) => setNotifications({...notifications, promoEmails: e.target.checked})}
                                                className="w-4 h-4 accent-cyan-400 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: ACTIVE SESSIONS SECURITY MODULE */}
                            {activeTab === "sessions" && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-cyan-400">Active Sessions</h2>
                                        <p className="text-xs text-gray-400 mt-0.5">Hardware systems linked to this authorization core token.</p>
                                    </div>
                                    <div className="space-y-3 border-t border-white/[0.05] pt-4">
                                        <div className="flex items-center justify-between p-4 bg-cyan-500/[0.02] border border-cyan-500/20 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.05)]">
                                            <div className="flex items-center gap-4">
                                                <div className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                                    <Smartphone size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Vite Web Core App Browser</span>
                                                        <span className="bg-cyan-400/20 text-cyan-400 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border border-cyan-500/30">Current Session</span>
                                                    </div>
                                                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-1">IP Address: 127.0.0.1 — Active Node Location Connection</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;