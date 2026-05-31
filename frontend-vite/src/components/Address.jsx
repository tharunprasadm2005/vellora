import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Home, RefreshCw, Save } from "lucide-react";

function Address() {
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // State configured exactly matching your MongoDB schema fields
    const [addressData, setAddressData] = useState({
        address: "",
        city: "",
        state: "",
        postalCode: ""
    });

    // FETCH THE CURRENT ADDRESS FROM THE PROFILE
    const fetchAddressFromProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const { data } = await axios.get(
                "http://localhost:5000/api/users/profile",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Populate state from your database keys
            const loadedAddress = {
                address: data?.address || "",
                city: data?.city || "",
                state: data?.state || "",
                postalCode: data?.postalCode || ""
            };

            setAddressData(loadedAddress);
            
            // Automatically cache it for your checkout flow to use
            if (loadedAddress.address) {
                localStorage.setItem("selectedDeliveryAddress", JSON.stringify(loadedAddress));
            }
        } catch (error) {
            console.error("Error fetching address field data:", error);
        } finally {
            setLoading(false);
        }
    };

    // UPDATE THE ADDRESS IN THE USER PROFILE
    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            // Send flat schema structure payload back to backend profile endpoint
            await axios.put(
                "http://localhost:5000/api/users/profile", 
                addressData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("Delivery address updated successfully!");
            setIsEditing(false);
            
            // Sync with local storage for checkout
            localStorage.setItem("selectedDeliveryAddress", JSON.stringify(addressData));
            
            // Refresh navbar profile state if needed
            window.dispatchEvent(new Event("profile:updated"));
        } catch (error) {
            console.error("Error saving address payload:", error);
            alert("Could not update address values. Check backend profile PUT route.");
        }
    };

    useEffect(() => {
        fetchAddressFromProfile();
    }, []);

    return (
        <div className="min-h-screen bg-[#050816] text-white p-6 md:p-12 relative overflow-hidden">
            {/* BACKGROUND GLOW EFFECTS */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full"></div>

            <div className="max-w-3xl mx-auto relative z-10">
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    Shipping & Delivery Address
                </h1>
                <p className="text-gray-400 text-sm mb-8">Manage the destination location used to fulfill your orders.</p>

                {loading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <RefreshCw size={16} className="animate-spin text-cyan-400" />
                        Accessing database records...
                    </div>
                ) : !isEditing && addressData.address ? (
                    
                    /* DISPLAY MODE: SHOWS CURRENT REGISTERED ADDRESS */
                    <div className="bg-cyan-500/[0.02] border border-cyan-500/30 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.05)]">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-cyan-400/20 text-cyan-400 rounded-2xl">
                                    <Home size={24} />
                                </div>
                                <div>
                                    <h2 className="text-[14px] font-black uppercase tracking-widest text-cyan-400">Primary Delivery Address</h2>
                                    <span className="text-[9px] bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest mt-1 inline-block border border-cyan-500/30">
                                        Active Destination
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="text-[10px] font-black tracking-widest uppercase border border-white/[0.1] hover:border-cyan-400 hover:text-cyan-400 px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.02)]"
                            >
                                Change Address
                            </button>
                        </div>

                        <div className="space-y-2 border-t border-white/[0.05] pt-4 text-gray-300">
                            <p className="text-sm font-bold uppercase tracking-widest text-white">{addressData.address}</p>
                            <p className="text-xs uppercase font-bold tracking-widest">{addressData.city}, {addressData.state}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">Postal Code: {addressData.postalCode}</p>
                        </div>
                    </div>

                ) : (

                    /* EDIT / SETUP MODE: USER FORM INPUT */
                    <form onSubmit={handleUpdateAddress} className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl p-8 rounded-3xl space-y-5 max-w-xl shadow-[0_0_30px_rgba(6,182,212,0.03)]">
                        <h2 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-2">
                            {addressData.address ? "Update Destination Details" : "Setup Delivery Address"}
                        </h2>
                        
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">Street Address</label>
                            <input 
                                type="text" placeholder="e.g. 9/259, Kattukottai, Ramayanaikanpatti..." required
                                value={addressData.address} 
                                onChange={(e) => setAddressData({...addressData, address: e.target.value})}
                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition text-sm font-bold"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">City</label>
                                <input 
                                    type="text" placeholder="e.g. Namakkal" required
                                    value={addressData.city} 
                                    onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">State</label>
                                <input 
                                    type="text" placeholder="e.g. Tamil Nadu" required
                                    value={addressData.state} 
                                    onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition text-sm font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-1">Postal Code (Zip Code)</label>
                            <input 
                                type="text" placeholder="e.g. 637018" required
                                value={addressData.postalCode} 
                                onChange={(e) => setAddressData({...addressData, postalCode: e.target.value})}
                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition text-sm font-bold"
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 font-black text-[10px] uppercase tracking-widest p-3 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                <Save size={18} /> Save Destination
                            </button>
                            {addressData.address && (
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    className="border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Address;