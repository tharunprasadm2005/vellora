import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

import {
    Star, ShoppingCart, Heart, Share2, Truck, ChevronDown, ChevronUp,
    Check, Zap, BadgeCheck, Sparkles, Cpu, Battery, Monitor,
    Wifi, Percent, MapPin, Package, ShieldCheck, Store, User,
    Box, ChevronRight, ChevronLeft, Info, HardDrive, Tag, Layers, Globe, Radio, Speaker, Camera,
    Send, X, Edit3, Home, AlertCircle, TrendingUp, Award, Gauge, Flame, Eye, ThumbsUp, MessageSquare,
    Clock, DollarSign, Truck as TruckDelivery, RefreshCw, CheckCircle, CreditCard, Gift, HelpCircle
} from "lucide-react";

/* ─── helpers ─── */
const pad = (n) => String(n).padStart(2, "0");
const fmt = (n) => n?.toLocaleString("en-IN");

const cleanImageUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    if (url.startsWith("[")) {
        const bracketMatch = url.match(/\[(.*?)\]/);
        if (bracketMatch && bracketMatch[1] && bracketMatch[1].startsWith("http")) {
            return bracketMatch[1].trim();
        }
    }
    const parenMatch = url.match(/\((.*?)\)/);
    if (parenMatch && parenMatch[1] && parenMatch[1].startsWith("http") && !parenMatch[1].includes("google.com")) {
        return parenMatch[1].trim();
    }
    return url.replace(/[\[\]]/g, "").trim();
};

const colorHex = {
    Starlight: "#e8e4d9", Midnight: "#1c2340", Silver: "#c0c0c0", Gold: "#f5c842",
    "Space Grey": "#6b6b70", "Space Gray": "#6b6b70", Black: "#1a1a1a", White: "#f5f5f5",
    Blue: "#1a56db", Red: "#e02424", Green: "#057a55", Pink: "#f472b6", Purple: "#7c3aed",
    Yellow: "#fbbf24", Orange: "#f97316", Graphite: "#4b5563", "Phantom Black": "#0f172a",
    Cream: "#f5f0e8", Lavender: "#c4b5fd", Sage: "#6b7c6b", "Deep Red": "#7f1d1d",
    "Forest Green": "#14532d", "Sky Blue": "#7dd3fc", "Navy Blue": "#1e3a5f",
    "Rose Gold": "#e8a090", Titanium: "#9ca3af", Natural: "#d1b89a", "Cosmic Gray": "#374151",
};

const getColorHex = (colorName) => {
    if (!colorName) return "#888";
    if (colorHex[colorName]) return colorHex[colorName];
    const key = Object.keys(colorHex).find(k =>
        colorName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(colorName.toLowerCase())
    );
    return key ? colorHex[key] : "#888";
};

/* ─── Build feature cards from selected variant context ─── */
const getCategoryFeatureCards = (product, selectedColor, selectedRam, selectedVariant) => {
    const sp = product.specifications;
    const pm = sp?.processorAndMemory;
    const disp = sp?.display;
    const batt = sp?.battery;
    const conn = sp?.connectivity;
    const cam = sp?.camera;
    const aud = sp?.audio;
    const category = product.category?.toLowerCase() || "";

    const variantObj = product.variants?.find(v => v.variant === selectedVariant);
    const ramObj = product.systemMemory?.find(m => m.ram === selectedRam);

    const cards = [];

    const processorName = variantObj?.processorName || ramObj?.processorName || pm?.processorName;
    const processorBrand = pm?.processorBrand;
    const cores = pm?.numberOfCores;

    if (processorName) {
        cards.push({
            icon: Cpu, color: "text-cyan-400",
            title: processorName,
            sub: [cores && `${cores}-core`, processorBrand, pm?.processorGeneration].filter(Boolean).join(" · ") || "High Performance",
        });
    }

    const ramDisplay = selectedRam || ramObj?.ram || pm?.ram;
    const storageDisplay = selectedVariant || variantObj?.variant || pm?.ssdCapacity || pm?.storageCapacity;

    if (ramDisplay) {
        cards.push({
            icon: HardDrive, color: "text-green-400",
            title: ramDisplay + (ramObj?.ramType || pm?.ramType ? ` ${ramObj?.ramType || pm?.ramType}` : ""),
            sub: storageDisplay ? `${storageDisplay} Storage` : "System Memory",
        });
    } else if (batt?.backup || batt?.capacity) {
        cards.push({
            icon: Battery, color: "text-green-400",
            title: batt.backup || "Long Battery",
            sub: batt.capacity?.split(",")[0] || "Built-in battery",
        });
    }

    if (disp?.screenType || disp?.screenSize) {
        cards.push({
            icon: Monitor, color: "text-pink-400",
            title: disp.screenType || disp.screenSize,
            sub: [disp.brightness, disp.pixelsPerInch && `${disp.pixelsPerInch} ppi`].filter(Boolean).join(" · ") || disp.screenResolution || "High Resolution",
        });
    }

    if (conn?.wirelessLAN) {
        cards.push({
            icon: Wifi, color: "text-yellow-400",
            title: conn.wirelessLAN,
            sub: conn.bluetooth ? `Bluetooth ${conn.bluetooth}` : "Wireless Connectivity",
        });
    } else if (cam?.rearCamera || cam?.resolution) {
        cards.push({
            icon: Camera, color: "text-yellow-400",
            title: cam.rearCamera || cam.resolution,
            sub: cam.aperture || "Camera",
        });
    } else if (aud?.speakers) {
        cards.push({
            icon: Speaker, color: "text-yellow-400",
            title: aud.speakers,
            sub: aud.audioTechnology || "Audio",
        });
    }

    const highlights = product.productHighlights || [];
    let idx = 0;
    while (cards.length < 4 && idx < highlights.length) {
        const h = highlights[idx++];
        const icons = [Tag, Layers, Globe, Radio];
        const colors = ["text-orange-400", "text-purple-400", "text-blue-400", "text-teal-400"];
        const pos = cards.length;
        cards.push({ icon: icons[pos] || Tag, color: colors[pos] || "text-gray-400", title: h.title, sub: h.description });
    }

    return cards.slice(0, 4);
};

