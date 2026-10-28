const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const zooms=[25,33,50,67,75,80,90,100,110,125,150,175,200];
  for (const z of zooms) {
    const w=Math.round(1903*100/z), h=Math.round(820*100/z);
    const c=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:z/100});
    const p=await c.newPage(); await p.goto('http://localhost:8765/',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
    const m=await p.evaluate(()=>{const r=e=>{const b=document.querySelector(e).getBoundingClientRect();return [Math.round(b.left),Math.round(b.right)]};return {vw:innerWidth,wrap:r('.hero-inner'),copy:r('.hero-copy'),media:r('.hero-media'),video:document.querySelector('.hero video')?r('.hero video'):null,hdr:r('.header-row')}});
    console.log(z+'%',JSON.stringify(m));
    await p.screenshot({path:`${out}/z${z}.png`}); await c.close();
  }
  await b.close();
})();
