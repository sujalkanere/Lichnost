/* Headless smoke test: load index.html + app.js in jsdom and drive the UI. */
'use strict';
const fs = require('fs');
const { JSDOM } = require('jsdom');

const ROOT = __dirname + '/..';

/* jsdom's DOMContentLoaded ordering is unreliable when external scripts go
   through its resource pipeline, so: parse the static page (script tag
   removed — jsdom then parses fully & synchronously), then eval app.js
   ourselves. In real browsers the <script defer> path is what runs. */
const html = fs.readFileSync(ROOT + '/index.html', 'utf8')
  .replace(/<script defer src="app\.js"><\/script>/, '');

const dom = new JSDOM(html, {
  url: 'http://localhost/lichnost/',
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});

const errors = [];
const { window } = dom;
window.addEventListener('error', (e) => errors.push('pageerror: ' + e.message));
window.requestAnimationFrame = (cb) => { cb(); return 1; };
window.scrollTo = () => {};

/* clipboard polyfill so the copy button can be tested headlessly */
let copiedText = '';
try {
  Object.defineProperty(window, 'isSecureContext', { configurable: true, get: () => true });
} catch { /* keep jsdom default */ }
Object.defineProperty(window.navigator, 'clipboard', {
  configurable: true,
  value: { writeText: async (t) => { copiedText = t; } },
});
window.document.execCommand = () => {
  const ta = window.document.querySelector('textarea');
  if (ta) copiedText = ta.value; // fallback path
  return true;
};

/* boot the app now that the document is fully parsed */
window.eval(fs.readFileSync(ROOT + '/app.js', 'utf8'));

