import { useEffect, useState } from "react";

export default function AnimatedName({ first, last, T }) {
    // We occasionally swap a character to binary to give it that "Data Engineer" feel
    const [scrambleIdx, setScrambleIdx] = useState(-1);
    const text = first + last;
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.4) {
                // Pick a random letter to briefly turn into '0' or '1'
                const randI = Math.floor(Math.random() * text.length);
                setScrambleIdx(randI);
                setTimeout(() => setScrambleIdx(-1), 150);
            }
        }, 1200);
        return () => clearInterval(interval);
    }, [text.length]);

    const renderWord = (word, startIndex) => (
        <div style={{ display: "flex" }}>
            {word.split("").map((char, i) => {
                const globalIdx = startIndex + i;
                const isScrambled = scrambleIdx === globalIdx;
                const displayChar = isScrambled ? (Math.random() > 0.5 ? "0" : "1") : char;
                
                return (
                    <span 
                        key={i} 
                        className="neural-char" 
                        data-char={displayChar}
                        style={{ 
                            "--char-index": globalIdx,
                            animationDelay: `${globalIdx * 0.12}s`,
                        }}
                    >
                        {displayChar}
                    </span>
                );
            })}
        </div>
    );

    return (
        <div style={{ display: "flex", flexWrap: "nowrap", columnGap: "0.3em", lineHeight: 1 }}>
            
            {renderWord(first, 0)}
            {renderWord(last, first.length)}
            
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap');

                .neural-char {
                    position: relative;
                    display: inline-block;
                    font-family: 'Space Grotesk', system-ui, sans-serif;
                    font-weight: 700;
                    letter-spacing: -0.05em;
                    color: transparent;
                    
                    /* Clean, icy cool palette using your theme variables */
                    background: linear-gradient(135deg, ${T.m}, ${T.t}, ${T.a}, ${T.m});
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    
                    /* The deep breathing focal blur */
                    animation: latentFocus 6s infinite ease-in-out;
                }

                /* This creates a slicing, scanning "laser" line over the text */
                .neural-char::after {
                    content: attr(data-char);
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: transparent;
                    pointer-events: none;
                    background: linear-gradient(
                        to bottom, 
                        transparent 40%, 
                        ${T.a} 50%, 
                        #ffffff 52%, 
                        ${T.a} 54%, 
                        transparent 60%
                    );
                    background-size: 100% 200%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    opacity: 0;
                    filter: drop-shadow(0 0 8px ${T.a});
                    
                    /* Scanning laser wave */
                    animation: dataScan 4s infinite linear;
                    animation-delay: calc(var(--char-index) * 0.08s);
                }

                @keyframes latentFocus {
                    0%, 100% { 
                        filter: blur(2px); 
                        opacity: 0.6; 
                        background-position: 0% 50%;
                        transform: scale(0.98);
                    }
                    50% { 
                        filter: blur(0px); 
                        opacity: 1; 
                        background-position: 100% 50%;
                        transform: scale(1);
                        text-shadow: 0 0 15px ${T.a}40;
                    }
                }

                @keyframes dataScan {
                    0%, 10% { opacity: 0; background-position: 50% -100%; }
                    25% { opacity: 1; }
                    40%, 100% { opacity: 0; background-position: 50% 200%; }
                }
            `}</style>
        </div>
    );
}
