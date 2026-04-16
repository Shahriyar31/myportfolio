import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import HeroProfile from "./HeroProfile";

const sf  = { fontFamily: "'Space Grotesk','Sora',sans-serif" };
const fm  = { fontFamily: "'Inter',sans-serif" };
const mono= { fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace" };

const SOCIAL = [
    { label:"GitHub",   href:"https://github.com/Shahriyar31",                 icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> },
    { label:"LinkedIn", href:"https://www.linkedin.com/in/farhanshahriyar",    icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { label:"Email",    href:"mailto:shahriyarfarhan3101@gmail.com",            icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg> },
];

// 12 tech icons scattered freely across the hero
const TECH_ICONS = [
    { name:"Python",     src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",           cx:0.10, cy:0.22, ax:0.07, ay:0.10, fx:0.31, fy:0.47 },
    { name:"TensorFlow", src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",   cx:0.88, cy:0.18, ax:0.06, ay:0.12, fx:0.41, fy:0.38 },
    { name:"Docker",     src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",           cx:0.08, cy:0.70, ax:0.07, ay:0.09, fx:0.52, fy:0.29 },
    { name:"Kafka",      src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachekafka/apachekafka-original.svg", cx:0.90, cy:0.72, ax:0.05, ay:0.10, fx:0.27, fy:0.53 },
    { name:"Azure",      src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg",             cx:0.18, cy:0.45, ax:0.06, ay:0.11, fx:0.44, fy:0.35 },
    { name:"AWS",        src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg", cx:0.83, cy:0.45, ax:0.06, ay:0.08, fx:0.36, fy:0.58 },
    { name:"Kubernetes", src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",      cx:0.25, cy:0.12, ax:0.08, ay:0.09, fx:0.48, fy:0.32 },
    { name:"PostgreSQL", src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",   cx:0.76, cy:0.10, ax:0.07, ay:0.11, fx:0.33, fy:0.51 },
    { name:"React",      src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",             cx:0.14, cy:0.85, ax:0.06, ay:0.08, fx:0.55, fy:0.42 },
    { name:"GitHub",     src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",           cx:0.86, cy:0.86, ax:0.06, ay:0.09, fx:0.39, fy:0.46 },
    { name:"Flask",      src:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",             cx:0.50, cy:0.06, ax:0.07, ay:0.07, fx:0.29, fy:0.61 },
    { name:"Scikit",     src:"https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg",         cx:0.50, cy:0.92, ax:0.07, ay:0.06, fx:0.63, fy:0.37 },
];

// ── Auto-demo AI chat — scripted Q&A that plays itself, with live input capability
const DEMO_SCRIPT = [
    {
        q: "What did you build at Nordex SE?",
        a: "I built an internal AI assistant using Azure AI Foundry and a custom RAG pipeline over 1,690 documents. It reduced inference costs by 11× compared to the native setup. I also built a rapidfuzz tool router to solve a core Azure limitation. 🚀",
    },
    {
        q: "What's your strongest technical skill?",
        a: "RAG pipelines and LLM orchestration on Azure. I've moved from prototype to production — handling chunking strategies, embedding models, and evaluation loops. Python + Azure AI is where I'm most dangerous. ⚡",
    },
    {
        q: "Are you open to work?",
        a: "Yes — actively looking for AI/Data Engineering roles. I'm based in Hamburg and open to relocation. My sweet spot is production AI systems, not just notebooks. Let's talk! 🎯",
    },
    {
        q: "Tell me about your MSc research.",
        a: "MSc Data Science at TU Hamburg. Focused on neural networks and large-scale data pipelines. I also built a Digital Twin dashboard with anomaly detection during my research — full CI/CD with GitHub Actions + Docker. 📚",
    },
];

function AutoDemoChat({ T, dark }) {
    const [msgs, setMsgs]     = useState([]);
    const [inp, setInp]       = useState("");
    const [busy, setBusy]     = useState(false);
    const [typing, setTyping] = useState("");
    const [phase, setPhase]   = useState("idle"); // idle | typing-q | typing-a | done
    const scrollRef = useRef(null);
    const demoIdx   = useRef(0);
    const inputRef  = useRef(null);

    const scroll = useCallback(() => {
        setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 40);
    }, []);

    // Typewriter util
    const typeText = useCallback((text, onChar, onDone, speed=28) => {
        let i = 0;
        const go = () => {
            if (i <= text.length) { onChar(text.slice(0, i)); i++; setTimeout(go, speed + Math.random()*18); }
            else onDone();
        };
        go();
    }, []);

    // Run one demo turn
    const runDemoTurn = useCallback(() => {
        const idx = demoIdx.current % DEMO_SCRIPT.length;
        const { q, a } = DEMO_SCRIPT[idx];
        demoIdx.current++;

        // Type the question into input bar
        setPhase("typing-q");
        typeText(q, (s) => setInp(s), () => {
            // Submit after a beat
            setTimeout(() => {
                setMsgs(prev => [...prev, { r:"u", t:q }]);
                setInp("");
                setPhase("typing-a");
                scroll();
                // Show typing indicator, then type answer
                setTimeout(() => {
                    setBusy(true);
                    setTimeout(() => {
                        setBusy(false);
                        typeText(a, (s) => setTyping(s), () => {
                            setMsgs(prev => [...prev, { r:"b", t:a }]);
                            setTyping("");
                            setPhase("idle");
                            scroll();
                            // Queue next turn
                            setTimeout(runDemoTurn, 5500);
                        }, 22);
                    }, 900 + Math.random()*400);
                }, 300);
            }, 600);
        }, 38);
    }, [typeText, scroll]);

    useEffect(() => {
        const t = setTimeout(runDemoTurn, 2000);
        return () => clearTimeout(t);
    }, []);

    // Manual send (real API)
    const DEV_KEY = import.meta.env.VITE_GROQ_KEY;
    const DEV_SYS = `You are Farhan Shahriyar's AI. Speak as Farhan in first person. MSc Data Science TUHH. Werkstudent Nordex SE. RAG pipeline 1,690 docs, 11× cost reduction. Projects: Poultry Shield 97.51%, Radiation Tracker, StockFlow. Skills: Python, Azure AI, RAG, MLOps, Kafka, Docker. Under 80 words. Warm and specific.`;
    const hist = useRef([]);

    const sendManual = async (txt) => {
        if (!txt.trim() || busy || phase !== "idle") return;
        setMsgs(prev => [...prev, { r:"u", t:txt }]);
        setInp(""); scroll(); setBusy(true);
        hist.current = [...hist.current, { role:"user", content:txt }];
        try {
            let data;
            if (DEV_KEY) {
                const res = await fetch("https://api.groq.com/openai/v1/chat/completions", { method:"POST", headers:{"Content-Type":"application/json","Authorization":`Bearer ${DEV_KEY}`}, body:JSON.stringify({ model:"llama-3.3-70b-versatile", messages:[{role:"system",content:DEV_SYS},...hist.current], max_tokens:180, temperature:0.72 }) });
                data = await res.json();
            } else {
                const res = await fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ messages:hist.current }) });
                data = await res.json();
            }
            const reply = data.choices[0].message.content;
            hist.current = [...hist.current, { role:"assistant", content:reply }];
            setMsgs(prev => [...prev, { r:"b", t:reply }]);
            scroll();
        } catch { setMsgs(prev => [...prev, { r:"b", t:"Something went wrong — try again!" }]); }
        finally { setBusy(false); }
    };

    return (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", overflow:"hidden" }}>
            {/* Messages */}
            <div ref={scrollRef} style={{ flex:1, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10, scrollbarWidth:"thin", scrollbarColor:`${T.a}30 transparent` }}>
                {msgs.length === 0 && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:8, opacity:0.5 }}>
                        <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${T.a},${T.a2||T.a})`, display:"flex", alignItems:"center", justifyContent:"center", ...sf, fontSize:17, color:"#fff", fontWeight:700 }}>F</div>
                        <div style={{ ...mono, fontSize:10, color:T.m }}>Starting AI demo…</div>
                    </div>
                )}
                {msgs.map((m, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:m.r==="u"?"flex-end":"flex-start" }}>
                        {m.r==="b" && <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${T.a},${T.a2||T.a})`, flexShrink:0, marginRight:7, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center", ...sf, fontSize:9, color:"#fff", fontWeight:700 }}>F</div>}
                        <div style={{ maxWidth:"82%", ...fm, fontSize:12, lineHeight:1.6, background:m.r==="u" ? T.a : T.bg, color:m.r==="u" ? "#fff" : T.t, padding:"9px 14px", borderRadius:m.r==="u"?"16px 16px 4px 16px":"4px 16px 16px 16px", boxShadow:T.neuSm }}>
                            {m.t}
                        </div>
                    </div>
                ))}
                {/* Live typing AI answer */}
                {typing && (
                    <div style={{ display:"flex", justifyContent:"flex-start", alignItems:"flex-start" }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${T.a},${T.a2||T.a})`, flexShrink:0, marginRight:7, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center", ...sf, fontSize:9, color:"#fff", fontWeight:700 }}>F</div>
                        <div style={{ maxWidth:"82%", ...fm, fontSize:12, lineHeight:1.6, background:T.bg, color:T.t, padding:"9px 14px", borderRadius:"4px 16px 16px 16px", boxShadow:T.neuSm }}>
                            {typing}<span style={{ display:"inline-block", width:2, height:"1em", background:T.a, animation:"cur-blink 0.8s infinite", verticalAlign:"middle", borderRadius:1, marginLeft:2 }} />
                        </div>
                    </div>
                )}
                {busy && !typing && (
                    <div style={{ display:"flex", justifyContent:"flex-start", alignItems:"center", gap:7 }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg,${T.a},${T.a2||T.a})`, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", ...sf, fontSize:9, color:"#fff", fontWeight:700 }}>F</div>
                        <div style={{ display:"flex", gap:5, background:T.bg, padding:"10px 14px", borderRadius:"4px 16px 16px 16px", boxShadow:T.neuSm }}>
                            {[0,0.2,0.4].map(d => <div key={d} style={{ width:6, height:6, borderRadius:"50%", background:T.a, animation:`dot-pulse 1.2s ${d}s infinite` }} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Input bar */}
            <div style={{ padding:"10px 12px 12px", borderTop:`1px solid ${T.border}30` }}>
                <div style={{ background:T.bg, boxShadow:T.neuSm, borderRadius:28, padding:"6px 6px 6px 14px", display:"flex", alignItems:"center", gap:8, transition:"box-shadow 0.25s" }}>
                    <input
                        ref={inputRef}
                        value={inp}
                        onChange={e => { if (phase === "idle") setInp(e.target.value); }}
                        onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendManual(inp); } }}
                        placeholder={phase==="idle" ? "Ask your own question…" : "AI is typing…"}
                        style={{ flex:1, background:"transparent", border:"none", color:T.t, ...fm, fontSize:12, outline:"none", minWidth:0, padding:"4px 0" }}
                    />
                    <button onClick={() => sendManual(inp)} disabled={busy || !inp.trim() || phase!=="idle"}
                        style={{ width:34, height:34, borderRadius:"50%", background:(busy||!inp.trim()||phase!=="idle") ? "transparent" : T.a, border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", opacity:(busy||!inp.trim()||phase!=="idle")?0.35:1, transition:"all 0.2s", flexShrink:0, boxShadow:(busy||!inp.trim()||phase!=="idle")?"none":`0 0 14px ${T.a}50` }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={(busy||!inp.trim())?T.m:"white"} strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
                <div style={{ ...mono, fontSize:8, color:T.m, marginTop:6, textAlign:"center", opacity:0.5, letterSpacing:"0.08em" }}>Llama 3.3 · Groq · Live</div>
            </div>
        </div>
    );
}

// ── Floating icon that drifts on a Lissajous path with burst-on-hover effect
function FloatingIcon({ icon, T, dark, mouseRef }) {
    const ref    = useRef(null);
    const state  = useRef({ burst:false, burstT:0, scale:1, glow:0 });

    useEffect(() => {
        const el  = ref.current; if (!el) return;
        const { cx, cy, ax, ay, fx, fy } = icon;
        const ph  = Math.random() * Math.PI * 2;
        const ph2 = Math.random() * Math.PI * 2;
        let raf;

        const loop = (t) => {
            const ts = t / 1000;
            const vw = window.innerWidth, vh = window.innerHeight;
            const x  = (cx + Math.sin(ts * fx + ph)  * ax) * vw;
            const y  = (cy + Math.sin(ts * fy + ph2) * ay) * vh;

            // Mouse proximity
            const mx = mouseRef.current.x, my = mouseRef.current.y;
            const dx = x - mx, dy = y - my, dist = Math.sqrt(dx*dx+dy*dy);
            const near = dist < 90;

            // Burst trigger
            if (near && !state.current.burst) {
                state.current.burst = true;
                state.current.burstT = ts;
            }
            if (!near && state.current.burst && (ts - state.current.burstT) > 0.8) {
                state.current.burst = false;
            }

            const bAge   = state.current.burst ? Math.min(1, (ts - state.current.burstT) / 0.5) : 0;
            const glow   = near ? 1 : Math.max(0, 1 - (ts - state.current.burstT) / 0.6);
            const s      = state.current.burst ? 1 + Math.sin(bAge * Math.PI) * 0.35 : 1;

            el.style.left      = `${x - 24}px`;
            el.style.top       = `${y - 24}px`;
            el.style.transform = `scale(${s})`;

            const neuSm = dark
                ? `3px 3px 8px rgba(10,10,18,0.8),-3px -3px 8px rgba(49,50,68,0.6),0 0 ${glow*22}px ${T.a}60`
                : `3px 3px 8px rgba(163,171,196,0.55),-3px -3px 8px rgba(255,255,255,0.85),0 0 ${glow*18}px ${T.a}50`;
            el.style.boxShadow = neuSm;

            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [icon, T, dark]);

    return (
        <div ref={ref} title={icon.name} style={{
            position:"absolute", width:48, height:48, borderRadius:"50%", background:T.bg,
            display:"flex", alignItems:"center", justifyContent:"center",
            pointerEvents:"none", zIndex:7, transition:"box-shadow 0.15s", willChange:"transform,left,top",
        }}>
            <img src={icon.src} alt={icon.name} width={26} height={26} style={{ objectFit:"contain" }} onError={e=>{e.target.style.display="none";}} />
        </div>
    );
}

// ── Counter hook
function useCounter(target, dur=1800, delay=600) {
    const [val,setVal]=useState(0);
    useEffect(()=>{
        let raf,start=null;
        const tid=setTimeout(()=>{
            raf=requestAnimationFrame(function step(ts){if(!start)start=ts;const p=Math.min((ts-start)/dur,1);setVal(Math.round((1-Math.pow(1-p,3))*target));if(p<1)raf=requestAnimationFrame(step);});
        },delay);
        return()=>{clearTimeout(tid);cancelAnimationFrame(raf);};
    },[target,dur,delay]);
    return val;
}

// ── HUD card — neumorphic + float + 3D tilt
function HudCard({ T, accentColor, tag, title, desc, stat, statSuffix="", statLabel, floatAmp, floatSpeed, floatDelay }) {
    const ref=useRef(null);
    const counter=useCounter(stat,1800,700+floatDelay*900);
    const tilt=useRef({x:0,y:0});
    useEffect(()=>{
        const el=ref.current;if(!el)return;
        let raf;const t0=performance.now()-floatDelay*1000;
        const loop=(now)=>{const t=(now-t0)/1000;const fy=Math.sin(t*floatSpeed*2*Math.PI)*floatAmp;el.style.transform=`translateY(${fy}px) perspective(600px) rotateY(${tilt.current.x}deg) rotateX(${-tilt.current.y}deg)`;raf=requestAnimationFrame(loop);};
        raf=requestAnimationFrame(loop);return()=>cancelAnimationFrame(raf);
    },[floatAmp,floatSpeed,floatDelay]);
    const dv=stat>999?`${Math.floor(counter/1000)},${String(counter%1000).padStart(3,"0")}`:counter;
    return(
        <div ref={ref}
            onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();tilt.current={x:((e.clientX-r.left)/r.width-.5)*10,y:((e.clientY-r.top)/r.height-.5)*10};}}
            onMouseLeave={()=>{tilt.current={x:0,y:0};}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=T.neuHover}
            onMouseOut={e=>e.currentTarget.style.boxShadow=T.neu}
            style={{position:"relative",overflow:"hidden",background:T.bg,boxShadow:T.neu,borderRadius:20,padding:"16px 20px",willChange:"transform",cursor:"default",transition:"box-shadow 0.25s",marginBottom:14}}>
            <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:2,borderRadius:2,background:`linear-gradient(to right,transparent,${accentColor},transparent)`}}/>
            <div style={{...fm,fontSize:9,color:accentColor,letterSpacing:"0.22em",fontWeight:800,textTransform:"uppercase",marginBottom:6}}>{tag}</div>
            <div style={{...sf,fontSize:14,color:T.t,fontWeight:700,lineHeight:1.3,marginBottom:8}}>{title}</div>
            <div style={{...fm,fontSize:11,color:T.m,lineHeight:1.6,marginBottom:12}}>{desc}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                <span style={{...sf,fontSize:28,fontWeight:900,color:accentColor,lineHeight:1}}>{dv}</span>
                <span style={{...sf,fontSize:14,color:accentColor,fontWeight:700}}>{statSuffix}</span>
                <span style={{...fm,fontSize:10,color:T.m,marginLeft:5}}>{statLabel}</span>
            </div>
        </div>
    );
}

// ── Typewriter hook
function useTypewriter(lines,speed=38,pause=2200){
    const[display,setDisplay]=useState("");
    const[li,setLi]=useState(0);
    const[ci,setCi]=useState(0);
    const[era,setEra]=useState(false);
    useEffect(()=>{const cur=lines[li];let t;
        if(!era){if(ci<cur.length)t=setTimeout(()=>setCi(c=>c+1),speed);else t=setTimeout(()=>setEra(true),pause);}
        else{if(ci>0)t=setTimeout(()=>setCi(c=>c-1),speed/2);else{setEra(false);setLi(l=>(l+1)%lines.length);}}
        setDisplay(cur.slice(0,ci));return()=>clearTimeout(t);
    },[ci,era,li,lines,speed,pause]);
    return display;
}

export default function HeroMindblowing({ T, dark, onOpenResume }) {
    const [isMobile, setIsMobile] = useState(false);
    const canvasRef   = useRef(null);
    const trailRef    = useRef(null);
    const mouseRef    = useRef({ x: -999, y: -999 });

    const TYPED_LINES = [
        "Built RAG pipeline → 11× cost reduction",
        "97.51% CNN accuracy on medical imaging",
        "Real-time Kafka streaming at Nordex SE",
        "MSc Data Science · TU Hamburg",
    ];
    const typed = useTypewriter(TYPED_LINES, 36, 2100);

    useEffect(()=>{
        const check=()=>setIsMobile(window.innerWidth<1000);
        check(); window.addEventListener("resize",check);
        return()=>window.removeEventListener("resize",check);
    },[]);

    // Track mouse globally for FloatingIcon proximity
    useEffect(()=>{
        const mm=e=>{mouseRef.current={x:e.clientX,y:e.clientY};};
        window.addEventListener("mousemove",mm);
        return()=>window.removeEventListener("mousemove",mm);
    },[]);

    // Mouse trail
    useEffect(()=>{
        const C=trailRef.current;if(!C)return;
        const ctx=C.getContext("2d");
        const rz=()=>{C.width=window.innerWidth;C.height=window.innerHeight;};
        rz();window.addEventListener("resize",rz);
        const parse=(hex)=>{const d=document.createElement("div");d.style.color=hex;document.body.appendChild(d);const s=getComputedStyle(d).color;document.body.removeChild(d);const m=s.match(/\d+/g);return m?m.map(Number):[137,180,250];};
        const[r1,g1,b1]=parse(T.a),[r2,g2,b2]=parse(T.a2||"#cba6f7");
        const trails=[];
        const mm=e=>{const x=e.clientX,y=e.clientY;for(let i=0;i<3;i++)trails.push({x:x+(Math.random()-.5)*6,y:y+(Math.random()-.5)*6,life:1,size:2+Math.random()*3,t:Math.random()});};
        window.addEventListener("mousemove",mm);
        let raf;
        const render=()=>{ctx.clearRect(0,0,C.width,C.height);for(let i=trails.length-1;i>=0;i--){const tr=trails[i];tr.life-=0.04;tr.size*=0.97;if(tr.life<=0){trails.splice(i,1);continue;}const cr=Math.round(r1+(r2-r1)*tr.t),cg=Math.round(g1+(g2-g1)*tr.t),cb=Math.round(b1+(b2-b1)*tr.t);ctx.beginPath();ctx.arc(tr.x,tr.y,Math.max(0.1,tr.size*tr.life),0,Math.PI*2);ctx.fillStyle=`rgba(${cr},${cg},${cb},${tr.life*0.5})`;ctx.fill();}raf=requestAnimationFrame(render);};
        raf=requestAnimationFrame(render);
        return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",rz);window.removeEventListener("mousemove",mm);};
    },[T]);

    // Particle engine
    useEffect(()=>{
        const C=canvasRef.current;if(!C)return;
        const ctx=C.getContext("2d",{alpha:false});
        let w,h,cx,cy;
        const rz=()=>{w=C.width=window.innerWidth;h=C.height=window.innerHeight;cx=w/2;cy=h/2;};
        rz();window.addEventListener("resize",rz);
        const PC=isMobile?500:1800;
        const pts=[];
        const parse=(hex)=>{const d=document.createElement("div");d.style.color=hex;document.body.appendChild(d);const s=getComputedStyle(d).color;document.body.removeChild(d);const m=s.match(/\d+/g);return m?m.map(Number):[255,255,255];};
        const[rA,gA,bA]=parse(T.a),[rB,gB,bB]=parse(T.a2||"#8839ef"),[rBg,gBg,bBg]=parse(T.bg);
        for(let i=0;i<PC;i++){
            const u=Math.random(),v=Math.random(),th=2*Math.PI*u,ph=Math.acos(2*v-1);
            const rb=isMobile?130:230,rs=rb+(Math.random()*35-17)+(Math.random()<0.1?60:0);
            const sx=rs*Math.sin(ph)*Math.cos(th),sy=rs*Math.sin(ph)*Math.sin(th),sz=rs*Math.cos(ph);
            const tkT=i*(Math.PI*2*3.5/PC),p2=3,q=5,rt=(isMobile?65:130)*(1.5+Math.sin(q*tkT));
            const ro=()=>(Math.random()-.5)*50;
            const tx=rt*Math.cos(p2*tkT)+ro(),ty=rt*Math.sin(p2*tkT)+ro(),tz=(isMobile?100:165)*Math.cos(q*tkT)+ro();
            const sa=i*0.02+Math.random(),sr=i*(isMobile?0.25:0.34);
            pts.push({sx,sy,sz,tx,ty,tz,gx:sr*Math.cos(sa)*1.5+ro(),gy:(Math.random()-.5)*Math.max(10,80-sr*0.2),gz:sr*Math.sin(sa)*1.5+ro(),x:sx,y:sy,z:sz,vx:0,vy:0,vz:0,co:Math.random(),sp:Math.random()});
        }
        let mouse={x:w/2,y:h/2,tx:w/2,ty:h/2,on:false},G={rX:0,rY:0,rZ:0},mode=0,lerp=0;
        const mm=e=>{mouse.tx=e.clientX;mouse.ty=e.clientY;mouse.on=true;mouseRef.current={x:e.clientX,y:e.clientY};};
        const ml=()=>mouse.on=false;
        const mt=e=>{if(e.touches[0]){mouse.tx=e.touches[0].clientX;mouse.ty=e.touches[0].clientY;mouse.on=true;}};
        window.addEventListener("mousemove",mm);window.addEventListener("mouseleave",ml);window.addEventListener("touchmove",mt,{passive:true});
        const timer=setInterval(()=>{mode=(mode+1)%3;lerp=0;},10000);
        let raf;
        const render=()=>{
            lerp=Math.min(1,lerp+0.007);
            ctx.globalCompositeOperation="source-over";
            ctx.fillStyle=`rgba(${rBg},${gBg},${bBg},${dark?0.18:0.33})`;ctx.fillRect(0,0,w,h);
            if(mouse.on){mouse.x+=(mouse.tx-mouse.x)*0.08;mouse.y+=(mouse.ty-mouse.y)*0.08;}
            else{mouse.x+=(cx-mouse.x)*0.02;mouse.y+=(cy-mouse.y)*0.02;}
            G.rY+=0.003;G.rX=(mouse.y-cy)*0.0005+0.2;G.rZ=(mouse.x-cx)*0.0005;
            const cX=Math.cos(G.rX),sX=Math.sin(G.rX),cY=Math.cos(G.rY),sY=Math.sin(G.rY),cZ=Math.cos(G.rZ),sZ=Math.sin(G.rZ);
            const ease=lerp<0.5?2*lerp*lerp:-1+(4-2*lerp)*lerp;
            ctx.globalCompositeOperation=dark?"screen":"multiply";
            for(let i=0;i<PC;i++){
                const p=pts[i];
                let tX,tY,tZ,pX,pY,pZ;
                if(mode===0){tX=p.sx;tY=p.sy;tZ=p.sz;pX=p.gx;pY=p.gy;pZ=p.gz;}
                else if(mode===1){tX=p.tx;tY=p.ty;tZ=p.tz;pX=p.sx;pY=p.sy;pZ=p.sz;}
                else{tX=p.gx;tY=p.gy;tZ=p.gz;pX=p.tx;pY=p.ty;pZ=p.tz;}
                const ex=pX+(tX-pX)*ease,ey=pY+(tY-pY)*ease,ez=pZ+(tZ-pZ)*ease;
                p.vx+=(ex-p.x)*.02;p.vy+=(ey-p.y)*.02;p.vz+=(ez-p.z)*.02;
                p.vx*=.85;p.vy*=.85;p.vz*=.85;p.x+=p.vx;p.y+=p.vy;p.z+=p.vz;
                let rx=p.x*cZ-p.y*sZ,ry=p.y*cZ+p.x*sZ,rz=p.z;
                let tx2=rx*cY+rz*sY;rz=rz*cY-rx*sY;rx=tx2;
                let ty2=ry*cX-rz*sX;rz=ry*sX+rz*cX;ry=ty2;
                if(rz<-800)continue;
                const pr=850/(850+rz),ppx=rx*pr+cx,ppy=ry*pr+cy;
                const dx=ppx-mouse.x,dy=ppy-mouse.y,ds=dx*dx+dy*dy;
                if(ds<20000){const f=(20000-ds)/20000;p.vx+=dx*f*.013;p.vy+=dy*f*.013;p.vz-=f*.45;}
                const bl=Math.max(0,Math.min(1,(rz+400)/800+p.co*0.3));
                const r=Math.round(rA+(rB-rA)*bl),g=Math.round(gA+(gB-gA)*bl),b=Math.round(bA+(bB-bA)*bl);
                const al=Math.min(1,Math.max(0.1,pr*1.5-.5)),sz=Math.max(0.2,(p.sp>.9?2.5:1)*pr*1.5);
                ctx.fillStyle=`rgba(${r},${g},${b},${al})`;ctx.beginPath();ctx.arc(ppx,ppy,sz,0,Math.PI*2);ctx.fill();
                if(i%28===0&&al>0.4){const nb=pts[(i+15)%PC],nrx=nb.x*cZ-nb.y*sZ,nry=nb.y*cZ+nb.x*sZ,nrz=nb.z;const np=850/(850+(nrz*cY-nrx*sY));ctx.beginPath();ctx.moveTo(ppx,ppy);ctx.lineTo((nrx*cY+nrz*sY)*np+cx,(nry*cX-(nrz*cY-nrx*sY)*sX)*np+cy);ctx.strokeStyle=`rgba(${r},${g},${b},${al*.2})`;ctx.lineWidth=0.5;ctx.stroke();}
            }
            raf=requestAnimationFrame(render);
        };
        raf=requestAnimationFrame(render);
        return()=>{cancelAnimationFrame(raf);clearInterval(timer);window.removeEventListener("resize",rz);window.removeEventListener("mousemove",mm);window.removeEventListener("mouseleave",ml);window.removeEventListener("touchmove",mt);};
    },[T,dark,isMobile]);

    const HUD_CARDS = [
        {tag:"RAG Pipeline Specialist",title:"Led Enterprise AI at Nordex SE",desc:"Custom RAG over 1,690+ docs.",stat:1690,statSuffix:"+",statLabel:"docs indexed",accentColor:T.a,floatAmp:10,floatSpeed:0.48,floatDelay:0},
        {tag:"Production Impact",title:"Cost Reduction vs GPT-4 Native",desc:"Custom LLM router cut API costs.",stat:11,statSuffix:"×",statLabel:"cost decrease",accentColor:T.a2||"#8839ef",floatAmp:9,floatSpeed:0.44,floatDelay:1.5},
        {tag:"Academic Foundation",title:"MSc Data Science — TU Hamburg",desc:"Neural networks, massive datasets.",stat:215,statSuffix:"",statLabel:"OSS commits",accentColor:T.a,floatAmp:12,floatSpeed:0.52,floatDelay:0.9},
    ];

    return (
        <section id="home" style={{position:"relative",width:"100%",height:"100vh",background:T.bg,overflow:"hidden"}}>
            <style>{`
                @keyframes hero-pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.35;transform:scale(1.8);}}
                @keyframes blink{0%,100%{opacity:.2;}50%{opacity:1;}}
                @keyframes cur-blink{0%,100%{opacity:.2;}50%{opacity:1;}}
                @keyframes dot-pulse{0%,80%,100%{transform:scale(0);}40%{transform:scale(1);}}
                @keyframes fadeSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes glitch-wave{0%,100%{transform:translateY(0) skewX(0);}30%{transform:translateY(-3px) skewX(-0.8deg);}60%{transform:translateY(1px) skewX(0.4deg);}}
                @keyframes letter-glow{0%,100%{text-shadow:none;opacity:1;}50%{text-shadow:0 0 16px var(--gc,#89b4fa),0 0 36px var(--gc,#89b4fa)33;opacity:.9;}}
                .gl{animation:glitch-wave 5s ease-in-out infinite, letter-glow 4s ease-in-out infinite;}
                .h-soc{transition:all .22s cubic-bezier(.16,1,.3,1);}
                .h-soc:hover{transform:scale(1.13) translateY(-2px)!important;}
                .hud-tray{scrollbar-width:none;-ms-overflow-style:none;}
                .hud-tray::-webkit-scrollbar{display:none;}
                .mhc{animation:hmf 4s ease-in-out infinite;}
                @keyframes hmf{0%,100%{transform:translateY(0);}50%{transform:translateY(-7px);}}
            `}</style>

            {/* Canvas + Trail */}
            <div style={{position:"absolute",inset:0,zIndex:0}}>
                <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",boxShadow:dark?"inset 0 0 200px rgba(0,0,0,0.6)":"inset 0 0 200px rgba(255,255,255,0.55)"}}/>
                <canvas ref={canvasRef} style={{display:"block",width:"100%",height:"100%"}}/>
            </div>
            <canvas ref={trailRef} style={{position:"absolute",inset:0,zIndex:8,pointerEvents:"none",width:"100%",height:"100%"}}/>

            {/* Freely floating tech icons scattered across the entire hero */}
            {!isMobile && TECH_ICONS.map(icon => (
                <FloatingIcon key={icon.name} icon={icon} T={T} dark={dark} mouseRef={mouseRef} />
            ))}

            {/* ── DESKTOP THREE-COLUMN LAYOUT ── */}
            {!isMobile && (
                <div style={{position:"absolute",inset:0,zIndex:10,display:"grid",gridTemplateColumns:"340px 1fr 300px",gridTemplateRows:"1fr",gap:0,padding:"0",pointerEvents:"none"}}>

                    {/* LEFT: Persistent AI Chat */}
                    <div style={{gridColumn:1,gridRow:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"80px 0 40px 32px",pointerEvents:"auto",animation:"fadeSlideUp 0.8s 0.3s both",opacity:0}}>
                        <div style={{background:T.bg,boxShadow:T.neu,borderRadius:22,overflow:"hidden",height:"min(420px, 55vh)",display:"flex",flexDirection:"column"}}>
                            {/* Chat header */}
                            <div style={{display:"flex",alignItems:"center",gap:10,padding:"13px 16px",borderBottom:`1px solid ${T.border}30`}}>
                                <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${T.a},${T.a2||T.a})`,display:"flex",alignItems:"center",justifyContent:"center",...sf,fontSize:13,color:"#fff",fontWeight:700}}>F</div>
                                <div style={{flex:1}}>
                                    <div style={{...sf,fontSize:13,fontWeight:700,color:T.t}}>Farhan's AI Assistant</div>
                                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                                        <span style={{width:5,height:5,borderRadius:"50%",background:"#10B981",animation:"hero-pulse 2.5s infinite"}}/>
                                        <span style={{...mono,fontSize:8.5,color:T.m,letterSpacing:"0.1em"}}>LIVE · Llama 3.3 · Groq</span>
                                    </div>
                                </div>
                                <div style={{...mono,fontSize:8,color:T.a,letterSpacing:"0.1em",background:`${T.a}15`,padding:"3px 8px",borderRadius:8}}>AI DEMO</div>
                            </div>
                            <AutoDemoChat T={T} dark={dark} />
                        </div>
                    </div>

                    {/* CENTER: Name + Profile + Socials */}
                    <div style={{gridColumn:2,gridRow:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:"8%",gap:0,pointerEvents:"auto"}}>
                        {/* Status */}
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,animation:"fadeSlideUp 0.6s 0.1s both",opacity:0}}>
                            <span style={{width:7,height:7,borderRadius:"50%",background:T.a,animation:"hero-pulse 2.5s infinite",boxShadow:`0 0 10px ${T.a}`}}/>
                            <span style={{...mono,fontSize:9,fontWeight:600,color:T.a,letterSpacing:"0.18em"}}>SYS::ONLINE — OPEN FOR IMPACT</span>
                        </div>

                        {/* Glitch name */}
                        <div style={{textAlign:"center",mixBlendMode:dark?"lighten":"darken",animation:"fadeSlideUp 0.7s 0.2s both",opacity:0}}>
                            <h1 style={{...sf,fontSize:"clamp(62px,7.5vw,130px)",fontWeight:900,lineHeight:0.88,letterSpacing:"-0.05em",margin:0,color:dark?"rgba(255,255,255,0.94)":"rgba(10,12,20,0.92)",textTransform:"uppercase",padding:"0 8px"}}>
                                {"FARHAN".split("").map((ch,i)=><span key={i} className="gl" style={{display:"inline-block",animationDelay:`${i*0.15}s`,"--gc":T.a}}>{ch}</span>)}<br/>
                                {"SHAHRIYAR".split("").map((ch,i)=><span key={i} className="gl" style={{display:"inline-block",animationDelay:`${(i+6)*0.15}s`,"--gc":T.a2||T.a}}>{ch}</span>)}
                            </h1>
                            <div style={{...mono,fontSize:11.5,color:T.a,marginTop:12,letterSpacing:"0.03em",minHeight:"1.4em",display:"flex",alignItems:"center",justifyContent:"center",gap:5,animation:"fadeSlideUp 0.7s 0.45s both",opacity:0}}>
                                <span style={{color:T.a2||T.a}}>›</span>{typed}<span style={{display:"inline-block",width:2,height:"1em",background:T.a,animation:"blink 1s infinite",verticalAlign:"middle",borderRadius:1}}/>
                            </div>
                        </div>

                        {/* Profile image — centred inside the sphere area */}
                        <div style={{marginTop:10,animation:"fadeSlideUp 0.8s 0.35s both",opacity:0}}>
                            <HeroProfile T={T} dark={dark} size="clamp(90px,8.5vw,138px)" />
                        </div>

                        {/* Socials + Resume */}
                        <div style={{position:"absolute",bottom:"8%",display:"flex",flexDirection:"column",alignItems:"center",gap:14,animation:"fadeSlideUp 0.9s 0.6s both",opacity:0}}>
                            <div onClick={onOpenResume} style={{...fm,fontSize:10,fontWeight:700,color:T.t,letterSpacing:"0.14em",textTransform:"uppercase",padding:"12px 32px",borderRadius:40,cursor:"pointer",background:T.bg,boxShadow:T.neu,transition:"all 0.25s"}} onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.neuHover;e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.color=T.a;}} onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.neu;e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.color=T.t;}}>
                                Access Full Profile
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                                {SOCIAL.map((s,i)=>(
                                    <a key={i} href={s.href} target="_blank" rel="noreferrer" title={s.label} className="h-soc"
                                        style={{width:42,height:42,borderRadius:"50%",background:T.bg,boxShadow:T.neuSm,display:"flex",alignItems:"center",justifyContent:"center",color:T.m,flexShrink:0,transition:"all 0.22s"}}
                                        onMouseEnter={e=>{e.currentTarget.style.boxShadow=T.neuInset;e.currentTarget.style.color=T.a;}}
                                        onMouseLeave={e=>{e.currentTarget.style.boxShadow=T.neuSm;e.currentTarget.style.color=T.m;}}
                                    >{s.icon}</a>
                                ))}
                            </div>
                            <div style={{opacity:.25,width:1,height:38,background:`linear-gradient(to bottom,${T.t},transparent)`}}/>
                        </div>
                    </div>

                    {/* RIGHT: HUD Cards */}
                    <div style={{gridColumn:3,gridRow:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"80px 32px 40px 0",pointerEvents:"auto",animation:"fadeSlideUp 0.8s 0.4s both",opacity:0}}>
                        {HUD_CARDS.map((c,i)=><HudCard key={i} {...c} T={T} dark={dark}/>)}
                    </div>
                </div>
            )}

            {/* ── MOBILE LAYOUT ── */}
            {isMobile && (
                <div style={{position:"absolute",inset:0,zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",paddingTop:"12%",pointerEvents:"none"}}>
                    {/* Status */}
                    <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                        <span style={{width:6,height:6,borderRadius:"50%",background:T.a,animation:"hero-pulse 2.5s infinite"}}/>
                        <span style={{...mono,fontSize:8,color:T.a,letterSpacing:"0.16em"}}>SYS::ONLINE — OPEN FOR IMPACT</span>
                    </div>
                    {/* Name */}
                    <h1 style={{...sf,fontSize:"clamp(44px,12vw,76px)",fontWeight:900,lineHeight:0.88,letterSpacing:"-0.05em",margin:0,color:dark?"rgba(255,255,255,0.94)":"rgba(10,12,20,0.92)",textTransform:"uppercase",textAlign:"center",padding:"0 12px",mixBlendMode:dark?"lighten":"darken"}}>
                        FARHAN<br/>SHAHRIYAR
                    </h1>
                    <div style={{...mono,fontSize:9,color:T.a,marginTop:10,letterSpacing:"0.03em",minHeight:"1.3em",display:"flex",alignItems:"center",gap:5}}>
                        <span style={{color:T.a2||T.a}}>›</span>{typed}<span style={{display:"inline-block",width:2,height:"1em",background:T.a,animation:"blink 1s infinite",verticalAlign:"middle",borderRadius:1}}/>
                    </div>

                    {/* Mobile HUD tray */}
                    <div className="hud-tray" style={{position:"absolute",bottom:"11%",left:0,right:0,display:"flex",overflowX:"auto",gap:12,padding:"8px 18px",pointerEvents:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>
                        {HUD_CARDS.map((card,i)=>(
                            <div key={i} className="mhc" style={{flexShrink:0,width:210,scrollSnapAlign:"center",animationDelay:`${i*0.5}s`,position:"relative",background:T.bg,boxShadow:T.neuSm,borderRadius:16,padding:"12px 16px",overflow:"hidden"}}>
                                <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:2,borderRadius:2,background:`linear-gradient(to right,transparent,${card.accentColor},transparent)`}}/>
                                <div style={{...fm,fontSize:8,color:card.accentColor,letterSpacing:"0.2em",fontWeight:800,textTransform:"uppercase",marginBottom:5}}>{card.tag}</div>
                                <div style={{...sf,fontSize:12,color:T.t,fontWeight:700,lineHeight:1.3,marginBottom:7}}>{card.title}</div>
                                <div style={{display:"flex",alignItems:"baseline",gap:2}}>
                                    <span style={{...sf,fontSize:22,fontWeight:900,color:card.accentColor}}>{card.stat}{card.statSuffix}</span>
                                    <span style={{...fm,fontSize:9,color:T.m,marginLeft:4}}>{card.statLabel}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile socials */}
                    <div style={{position:"absolute",bottom:"2%",display:"flex",alignItems:"center",gap:12,pointerEvents:"auto"}}>
                        {SOCIAL.map((s,i)=>(
                            <a key={i} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                                style={{width:40,height:40,borderRadius:"50%",background:T.bg,boxShadow:T.neuSm,display:"flex",alignItems:"center",justifyContent:"center",color:T.m}}
                            >{s.icon}</a>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