/* ─── Build dynamic features from selected variant context ─── */
const getDynamicFeatures = (product, selectedColor, selectedRam, selectedVariant) => {
    const sp = product.specifications;
    const pm = sp?.processorAndMemory;
    const disp = sp?.display;
    const batt = sp?.battery;
    const conn = sp?.connectivity;
    const dims = sp?.dimensions;
    const ports = sp?.ports;
    const feat = sp?.additionalFeatures;

    const variantObj = product.variants?.find(v => v.variant === selectedVariant);
    const ramObj = product.systemMemory?.find(m => m.ram === selectedRam);
    const colorObj = product.colors?.find(c => c.color === selectedColor);

    const features = [];

    product.productHighlights?.forEach(h => features.push(h.title));

    if (variantObj?.features) variantObj.features.forEach(f => features.push(f));
    if (ramObj?.features) ramObj.features.forEach(f => features.push(f));
    if (colorObj?.features) colorObj.features.forEach(f => features.push(f));

    const processorName = variantObj?.processorName || pm?.processorName;
    if (processorName) features.push(`${processorName} Processor`);

    const ramDisplay = selectedRam || pm?.ram;
    if (ramDisplay) features.push(`${ramDisplay} ${pm?.ramType || "RAM"}`);

    const storageDisplay = selectedVariant || pm?.ssdCapacity;
    if (storageDisplay && storageDisplay !== selectedVariant) features.push(`${storageDisplay} ${pm?.storageType || "SSD"}`);
    else if (selectedVariant) features.push(`${selectedVariant} Storage`);
    if (pm?.hddCapacity) features.push(`${pm.hddCapacity} HDD Storage`);

    if (selectedColor) features.push(`${selectedColor} Color`);
    if (disp?.screenType) features.push(`${disp.screenType} Display`);
    if (disp?.screenSize) features.push(`${disp.screenSize} Screen`);
    if (batt?.backup) features.push(`${batt.backup} Battery Life`);
    if (conn?.wirelessLAN) features.push(conn.wirelessLAN);
    if (conn?.bluetooth) features.push(`Bluetooth ${conn.bluetooth}`);
    if (dims?.weight) features.push(`Lightweight ${dims.weight}`);
    if (ports?.usbPorts) features.push(`${ports.usbPorts} USB Ports`);
    if (ports?.magsafe) features.push("MagSafe Charging");
    if (ports?.hdmiPort) features.push("HDMI Port");
    if (ports?.sdCardSlot) features.push("SD Card Slot");
    if (feat?.fingerprintSensor) features.push("Fingerprint Sensor");
    if (feat?.touchBar) features.push("Touch Bar");
    if (feat?.facialRecognition) features.push("Face Recognition");
    if (sp?.operatingSystem) features.push(sp.operatingSystem);

    return [...new Set(features)].slice(0, 8);
};

/* ─── Build spec rows from selected variant context ─── */
const buildAllSpecs = (product, selectedColor, selectedRam, selectedVariant) => {
    const sp = product.specifications;
    const pm = sp?.processorAndMemory;
    const disp = sp?.display;
    const aud = sp?.audio;
    const dims = sp?.dimensions;
    const batt = sp?.battery;
    const ports = sp?.ports;
    const conn = sp?.connectivity;
    const feat = sp?.additionalFeatures;
    const cam = sp?.camera;
    const sens = sp?.sensors;

    const variantObj = product.variants?.find(v => v.variant === selectedVariant);
    const ramObj = product.systemMemory?.find(m => m.ram === selectedRam);
    const colorObj = product.colors?.find(c => c.color === selectedColor);

    const processorName = variantObj?.processorName || ramObj?.processorName || pm?.processorName;
    const processorBrand = variantObj?.processorBrand || pm?.processorBrand;
    const ramDisplay = selectedRam || pm?.ram;
    const ramType = ramObj?.ramType || pm?.ramType;
    const storageDisplay = selectedVariant || pm?.ssdCapacity || pm?.storageCapacity;
    const storageType = variantObj?.storageType || pm?.storageType;

    return [
        processorBrand && processorName && {
            label: "Processor",
            value: `${processorBrand} ${processorName}${pm?.numberOfCores ? ` (${pm.numberOfCores}-core)` : ""}`,
        },
        !processorBrand && processorName && { label: "Processor", value: processorName },
        pm?.processorGeneration && { label: "Processor Generation", value: pm.processorGeneration },
        pm?.graphicProcessor && { label: "GPU", value: pm.graphicProcessor },
        ramDisplay && { label: "RAM", value: `${ramDisplay}${ramType ? ` ${ramType}` : ""}` },
        storageDisplay && { label: "Storage", value: `${storageDisplay}${storageType ? ` ${storageType}` : ""}` },
        pm?.hddCapacity && { label: "HDD Storage", value: pm.hddCapacity },
        selectedColor && { label: "Color", value: selectedColor },
        colorObj?.finish && { label: "Finish", value: colorObj.finish },
        sp?.operatingSystem && { label: "Operating System", value: sp.operatingSystem },
        disp?.screenSize && { label: "Display Size", value: disp.screenSize },
        disp?.screenResolution && {
            label: "Resolution",
            value: `${disp.screenResolution}${disp.pixelsPerInch ? ` (${disp.pixelsPerInch} ppi)` : ""}`,
        },
        disp?.screenType && { label: "Screen Type", value: disp.screenType },
        disp?.screenTechnology && { label: "Screen Tech", value: disp.screenTechnology },
        disp?.brightness && { label: "Brightness", value: disp.brightness },
        disp?.refreshRate && { label: "Refresh Rate", value: disp.refreshRate },
        typeof disp?.touchscreen !== "undefined" && { label: "Touchscreen", value: disp.touchscreen ? "Yes" : "No" },
        cam?.rearCamera && { label: "Rear Camera", value: cam.rearCamera },
        cam?.frontCamera && { label: "Front Camera", value: cam.frontCamera },
        cam?.resolution && !cam?.rearCamera && { label: "Camera Resolution", value: cam.resolution },
        cam?.aperture && { label: "Aperture", value: cam.aperture },
        cam?.opticalZoom && { label: "Optical Zoom", value: cam.opticalZoom },
        feat?.webCamera && { label: "Webcam", value: feat.webCamera },
        aud?.speakers && { label: "Speakers", value: aud.speakers },
        aud?.internalMic && { label: "Microphone", value: aud.internalMic },
        aud?.audioTechnology && { label: "Audio Tech", value: aud.audioTechnology },
        aud?.noiseCancellation !== undefined && { label: "Noise Cancellation", value: aud.noiseCancellation ? "Yes" : "No" },
        (batt?.capacity || batt?.backup) && {
            label: "Battery",
            value: [batt.capacity, batt.backup].filter(Boolean).join(" — "),
        },
        batt?.powerSupply && { label: "Power Supply", value: batt.powerSupply },
        batt?.chargingSpeed && { label: "Charging Speed", value: batt.chargingSpeed },
        batt?.wirelessCharging !== undefined && { label: "Wireless Charging", value: batt.wirelessCharging ? "Yes" : "No" },
        ports?.usbPorts && { label: "USB Ports", value: ports.usbPorts },
        ports?.usbPortDetails && { label: "USB Port Details", value: ports.usbPortDetails },
        ports?.headphoneJack !== undefined && { label: "Headphone Jack", value: ports.headphoneJack ? "Yes (3.5 mm)" : "No" },
        ports?.magsafe !== undefined && { label: "MagSafe", value: ports.magsafe ? "Yes" : "No" },
        ports?.hdmiPort && { label: "HDMI", value: ports.hdmiPort },
        ports?.sdCardSlot !== undefined && { label: "SD Card Slot", value: ports.sdCardSlot ? "Yes" : "No" },
        conn?.wirelessLAN && { label: "Wi-Fi", value: conn.wirelessLAN },
        conn?.bluetooth && { label: "Bluetooth", value: conn.bluetooth },
        conn?.nfc !== undefined && { label: "NFC", value: conn.nfc ? "Yes" : "No" },
        conn?.gps !== undefined && { label: "GPS", value: conn.gps ? "Yes" : "No" },
        conn?.simType && { label: "SIM Type", value: conn.simType },
        conn?.networkSupport && { label: "Network", value: conn.networkSupport },
        sens?.fingerprint !== undefined && { label: "Fingerprint Sensor", value: sens.fingerprint ? "Yes" : "No" },
        sens?.list && { label: "Sensors", value: Array.isArray(sens.list) ? sens.list.join(", ") : sens.list },
        feat?.keyboard && { label: "Keyboard", value: feat.keyboard },
        feat?.pointerDevice && { label: "Trackpad/Pointer", value: feat.pointerDevice },
        feat?.fingerprintSensor && { label: "Fingerprint", value: feat.fingerprintSensor },
        feat?.facialRecognition && { label: "Face Recognition", value: feat.facialRecognition },
        dims?.weight && { label: "Weight", value: dims.weight },
        dims?.width && dims?.depth && { label: "Dimensions", value: `${dims.width} × ${dims.depth} × ${dims.height}` },
        ...(Array.isArray(product.specs) ? product.specs.map(s => ({ label: s.name, value: s.value })) : [])
    ].filter(Boolean).filter(s => s && s.value);
};

