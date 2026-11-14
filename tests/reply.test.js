import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseAddress, wardOf, prepare, reply, alerts, placesNamed, kind } from '../site/lib/reply.js';

const load = p => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const streets = load('../site/data/streets.json');
const places = load('../site/data/places.json');
const data = { ...prepare(load('../site/data/items.json'), streets, places), siteUrl: 'https://example.test/' };
const GSM = /^[A-Za-z0-9 \n@£$¥èéùìòÇØøÅå_!"#%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà]*$/;
const chat = (...msgs) => msgs.reduce(({ state }, m) => reply(m, state, data), { state: {} });

test('parses resident-style addresses', () => {
  assert.deepEqual(parseAddress('245 Eglinton Avenue East'), { num: 245, street: 'EGLINTON AVE E' });
  assert.deepEqual(parseAddress('100 queen st. w'), { num: 100, street: 'QUEEN ST W' });
  assert.deepEqual(parseAddress('191-199 College Street'), { num: 191, street: 'COLLEGE ST' });
  assert.deepEqual(parseAddress('113 1/2 Soudan Ave'), { num: 113, street: 'SOUDAN AVE' });
  assert.deepEqual(parseAddress('22 De-Savery Cres'), { num: 22, street: 'DE-SAVERY CRES' });
  assert.equal(parseAddress('hello'), null);
});

test('wards match the official item pages', () => {
  assert.deepEqual(wardOf(parseAddress('245 Eglinton Avenue East'), streets), { ward: 15 });
  assert.deepEqual(wardOf(parseAddress('3838 Bloor Street West'), streets), { ward: 2 });
  assert.deepEqual(wardOf(parseAddress('191 College Street'), streets), { ward: 11 });
});

test('never names a wrong ward on 2,000 real Toronto addresses', () => {
  let right = 0;
  for (const [address, ward] of load('./address_sample.json')) {
    const got = wardOf(parseAddress(address), streets);
    assert.ok(got, `not found: ${address}`);
    if (got.ward) { assert.equal(got.ward, ward, address); right++; }
  }
  assert.ok(right >= 1900, `only ${right}/2000 resolved`);
});

test('address -> menu -> details, all SMS-sized and GSM-7', () => {
  const { text, state } = chat('245 Eglinton Ave E');
  assert.match(text, /Ward 15 Don Valley West/);
  assert.equal(state.list[0], '2026.NY34.12');
  const d = reply('1', state, data).text;
  assert.match(d, /Official: https:\/\/secure\.toronto\.ca\/council\/agenda-item\.do\?item=2026\.NY34\.12$/);
  assert.match(d, /none confirmed/); // never invents a deadline
  for (const t of [text, d]) { assert.ok(t.length <= 459, t.length); assert.match(t, GSM); }
});

test('every item detail fits 3 SMS and ends with its official link', () => {
  for (let w = 1; w <= 25; w++) {
    const { state } = chat(`WARD ${w}`);
    state.list.forEach((id, i) => {
      const t = reply(String(i + 1), state, data).text;
      assert.ok(t.length <= 459 && GSM.test(t), `${id}: ${t.length}`);
      assert.ok(t.endsWith(data.items.find(x => x.id === id).url));
    });
  }
});

test('dated replay hides later votes and the final status', () => {
  const { state } = chat('245 Eglinton Ave E');
  const d = reply('1', { ...state, asOf: '2026-07-08' }, data).text;
  assert.doesNotMatch(d, /City Council adopted|Carried, 25-1/);
  assert.match(d, /North York Community Council/);
});

test('commands', () => {
  assert.match(chat('help').text, /street address/);
  assert.match(chat('WATCH').text, /First text your street address/);
  assert.equal(chat('WARD 15', 'WATCH').state.watch, 15);
  assert.equal(chat('WARD 15', 'WATCH', 'STOP').state.watch, undefined);
  assert.match(chat('99 Nowhere Imaginary Rd').text, /Could not find/);
  assert.match(chat('banana').text, /did not understand/);
});

test('alerts list votes in the window only', () => {
  const a = alerts(data, 15, '2026-07-08', '2026-07-31');
  assert.ok(a.some(t => t.includes('245 Eglinton Avenue East') && t.includes('Carried, 25-1')));
  assert.equal(alerts(data, 15, '2026-08-01', '2026-12-31').length, 0);
});

test('building names resolve from the city place-name field', () => {
  const t = chat('CN Tower').text;
  assert.match(t, /^CN Tower is at 301 Front St W\. Ward 10 Spadina-Fort York/);
  const which = chat('city hall').text; // two City Halls in two wards: ask, never guess
  assert.match(which, /^Which one\?/); assert.match(which, /60 Queen St W/); assert.match(which, /100 Queen St W/);
  assert.match(chat('royal ontario museum').text, /Ward 11/);
  assert.equal(placesNamed('zzqx', places).length, 0);
  assert.match(chat('banana').text, /did not understand/);
});

test('item labels match whole words only', () => {
  assert.equal(kind('701 Fleet Street - Authorization to Enter into a Long-term Lease'), 'city lease');
  assert.equal(kind('15 Marchwood Drive - Application to Remove a Private Tree'), 'tree removal');
  assert.equal(kind('10 Design Street - Something Else'), 'council item');
});
