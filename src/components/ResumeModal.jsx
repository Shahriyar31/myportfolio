import { useTheme } from "../context/ThemeContext";

const fm = { fontFamily: "'Inter', sans-serif" };

export default function ResumeModal({ open, onClose }) {
    const { T } = useTheme();
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.3s ease", padding: "10px", paddingBottom: "30px" }}>
            <div style={{ width: "100%", maxWidth: 1000, display: "flex", justifyContent: "flex-end", paddingBottom: 16 }}>
                <button
                    onClick={onClose}
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "8px 24px", borderRadius: 20, ...fm, fontSize: 12, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.a}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}>
                    ✕ CLOSE
                </button>
            </div>
            <iframe
                src="https://shahriyar31.github.io/Farhan-Shahriyar.github.io/Farhan_Shahriyar_Resume.pdf"
                style={{ width: "100%", maxWidth: 1000, height: "80vh", borderRadius: 12, border: `1px solid ${T.border}`, background: "white" }}
            />
        </div>
    );
}
