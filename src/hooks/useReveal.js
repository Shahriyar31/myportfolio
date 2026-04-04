import { useEffect } from "react";

export function useReveal() {
    useEffect(() => {
        const go = () =>
            document.querySelectorAll(".rv,.rv2,.rv3,.section").forEach(el => {
                if (el.getBoundingClientRect().top < window.innerHeight * 0.95)
                    el.classList.add("vi");
            });
        go();
        window.addEventListener("scroll", go, { passive: true });
        return () => window.removeEventListener("scroll", go);
    }, []);
}
