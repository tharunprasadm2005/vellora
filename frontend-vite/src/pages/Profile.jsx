import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone, Save, User, Wallet } from "lucide-react";

const emptyProfile = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "Cash on Delivery",
};

function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(emptyProfile);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            const { data } = await axios.get("http://localhost:5000/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setProfile({
                ...emptyProfile,
                ...data,
            });
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            alert(error.response?.data?.message || "Error loading profile");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        queueMicrotask(fetchProfile);
    }, [fetchProfile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.put(
                "http://localhost:5000/api/users/profile",
                {
                    name: profile.name,
                    phone: profile.phone,
                    address: profile.address,
                    city: profile.city,
                    state: profile.state,
                    postalCode: profile.postalCode,
                    paymentMethod: profile.paymentMethod,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setProfile({ ...emptyProfile, ...data });
            window.dispatchEvent(new CustomEvent("profile:updated", { detail: data }));
            alert("Profile details saved!");
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            alert(error.response?.data?.message || "Error saving profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="bg-white/10 border border-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-xl">
                        <User className="h-8 w-8 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest">My Profile</h1>
                        <p className="text-gray-400 mt-2">Manage your delivery and payment details</p>
                    </div>
                </div>

                <form
                    onSubmit={saveProfile}
                    className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-[35px] shadow-[0_0_50px_rgba(6,182,212,0.03)] p-6 sm:p-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 block" htmlFor="name">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                <input
                                    id="name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 block" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                <input
                                    id="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full bg-white/[0.01] border border-white/[0.02] rounded-2xl py-3 pl-12 pr-4 text-gray-500 outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 block" htmlFor="phone">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition"
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 block" htmlFor="paymentMethod">
                                Preferred Payment
                            </label>
                            <div className="relative">
                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" size={18} />
                                <select
                                    id="paymentMethod"
                                    name="paymentMethod"
                                    value={profile.paymentMethod}
                                    onChange={handleChange}
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition appearance-none"
                                >
                                    <option className="bg-[#0f172a]" value="Cash on Delivery">Cash on Delivery</option>
                                    <option className="bg-[#0f172a]" value="UPI">UPI</option>
                                    <option className="bg-[#0f172a]" value="Card">Card</option>
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 block" htmlFor="address">
                                Delivery Address
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-cyan-400" size={18} />
                                <textarea
                                    id="address"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition resize-none"
                                    placeholder="House no, street, area"
                                />
                            </div>
                        </div>

                        <input
                            name="city"
                            value={profile.city}
                            onChange={handleChange}
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-3 px-4 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition"
                            placeholder="City"
                        />
                        <input
                            name="state"
                            value={profile.state}
                            onChange={handleChange}
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-3 px-4 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition"
                            placeholder="State"
                        />
                        <input
                            name="postalCode"
                            value={profile.postalCode}
                            onChange={handleChange}
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl py-3 px-4 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:bg-white/[0.05] transition md:col-span-2"
                            placeholder="Postal / PIN code"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-8 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-sm tracking-widest uppercase py-4 px-6 rounded-2xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-cyan-500/20 hover:scale-105"
                    >
                        <Save size={20} />
                        {saving ? "Saving..." : "Save Profile Details"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;
