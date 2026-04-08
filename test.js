import('puppeteer').then(async (puppeteer) => {
  const browser = await puppeteer.default.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 3000));
  
  const topEl = await page.evaluate(() => {
    let topNode = null;
    let maxZ = -1;
    const all = document.querySelectorAll('*');
    for (let i = 0; i < all.length; i++) {
        const z = parseInt(window.getComputedStyle(all[i]).zIndex, 10);
        if (!isNaN(z) && z > maxZ) {
            maxZ = z;
            topNode = all[i];
        }
    }
    return topNode ? topNode.tagName + ' Z=' + maxZ : 'NONE';
  });
  console.log('TOP ELEMENT:', topEl);
  
  const bodyStyles = await page.evaluate(() => window.getComputedStyle(document.body).cssText);
  console.log('BODY BACKGROUND:', await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor));

  await browser.close();
});
