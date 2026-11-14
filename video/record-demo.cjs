// Records the live simulator for the demo video. Each step lasts as long as its narration
// (src/vo-timing.json, from tts.cjs), and the step times are logged for the composition.
const { chromium } = require('playwright');
const fs = require('fs');
const vo = require('./src/vo-timing.json');
const dur = id => vo[id].duration * 1000 + 700;
const said = (id, n) => vo[id].sentences[n].start * 1000; // when sentence n of a section starts

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, recordVideo: { dir: 'rec', size: { width: 1080, height: 1920 } } });
  const p = await ctx.newPage();
  const t0 = Date.now(); const log = [];
  const mark = id => { log.push({ id, t: (Date.now() - t0) / 1000 }); return Date.now(); };
  const until = async (start, ms) => p.waitForTimeout(Math.max(0, start + ms - Date.now()));
  const setDate = d => p.evaluate(v => { const el = document.getElementById('asof'); el.value = v; el.dispatchEvent(new Event('change')); }, d);
  const text = async msg => { await p.type('#msg', msg, { delay: 70 }); await p.press('#msg', 'Enter'); };

  await p.goto('https://ripasso.github.io/civichacks/');
  await p.waitForSelector('.msg.bot');
  // Recording view: the same app, phone only, filling the frame.
  await p.addStyleTag({ content: '.intro,.more{display:none!important} main{padding:0!important;display:block!important;max-width:none!important} .phone{position:static!important;border-radius:0!important;padding:0!important;box-shadow:none!important} .screen{height:960px!important;border-radius:0!important} html{zoom:2}' });
  await p.waitForTimeout(1500);

  let s = mark('demo-replay'); await until(s, said('demo-replay', 1)); await setDate('2026-07-08'); await until(s, dur('demo-replay'));
  s = mark('demo-address'); await text('245 Eglinton Ave E'); await until(s, dur('demo-address'));
  s = mark('demo-detail'); await text('1'); await until(s, dur('demo-detail'));
  s = mark('demo-alerts'); await text('WATCH'); await until(s, said('demo-alerts', 1) + 2500); await setDate('2026-07-30'); await until(s, dur('demo-alerts'));
  s = mark('demo-final'); await text('1'); await until(s, dur('demo-final'));
  mark('end');

  const vid = p.video(); await ctx.close(); await b.close();
  fs.renameSync(await vid.path(), 'public/demo.webm');
  fs.writeFileSync('src/demo-marks.json', JSON.stringify(log, null, 1));
  console.log(log);
})();
