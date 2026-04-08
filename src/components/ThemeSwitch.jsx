export default function ThemeSwitch({ dark, setDark }) {
    const S = 11; // toggle-size in px

    const em = (v) => `${v}em`;

    const cw = 5.625, ch = 2.5, cr = 6.25;
    const ccd = 3.375, smd = 2.125;
    const offset = -((ccd - ch) / 2);

    const circleLeft = dark
        ? `calc(100% - ${em(offset)} - ${em(ccd)})`
        : em(offset);

    return (
        <label onClick={() => setDark(d => !d)} style={{ fontSize: S, display: "inline-flex", cursor: "pointer" }}>
            {/* The pill container */}
            <div style={{
                width: em(cw), height: em(ch),
                backgroundColor: dark ? "#1D1F2C" : "#3D7EAE",
                borderRadius: em(cr),
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0em -0.062em 0.062em rgba(0,0,0,0.25), 0em 0.062em 0.125em rgba(255,255,255,0.94)",
                transition: ".5s cubic-bezier(0, -0.02, 0.4, 1.25)",
                position: "relative",
            }}>
                {/* Inner inset shadow overlay */}
                <div style={{
                    position: "absolute", zIndex: 1, inset: 0,
                    boxShadow: "0em 0.05em 0.187em rgba(0,0,0,0.25) inset",
                    borderRadius: em(cr),
                    pointerEvents: "none",
                }} />

                {/* Clouds */}
                <div style={{
                    width: "1.25em", height: "1.25em",
                    backgroundColor: "#F3FDFF",
                    borderRadius: em(cr),
                    position: "absolute",
                    bottom: dark ? "-4.062em" : "-0.625em",
                    left: "0.312em",
                    transition: "0.5s cubic-bezier(0, -0.02, 0.4, 1.25)",
                    boxShadow: `0.937em 0.312em #F3FDFF, -0.312em -0.312em #AACADF,
                        1.437em 0.375em #F3FDFF, 0.5em -0.125em #AACADF,
                        2.187em 0 #F3FDFF, 1.25em -0.062em #AACADF,
                        2.937em 0.312em #F3FDFF, 2em -0.312em #AACADF,
                        3.625em -0.062em #F3FDFF, 2.625em 0em #AACADF`,
                }} />

                {/* Stars */}
                <div style={{
                    position: "absolute",
                    color: "#fff",
                    top: dark ? "50%" : "-100%",
                    left: "0.312em",
                    width: "2.75em",
                    height: "auto",
                    transform: dark ? "translateY(-50%)" : "none",
                    transition: ".5s cubic-bezier(0, -0.02, 0.4, 1.25)",
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none" style={{ width: "100%", height: "auto" }}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85866 135.831 5.70205C136.607 6.54544 136.996 7.57303 136.996 8.78482C136.996 7.57303 137.385 6.54544 138.161 5.70205C138.937 4.85866 139.881 4.40947 140.992 4.35447C139.881 4.29946 138.937 3.85027 138.161 3.00688C137.385 2.16348 136.996 1.1359 136.996 -0.0758972C136.996 1.1359 136.607 2.16348 135.831 3.00688ZM31.8315 37.0069C31.0549 37.8503 30.1111 38.2995 29 38.3545C30.1111 38.4095 31.0549 38.8587 31.8315 39.7021C32.6081 40.5454 32.9964 41.573 32.9964 42.7848C32.9964 41.573 33.3847 40.5454 34.1613 39.7021C34.9379 38.8587 35.8817 38.4095 36.9928 38.3545C35.8817 38.2995 34.9379 37.8503 34.1613 37.0069C33.3847 36.1635 32.9964 35.1359 32.9964 33.9241C32.9964 35.1359 32.6081 36.1635 31.8315 37.0069ZM135.831 49.0069C135.055 49.8503 134.111 50.2995 133 50.3545C134.111 50.4095 135.055 50.8587 135.831 51.7021C136.607 52.5454 136.996 53.573 136.996 54.7848C136.996 53.573 137.385 52.5454 138.161 51.7021C138.937 50.8587 139.881 50.4095 140.992 50.3545C139.881 50.2995 138.937 49.8503 138.161 49.0069C137.385 48.1635 136.996 47.1359 136.996 45.9241C136.996 47.1359 136.607 48.1635 135.831 49.0069Z" fill="currentColor" />
                    </svg>
                </div>

                {/* The sliding orb container */}
                <div style={{
                    width: em(ccd), height: em(ccd),
                    backgroundColor: "rgba(255,255,255,0.1)",
                    position: "absolute",
                    left: circleLeft,
                    top: em(offset),
                    borderRadius: em(cr),
                    boxShadow: `inset 0 0 0 ${em(ccd)} rgba(255,255,255,0.1), 0 0 0 0.625em rgba(255,255,255,0.1), 0 0 0 1.25em rgba(255,255,255,0.1)`,
                    display: "flex",
                    transition: ".3s cubic-bezier(0, -0.02, 0.35, 1.17)",
                }}>
                    {/* Sun/Moon orb */}
                    <div style={{
                        position: "relative", zIndex: 2,
                        width: em(smd), height: em(smd),
                        margin: "auto",
                        borderRadius: em(cr),
                        backgroundColor: dark ? "#C4C9D1" : "#ECCA2F",
                        boxShadow: dark
                            ? "0.062em 0.062em 0.062em 0em rgba(254,255,239,0.61) inset, 0em -0.062em 0.062em 0em #969696 inset"
                            : "0.062em 0.062em 0.062em 0em rgba(254,255,239,0.61) inset, 0em -0.062em 0.062em 0em #a1872a inset",
                        filter: "drop-shadow(0.062em 0.125em 0.125em rgba(0,0,0,0.25))",
                        overflow: "hidden",
                        transition: ".5s cubic-bezier(0, -0.02, 0.4, 1.25)",
                    }}>
                        {/* Moon overlay slides in from right */}
                        <div style={{
                            transform: dark ? "translateX(0)" : "translateX(100%)",
                            width: "100%", height: "100%",
                            backgroundColor: "#C4C9D1",
                            borderRadius: "inherit",
                            boxShadow: "0.062em 0.062em 0.062em 0em rgba(254,255,239,0.61) inset, 0em -0.062em 0.062em 0em #969696 inset",
                            transition: ".5s cubic-bezier(0, -0.02, 0.4, 1.25)",
                            position: "relative",
                        }}>
                            {/* Moon craters */}
                            {[
                                { top: "0.75em", left: "0.312em", w: "0.75em", h: "0.75em" },
                                { top: "0.937em", left: "1.375em", w: "0.375em", h: "0.375em" },
                                { top: "0.312em", left: "0.812em", w: "0.25em", h: "0.25em" },
                            ].map((s, i) => (
                                <div key={i} style={{
                                    position: "absolute", top: s.top, left: s.left,
                                    width: s.w, height: s.h,
                                    borderRadius: em(cr),
                                    backgroundColor: "#959DB1",
                                    boxShadow: "0em 0.0312em 0.062em rgba(0,0,0,0.25) inset",
                                }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </label>
    );
}
