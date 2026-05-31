import { useRef } from "react";

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

export default RealisticTilt;
