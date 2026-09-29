import puppeteer from 'puppeteer';
// Walks every chapter at many screen sizes and reports panels that are cut off.
// usage: npm run build && npx vite preview --port 4173, then: node scripts/audit-responsive.mjs <screenshot dir> [size,size]
const S = process.argv[2] || '.', only = process.argv[3];
const SIZES = [
  ['phone-s', 360, 740, true], ['phone', 390, 844, true], ['phone-l', 430, 932, true], ['phone-land', 844, 390, true],
  ['ipad-mini', 768, 1024, true], ['narrow-win', 838, 1000, false], ['ipad-pro', 1024, 1366, true], ['ipad-land', 1180, 820, true],
  ['laptop-s', 1280, 720, false], ['laptop', 1366, 768, false], ['mac14', 1512, 945, false], ['fhd', 1920, 1080, false], ['qhd', 2560, 1440, false],
];
const STOPS = [['home', 0], ['what', 2.2], ['break', 0.05], ['experience', 1.1], ['experience', 4.2], ['projects', 0], ['projects', 4], ['journey', 0.2], ['journey', 1.5], ['journey', 2.6], ['journey', 4.2], ['skills', 0], ['contact', 0]];
const PANELS = '.pl-hero-copy, .pl-hero-dock, .pl-what-head, .pl-sat.is-out, .pl-term, .pl-floor, .pl-notebook, .pl-exp-intro, .pl-bp-slot.is-center, .pl-edu, .pl-passport, .pl-bpass, .pl-desk-left > *';
const b = await puppeteer.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] });
const W = ms => new Promise(r => setTimeout(r, ms));
let bad = 0;
for (const [tag, w, h, mob] of SIZES) {
  if (only && !only.split(',').includes(tag)) continue;
  const p = await b.newPage(); await p.setViewport({ width: w, height: h, isMobile: mob, hasTouch: mob });
  p.on('pageerror', e => console.log(tag, 'PAGEERR', e.message));
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('fs-welcomed', '1'); } catch {} });
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle0' }); await W(6000);
  for (const [id, slot] of STOPS) {
    await p.evaluate((id, slot) => { const e = document.getElementById(id); const sl = +(e.dataset.slot || 0); const y = e.getBoundingClientRect().top + scrollY + (sl ? innerHeight * sl * slot : 0); window.__lenis?.scrollTo(y, { immediate: true }); scrollTo(0, y); }, id, slot);
    await W(2600);
    const res = await p.evaluate((sel) => {
      const out = [], top = 56, vh = innerHeight, vw = innerWidth;
      document.querySelectorAll(sel).forEach(el => {
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || +cs.opacity < 0.1) return;
        if (r.bottom < 0 || r.top > vh) return; // not on screen at all
        const probs = [];
        if (r.bottom > vh + 2) probs.push(`bottom +${Math.round(r.bottom - vh)}px`);
        if (r.top < top - 30 && r.height > vh * 0.5) probs.push(`top ${Math.round(r.top)}px`);
        if (r.left < -2 || r.right > vw + 2) probs.push(`x ${Math.round(r.left)}..${Math.round(r.right)}`);
        if (probs.length) out.push(`${el.className.split(' ').slice(0, 2).join('.')} fit=${el.dataset.fit ?? el.closest('[data-fit]')?.dataset.fit ?? '-'} ${probs.join(' ')}`);
      });
      return out;
    }, PANELS);
    if (res.length) { bad += res.length; console.log(`${tag} ${w}x${h} ${id}@${slot}: ${res.join(' | ')}`); await p.screenshot({ path: `${S}/audit-${tag}-${id}-${slot}.jpg`, type: 'jpeg', quality: 50 }); }
  }
  const ox = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(`${tag} done${ox ? ' · HORIZONTAL OVERFLOW' : ''}`);
  await p.close();
}
console.log('problems:', bad);
await b.close();
