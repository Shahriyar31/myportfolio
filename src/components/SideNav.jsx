import Mag from "./Mag";
import { useTheme } from "../context/ThemeContext";

export default function SideNav({ active }) {
    const { T } = useTheme();
    const items = [
        { id: "home", svg: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /> },
        { id: "about", svg: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
        { id: "experience", svg: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></> },
        { id: "projects", svg: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></> },
        { id: "skills", svg: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></> },
        { id: "education", svg: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></> },
        { id: "photography", svg: <><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></> },
        { id: "contact", svg: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></> },
    ];
    const scroll = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    return (
        <div id="snav" className="snav-container">
            {items.map(({ id, svg }) => {
                const a = active === id;
                return (
                    <Mag key={id} as="button" onClick={() => scroll(id)} title={id}
                        className={`snav-item ${a ? 'active' : ''}`}
                        style={{
                            borderColor: a ? T.a : T.border,
                            background: a ? T.a : `${T.a}0c`,
                            boxShadow: a ? `0 0 20px ${T.a}55,0 0 40px ${T.a}18` : "none",
                        }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={a ? T.bg : T.m} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{svg}</svg>
                    </Mag>
                );
            })}
        </div>
    );
}
