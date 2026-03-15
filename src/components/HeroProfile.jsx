export default function HeroProfile({ T, dark }) {
    return (
        <div style={{
            position: "relative",
            width: "clamp(260px, 32vw, 400px)",
            height: "clamp(260px, 32vw, 400px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeUp .8s .1s both"
        }}>
            {/* The animated morphing neon aura */}
            <div style={{
                position: "absolute",
                inset: -15,
                background: `linear-gradient(45deg, ${T.a}, ${T.a2}, ${T.a3})`,
                filter: "blur(25px)",
                opacity: dark ? 0.6 : 0.8,
                animation: "blobify 12s ease-in-out infinite both alternate, auraRotate 30s linear infinite",
                zIndex: 0
            }} />
            
            {/* The actual image inside the organic, morphing mask container */}
            <div style={{
                position: "absolute",
                inset: 0,
                background: T.bg, // Backdrop
                overflow: "hidden",
                border: `4px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                zIndex: 2,
                animation: "blobify 12s ease-in-out infinite both alternate-reverse, float 6s ease-in-out infinite",
                boxShadow: `0 20px 50px rgba(0,0,0,0.4)`
            }}>
                <img 
                    src="/images/profile-suit.jpg"
                    alt="Farhan Shahriyar"
                    style={{ 
                        width: "115%", // scaled slightly up so corners don't peek out while morphing
                        height: "115%", 
                        objectFit: "cover", 
                        pointerEvents: "none",
                        transform: "translate(-7%, -7%)" // re-center the scaled image
                    }} 
                    onError={(e) => { 
                        e.target.src = "https://shahriyar31.github.io/Farhan-Shahriyar.github.io/images/profile.jpg"; 
                        e.target.onerror = null; 
                    }}
                />
            </div>
        </div>
    );
}
