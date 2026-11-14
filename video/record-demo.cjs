// Records the live simulator for the demo video and logs when each step happens (for captions).
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 },
    recordVideo: { dir: 'rec', size: { width: 1080, height: 1920 } } });
  const p = await ctx.newPage();
  const t0 = Date.now(); const log = [];
  const mark = id => log.push({ id, t: (Date.now() - t0) / 1000 });
  await p.goto('https://ripasso.github.io/civichacks/');
  await p.waitForSelector('.msg.bot');
  // Recording view: the same app, phone only, filling the frame.
  await p.addStyleTag({ content: '.intro,.more{display:none!important} main{padding:0!important;display:block!important;max-width:none!important} .phone{position:static!important;border-radius:0!important;padding:0!important;box-shadow:none!important} .screen{height:960px!important;border-radius:0!important} html{zoom:2} body{font-size:22px!important} .msg{font-size:1.05rem!important}' });
  await p.waitForTimeout(2500); mark('start');
  const text = async (id, msg, wait) => {
    mark(id); await p.type('#msg', msg, { delay: 70 }); await p.press('#msg', 'Enter'); await p.waitForTimeout(wait);
  };
  await text('address', '245 Eglinton Ave E', 6500);
  await text('detail', '1', 8000);
  await text('building', 'CN Tower', 6000);
  await text('ambiguous', 'city hall', 5500);
  await text('ward', 'WARD 2', 5000);
  await text('watch', 'WATCH', 4500);
  mark('replay');
  await p.evaluate(() => { const d = document.getElementById('asof'); d.value = '2026-05-01'; d.dispatchEvent(new Event('change')); });
  await p.waitForTimeout(1200);
  await p.evaluate(() => { const d = document.getElementById('asof'); d.value = '2026-07-30'; d.dispatchEvent(new Event('change')); });
  await p.waitForTimeout(8000); mark('end');
  const vid = p.video(); await ctx.close(); await b.close();
  fs.renameSync(await vid.path(), 'public/demo.webm');
  fs.writeFileSync('src/demo-marks.json', JSON.stringify(log, null, 1));
  console.log(log);
})();