const doc = window.document;
const $ = (id) => doc.getElementById(String(id).replace(/^#/, ''));
const qs = (s) => doc.querySelector(s);
const qsa = (s) => [...doc.querySelectorAll(s)];
const visible = (id) => !$(id).hidden;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function assert(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { console.error('  ✗ FAIL: ' + msg); process.exitCode = 1; errors.push('assert: ' + msg); }
}

/* wait until the app script has run and boot rendered the home strand list */
const appReady = (async () => {
  for (let i = 0; i < 300; i++) {
    const list = doc.getElementById('strand-list');
    if (list && list.children.length === 5) return;
    await wait(10);
  }
})();

(async () => {
  await appReady;

  /* ── 1. boot on home */
  console.log('1. boot');
  assert(visible('screen-home'), 'home visible');
  assert(!visible('screen-quiz'), 'quiz hidden');
  assert($('history-section').hidden, 'history hidden when empty');
  assert(qsa('#strand-list li').length === 5, 'five strand cards rendered');
  assert(qs('#start-label').textContent === 'Begin the questionnaire', 'fresh CTA label');
  assert(qsa('li.strand').every((li) => li.style.getPropertyValue('--sc')), 'each strand carries its colour');

  /* ── 2. quiz interaction */
  console.log('2. quiz interaction');
  $('#btn-start').click();
  assert(visible('screen-quiz'), 'quiz shown after start');
  assert(qs('#q-count').textContent === 'Question 1 of 25', 'counter starts at 1');
  assert(qsa('#answers .opt').length === 5, 'five options rendered');
  qsa('#answers .opt')[2].click();
  assert(qs('#q-count').textContent === 'Question 2 of 25', 'advances after answering');
  assert(qs('#progress-fill').style.width === '4%', 'progress bar moves');

  $('#btn-back').click();
  assert(qs('#q-count').textContent === 'Question 1 of 25', 'back returns to question 1');
  const lit = qsa('#answers .opt').find((b) => b.classList.contains('is-on'));
  assert(lit && lit.textContent.includes('Sometimes me'), 'previous answer restored on back');

  doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: '3', bubbles: true }));
  assert(qs('#q-count').textContent === 'Question 2 of 25', 'keyboard answer works');

  /* ── 3. leave mid-quiz → draft resume CTA */
  console.log('3. draft resume');
  qs('[data-nav-home]').click();
  assert(visible('screen-home'), 'home reachable from quiz');
  assert($('history-section').hidden, 'no history yet');
  const rawDraft = window.localStorage.getItem('lichnost.qs.v1');
  console.log('  (raw draft:', rawDraft, ')');
  console.log('  (label now:', JSON.stringify(qs('#start-label').textContent), '| meta:', JSON.stringify(qs('.hero-meta').textContent), ')');
  assert(qs('#start-label').textContent === 'Continue the questionnaire', 'continue CTA shown');
  assert(qs('.hero-meta').textContent.includes('1 of 25'), 'meta shows progress');

  /* ── 4. finish all 25 */
  console.log('4. full run');
  $('#btn-start').click();
  assert(visible('screen-quiz'), 'resumed quiz');
  assert(qs('#q-count').textContent === 'Question 2 of 25', 'resumes at first unanswered');
  let n = 0;
  while (visible('screen-quiz') && n < 40) { qsa('#answers .opt')[n % 5].click(); n++; }
  assert(visible('screen-working'), 'working screen appears after Q25');
  await wait(2800);
  assert(visible('screen-result'), 'result screen appears after working');

  const title = qs('#result-title').textContent;
  assert(title.length > 0, 'result has a title: ' + title.slice(0, 48) + '…');
  assert(qsa('#trait-cards .tcard').length === 5, 'five trait cards rendered');
  assert(qsa('#radar-holder svg polygon.r-shape').length === 1, 'radar shape drawn');
  assert(qsa('#radar-holder svg text.radar-label').length === 5, 'radar labels drawn');
  const pcts = [...doc.querySelectorAll('#trait-cards .tpct')].map((el) => parseInt(el.textContent));
  assert(pcts.every((p) => p >= 0 && p <= 100), 'all scores within 0–100: ' + pcts.join(','));
  assert(pcts.reduce((a, b) => a + b, 0) > 0, 'scores not all zero');

  /* scoring sanity: constant “Rarely me” answers.
     Strands with 3 positive + 2 negative items → 40.
     Stability has 3 negative items, so “rarely me” must score HIGH there (60). */
  qs('[data-nav-home]').click();
  $('#btn-start').click();
  for (let i = 0; i < 25; i++) qsa('#answers .opt')[0].click();
  await wait(2800);
  const flat = [...doc.querySelectorAll('#trait-cards .tpct')].map((el) => parseInt(el.textContent));
  console.log('  (all-\'Rarely me\' scores: ' + flat.join(', ') + ')');
  assert(flat.join(',') === '40,40,40,40,60', 'reverse-scored items behave exactly right');

  /* ── 5. history: open a stored portrait */
  console.log('5. history');
  qs('[data-nav-home]').click();
  assert(qsa('#history-list .hist-item').length === 2, 'two portraits in history');
  const openBtn = qsa('#history-list .hist-open')[0];
  const date = qsa('#history-list .hist-date')[0].textContent;
  openBtn.click();
  assert(visible('screen-result'), 'stored portrait opens');
  assert($('result-date').textContent.includes('Portrait drawn'), 'result header shows drawn date');
  assert($('result-date').textContent.includes(':'), 'header shows time too');

  /* ── 6. copy summary */
  console.log('6. copy');
  $('#btn-copy').click();
  await wait(30);
  assert(copiedText.includes('LICHNOST'), 'summary copied');
  assert(copiedText.includes('%'), 'summary contains scores');
  assert($('#copy-label').textContent === 'Copied ✓', 'copy button gives feedback');

  /* ── 7. delete keeps the other */
  qs('[data-nav-home]').click();
  const firstId = qsa('#history-list .hist-item')[0].querySelector('[data-del]').dataset.del;
  qsa('#history-list .hist-item')[0].querySelector('[data-del]').click();
  assert(qsa('#history-list .hist-item').length === 1, 'one portrait deleted');
  assert(!qsa('#history-list [data-del]').some((b) => b.dataset.del === firstId), 'the deleted one is gone');

  /* ── 8. storage shape */
  console.log('8. storage');
  const hist = JSON.parse(window.localStorage.getItem('lichnost.hist.v1'));
  assert(Array.isArray(hist) && hist.length === 1, 'history persisted in localStorage');
  const rec = hist[0];
  assert(rec.scores && Object.keys(rec.scores).length === 5, 'record stores five compact scores');

  console.log('\n' + (errors.length ? 'FAILURES: ' + errors.length : 'ALL CHECKS PASSED'));
  process.exit(errors.length ? 1 : 0);
})();