/* ─── Sub-components ─── */
const RatingBar = ({ label, value }) => (
    <div className="flex items-center gap-3">
        <span className="text-slate-400 text-xs w-28 shrink-0">{label}</span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${(value / 5) * 100}%` }} />
        </div>
        <span className="text-white text-xs font-semibold w-6 text-right font-mono">{value}</span>
    </div>
);

const SpecRow = ({ label, value }) => (
    <div className="flex justify-between items-start bg-white/[0.01] border border-white/[0.05] px-4 py-3.5 rounded-xl gap-4 hover:bg-white/[0.04] transition-colors duration-200 shadow-[0_0_15px_rgba(6,182,212,0.03)]">
        <span className="text-gray-400 text-xs shrink-0 font-black uppercase tracking-widest">{label}</span>
        <span className="text-sm font-bold text-right text-gray-200">{value}</span>
    </div>
);

const FeatureCard = ({ icon: Icon, color, title, sub }) => (
    <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-4 hover:border-cyan-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.05)] hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <Icon className={`${color} mb-2.5`} size={20} />
        <p className="text-xs font-black uppercase tracking-widest text-white">{title}</p>
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mt-1 leading-relaxed">{sub}</p>
    </div>
);

/* ─── Star Rating Input ─── */
const StarInput = ({ value, onChange }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
            <button key={s} type="button" onClick={() => onChange(s)}>
                <Star size={20} className={s <= value ? "fill-amber-400 text-amber-400" : "text-slate-600 hover:text-amber-300 transition-colors"} />
            </button>
        ))}
    </div>
);

/* ─── Delivery Timeline ─── */
const DeliveryTimeline = () => (
    <div className="flex items-center justify-between text-xs font-bold text-slate-400 gap-2 bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
        <div className="flex items-center gap-2 flex-1">
            <Clock size={14} className="text-cyan-400" />
            <span>Order Confirmed</span>
        </div>
        <div className="h-1 flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent rounded" />
        <div className="flex items-center gap-2 flex-1">
            <Gauge size={14} className="text-blue-400" />
            <span>Processing</span>
        </div>
        <div className="h-1 flex-1 bg-gradient-to-r from-blue-500/30 to-transparent rounded" />
        <div className="flex items-center gap-2 flex-1">
            <TruckDelivery size={14} className="text-purple-400" />
            <span>3-5 Days</span>
        </div>
    </div>
);

/* ─── Trust Badges ─── */
const TrustBadges = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
            { icon: ShieldCheck, label: "Authenticity", color: "text-emerald-400" },
            { icon: RefreshCw, label: "Easy Returns", color: "text-blue-400" },
            { icon: TruckDelivery, label: "Free Delivery", color: "text-purple-400" },
            { icon: Award, label: "Warranty", color: "text-amber-400" }
        ].map((badge, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 text-center">
                <badge.icon className={`${badge.color} mx-auto mb-1.5`} size={18} />
                <p className="text-xs font-semibold text-slate-300">{badge.label}</p>
            </div>
        ))}
    </div>
);

/* ─── Pincode Checker ─── */
const DeliveryPincodeChecker = () => {
    const [pincode, setPincode] = useState("");
    const [status, setStatus] = useState(null);
    
    const handleCheck = () => {
        if (pincode.length !== 6) { setStatus('error'); return; }
        setStatus('loading');
        setTimeout(() => setStatus('success'), 800);
    };

    return (
        <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-cyan-400" />
                <span className="text-sm font-bold text-slate-300">Delivery Options</span>
            </div>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Enter 6-digit Pincode"
                        value={pincode}
                        onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setStatus(null); }}
                        className="w-full bg-black/40 border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    {status === 'success' && <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />}
                </div>
                <button 
                    onClick={handleCheck}
                    className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-cyan-400 font-bold px-4 rounded-lg text-sm transition-all"
                >
                    {status === 'loading' ? <RefreshCw size={16} className="animate-spin" /> : "Check"}
                </button>
            </div>
            {status === 'success' && (
                <div className="mt-3 text-xs space-y-1.5 animate-in fade-in">
                    <p className="text-emerald-400 font-semibold flex items-center gap-1.5">
                        <TruckDelivery size={14} /> Free Delivery by Tomorrow, 11 PM
                    </p>
                    <p className="text-slate-400 flex items-center gap-1.5">
                        <CreditCard size={14} /> Cash on Delivery available
                    </p>
                </div>
            )}
            {status === 'error' && (
                <p className="mt-2 text-xs text-rose-400">Please enter a valid 6-digit pincode.</p>
            )}
        </div>
    );
};

/* ─── Bank Offers & EMI ─── */
const OffersSection = ({ price }) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="mt-6 border border-emerald-500/20 bg-emerald-500/5 rounded-xl overflow-hidden">
            <button 
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-emerald-500/10 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <Tag size={18} className="text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-300">Available Offers</span>
                </div>
                {expanded ? <ChevronUp size={16} className="text-emerald-400" /> : <ChevronDown size={16} className="text-emerald-400" />}
            </button>
            {expanded && (
                <div className="p-4 pt-0 space-y-3 border-t border-emerald-500/10 mt-2">
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5"><CheckCircle size={14} className="text-emerald-400" /></div>
                        <div>
                            <p className="text-xs font-bold text-white">Bank Offer</p>
                            <p className="text-[10px] text-slate-400">5% Cashback on Flipkart Axis Bank Card.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5"><CreditCard size={14} className="text-emerald-400" /></div>
                        <div>
                            <p className="text-xs font-bold text-white">No Cost EMI</p>
                            <p className="text-[10px] text-slate-400">EMI starting from ₹{Math.round(price / 6)}/month. Standard EMI also available.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5"><Gift size={14} className="text-emerald-400" /></div>
                        <div>
                            <p className="text-xs font-bold text-white">Special Price</p>
                            <p className="text-[10px] text-slate-400">Get extra 10% off (price inclusive of cashback/coupon).</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState("");
    const [wishlisted, setWishlisted] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const [specsExpanded, setSpecsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState("description");
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedRam, setSelectedRam] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [reviewsExpanded, setReviewsExpanded] = useState(false);
    const [softwareExpanded, setSoftwareExpanded] = useState(false);
    const [userAddress, setUserAddress] = useState(null);
    const [addressLoading, setAddressLoading] = useState(false);
    const [compareMode, setCompareMode] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
    const [showStickyCart, setShowStickyCart] = useState(false);
    const mainCartBtnRef = useRef(null);

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ title: "", comment: "", rating: 5 });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [localReviews, setLocalReviews] = useState([]);

    // ─── Dynamic Pricing ───
    const calculateDynamicPrice = useCallback(() => {
        if (!product) return { unitPrice: 0, totalPrice: 0, totalMrp: 0, discount: 0 };

        let unitPrice = product.price || 0;
        let unitMrp = product.mrp || 0;

        const colorObj = product.colors?.find(c => c.color === selectedColor);
        if (colorObj?.price) {
            unitPrice = colorObj.price;
            unitMrp = colorObj.mrp || unitMrp;
        } else if (colorObj?.priceModifier) {
            unitPrice += colorObj.priceModifier;
            unitMrp += colorObj.priceModifier;
        }

        const ramObj = product.systemMemory?.find(m => m.ram === selectedRam);
        if (ramObj?.price) {
            unitPrice = ramObj.price;
            unitMrp = ramObj.mrp || unitMrp;
        } else if (ramObj?.priceModifier) {
            unitPrice += ramObj.priceModifier;
            unitMrp += ramObj.priceModifier;
        }

        const variantObj = product.variants?.find(v => v.variant === selectedVariant);
        if (variantObj?.price) {
            unitPrice = variantObj.price;
            unitMrp = variantObj.mrp || unitMrp;
        } else if (variantObj?.priceModifier) {
            unitPrice += variantObj.priceModifier;
            unitMrp += variantObj.priceModifier;
        }

        const totalPrice = unitPrice * quantity;
        const totalMrp = unitMrp * quantity;
        const discount = totalMrp > 0 ? Math.round(((totalMrp - totalPrice) / totalMrp) * 100) : 0;

        return { unitPrice, totalPrice, totalMrp, discount };
    }, [product, selectedColor, selectedRam, selectedVariant, quantity]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyCart(!entry.isIntersecting);
            },
            { threshold: 0 }
        );
        if (mainCartBtnRef.current) {
            observer.observe(mainCartBtnRef.current);
        }
        return () => observer.disconnect();
    }, [product]);

    const { unitPrice, totalPrice, totalMrp, discount } = calculateDynamicPrice();

    // ─── Fetch user address ───
    const fetchUserAddress = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        setAddressLoading(true);
        try {
            const res = await axios.get("http://localhost:5000/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserAddress(res.data || null);
        } catch {
            setUserAddress(null);
        } finally {
            setAddressLoading(false);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        axios.get(`http://localhost:5000/api/products/${id}`)
            .then(res => {
                const p = res.data;
                setProduct(p);
                setLocalReviews(p.customerReviews || []);
                const rawImage = p.image || p.images?.[0] || "";
                setSelectedImage(cleanImageUrl(rawImage));
                setSelectedColor(p.selectedColor || p.colors?.[0]?.color);
                setSelectedRam(p.systemMemory?.[0]?.ram);
                setSelectedVariant(p.variants?.find(v => v.available)?.variant);
            })
            .catch(err => console.log(err));
        fetchUserAddress();
    }, [id, fetchUserAddress]);

    const handleImageNavigation = (direction) => {
        if (!product?.images || product.images.length <= 1) return;
        const currentIndex = product.images.findIndex(img => cleanImageUrl(img) === selectedImage);
        let nextIndex = direction === "next"
            ? (currentIndex + 1) % product.images.length
            : (currentIndex - 1 + product.images.length) % product.images.length;
        setSelectedImage(cleanImageUrl(product.images[nextIndex]));
    };

    const addToCart = async (productId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) { alert("Please login first"); navigate("/login"); return; }
            await axios.post(
                "http://localhost:5000/api/cart",
                { productId, quantity, selectedColor, selectedRam, selectedVariant, finalPrice: totalPrice },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAddedToCart(true);
            setTimeout(() => setAddedToCart(false), 2500);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (error) {
            alert(error.response?.data?.message || "Error adding to cart");
        }
    };

    // ─── Instant Checkout ───
    const handleInstantCheckout = async () => {
        const token = localStorage.getItem("token");
        if (!token) { alert("Please login first"); navigate("/login"); return; }
        if (!product) return;
        try {
            await axios.post(
                "http://localhost:5000/api/cart",
                { productId: product._id, quantity, selectedColor, selectedRam, selectedVariant, finalPrice: totalPrice },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.dispatchEvent(new Event("cartUpdated"));
            navigate("/cart");
        } catch (error) {
            alert(error.response?.data?.message || "Error proceeding to checkout");
        }
    };

    const addToWishlist = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) { alert("Please login first"); navigate("/login"); return; }
            await axios.post(
                "http://localhost:5000/api/wishlist",
                { productId: product._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWishlisted(true);
        } catch (error) {
            alert(error.response?.data?.message || "Error adding to wishlist");
        }
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        const resolvedImage = selectedImage || cleanImageUrl(product.image) || cleanImageUrl(product.images?.[0]);
        setZoomStyle({
            display: 'block',
            backgroundImage: `url(${resolvedImage})`,
            backgroundPosition: `${x}% ${y}%`,
            backgroundSize: '250%'
        });
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try { await navigator.share({ title: product.name, text: "Check out this product!", url }); }
            catch (err) { console.log(err); }
        } else {
            navigator.clipboard.writeText(url);
            alert("Link copied to clipboard!");
        }
    };

    // ─── Submit review ───
    const submitReview = async () => {
        if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
            setReviewError("Please fill in title and review.");
            return;
        }
        setReviewSubmitting(true);
        setReviewError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) { alert("Please login first"); navigate("/login"); return; }
            const res = await axios.post(
                `http://localhost:5000/api/products/${id}/reviews`,
                { title: reviewForm.title, comment: reviewForm.comment, rating: reviewForm.rating },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const newReview = res.data?.review || {
                title: reviewForm.title,
                comment: reviewForm.comment,
                rating: reviewForm.rating,
                reviewer: res.data?.name || "You",
                verified: true,
                timeAgo: "Just now",
            };
            setLocalReviews(prev => [newReview, ...prev]);
            setReviewSuccess(true);
            setShowReviewForm(false);
            setReviewForm({ title: "", comment: "", rating: 5 });
            setTimeout(() => setReviewSuccess(false), 3000);
        } catch (error) {
            setReviewError(error.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (!product) {
        return (
            <div className="bg-[#020208] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-t-cyan-400 border-r-purple-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-cyan-400 tracking-widest font-mono text-sm uppercase animate-pulse">Retrieving Specs...</p>
                </div>
            </div>
        );
    }

    const sp = product.specifications;
    const isOutOfStock = product.availability?.status !== "In Stock";

    const allSpecs = buildAllSpecs(product, selectedColor, selectedRam, selectedVariant);
    const dynamicFeatures = getDynamicFeatures(product, selectedColor, selectedRam, selectedVariant);
    const featureCards = getCategoryFeatureCards(product, selectedColor, selectedRam, selectedVariant);

    const visibleSpecs = specsExpanded ? allSpecs : allSpecs.slice(0, 8);
    const visibleReviews = reviewsExpanded ? localReviews : localReviews?.slice(0, 1);
    const rb = product.ratingsBreakdown;

    const resolvedDisplayImage = selectedImage || cleanImageUrl(product.image) || cleanImageUrl(product.images?.[0]);

    return (
        <div className="bg-[#020208] text-white min-h-screen relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
            {/* Ambient Background */}
            <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-cyan-500/[0.07] rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[30%] right-[-5%] w-[600px] h-[600px] bg-purple-500/[0.07] rounded-full blur-[140px] pointer-events-none" />

            {/* ── BREADCRUMB ── */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-2 relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                    <span onClick={() => navigate("/")} className="hover:text-cyan-400 cursor-pointer transition-colors duration-200">Home</span>
                    <ChevronRight size={10} className="text-gray-600" />
                    <span onClick={() => navigate(`/category/${product.category}`)} className="hover:text-cyan-400 cursor-pointer transition-colors duration-200">{product.category}</span>
                    <ChevronRight size={10} className="text-gray-600" />
                    <span className="text-cyan-400/80 truncate max-w-[200px]">{product.brand}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-8 py-8 space-y-24">

                {/* ══ SECTION 1 — MAIN PRODUCT ══ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT: IMAGES */}
                    <div className="lg:col-span-6 space-y-6">

                        {/* Hero Image */}
                        <div 
                            className="bg-white/[0.01] border border-white/[0.05] rounded-[32px] h-[480px] overflow-hidden relative backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.05)] cursor-crosshair group"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={() => setZoomStyle(prev => ({ ...prev, display: 'block' }))}
                            onMouseLeave={() => setZoomStyle({ display: 'none' })}
                        >
                            {resolvedDisplayImage ? (
                                <>
                                    <img
                                        src={resolvedDisplayImage}
                                        alt={product.name}
                                        className="w-full h-full object-contain p-6 transition-opacity duration-200 group-hover:opacity-0"
                                    />
                                    <div 
                                        className="absolute inset-0 z-10 pointer-events-none"
                                        style={zoomStyle}
                                    />
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package size={80} className="text-slate-700 animate-pulse" />
                                </div>
                            )}

                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleImageNavigation("prev"); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 text-white hover:text-cyan-400 hover:bg-black/60 transition-all duration-200 cursor-pointer z-20"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleImageNavigation("next"); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 border border-white/[0.08] backdrop-blur-md rounded-xl p-2.5 text-white hover:text-cyan-400 hover:bg-black/60 transition-all duration-200 cursor-pointer z-20"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            {discount > 0 && (
                                <span className="absolute top-5 left-5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl font-mono shadow-lg shadow-rose-500/20">
                                    {discount}% OFF
                                </span>
                            )}
                            <button
                                onClick={addToWishlist}
                                className="absolute top-5 right-5 bg-black/40 border border-white/[0.08] backdrop-blur-md rounded-xl p-3 text-white hover:text-rose-400 hover:bg-black/60 transition-all duration-300 z-20"
                            >
                                <Heart size={18} className={wishlisted ? "fill-rose-500 text-rose-500" : ""} />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        {product.images?.length > 1 && (
                            <div className="flex gap-3 flex-wrap bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl backdrop-blur-sm">
                                {product.images.map((img, i) => {
                                    const sanitizedImg = cleanImageUrl(img);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(sanitizedImg)}
                                            className={`w-16 h-16 rounded-xl overflow-hidden border-2 p-1.5 transition-all duration-300 bg-black/20 ${selectedImage === sanitizedImg
                                                ? "border-cyan-400 bg-cyan-500/[0.05] scale-105 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                                : "border-white/[0.06] hover:border-white/30"
                                                }`}
                                        >
                                            <img src={sanitizedImg} alt={`view ${i + 1}`} className="w-full h-full object-contain" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Delivery Timeline / Pincode Checker */}
                        <DeliveryPincodeChecker />

                        {/* User Address Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Merchant */}
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex items-center gap-4">
                                <div className="w-11 h-11 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center shrink-0">
                                    <Store size={20} className="text-cyan-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs uppercase font-bold text-slate-500 tracking-wider">Verified Merchant</p>
                                    <p className="text-sm font-bold text-white truncate mt-0.5">{product.seller?.name || "Matrix Supply Core"}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">
                                    {product.seller?.sellerRating || "4.7"}
                                    <Star size={11} fill="currentColor" />
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col justify-center">
                                <p className="text-xs uppercase font-black text-gray-500 tracking-widest mb-2 flex items-center gap-1.5">
                                    <Home size={12} className="text-cyan-400" /> Delivery Address
                                </p>
                                {addressLoading ? (
                                    <p className="text-xs text-slate-500 animate-pulse">Loading address...</p>
                                ) : userAddress ? (
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                                            {userAddress.address || "No address saved"}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {[userAddress.city, userAddress.state, userAddress.postalCode].filter(Boolean).join(", ")}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">
                                                <Truck size={10} /> FREE Delivery Available
                                            </span>
                                            <button
                                                onClick={() => navigate("/address")}
                                                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors font-mono"
                                            >
                                                <Edit3 size={10} /> Change
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-2">No address saved.</p>
                                        <button
                                            onClick={() => navigate("/login")}
                                            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                                        >
                                            <MapPin size={12} /> Login to see delivery info
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <TrustBadges />

                        {/* In The Box */}
                        {sp?.inTheBox?.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-sm">
                                <p className="text-xs uppercase font-black tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                    <Box size={14} className="text-cyan-400" /> In The Box
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {sp.inTheBox.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-300 bg-white/[0.02] border border-white/[0.04] px-3 py-2 rounded-xl">
                                            <Check size={14} className="text-cyan-400 shrink-0" />
                                            <span className="truncate">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: PRODUCT INFO */}
                    <div className="lg:col-span-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-4 mb-2">
                                <span className="text-cyan-400 text-xs font-extrabold tracking-widest uppercase font-mono bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                                    {product.brand}
                                </span>
                                <span className="text-slate-600 text-xs font-mono font-bold tracking-wider">MN: {product.modelNumber || "N/A"}</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-2 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                                <div className="flex items-center gap-1 bg-emerald-500 text-black text-xs font-extrabold px-2.5 py-1 rounded-md shadow-lg shadow-emerald-500/10">
                                    {product.rating}
                                    <Star size={12} fill="currentColor" />
                                </div>
                                <span className="text-slate-400 text-sm font-medium">({product.numReviews?.toLocaleString()} reviews)</span>
                                {product.warranty?.type && (
                                    <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                        <ShieldCheck size={13} /> {product.warranty.type}
                                    </span>
                                )}
                            </div>

                            {/* Price Section */}
                            <div className="mb-6 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 bg-white/[0.03] rounded-bl-xl font-mono text-[10px] text-slate-500 font-bold">
                                    QTY: {quantity}x
                                </div>
                                <div className="flex items-baseline gap-3 flex-wrap">
                                    <p className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                                        ₹{fmt(totalPrice)}
                                    </p>
                                    {totalMrp > totalPrice && (
                                        <p className="text-slate-500 line-through text-lg font-semibold">₹{fmt(totalMrp)}</p>
                                    )}
                                    {discount > 0 && (
                                        <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
                                            SAVE ₹{fmt(totalMrp - totalPrice)}
                                        </span>
                                    )}
                                </div>

                                {/* Config summary line */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedColor && (
                                        <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                                            🎨 {selectedColor}
                                        </span>
                                    )}
                                    {selectedRam && (
                                        <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                                            💾 {selectedRam}
                                        </span>
                                    )}
                                    {selectedVariant && (
                                        <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                                            📦 {selectedVariant}
                                        </span>
                                    )}
                                </div>

                                <p className="text-slate-500 text-xs mt-2">
                                    Inclusive of all taxes
                                    {product.protectPromiseFee && (
                                        <span className="ml-3 flex items-center gap-1 inline-flex text-slate-400 font-medium">
                                            <Info size={12} className="text-cyan-400" /> +₹{product.protectPromiseFee * quantity} protection fee
                                        </span>
                                    )}
                                </p>
                            </div>

                            <OffersSection price={totalPrice} />

                            {/* Color Selector */}
                            {product.colors?.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-xs font-extrabold tracking-widest text-slate-500 mb-2.5 uppercase font-mono">
                                        Colours: <span className="text-white normal-case font-sans ml-1 font-bold">{selectedColor}</span>
                                        {product.colors.find(c => c.color === selectedColor)?.price && (
                                            <span className="ml-2 text-cyan-400 font-mono">₹{fmt(product.colors.find(c => c.color === selectedColor).price)}</span>
                                        )}
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        {product.colors.map(c => (
                                            <button
                                                key={c.color}
                                                onClick={() => c.available !== false && setSelectedColor(c.color)}
                                                title={`${c.color}${c.price ? ` — ₹${fmt(c.price)}` : ""}`}
                                                disabled={c.available === false}
                                                className={`relative w-9 h-9 rounded-full border-2 transition-all duration-300 ${selectedColor === c.color
                                                    ? "border-cyan-400 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                                                    : c.available !== false
                                                        ? "border-white/20 hover:border-white/50 hover:scale-105"
                                                        : "border-white/10 opacity-20 cursor-not-allowed"
                                                    }`}
                                                style={{ backgroundColor: getColorHex(c.color) }}
                                            >
                                                {selectedColor === c.color && (
                                                    <span className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                                                        <Check size={14} className="text-white drop-shadow" />
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* RAM Selector */}
                            {product.systemMemory?.length > 0 && (
                                <div className="mb-5">
                                    <p className="text-xs font-extrabold tracking-widest text-slate-500 mb-2.5 uppercase font-mono">Memory</p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {product.systemMemory.map(m => (
                                            <button
                                                key={m.ram}
                                                onClick={() => m.available !== false && setSelectedRam(m.ram)}
                                                disabled={m.available === false}
                                                title={m.price ? `₹${fmt(m.price)}` : ""}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold border font-mono transition-all duration-300 relative ${selectedRam === m.ram
                                                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                                                    : m.available !== false
                                                        ? "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/30 hover:bg-white/[0.05]"
                                                        : "border-white/5 text-slate-600 cursor-not-allowed opacity-40"
                                                    }`}
                                            >
                                                {m.ram}
                                                {m.price && <span className="ml-1.5 text-[9px] text-cyan-400">₹{fmt(m.price)}</span>}
                                                {m.stockLeft && m.available !== false && (
                                                    <span className="ml-2 text-[10px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                                                        {m.stockLeft} left
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Storage / Variant Selector */}
                            {product.variants?.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-extrabold tracking-widest text-slate-500 mb-2.5 uppercase font-mono">
                                        {product.category?.toLowerCase().includes("laptop") || product.category?.toLowerCase().includes("computer")
                                            ? "Storage & Layout Format"
                                            : "Storage"}
                                    </p>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {product.variants.map(v => (
                                            <button
                                                key={v.variant}
                                                onClick={() => v.available !== false && setSelectedVariant(v.variant)}
                                                disabled={v.available === false}
                                                title={v.price ? `₹${fmt(v.price)}` : ""}
                                                className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${selectedVariant === v.variant
                                                    ? "border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                                                    : v.available !== false
                                                        ? "border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/30 hover:bg-white/[0.05]"
                                                        : "border-white/5 text-slate-600 cursor-not-allowed opacity-25"
                                                    }`}
                                            >
                                                {v.variant}
                                                {v.price && <span className="ml-1.5 text-[9px] text-cyan-400">₹{fmt(v.price)}</span>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Product Highlights */}
                            <div className="mb-6 bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] p-4 rounded-2xl space-y-2.5">
                                {product.productHighlights?.slice(0, 3).map((h, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                                        <p className="text-xs font-medium text-slate-300 leading-relaxed">
                                            <span className="font-bold text-white mr-1.5">{h.title}</span> — {h.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="mt-auto space-y-4 pt-6 border-t border-white/[0.06]">
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                                <div className={`border px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 font-mono ${isOutOfStock
                                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    }`}>
                                    <BadgeCheck size={13} /> {product.availability?.status?.toUpperCase()}
                                    {!isOutOfStock && product.countInStock > 0 && ` // ${product.countInStock} UNITS`}
                                </div>

                                {!isOutOfStock && (
                                    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-slate-400 hover:text-white transition-colors w-5 h-5 flex items-center justify-center font-bold text-base">-</button>
                                        <span className="text-white font-bold font-mono text-sm w-5 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(q => Math.min(product.countInStock || 10, q + 1))} className="text-slate-400 hover:text-white transition-colors w-5 h-5 flex items-center justify-center font-bold text-base">+</button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    ref={mainCartBtnRef}
                                    onClick={() => addToCart(product._id)}
                                    disabled={isOutOfStock}
                                    className={`flex-1 py-4 rounded-xl font-black text-sm tracking-widest uppercase flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-[0.98] shadow-lg ${isOutOfStock
                                        ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                                        : addedToCart
                                            ? "bg-emerald-500 text-black shadow-emerald-500/20"
                                            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-cyan-500/10"
                                        }`}
                                >
                                    {addedToCart ? <><Check size={18} className="stroke-[3]" />Added to Cart</> : <><ShoppingCart size={18} />Add to Cart</>}
                                </button>

                                <button
                                    onClick={handleInstantCheckout}
                                    disabled={isOutOfStock}
                                    className={`flex-1 py-4 rounded-xl font-black text-sm tracking-widest uppercase flex justify-center items-center gap-2 transition-all duration-300 transform active:scale-[0.98] shadow-lg ${isOutOfStock
                                        ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-orange-500 to-pink-600 hover:opacity-95 text-white shadow-orange-500/10"
                                        }`}
                                >
                                    <Zap size={18} />Buy Now
                                </button>

                                <button onClick={handleShare} className="p-4 bg-white/[0.02] border border-white/[0.08] hover:border-white/30 rounded-xl hover:bg-white/[0.05] transition-all duration-200 text-slate-300 hover:text-white">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ SECTION 2 — TABS ══ */}
                <div className="space-y-6">
                    <div className="flex gap-2 border-b border-white/[0.06] pb-px flex-wrap">
                        {["description", "features", "offers", "qna"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-3 text-sm font-bold tracking-wide uppercase font-mono transition-all duration-300 border-b-2 relative -bottom-[2px] ${activeTab === tab
                                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/[0.02]"
                                    : "border-transparent text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="min-h-[120px]">
                        {activeTab === "description" && (
                            <div className="bg-gradient-to-b from-white/[0.02] to-transparent border border-white/[0.05] rounded-2xl p-6 leading-relaxed text-slate-300 text-sm md:text-base font-medium">
                                {product.description}
                            </div>
                        )}

                        {activeTab === "features" && (
                            <div className="space-y-4">
                                {featureCards.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        {featureCards.map((fc, i) => (
                                            <FeatureCard key={i} icon={fc.icon} color={fc.color} title={fc.title} sub={fc.sub} />
                                        ))}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {dynamicFeatures.length > 0 ? (
                                        dynamicFeatures.map((f, i) => (
                                            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3.5 flex items-center gap-3">
                                                <Check size={14} className="text-cyan-400 shrink-0" />
                                                <span className="text-xs font-semibold text-slate-300">{f}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-sm text-slate-400 text-center font-medium">
                                            Select a configuration to see features.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "offers" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    "₹5,000 Instant Bank Discount",
                                    "Complimentary Premium Protective Case",
                                    "No-Cost EMI Available",
                                    "Exchange Bonus up to ₹8,000",
                                    product.protectPromiseFee && `Device Insurance — ₹${product.protectPromiseFee * quantity} premium`
                                ].filter(Boolean).map((offer, i) => (
                                    <div key={i} className="bg-emerald-500/[0.02] border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3.5">
                                        <Percent size={14} className="text-emerald-400 shrink-0" />
                                        <span className="text-sm font-semibold text-slate-300">{offer}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === "qna" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">Customer Questions & Answers</h3>
                                    <div className="relative">
                                        <input type="text" placeholder="Have a question? Search here..." className="bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-sm w-64 focus:border-cyan-500 outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl">
                                        <div className="flex gap-3 mb-2">
                                            <span className="font-black text-cyan-400">Q:</span>
                                            <p className="text-sm font-bold text-white">Does this product support dual-device pairing out of the box?</p>
                                        </div>
                                        <div className="flex gap-3 text-sm text-slate-300">
                                            <span className="font-black text-emerald-400">A:</span>
                                            <div>
                                                <p className="mb-2">Yes, it features seamless multipoint connection, allowing you to connect to two devices simultaneously and switch between them automatically.</p>
                                                <p className="text-[10px] text-slate-500 font-mono">Answered by Vellora Support — 2 months ago</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.01] border border-white/[0.05] p-4 rounded-xl">
                                        <div className="flex gap-3 mb-2">
                                            <span className="font-black text-cyan-400">Q:</span>
                                            <p className="text-sm font-bold text-white">Is the build quality durable enough for gym use?</p>
                                        </div>
                                        <div className="flex gap-3 text-sm text-slate-300">
                                            <span className="font-black text-emerald-400">A:</span>
                                            <div>
                                                <p className="mb-2">While it's highly durable, it does not have an official IP rating for water/sweat resistance. We recommend wiping it down after intense workouts.</p>
                                                <p className="text-[10px] text-slate-500 font-mono">Answered by Verified Purchaser — 5 months ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══ SECTION 3 — SPECIFICATIONS ══ */}
                {allSpecs.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-extrabold tracking-widest uppercase font-mono text-slate-400 shrink-0">Specifications</h2>
                            <div className="h-px w-full bg-white/[0.06]" />
                            {(selectedColor || selectedRam || selectedVariant) && (
                                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-1 rounded shrink-0">
                                    Config: {[selectedColor, selectedRam, selectedVariant].filter(Boolean).join(" / ")}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {visibleSpecs.map((spec, i) => <SpecRow key={i} label={spec.label} value={spec.value} />)}
                        </div>
                        {allSpecs.length > 8 && (
                            <button
                                onClick={() => setSpecsExpanded(!specsExpanded)}
                                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 px-4 py-2.5 rounded-xl transition-all duration-200"
                            >
                                {specsExpanded ? <><ChevronUp size={14} />Collapse</> : <><ChevronDown size={14} />Show All {allSpecs.length} Specs</>}
                            </button>
                        )}
                    </div>
                )}

                {/* ══ SECTION 4 — SOFTWARE BUNDLE ══ */}
                {sp?.includedSoftware?.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-extrabold tracking-widest uppercase font-mono text-slate-400 shrink-0">Included Software</h2>
                            <div className="h-px w-full bg-white/[0.06]" />
                        </div>
                        <div className="flex flex-wrap gap-2.5 bg-white/[0.01] border border-white/[0.05] p-4 rounded-2xl">
                            {(softwareExpanded ? sp.includedSoftware : sp.includedSoftware.slice(0, 12)).map((app, i) => (
                                <span key={i} className="bg-black/40 border border-white/[0.08] text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl font-mono">{app}</span>
                            ))}
                            {sp.includedSoftware.length > 12 && (
                                <button
                                    onClick={() => setSoftwareExpanded(!softwareExpanded)}
                                    className="text-xs font-bold tracking-wider font-mono text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-2 border border-cyan-500/30 rounded-xl bg-cyan-500/5"
                                >
                                    {softwareExpanded ? "CLOSE" : `+${sp.includedSoftware.length - 12} MORE`}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ══ SECTION 5 — REVIEWS ══ */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-extrabold tracking-widest uppercase font-mono text-slate-400 shrink-0">Customer Reviews</h2>
                        <div className="h-px w-full bg-white/[0.06]" />
                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="shrink-0 flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase font-mono text-white bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90"
                        >
                            <Edit3 size={13} /> Write Review
                        </button>
                    </div>

                    {/* Review form */}
                    {showReviewForm && (
                        <div className="bg-white/[0.02] border border-cyan-500/20 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">Write Your Review</h3>
                                <button onClick={() => { setShowReviewForm(false); setReviewError(""); }} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">Your Rating</p>
                                <StarInput value={reviewForm.rating} onChange={(r) => setReviewForm(f => ({ ...f, rating: r }))} />
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">Review Title</p>
                                <input
                                    type="text"
                                    placeholder="Summary of your experience..."
                                    value={reviewForm.title}
                                    onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/[0.08] focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600"
                                />
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-2">Your Review</p>
                                <textarea
                                    rows={4}
                                    placeholder="Share your experience with this product..."
                                    value={reviewForm.comment}
                                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/[0.08] focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-600 resize-none"
                                />
                            </div>

                            {reviewError && (
                                <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">{reviewError}</p>
                            )}

                            <button
                                onClick={submitReview}
                                disabled={reviewSubmitting}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={14} />
                                {reviewSubmitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </div>
                    )}

                    {reviewSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-sm font-semibold animate-pulse">
                            <BadgeCheck size={16} /> Review submitted successfully!
                        </div>
                    )}

                    {localReviews?.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Rating summary */}
                                <div className="lg:col-span-4 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                    <p className="text-6xl font-black text-white tracking-tighter mb-2">{product.rating}</p>
                                    <div className="flex gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={16} className={s <= Math.round(product.rating) ? "fill-amber-400 text-amber-400" : "text-slate-800"} />
                                        ))}
                                    </div>
                                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-mono">Based on {localReviews.length} reviews</p>
                                </div>

                                {/* Rating bars */}
                                {rb && (
                                    <div className="lg:col-span-4 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl p-6 space-y-3.5">
                                        {rb.performance !== undefined && <RatingBar label="Performance" value={rb.performance} />}
                                        {rb.battery !== undefined && <RatingBar label="Battery" value={rb.battery} />}
                                        {rb.design !== undefined && <RatingBar label="Design" value={rb.design} />}
                                        {rb.display !== undefined && <RatingBar label="Display" value={rb.display} />}
                                        {rb.valueForMoney !== undefined && <RatingBar label="Value for Money" value={rb.valueForMoney} />}
                                        {rb.sound !== undefined && <RatingBar label="Sound" value={rb.sound} />}
                                        {rb.buildQuality !== undefined && <RatingBar label="Build Quality" value={rb.buildQuality} />}
                                        {rb.camera !== undefined && <RatingBar label="Camera" value={rb.camera} />}
                                    </div>
                                )}

                                {/* Top review */}
                                {localReviews[0] && (
                                    <div className="lg:col-span-4 bg-gradient-to-b from-white/[0.03] to-white/[0.01] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex gap-0.5 mb-2">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Star key={s} size={12} className={s <= (localReviews[0].rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-800"} />
                                                ))}
                                            </div>
                                            <p className="font-bold text-white mb-2 leading-snug">"{localReviews[0]?.title}"</p>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-4">{localReviews[0]?.comment}</p>
                                        </div>
                                        <div className="flex items-center gap-2.5 mt-4 text-xs font-semibold text-slate-500 border-t border-white/[0.04] pt-3.5">
                                            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-slate-300">
                                                <User size={12} />
                                            </div>
                                            <span className="text-slate-300 max-w-[100px] truncate">{localReviews[0]?.reviewer}</span>
                                            {localReviews[0]?.verified && (
                                                <span className="text-emerald-400 flex items-center gap-0.5 bg-emerald-500/5 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">
                                                    <BadgeCheck size={11} /> VERIFIED
                                                </span>
                                            )}
                                            <span className="font-mono text-[10px] ml-2">{localReviews[0]?.timeAgo || "Recent"}</span>
                                            
                                            <button className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition bg-white/[0.02]">
                                                <ThumbsUp size={12} /> Helpful ({Math.floor(Math.random() * 50) + 10})
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Review Image Gallery (Mock) */}
                            <div className="mt-8 mb-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Camera size={14} className="text-cyan-400" /> Customer Photos
                                </h3>
                                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                    {(product.images || [product.image]).filter(Boolean).map((img, idx) => (
                                        <div key={idx} className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition cursor-pointer relative group">
                                            <img src={cleanImageUrl(img)} alt="Customer Review" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                                <Eye size={16} className="text-white" />
                                            </div>
                                        </div>
                                    ))}
                                    {[1,2].map((_, idx) => (
                                        <div key={`extra-${idx}`} className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition cursor-pointer relative group bg-white/5">
                                            <img src={cleanImageUrl(product.image)} alt="Customer Review" className="w-full h-full object-cover opacity-50 mix-blend-luminosity group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* All reviews */}
                            {localReviews.length > 1 && (
                                <div className="space-y-3 pt-3">
                                    {visibleReviews?.slice(1).map((rev, i) => (
                                        <div key={i} className="bg-white/[0.01] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.03] transition-colors duration-200">
                                            <div className="flex items-center justify-between gap-4 mb-1.5">
                                                <p className="font-bold text-sm text-slate-200">{rev.title}</p>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={10} className={s <= (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-slate-800"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{rev.comment}</p>
                                            <div className="flex items-center gap-3 mt-4 text-[11px] text-slate-500 font-semibold border-t border-white/[0.03] pt-3">
                                                <div className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                                                    <User size={10} />
                                                </div>
                                                <span className="text-slate-400">{rev.reviewer}</span>
                                                {rev.verified && <span className="text-emerald-400 flex items-center gap-0.5 font-mono text-[9px] bg-emerald-500/5 px-1 py-0.5 rounded border border-emerald-500/20"><BadgeCheck size={10} /> VERIFIED</span>}
                                                <span className="font-mono text-[10px] ml-2">{rev.timeAgo}</span>
                                                
                                                <button className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400 transition bg-white/[0.01] text-[10px]">
                                                    <ThumbsUp size={10} /> Helpful ({Math.floor(Math.random() * 20) + 1})
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {localReviews.length > 1 && (
                                        <button
                                            onClick={() => setReviewsExpanded(!reviewsExpanded)}
                                            className="flex items-center gap-1 text-xs font-bold tracking-wider font-mono uppercase text-cyan-400 hover:text-cyan-300 transition-colors mt-2 px-1"
                                        >
                                            {reviewsExpanded ? <><ChevronUp size={12} />Collapse</> : <><ChevronDown size={12} />Read All {localReviews.length} Reviews</>}
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white/[0.01] border border-white/[0.05] rounded-2xl p-10 text-center">
                            <Star size={32} className="text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-400 font-semibold">No reviews yet.</p>
                            <p className="text-slate-600 text-xs mt-1">Be the first to review this product!</p>
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="mt-4 px-5 py-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl hover:bg-cyan-500/20 transition-colors"
                            >
                                Write a Review
                            </button>
                        </div>
                    )}
                </div>

                {/* ══ SECTION 5.5 — FREQUENTLY BOUGHT TOGETHER ══ */}
                {product.similarProducts?.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-extrabold tracking-widest uppercase font-mono text-slate-400 shrink-0">Frequently Bought Together</h2>
                            <div className="h-px w-full bg-white/[0.06]" />
                        </div>
                        <div className="bg-gradient-to-r from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex items-center gap-4 shrink-0">
                                <div className="w-24 h-24 bg-white/[0.05] rounded-xl p-2 border border-white/[0.1]">
                                    <img src={resolvedDisplayImage} alt={product.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="text-2xl font-black text-slate-500">+</div>
                                <div className="w-24 h-24 bg-white/[0.05] rounded-xl p-2 border border-white/[0.1]">
                                    <img src={cleanImageUrl(product.similarProducts[0].image || product.similarProducts[0].images?.[0])} alt={product.similarProducts[0].name} className="w-full h-full object-contain" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white leading-snug mb-1">
                                    <span className="text-cyan-400">This item:</span> {product.name}
                                </p>
                                <p className="text-sm font-bold text-slate-400 leading-snug">
                                    <span className="text-emerald-400">+</span> {product.similarProducts[0].name}
                                </p>
                            </div>
                            <div className="shrink-0 text-center md:text-right">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Total Bundle Price</p>
                                <p className="text-2xl font-black text-cyan-400 mb-3">₹{fmt(totalPrice + product.similarProducts[0].price)}</p>
                                <button className="bg-white text-black hover:bg-cyan-400 font-black px-6 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-white/10 w-full md:w-auto">
                                    Add Both to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ SECTION 6 — SIMILAR PRODUCTS ══ */}
                {product.similarProducts?.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-extrabold tracking-widest uppercase font-mono text-slate-400 shrink-0">Similar Products</h2>
                            <div className="h-px w-full bg-white/[0.06]" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {product.similarProducts.map((p, i) => {
                                const simDiscount = p.discountPercent || (p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
                                const parsedSimImage = cleanImageUrl(p.image || p.images?.[0]);
                                return (
                                    <div
                                        key={p._id || i}
                                        className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.06] rounded-2xl p-3.5 hover:border-cyan-500/30 hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer group"
                                        onClick={() => {
                                            if (p._id) {
                                                navigate(`/product/${p._id}`);
                                                window.scrollTo(0, 0);
                                            }
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === "Enter" && p._id && navigate(`/product/${p._id}`)}
                                    >
                                        <div className="h-28 bg-black/40 border border-white/[0.04] rounded-xl mb-3 flex items-center justify-center group-hover:bg-black/60 transition-colors duration-300 overflow-hidden">
                                            {parsedSimImage ? (
                                                <img src={parsedSimImage} alt={p.name} className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <Package size={28} className="text-slate-800" />
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-200 leading-snug line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors duration-200">{p.name}</p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-cyan-400 font-extrabold text-sm font-mono">₹{fmt(p.price)}</p>
                                            {simDiscount > 0 && (
                                                <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/5 px-1 rounded">-{simDiscount}%</span>
                                            )}
                                        </div>
                                        {!p._id && (
                                            <p className="text-[10px] text-slate-600 mt-1 font-mono">No link available</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>

            {/* Sticky Add to Cart Bar */}
            <div className={`fixed bottom-0 left-0 w-full z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 transition-transform duration-300 ${showStickyCart ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <img src={resolvedDisplayImage} className="w-10 h-10 object-contain bg-white/5 rounded" alt="" />
                        <div className="truncate">
                            <p className="text-sm font-bold text-white truncate">{product.name}</p>
                            <p className="text-xs text-cyan-400 font-mono">₹{fmt(totalPrice)}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => addToCart(product._id)}
                        disabled={isOutOfStock}
                        className="shrink-0 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-sm font-black px-6 py-2 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
