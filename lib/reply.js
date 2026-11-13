// Deterministic SMS replies built only from city records. The same code runs
// in the browser simulator and on the SMS webhook, so judges see exactly what
// a texter would get. No AI: every line comes from a dataset field.

const TYPES = { STREET: 'ST', AVENUE: 'AVE', ROAD: 'RD', DRIVE: 'DR', CRESCENT: 'CRES',
  BOULEVARD: 'BLVD', COURT: 'CRT', TRAIL: 'TRL', SQUARE: 'SQ', PLACE: 'PL', CIRCLE: 'CRCL',
  TERRACE: 'TER', GARDENS: 'GDNS', GROVE: 'GRV', PARKWAY: 'PKWY', GATE: 'GT', HEIGHTS: 'HTS',
  CIRCUIT: 'CRCT', LANE: 'LANE', WAY: 'WAY' };
const DIRS = { WEST: 'W', EAST: 'E', NORTH: 'N', SOUTH: 'S' };
const SHORT_TYPES = new Set(Object.values(TYPES));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_SMS = 459; // 3 concatenated GSM-7 segments of 153 characters

// "245 Eglinton Avenue East" -> { num: 245, street: "EGLINTON AVE E" }
export function parseAddress(text) {
  const m = text.toUpperCase().replace(/\(.*?\)/g, ' ').replace(/[.,]/g, ' ')
    .match(/^\s*(\d+)[A-Z]?(?:\s+1\/2)?(?:\s*-\s*\d+[A-Z]?)?\s+([A-Z][A-Z' -]*?)\s*$/);
  if (!m) return null;
  const w = m[2].split(/\s+/);
  if (DIRS[w.at(-1)]) w[w.length - 1] = DIRS[w.at(-1)];
  const t = DIRS[w.at(-1)] || ['W', 'E', 'N', 'S'].includes(w.at(-1)) ? w.length - 2 : w.length - 1;
  if (t > 0 && TYPES[w[t]]) w[t] = TYPES[w[t]];
  return { num: +m[1], street: w.join(' ') };
}

// Returns { ward } or { ambiguous: true } or null (street not found). Never guesses.
export function wardOf(addr, streets) {
  let keys = streets[addr.street] ? [addr.street] : [];
  if (!keys.length) { // resident left out "Ave"/"St": try every street with that name
    const bare = addr.street.split(' ').filter(x => !SHORT_TYPES.has(x)).join(' ');
    keys = Object.keys(streets).filter(k => k.split(' ').filter(x => !SHORT_TYPES.has(x)).join(' ') === bare);
  }
  if (!keys.length) return null;
  const ranges = keys.flatMap(k => streets[k]);
  const hit = new Set(ranges.filter(([lo, hi]) => lo % 2 === addr.num % 2 && lo <= addr.num && addr.num <= hi).map(r => r[2]));
  const all = new Set(ranges.map(r => r[2]));
  if (hit.size === 1) return { ward: [...hit][0] };
  if (hit.size === 0 && all.size === 1) return { ward: [...all][0] };
  return { ambiguous: true };
}

// Attach a ward to each item once: the official page's ward if we have it, else from the title address.
export function prepare(itemsJson, streets) {
  const items = itemsJson.items.map(it => {
    const addr = parseAddress(it.title.split(' - ')[0].split(/ and /i)[0]);
    const found = !it.ward && addr ? wardOf(addr, streets) : null;
    return { ...it, ward: it.ward || found?.ward || null };
  });
  return { ...itemsJson, items, streets };
}

const fmt = d => `${+d.slice(8, 10)} ${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
const gsm = s => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-');
const place = t => t.split(' - ')[0].replace(/\s*\(.*?\)/, '');

// Plain label from words in the official title (fixed list, no AI).
export function kind(title) {
  return [[/Zoning/i, 'rezoning'], [/Fence/i, 'fence exemption'], [/Tree/i, 'tree removal'],
    [/Heritage/i, 'heritage change'], [/Land Tribunal/i, 'tribunal appeal'], [/Lease/i, 'city lease'],
    [/Sign/i, 'sign variance']].find(([re]) => re.test(title))?.[1] || 'council item';
}

const HELP = 'Text a Toronto street address (e.g. 100 Queen St W) or WARD 10 to see recent council decisions there. Reply a number for details. WATCH for updates, STOP to end. Info from City of Toronto open data.';

function menu(data, ward, state) {
  const asOf = state.asOf || '9999';
  const votes = it => it.votes.filter(v => v.date <= asOf);
  const items = data.items.filter(it => it.ward === ward && votes(it).length).slice(0, 3);
  const head = `${state.asOf ? `As of ${fmt(state.asOf)}: ` : ''}Ward ${ward} ${data.wards[ward]}.`;
  if (!items.length) {
    return { text: `${head} No address-specific council votes recorded here in 2026 (records to ${fmt(data.lastVote)}). Try another address or WARD number.`, list: [] };
  }
  const lines = items.map((it, i) => `${i + 1}) ${place(it.title)} - ${kind(it.title)} - last vote ${fmt(votes(it).at(-1).date)}`);
  return { text: `${head} Recent council decisions:\n${lines.join('\n')}\nReply 1-${items.length} for details.`, list: items.map(it => it.id) };
}

function detail(data, id, state) {
  const it = data.items.find(x => x.id === id);
  const votes = it.votes.filter(v => v.date <= (state.asOf || '9999'));
  const final = !state.asOf || state.asOf >= it.votes.at(-1).date;
  const parts = [`${place(it.title)} (${kind(it.title)}), Ward ${it.ward}.`];
  // first sentence only: the rest of the city's status is written in the future tense of an earlier date
  if (final && it.status) parts.push(it.status.split('. ')[0].replace(/\.?$/, '.'));
  for (const v of votes.slice(-2)) parts.push(`${fmt(v.date)} ${v.body}: ${v.motion} - ${v.result}.`);
  parts.push('Open comment period: none confirmed in records.');
  if (it.page && data.siteUrl) parts.push(`Plain-language page: ${data.siteUrl}item.html?id=${it.id}`);
  parts.push(`Official: ${it.url}`);
  // Drop optional lines (oldest vote, status) until it fits 3 SMS segments; the source link always stays.
  while (gsm(parts.join('\n')).length > MAX_SMS && parts.length > 3) parts.splice(1, 1);
  return gsm(parts.join('\n'));
}

export function reply(message, state, data) {
  const msg = message.trim().toUpperCase();
  const s = { ...state };
  if (/^(STOP|UNSUBSCRIBE|CANCEL|END|QUIT)$/.test(msg)) {
    return { text: 'You are unsubscribed and will get no more texts. Text START to come back.', state: { asOf: s.asOf } };
  }
  if (/^(HELP|INFO|\?|START|HI|HELLO)$/.test(msg)) return { text: HELP, state: s };
  if (msg === 'WATCH') {
    if (!s.ward) return { text: 'First text your street address or WARD number, then WATCH.', state: s };
    return { text: `Watching Ward ${s.ward}. You will get a text when a new council vote is recorded for an item there. We keep only your number and ward. STOP to end.`, state: { ...s, watch: s.ward } };
  }
  let m = msg.match(/^(\d{1,2})$/);
  if (m && s.list?.[+m[1] - 1]) return { text: detail(data, s.list[+m[1] - 1], s), state: s };
  m = msg.match(/^WARD\s*(\d{1,2})$/);
  const ward = m && data.wards[+m[1]] ? +m[1] : null;
  if (!ward) {
    const addr = parseAddress(message);
    if (!addr) return { text: `Sorry, I did not understand that. ${HELP}`, state: s };
    const found = wardOf(addr, data.streets);
    if (!found) return { text: `Could not find "${gsm(message.trim()).slice(0, 40)}" in Toronto's address list. Check the spelling, or text WARD and your ward number (1-25).`, state: s };
    if (found.ambiguous) return { text: 'That address is near a ward boundary, so I will not guess. Text WARD and your ward number (1-25). Find it at toronto.ca/city-government/data-research-maps/neighbourhoods-communities/ward-profiles', state: s };
    return reply(`WARD ${found.ward}`, s, data);
  }
  const { text, list } = menu(data, ward, s);
  return { text: gsm(text), state: { ...s, ward, list } };
}

// Texts a WATCH subscriber would get for votes recorded after `since` (dated replay in the simulator).
export function alerts(data, ward, since, until) {
  return data.items.filter(it => it.ward === ward).flatMap(it => it.votes
    .filter(v => v.date > since && v.date <= until)
    .map(v => gsm(`Ward ${ward} update ${fmt(v.date)}: ${place(it.title)} (${kind(it.title)}) - ${v.body}: ${v.motion} - ${v.result}. Official: ${it.url}`)));
}
