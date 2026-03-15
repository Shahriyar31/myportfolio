// ── FONTS ─────────────────────────────────────────────────────────────
(() => {
  const l = document.createElement("link");
  l.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap";
  l.rel = "stylesheet";
  document.head.appendChild(l);
  const l2 = document.createElement("link");
  l2.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400&display=swap";
  l2.rel = "stylesheet";
  document.head.appendChild(l2);
})();

// ── GLOBAL CSS ────────────────────────────────────────────────────────
const GS = document.createElement("style");
GS.textContent = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{overflow-x:hidden;cursor:none;transition:background .4s,color .4s;font-family:'Inter',sans-serif}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--ca);border-radius:2px}
::-webkit-scrollbar-track{background:var(--cbg)}

#cd{position:fixed;top:0;left:0;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:var(--ca);pointer-events:none;z-index:10000;box-shadow:0 0 12px var(--ca);will-change:transform;opacity:0;transition:opacity .3s}
#cr{position:fixed;top:0;left:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:1px solid var(--ca);pointer-events:none;z-index:9999;will-change:transform;opacity:0}
body.cursor-active #cd{opacity:1}
body.cursor-active #cr{opacity:.35}
body.ch #cd{width:16px;height:16px;margin:-8px 0 0 -8px;background:var(--ca)20;box-shadow:0 0 0 1px var(--ca);backdrop-filter:blur(2px)}
body.ch #cr{width:60px;height:60px;margin:-30px 0 0 -30px;opacity:.15;border:1.5px solid var(--ca);background:var(--ca)08}
@media(hover:none){#cd,#cr{display:none!important}body{cursor:auto}}
@media(max-width:768px){body{cursor:auto}#cd,#cr{display:none}}

/* ── Animations ── */
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.7;transform:scale(1.06)}}
@keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes glitch1{0%,85%,100%{transform:translate(0);opacity:0}86%{transform:translate(-4px,0);opacity:1}88%{transform:translate(4px,0);opacity:1}90%{transform:translate(0);opacity:0}}
@keyframes glitch2{0%,85%,100%{transform:translate(0);opacity:0}87%{transform:translate(4px,0);opacity:1}89%{transform:translate(-4px,0);opacity:1}91%{transform:translate(0);opacity:0}}
@keyframes headingReveal{from{clip-path:inset(0 100% 0 0);opacity:0}to{clip-path:inset(0 0% 0 0);opacity:1}}
@keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
@keyframes borderGlow{0%,100%{border-color:var(--ca)}50%{border-color:var(--ca2)}}
@keyframes marqueeScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-33.33%)}}
@keyframes drawPath{to{stroke-dashoffset:0}}
@keyframes lbEnter{from{opacity:0;transform:scale(.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes dnaFloat{0%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-20px) rotate(180deg)}100%{transform:translateY(0) rotate(360deg)}}
@keyframes dataStream{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
@keyframes dotPulse{0%,100%{transform:scale(1);opacity:.35}50%{transform:scale(1.8);opacity:.75}}
@keyframes orbitA{from{transform:rotate(0deg) translateX(60px) rotate(0deg)}to{transform:rotate(360deg) translateX(60px) rotate(-360deg)}}
@keyframes orbitB{from{transform:rotate(0deg) translateX(100px) rotate(0deg)}to{transform:rotate(-360deg) translateX(100px) rotate(360deg)}}
@keyframes orbitC{from{transform:rotate(45deg) translateX(140px) rotate(-45deg)}to{transform:rotate(405deg) translateX(140px) rotate(-405deg)}}
@keyframes sonarPulse{0%{transform:scale(.2);opacity:.7}100%{transform:scale(3);opacity:0}}
@keyframes constellationDraw{0%{stroke-dashoffset:1000}100%{stroke-dashoffset:0}}
@keyframes terminalBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes floatRandom{0%,100%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(10px,-15px) rotate(90deg)}50%{transform:translate(-8px,10px) rotate(180deg)}75%{transform:translate(15px,5px) rotate(270deg)}}
@keyframes skillFloat{0%,100%{transform:translateY(0)}33%{transform:translateY(-4px)}66%{transform:translateY(2px)}}
@keyframes rippleOut{0%{transform:scale(.8);opacity:.6}100%{transform:scale(1.6);opacity:0}}
@keyframes shimmerBar{0%{left:-100%}100%{left:200%}}
@keyframes blobify{0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%}}
@keyframes auraRotate{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}

