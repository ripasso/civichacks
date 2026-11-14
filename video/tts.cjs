// Generates the narration with ElevenLabs (voice: Chris, model eleven_v3), one file per script section, and records
// when each sentence starts and ends so captions and the demo recording follow the voice exactly.
// The API key is added to requests by the network proxy; it is never stored here.
const fs = require('fs');
const script = require('./src/script.json');
const VOICE = 'iP95p4xoKVk53GoZ742B'; // Chris: charming, down-to-earth
const spoken = t => t.replace('ripasso.github.io/civichacks', 'ripasso dot github dot io, slash civic hacks');

(async () => {
  const timing = {};
  for (const sec of script) {
    const text = spoken(sec.vo.join(' '));
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST', headers: { 'content-type': 'application/json', 'xi-api-key': 'proxy-injected' },
      body: JSON.stringify({ text, model_id: 'eleven_v3', voice_settings: { stability: 0.5 } }),
    });
    if (!r.ok) throw new Error(`${sec.id}: ${r.status} ${await r.text()}`);
    const { audio_base64, alignment } = await r.json();
    fs.writeFileSync(`public/vo/${sec.id}.mp3`, Buffer.from(audio_base64, 'base64'));
    const ends = alignment.character_end_times_seconds, starts = alignment.character_start_times_seconds;
    let pos = 0;
    const sentences = sec.vo.map(line => {
      const len = spoken(line).length, a = pos, b = Math.min(pos + len, ends.length) - 1;
      pos += len + 1;
      return { start: starts[a], end: ends[b] };
    });
    timing[sec.id] = { duration: ends[ends.length - 1], sentences };
    console.log(sec.id.padEnd(13), timing[sec.id].duration.toFixed(1) + 's');
  }
  fs.writeFileSync('src/vo-timing.json', JSON.stringify(timing, null, 1));
  const total = Object.values(timing).reduce((a, t) => a + t.duration, 0);
  console.log('narration total', total.toFixed(1) + 's');
})();
