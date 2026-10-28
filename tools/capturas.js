const { chromium } = require('playwright');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const sizes = [[375,812],[812,375],[768,1024],[1280,800]];
  for (const [w,h] of sizes) {
    for (const rm of ['no-preference','reduce']) {
      const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1, reducedMotion: rm });
      const p = await ctx.newPage();
      const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
      await p.goto('http://localhost:8765/', {waitUntil:'networkidle'});
      await p.waitForTimeout(800);
      await p.screenshot({path:`${out}/${w}x${h}-${rm}-fold.png`});
      if (rm==='no-preference') {
        // scroll through to trigger reveals
        const H = await p.evaluate(()=>document.body.scrollHeight);
        for (let y=0;y<H;y+=h/2){ await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(120); }
        await p.waitForTimeout(900);
        await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(300);
        await p.screenshot({path:`${out}/${w}x${h}-full.png`, fullPage:true});
        const ov = await p.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
        console.log(w,h,'overflowX',ov,'errors',errs.join('|')||'none');
      }
      await ctx.close();
    }
  }
  await b.close();
})();