/* ── Scroll reveal — more forgiving thresholds ── */
.rv{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.rv.vi{opacity:1;transform:translateY(0)}
.rv2{opacity:0;transform:translateY(24px);transition:opacity .7s .12s ease,transform .7s .12s ease}
.rv2.vi{opacity:1;transform:translateY(0)}
.rv3{opacity:0;transform:translateY(24px);transition:opacity .7s .24s ease,transform .7s .24s ease}
.rv3.vi{opacity:1;transform:translateY(0)}

/* ── Section reveal — starts visible on mobile ── */
.section{opacity:0;transform:translateY(24px);transition:opacity 1s cubic-bezier(0.16,1,0.3,1),transform 1s cubic-bezier(0.16,1,0.3,1)}
.section.vi{opacity:1;transform:translateY(0)}
@media(max-width:768px){
  .rv,.rv2,.rv3,.section{opacity:1!important;transform:translateY(0)!important;transition:none!important}
}

/* ── Section heading — Firefox fix ── */
.sec-num{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.2em;color:var(--ca);display:inline-block}
.sec-title{
  font-weight:700;letter-spacing:-.02em;line-height:1;
  background:linear-gradient(135deg,var(--ct) 0%,var(--ct) 60%,var(--ca) 100%);
  background-clip:text;
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  color:transparent;
  display:inline-block;
}
.sec-title.vi{animation:headingReveal .7s ease both}

/* ── Nav links ── */
.nav-link{
  position:relative;text-decoration:none;
  font-family:'JetBrains Mono',monospace;font-size:10px;
  letter-spacing:.14em;text-transform:uppercase;
  cursor:none;padding:7px 16px;border-radius:20px;
  border:1px solid transparent;
  transition:color .25s,background .25s,border-color .25s,transform .2s,box-shadow .25s;
  overflow:hidden;
}
.nav-link::before{
  content:'';position:absolute;inset:0;border-radius:20px;
  background:linear-gradient(135deg,var(--ca),var(--ca2));
  opacity:0;transition:opacity .25s;z-index:-1;
}
.nav-link:hover{color:#fff!important;border-color:transparent;transform:translateY(-2px);box-shadow:0 6px 20px var(--ca)40}
.nav-link:hover::before{opacity:1}
.nav-link.active-link{color:#fff!important;border-color:transparent;box-shadow:0 4px 16px var(--ca)50}
.nav-link.active-link::before{opacity:1}

/* ── Project card ── */
.pcard-line{transform:scaleX(0);transform-origin:left;transition:transform .4s cubic-bezier(.16,1,.3,1)}
.pcard:hover .pcard-line{transform:scaleX(1)}

/* ── Skill pill ── */
.spill{font-family:'JetBrains Mono',monospace;font-size:11px;padding:6px 14px;border-radius:20px;border:1px solid var(--cbr);color:var(--cm);transition:all .2s;cursor:none;display:inline-block}
.spill:hover{transform:translateY(-3px) scale(1.04)}

/* ── Side/Bottom Nav ── */
.snav-container{position:fixed;top:50%;right:16px;transform:translateY(-50%);z-index:200;display:flex;flex-direction:column;gap:8px}
.snav-item{width:40px;height:40px;border-radius:12px;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid transparent;transition:all .3s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.snav-item:hover{border-radius:16px;transform:scale(1.1)}

/* ── Layout ── */
.sec-inner{width:100%;padding:100px clamp(20px,6vw,120px)}
.about-grid{display:grid;grid-template-columns:280px 1fr;gap:48px;align-items:start;max-width:1400px}
.contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;max-width:1400px}
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px}
.hero-section{padding:96px clamp(20px,6vw,120px) 40px!important}
.hero-cols{display:flex;gap:48px;align-items:flex-start;justify-content:center;max-width:1400px;width:100%;margin:0 auto}

/* ── Responsive ── */
@media(max-width:1280px){
  .about-grid{grid-template-columns:240px 1fr;gap:36px}
  .contact-grid{gap:48px}
  .proj-grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
}
@media(max-width:1024px){
  .sec-inner{padding:80px clamp(20px,5vw,80px)}
  .about-grid{grid-template-columns:1fr!important}
  .contact-grid{grid-template-columns:1fr!important}
  .hero-cols{flex-direction:column!important;align-items:center!important;text-align:center}
  .hero-chips,.hero-stats,.hero-cta{justify-content:center!important}
}
@media(max-width:768px){
  .sec-inner{padding:64px 20px}
  .hero-section{padding:80px 20px 40px!important}
  .hero-name{font-size:clamp(40px,12vw,72px)!important}
  .proj-grid{grid-template-columns:1fr!important}
  section, .section { overflow:hidden !important; }
  .snav-container{top:auto;bottom:24px;right:50%;transform:translateX(50%);flex-direction:row;gap:12px;background:var(--cbg);padding:10px 16px;border-radius:40px;border:1px solid var(--cbr);box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:500}

  /* Disable heavy animations on mobile */
  @keyframes float{0%,100%{transform:none}}
  @keyframes pulse{0%,100%{opacity:.5;transform:none}}
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
  .snav-item,.nav-link,.rv,.rv2,.rv3,.section,.pcard { animation: none !important; transition-duration: 0.15s !important; }
}
@media(max-width:480px){
  .sec-inner{padding:48px 16px}
  .snav-container{gap:6px;padding:8px 12px;width:max-content;max-width:95vw}
  .snav-item{width:32px;height:32px}
}

/* ── Light theme text gradient fix for Firefox ── */
@supports not (-webkit-background-clip: text) {
  .sec-title { color: var(--ct) !important; background: none !important; -webkit-text-fill-color: unset !important; }
}
`;
document.head.appendChild(GS);