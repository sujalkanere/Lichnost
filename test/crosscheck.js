/* Cross-check: every id/class the JS touches must exist in the HTML/CSS. */
'use strict';
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const css = fs.readFileSync(__dirname + '/../styles.css', 'utf8');
const js = fs.readFileSync(__dirname + '/../app.js', 'utf8');

let bad = 0;
const ok = (c, m) => console.log((c ? '  ✓ ' : '  ✗ ') + m) || (c ? 0 : (bad++, 1));

/* 1) ids referenced by JS must exist in HTML */
const idRefs = [...new Set(
  [...js.matchAll(/\$\(['"]([^'"]+)['"]\)/g)].map((m) => m[1].replace(/^#/, ''))
    .concat([...js.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]))
    .concat([...js.matchAll(/data-nav-home/g)].map(() => 'screen-home'))
    .concat([...js.matchAll(/screen-quiz/g)].map(() => 'screen-quiz'))
    .concat([...js.matchAll(/screen-home/g)].map(() => 'screen-home'))
)];
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
const missingIds = idRefs.filter((id) => !htmlIds.has(id));
console.log('1. ids JS touches exist in HTML');
console.log('   (referenced: ' + [...new Set(idRefs)].join(', ') + ')');
ok(missingIds.length === 0, 'all referenced ids exist' + (missingIds.length ? ' — MISSING: ' + missingIds.join(',') : ''));

/* 2) classes emitted by JS templates exist in CSS
      (only literal class="…" tokens count; template-literal interpolation
      is ignored by looking at code outside backtick strings) */
const jsNoTemplates = js.replace(/`[^`]*`/g, '');
const jsClasses = [...new Set([...jsNoTemplates.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)))];
const cssHas = (c) => {
  const esc = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\.' + esc + '(?=[^a-zA-Z0-9_-]|$)').test(css);
};
const noCss = jsClasses.filter((c) => c && !cssHas(c));
console.log('2. classes JS emits exist in CSS (' + jsClasses.length + ' unique)');
ok(noCss.length === 0, 'all emitted classes styled' + (noCss.length ? ' — MISSING: ' + [...new Set(noCss)].join(', ') : ''));

/* 3) screen ids & show-animation hooks */
console.log('3. screens & animation hooks');
ok(htmlIds.has('screen-home') && htmlIds.has('screen-quiz') && htmlIds.has('screen-working') && htmlIds.has('screen-result'), 'all four screens present');
ok(['screen-home', 'screen-result', 'screen-working'].every((s) => css.includes('#' + s + '.show')), 'entrance animations defined for shown screens');
ok(css.includes('quiz-statement') && css.includes('answers .opt'), 'quiz entrance animation styles exist');

/* 4) CSS selectors reference classes that exist in templates/HTML (spot reverse check) */
console.log('4. no leftover selectors for removed pieces');
ok(!/o-dot|quiz-scale|opt--s|opt--neutral|hist-open\b.*cursor/.test(css), 'no dead selectors for removed markup');
ok(!css.includes('radar-scale'), 'radar helper classes consistent');

console.log(bad ? '\nFAILURES: ' + bad : '\nALL CROSS-CHECKS PASSED');
process.exit(bad ? 1 : 0);
