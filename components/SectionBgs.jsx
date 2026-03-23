export function AboutBG({ T }) {
    const dark = T.bg === "#1a1a22";
    const col = dark ? "rgba(126,184,190,.18)" : "rgba(45,50,80,.32)";
    const strands = Array.from({ length: 8 }, (_, i) => i);
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {strands.map(i => (
                <div key={i} style={{ position: "absolute", left: `${8 + i * 12}%`, top: "-10%", width: 2, height: "120%", background: `repeating-linear-gradient(to bottom,transparent 0px,transparent 20px,${col} 20px,${col} 22px)`, animation: `dnaFloat ${14 + i * 2}s ease-in-out infinite`, animationDelay: `${-i * 1.8}s`, opacity: .6 }} />
            ))}
            {strands.map(i => (
                <div key={`r${i}`} style={{ position: "absolute", right: `${8 + i * 12}%`, top: "-10%", width: 2, height: "120%", background: `repeating-linear-gradient(to bottom,transparent 0px,transparent 20px,${col} 20px,${col} 22px)`, animation: `dnaFloat ${16 + i * 2}s ease-in-out infinite reverse`, animationDelay: `${-i * 2.2}s`, opacity: .4 }} />
            ))}
        </div>
    );
}

export function ExperienceBG({ T }) {
    const dark = T.bg === "#1a1a22";
    const lines = ["const rag = new RAGPipeline(1690);", "await llm.evaluate(29, 'gpt-4o');", "rapidfuzz.match(threshold=70)", "docker build -t nordex-ai .", "git push origin main", "kubectl apply -f deployment.yaml", "python3 eval_pipeline.py", "streamlit run app.py", "azure.ai.foundry.deploy()", "embeddings = text_embedding_3_large", "score: groundedness=4.8/5", "cost_reduction = 11.0  # times"];
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {[0, 1, 2].map(col => (
                <div key={col} style={{ position: "absolute", top: 0, left: `${15 + col * 30}%`, width: 240, animation: `dataStream ${18 + col * 4}s linear infinite`, animationDelay: `${-col * 6}s`, opacity: dark ? .12 : .25 }}>
                    {lines.map((l, i) => (
                        <div key={i} style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: dark ? "#7eb8be" : "#2d3050", padding: "3px 0", whiteSpace: "nowrap" }}>{l}</div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ProjectsBG({ T }) {
    const dark = T.bg === "#1a1a22";
    const fragments = [
        { code: "accuracy = 97.51%", x: 4, y: 12, dur: 22, del: 0, rot: -6 },
        { code: "RAGPipeline(docs=1690)", x: 68, y: 7, dur: 18, del: -3, rot: 4 },
        { code: "rapidfuzz.threshold=70", x: 12, y: 72, dur: 25, del: -7, rot: -5 },
        { code: "docker build -t nordex-ai", x: 58, y: 82, dur: 20, del: -4, rot: 3 },
        { code: "kafka.produce(topic='stock')", x: 1, y: 44, dur: 28, del: -9, rot: -10 },
        { code: "llm_eval.n_questions=29", x: 72, y: 48, dur: 16, del: -2, rot: 7 },
        { code: "cost_reduction = 11.0x", x: 32, y: 4, dur: 24, del: -5, rot: 2 },
        { code: "git push origin main", x: 44, y: 88, dur: 19, del: -6, rot: -3 },
        { code: "torch.cuda.is_available()", x: 80, y: 65, dur: 23, del: -1, rot: 5 },
        { code: "embedding='text-embedding-3-large'", x: 20, y: 90, dur: 26, del: -8, rot: -4 },
        { code: "flink.stream().filter()", x: 55, y: 22, dur: 21, del: -2, rot: 8 },
        { code: "aws.s3.put_object(Bucket='glue')", x: 2, y: 25, dur: 27, del: -4, rot: -7 },
    ];
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {fragments.map((f, i) => (
                <div key={i} style={{
                    position: "absolute", left: `${f.x}%`, top: `${f.y}%`,
                    fontFamily: "'Inter', sans-serif", fontSize: 10,
                    color: dark ? "rgba(126,184,190,.22)" : "rgba(45,50,80,.38)",
                    transform: `rotate(${f.rot}deg)`, whiteSpace: "nowrap",
                    animation: `floatRandom ${f.dur}s ease-in-out infinite`, animationDelay: `${f.del}s`,
                    padding: "3px 9px", borderRadius: 5,
                    border: `1px solid ${dark ? "rgba(126,184,190,.1)" : "rgba(45,50,80,.16)"}`,
                    background: dark ? "rgba(126,184,190,.03)" : "rgba(45,50,80,.04)",
                }}>{f.code}</div>
            ))}
        </div>
    );
}

export function EducationBG({ T }) {
    const dark = T.bg === "#1a1a22";
    const items = [
        { e: "📚", x: 4, y: 12, dur: 20, del: 0, rot: -8, s: 28 },
        { e: "💻", x: 88, y: 8, dur: 22, del: -4, rot: 5, s: 26 },
        { e: "🧠", x: 6, y: 72, dur: 18, del: -7, rot: -10, s: 24 },
        { e: "⚙️", x: 91, y: 68, dur: 25, del: -2, rot: 8, s: 22 },
        { e: "📐", x: 48, y: 5, dur: 17, del: -5, rot: 3, s: 20 },
        { e: "🔬", x: 2, y: 42, dur: 23, del: -9, rot: -6, s: 22 },
        { e: "📊", x: 85, y: 40, dur: 19, del: -3, rot: 7, s: 24 },
        { e: "🎓", x: 45, y: 88, dur: 21, del: -6, rot: -4, s: 30 },
        { e: "✏️", x: 72, y: 82, dur: 16, del: -1, rot: 12, s: 20 },
        { e: "🔭", x: 18, y: 88, dur: 24, del: -8, rot: -9, s: 22 },
    ];
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {items.map((it, i) => (
                <div key={i} style={{
                    position: "absolute", left: `${it.x}%`, top: `${it.y}%`,
                    fontSize: it.s, opacity: dark ? 0.18 : 0.28,
                    transform: `rotate(${it.rot}deg)`,
                    animation: `floatRandom ${it.dur}s ease-in-out infinite`, animationDelay: `${it.del}s`,
                    filter: dark ? "none" : "grayscale(.4)",
                }}>{it.e}</div>
            ))}
        </div>
    );
}

export function SkillsBG({ T }) {
    const dark = T.bg === "#1a1a22";
    const pts = [{ x: 10, y: 20 }, { x: 25, y: 10 }, { x: 45, y: 30 }, { x: 65, y: 15 }, { x: 80, y: 35 }, { x: 90, y: 20 }, { x: 15, y: 60 }, { x: 35, y: 75 }, { x: 55, y: 55 }, { x: 75, y: 70 }, { x: 85, y: 60 }, { x: 20, y: 85 }, { x: 50, y: 90 }, { x: 70, y: 85 }];
    const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [6, 7], [7, 8], [8, 9], [9, 10], [6, 11], [11, 12], [12, 13], [2, 8], [4, 9], [3, 8], [1, 7]];
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, opacity: dark ? 0.5 : 0.85 }}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
                {edges.map(([a, b], i) => (
                    <line key={i} x1={`${pts[a].x}%`} y1={`${pts[a].y}%`} x2={`${pts[b].x}%`} y2={`${pts[b].y}%`}
                        stroke={dark ? "rgba(126,184,190,.2)" : "rgba(45,50,80,.4)"} strokeWidth=".8"
                        strokeDasharray="4 4"
                        style={{ animation: `constellationDraw 3s ${i * .15}s ease forwards` }} />
                ))}
                {pts.map((p, i) => (
                    <circle key={i} cx={`${p.x}%`} cy={`${p.y}%`} r="2.5"
                        fill={dark ? "rgba(126,184,190,.35)" : "rgba(45,50,80,.55)"}
                        style={{ animation: `dotPulse ${3 + i % 3}s ${i * .2}s ease-in-out infinite` }} />
                ))}
            </svg>
        </div>
    );
}

