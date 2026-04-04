import { useTheme } from "../context/ThemeContext";
import HeroBentoMaster from "../components/HeroBentoMaster";

export default function Hero({ scrollTo, onOpenResume }) {
    const { T, dark } = useTheme();

    return (
        <section id="home" className="section hero-section" style={{ padding: 0 }}>
             <HeroBentoMaster T={T} dark={dark} onOpenResume={onOpenResume} />
        </section>
    );
}