export function ContactBG({ T }) {
    const dark = T.bg === "#1a1a22";
    const col = dark ? "rgba(126,184,190,ALPHA)" : "rgba(45,50,80,ALPHA)";
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                    position: "absolute", width: 100, height: 100, borderRadius: "50%",
                    border: `1.5px solid ${col.replace("ALPHA", dark ? (.5 - i * .08).toString() : (.65 - i * .1).toString())}`,
                    animation: `sonarPulse ${3.5}s linear infinite`, animationDelay: `${i * .7}s`
                }} />
            ))}
            <div style={{ position: "absolute", width: 12, height: 12, borderRadius: "50%", background: col.replace("ALPHA", dark ? ".4" : ".6"), animation: `pulse 2s ease-in-out infinite` }} />
        </div>
    );
}

export function PhotographyBG({ T }) {
    const dark = T.bg === "#1a1a22";
    const shapes = [{ type: "circle", x: 8, y: 15, s: 40, dur: 22, del: 0 }, { type: "square", x: 88, y: 10, s: 28, dur: 18, del: -3 }, { type: "triangle", x: 5, y: 70, s: 35, dur: 25, del: -7 }, { type: "circle", x: 92, y: 75, s: 25, dur: 20, del: -5 }, { type: "square", x: 50, y: 5, s: 20, dur: 16, del: -2 }];
    const col = dark ? "rgba(126,184,190,.12)" : "rgba(45,50,80,.28)";
    return (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {shapes.map((sh, i) => (
                <div key={i} style={{ position: "absolute", left: `${sh.x}%`, top: `${sh.y}%`, animation: `floatRandom ${sh.dur}s ease-in-out infinite`, animationDelay: `${sh.del}s` }}>
                    {sh.type === "circle" && <div style={{ width: sh.s, height: sh.s, borderRadius: "50%", border: `1.5px solid ${col}` }} />}
                    {sh.type === "square" && <div style={{ width: sh.s, height: sh.s, border: `1.5px solid ${col}`, transform: "rotate(30deg)" }} />}
                    {sh.type === "triangle" && <div style={{ width: 0, height: 0, borderLeft: `${sh.s / 2}px solid transparent`, borderRight: `${sh.s / 2}px solid transparent`, borderBottom: `${sh.s}px solid ${col}` }} />}
                </div>
            ))}
        </div>
    );
}
