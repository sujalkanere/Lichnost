'use strict';
/* ════════════════════════════════════════════════════════════
   LICHNOST — a personality portrait in five strands
   No dependencies. All state lives in localStorage; nothing
   ever leaves the device.
   ════════════════════════════════════════════════════════════ */
(() => {

  /* ─────────────────────────── data ─────────────────────────── */

  const STRAND_ORDER = ['O', 'C', 'E', 'A', 'S'];

  const STRANDS = {
    O: {
      name: 'Openness', sub: 'wonder & new ideas', word: 'the dreamer', color: '#7564D0',
      radarName: 'imagination',
      levels: {
        low: {
          title: 'You find depth in the *familiar*',
          band: 'On the quieter side',
          blurb: 'You like knowing how things work and sticking with what does. You are probably not chasing every new idea or trend — and that frees your attention for depth. There is a quiet radicalism in being hard to impress.',
          words: ['practical', 'prefers the known', 'deep, not wide'],
        },
        mid: {
          title: 'You hold a quiet *wonder* — feet on the ground',
          band: 'Sitting mid-spectrum',
          blurb: 'You are selective with novelty: open when it earns it, sceptical when it does not. You can geek out over a new idea in the morning and still come home to your old favourites at night.',
          words: ['selectively curious', 'open-minded', 'grounded'],
        },
        high: {
          title: 'You move through the world with *curiosity*',
          band: 'On the high side',
          blurb: 'Your mind collects new ideas the way others collect photographs — experiences, possibilities, perspectives. You get restless without novelty and ask “what if?” before “what is?”. Boredom is your signal that something is missing.',
          words: ['curious', 'imaginative', 'restless for ideas'],
        },
      },
    },
    C: {
      name: 'Conscientiousness', sub: 'intention & follow-through', word: 'the architect', color: '#2E9B8F',
      radarName: 'order',
      levels: {
        low: {
          title: 'You trust the *flow* more than the plan',
          band: 'On the freer side',
          blurb: 'Plans are suggestions; you improvise. You may leave things until the pressure is on — and still pull it off, which only confirms that your system works. A little chaos is a comfort zone, and deadlines are your real muse.',
          words: ['spontaneous', 'an improviser', 'thrives on deadline'],
        },
        mid: {
          title: 'You build *intention* between moments of ease',
          band: 'Sitting mid-spectrum',
          blurb: 'You can be organised — when it matters. You keep a plan for the important things and trust your mood for the rest: structure when it counts, freedom when it does not.',
          words: ['organised when it counts', 'flexible', 'reliable'],
        },
        high: {
          title: 'A *steady rhythm* carries your days',
          band: 'On the high side',
          blurb: 'When you say you will do a thing, it gets done. Order is not a cage for you — it is what buys your freedom: a tidy room, a finished project, a kept promise. Each one quietly settles your mind.',
          words: ['reliable', 'disciplined', 'a finisher'],
        },
      },
    },
    E: {
      name: 'Extraversion', sub: 'energy, people & spark', word: 'the spark', color: '#D9912C',
      radarName: 'energy',
      levels: {
        low: {
          title: 'You draw power from *quiet*',
          band: 'On the quieter side',
          blurb: 'People can drain you as fast as they energise others. You need real solitude to recharge, your best conversations are often one-on-one, and your inner world is rarely empty — it is usually the loudest room you know.',
          words: ['thoughtful', 'deep one-on-ones', 'needs solitude'],
        },
        mid: {
          title: 'You carry your own *energy* — in doses that suit you',
          band: 'Sitting mid-spectrum',
          blurb: 'You can switch it on when it counts, but you genuinely need the switch-off afterwards. Crowds tire you faster than friends, and strangers faster than both. You are the one who leaves the party early — and means it kindly.',
          words: ['selectively social', 'lively in the right room', 'values both'],
        },
        high: {
          title: 'You come alive around *other people*',
          band: 'On the high side',
          blurb: 'You think out loud, feed on good company, and a quiet evening can feel like a wasted one. For you, people are not a distraction from life — they are most of the point. The room’s energy is your fuel.',
          words: ['energetic', 'warmly talkative', 'people-fuelled'],
        },
      },
    },
    A: {
      name: 'Agreeableness', sub: 'warmth, trust & kindness', word: 'the hearth', color: '#D75F7E',
      radarName: 'warmth',
      levels: {
        low: {
          title: 'You value *candour* over pleasing',
          band: 'On the franker side',
          blurb: 'You would rather be straight than smooth. You trust your own read over the group’s, and you do not need to be liked by everyone — which makes you exactly the person to have around when a hard thing needs saying.',
          words: ['candid', 'independent-minded', 'the honest one'],
        },
        mid: {
          title: 'You meet people with *warmth* — and a quiet line',
          band: 'Sitting mid-spectrum',
          blurb: 'You care about people, but on your own terms. You will listen, help, and show up — then close the door when you need to, without much guilt. Kind, yes. A pushover, no.',
          words: ['fair', 'warm with limits', 'chooses their circle'],
        },
        high: {
          title: 'You move through life with *warmth*',
          band: 'On the high side',
          blurb: 'You feel other people like weather — their moods move yours, and their pain is hard to shake off. You forgive easily, soften conflicts, and hand out more chances than people have earned. It costs you sometimes; it is still how you love.',
          words: ['compassionate', 'generous', 'conflict-softener'],
        },
      },
    },
    S: {
      name: 'Stability', sub: 'calm in all weather', word: 'the oak', color: '#4F7FD0',
      radarName: 'composure',
      levels: {
        low: {
          title: 'You feel things *deeply* — and that is a strength',
          band: 'On the sensitive side',
          blurb: 'You feel at full volume: excitement, worry, hurt — and the waves can take a while to pass. The upside is real: you notice nuance and depth most people walk past. Your sensitivity is a sensor, not a flaw.',
          words: ['deep feeler', 'empathic', 'slow to settle'],
        },
        mid: {
          title: 'You feel deeply, and *right yourself* in time',
          band: 'Sitting mid-spectrum',
          blurb: 'You have steady days and stormy ones. You can hold it together in a crisis — then unravel a little over something small, usually because you were holding it together for so long. You weather, and you recover.',
          words: ['mostly steady', 'recovers in time', 'human'],
        },
        high: {
          title: 'An *even keel* carries you through storms',
          band: 'On the steady side',
          blurb: 'Pressure steadies you. You are hard to rattle and quick to recover, and your calm has a way of calming the room. In a crisis people tend to lean on you — and you tend to hold.',
          words: ['composed', 'resilient', 'the calm one'],
        },
      },
    },
  };

  /* 25 statements — five per strand, mixed direction.
     dir +1: agreement scores high · dir −1: agreement scores low. */
  const QS = {
    O: [
      { s: 'When I notice something new, my first impulse is to try it.', dir: +1 },
      { s: 'I find myself daydreaming about possibilities more often than not.', dir: +1 },
      { s: 'I prefer sticking to ideas and habits I already know work.', dir: -1 },
      { s: 'I get genuinely drawn into beauty — a painting, a melody, a well-made thing.', dir: +1 },
      { s: 'When I read or hear something, I rarely stop to question the deeper meaning.', dir: -1 },
    ],
    C: [
      { s: 'I finish what I start, even after the excitement has worn off.', dir: +1 },
      { s: 'I often leave important things until the last minute.', dir: -1 },
      { s: 'Keeping my space tidy genuinely calms me.', dir: +1 },
      { s: 'I make lists not because I must, but because they work.', dir: +1 },
      { s: 'I tend to lose track of small details I promised to handle.', dir: -1 },
    ],
    E: [
      { s: 'At gatherings I am usually the one keeping the conversation moving.', dir: +1 },
      { s: 'Long parties drain me, and I prefer to slip away early.', dir: -1 },
      { s: 'Talking things through with other people helps me think better.', dir: +1 },
      { s: 'I am comfortable with silence in a full room.', dir: -1 },
      { s: 'I feel genuinely energised after time in a lively crowd.', dir: +1 },
    ],
    A: [
      { s: 'Other people’s moods genuinely shift mine.', dir: +1 },
      { s: 'When someone is being difficult, my patience runs thin quickly.', dir: -1 },
      { s: 'I would rather smooth over a disagreement than win the argument.', dir: +1 },
      { s: 'I rarely go out of my way to check in on how friends are doing.', dir: -1 },
      { s: 'I tend to give people the benefit of the doubt.', dir: +1 },
    ],
    S: [
      { s: 'Worry keeps me up at night more often than I would like.', dir: -1 },
      { s: 'Criticism stings, but I can set it aside and keep perspective.', dir: +1 },
      { s: 'My mood swings quickly with small setbacks.', dir: -1 },
      { s: 'I stay fairly level-headed under pressure.', dir: +1 },
      { s: 'I dwell on awkward moments long after they have passed.', dir: -1 },
    ],
  };

  const OPT_LABELS = ['Rarely me', 'A little like me', 'Sometimes me', 'Often me', 'Almost always me'];
  const WORK_LINES = [
    'Reading your answers…', 'Weighing your imagination…', 'Measuring how you get things done…',
    'Sensing your energy with people…', 'Feeling for your warmth…', 'Listening for your inner calm…',
    'Weaving the five strands…',
  ];

  /* Interleave the strands — no two consecutive questions share one. */
  const QUESTIONS = (() => {
    const out = [];
    for (let row = 0; row < 5; row++) {
      const order = STRAND_ORDER
        .map((s) => ({ s, r: Math.random() })).sort((a, b) => a.r - b.r).map((x) => x.s);
      for (const s of order) out.push({ strand: s, ...QS[s][row] });
    }
    return out;
  })();

  /* ─────────────────────────── state ─────────────────────────── */

  const LS_QS = 'lichnost.qs.v1';     // in-progress answers
  const LS_HIST = 'lichnost.hist.v1'; // past portraits

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode */ } },
    del(key) { try { localStorage.removeItem(key); } catch { /* private mode */ } },
  };

  let answers = Array(25).fill(0);   // 1..5 per question
  let qIdx = 0;
  let showing = null;                // portrait record currently displayed

  /* ─────────────────────────── helpers ─────────────────────────── */

  const $ = (id) => document.getElementById(id.replace(/^#/, ''));
  const byClass = (sel) => Array.from(document.querySelectorAll(sel));

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* "You lead with *curiosity*" → italicised emphasis */
  function withEm(text) {
    return text.split('*').map((part, i) => (i % 2 ? `<em>${part}</em>` : esc(part))).join('');
  }

  const levelOf = (pct) => (pct >= 67 ? 'high' : pct <= 38 ? 'low' : 'mid');

  function pctOf(strandId) {
    const items = QS[strandId];
    let raw = 0;
    QUESTIONS.forEach((q, i) => {
      if (q.strand !== strandId || !answers[i]) return;
      raw += q.dir === +1 ? answers[i] : 6 - answers[i];
    });
    return Math.round(((raw - items.length) / (items.length * 4)) * 100); // 5..25 → 0..100
  }

  /* compact portrait scores — just percentages, enriched at render time */
  function pctMap() {
    const out = {};
    for (const s of STRAND_ORDER) out[s] = { pct: pctOf(s) };
    return out;
  }

  const ranked = (sc) => STRAND_ORDER.map((s) => ({ s, pct: sc[s].pct })).sort((a, b) => b.pct - a.pct);

  function dateLabel(ts) {
    return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function timeLabel(ts) {
    return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  const allMidScores = (sc) => STRAND_ORDER.every((s) => levelOf(sc[s].pct) === 'mid');

  const titlePlain = (sc) => {
    if (allMidScores(sc)) return 'A portrait of pleasing balance';
    const top = ranked(sc)[0];
    return STRANDS[top.s].levels[levelOf(top.pct)].title.replace(/\*/g, '');
  };

  const MAX_HIST = 12;

  function loadHistory() {
    const h = store.get(LS_HIST, []);
    return Array.isArray(h) ? h.filter((r) => r && r.scores) : [];
  }
  function saveHistory(record) {
    const h = [record, ...loadHistory()].slice(0, MAX_HIST);
    store.set(LS_HIST, h);
    return h;
  }
  function deleteHistory(id) {
    store.set(LS_HIST, loadHistory().filter((r) => r.id !== id));
    renderHistory();
  }

  const saveDraft = () => store.set(LS_QS, { i: qIdx, answers });

  /* keep the home CTA honest: “continue” when a draft exists, fresh otherwise */
  function refreshCta() {
    const draft = store.get(LS_QS, null);
    const hasDraft = draft && Array.isArray(draft.answers) && draft.answers.some(Boolean);
    const label = $('#start-label');
    const meta = document.querySelector('.hero-meta');
    if (hasDraft) {
      const answered = draft.answers.filter(Boolean).length;
      label.textContent = answered >= 25 ? 'Begin the questionnaire' : 'Continue the questionnaire';
      meta.textContent = `you answered ${answered} of 25 · pick up where you left off`;
    } else {
      label.textContent = 'Begin the questionnaire';
      meta.textContent = '5 strands · 25 questions · ~4 minutes · no account';
    }
  }

  /* ─────────────────────────── screens ─────────────────────────── */

  const screens = byClass('.screen');

  function show(id) {
    screens.forEach((s) => { s.hidden = s !== $(id); s.classList.toggle('show', s === $(id)); });
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (id === 'screen-home') { refreshCta(); renderHome(); }
    if (id === 'screen-result') renderResult();
  }

  /* ─────────────────────────── home ─────────────────────────── */

  function renderHome() {
    $('#strand-list').innerHTML = STRAND_ORDER.map((s, i) => {
      const d = STRANDS[s];
      return `<li class="strand" style="--sc:${d.color}">
        <span class="strand-idx">${i + 1}</span>
        <span class="strand-name">${d.name}<small>${d.sub}</small></span>
        <span class="strand-word">${d.word}</span>
      </li>`;
    }).join('');

    renderHistory();
  }

  function renderHistory() {
    const hist = loadHistory();
    const sec = $('history-section');
    sec.hidden = hist.length === 0;
    if (!hist.length) { sec.hidden = true; return; }

    $('#history-list').innerHTML = hist.map((r) => {
      const top = ranked(r.scores)[0];
      const s = STRANDS[top.s];
      const bars = STRAND_ORDER.map((k) => {
        const v = r.scores[k].pct;
        return `<i style="--sc:${STRANDS[k].color};height:${Math.max(7, Math.round(v / 100 * 26))}px" title="${STRANDS[k].name} ${v}%"></i>`;
      }).join('');
      const id = String(r.id);
      const date = `${dateLabel(r.at)} · ${timeLabel(r.at)}`;
      return `<li class="hist-item">
        <span class="hist-body">
          <span class="hist-date">${date}</span>
          <span class="hist-tags"><span class="hist-tag" style="--sc:${s.color}">${s.name} ${top.pct}%</span></span>
        </span>
        <span class="hist-bars" aria-hidden="true">${bars}</span>
        <span class="hist-actions">
          <button class="hist-open" data-open="${id}" aria-label="Open portrait from ${date}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
          </button>
          <button class="hist-del" data-del="${id}" aria-label="Delete portrait from ${date}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </span>
      </li>`;
    }).join('');
  }

  /* ─────────────────────────── quiz ─────────────────────────── */

  function drawQuestion() {
    const q = QUESTIONS[qIdx];
    $('#q-count').textContent = `Question ${qIdx + 1} of 25`;
    $('#progress-fill').style.width = `${(qIdx / 25) * 100}%`;

    const st = $('#quiz-statement');
    st.textContent = q.s;
    st.style.animation = 'none';      // replay the little entrance
    void st.offsetWidth;
    st.style.animation = '';

    const val = answers[qIdx];
    $('#answers').innerHTML = OPT_LABELS.map((label, i) => {
      const v = i + 1;
      return `<button type="button" class="opt ${v === val ? 'is-on' : ''}" data-v="${v}" style="animation-delay:${70 + i * 45}ms">
        <span class="o-key">${v}</span>
        <span class="o-text">${label}</span>
        <span class="o-mark" aria-hidden="true">${v === val ? '✓ chosen' : ''}</span>
      </button>`;
    }).join('');
  }

  function choose(v) {
    answers[qIdx] = v;
    if (qIdx < 24) { qIdx++; saveDraft(); drawQuestion(); }
    else finish();
  }

  function back() {
    if (qIdx === 0) { show('screen-home'); return; }
    qIdx--;
    saveDraft();
    drawQuestion();
  }

  /* ─────────────────────────── finish → result ─────────────────────────── */

  function finish() {
    store.del(LS_QS);
    showing = null;
    show('screen-working');

    $('#working-dots').innerHTML = '<i></i><i></i><i></i><i></i><i></i>';
    const title = $('#working-title');
    const sub = $('#working-sub');
    sub.textContent = 'your answers stay on this device';
    let step = 0;
    const tick = setInterval(() => {
      if (step < WORK_LINES.length) { title.textContent = WORK_LINES[step++]; return; }
      clearInterval(tick);
      const rec = { id: Date.now(), at: Date.now(), scores: pctMap() };
      saveHistory(rec);
      showing = rec;
      show('screen-result');
    }, 330);
  }

  function openRecord(rec) {
    showing = rec;
    show('screen-result');
  }

  /* ─────────────────────────── result ─────────────────────────── */

  function renderResult() {
    const sc = showing.scores;
    const top = ranked(sc)[0];
    const bottom = ranked(sc)[4];
    const allMid = allMidScores(sc);

    $('#result-date').textContent =
      `Portrait drawn ${dateLabel(showing.at)} · ${timeLabel(showing.at)}`;
    $('#result-title').innerHTML = allMid
      ? 'A portrait of pleasing *balance*'.replace(/\*/g, '<em>')
      : withEm(STRANDS[top.s].levels[levelOf(top.pct)].title);

    $('#result-badges').innerHTML =
      `<span class="badge" style="--sc:${STRANDS[top.s].color}"><i></i>strongest — ${STRANDS[top.s].name} · ${top.pct}%</span>` +
      `<span class="badge" style="--sc:${STRANDS[bottom.s].color}"><i></i>quietest — ${STRANDS[bottom.s].name} · ${bottom.pct}%</span>`;

    renderRadar(sc);
    renderTraits(sc);

    const lead = allMid ? '' : `${STRANDS[bottom.s].name} showed least in your answers today (${bottom.pct}%). `;
    $('#result-footnote').textContent =
      lead + 'Take this whole picture as a weather report, not a verdict — personality drifts with seasons. ' +
      'Come back in a few months and watch the shape of it move.';
  }

  /* a tiny hand-rolled radar — no chart library in sight */
  const R_ANGLES = { O: -90, C: -18, E: 54, A: 126, S: 198 };
  const R_CX = 180, R_CY = 200, R_R = 138;

  function polar(deg, r) {
    const a = (deg * Math.PI) / 180;
    return [R_CX + r * Math.cos(a), R_CY + r * Math.sin(a)];
  }

  function renderRadar(sc) {
    const holder = $('#radar-holder');
    let grid = '';
    for (let ring = 1; ring <= 4; ring++) {
      const pts = STRAND_ORDER.map((s) => polar(R_ANGLES[s], (R_R * ring) / 4).map((n) => n.toFixed(2)).join(',')).join(' ');
      grid += `<polygon points="${pts}" fill="none" stroke="#E3DBC9" stroke-width="1"/>`;
    }
    grid += STRAND_ORDER.map((s) => {
      const [x, y] = polar(R_ANGLES[s], R_R);
      return `<line x1="${R_CX}" y1="${R_CY}" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" stroke="#E3DBC9" stroke-width="1"/>`;
    }).join('');

    const pts = STRAND_ORDER.map((s) =>
      polar(R_ANGLES[s], (sc[s].pct / 100) * R_R).map((n) => n.toFixed(2)).join(',')).join(' ');

    const verts = STRAND_ORDER.map((s, i) => {
      const [x, y] = polar(R_ANGLES[s], (sc[s].pct / 100) * R_R);
      return `<circle class="r-vertex" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="5.5" fill="${STRANDS[s].color}"
        stroke="#FBF8F1" stroke-width="2.5" style="transition-delay:${0.55 + i * 0.08}s"/>`;
    }).join('');

    const labels = STRAND_ORDER.map((s) => {
      const a = (R_ANGLES[s] * Math.PI) / 180;
      const u = Math.cos(a), v = Math.sin(a);
      let x, y, anchor = 'middle';
      if (Math.abs(u) < 0.45) {                 // top / bottom labels
        [x, y] = polar(R_ANGLES[s], R_R + 26);
      } else {                                  // side labels
        anchor = u > 0 ? 'start' : 'end';
        [x, y] = polar(R_ANGLES[s], R_R + 11);
        x += u > 0 ? 4 : -4;
        y += v > 0 ? 4 : -2;
      }
      return `<text class="radar-label r-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle">${STRANDS[s].radarName}</text>`;
    }).join('');

    holder.classList.remove('drawn');
    holder.innerHTML = `
      <svg viewBox="-40 0 440 400" role="img" aria-label="Radar chart of your five personality scores: ${STRAND_ORDER.map((s) => `${STRANDS[s].name} ${sc[s].pct} percent`).join(', ')}">
        <g class="r-grid">${grid}</g>
        <polygon class="r-shape" points="${pts}"
          fill="rgba(41,35,26,0.09)" stroke="rgba(41,35,26,0.55)" stroke-width="2" stroke-linejoin="round"/>
        ${verts}
        ${labels}
      </svg>`;
    requestAnimationFrame(() => holder.classList.add('drawn'));
  }

  function renderTraits(sc) {
    $('#trait-cards').innerHTML = STRAND_ORDER.map((s) => {
      const d = STRANDS[s];
      const L = d.levels[levelOf(sc[s].pct)];
      return `<article class="card tcard" style="--sc:${d.color}">
        <div class="tcard-body">
          <div class="tcard-letter" aria-hidden="true">${s}</div>
          <div>
            <div class="tcard-top">
              <h3>${d.name} <small>${esc(d.sub)}</small></h3>
              <span class="tpct">${sc[s].pct}%</span>
            </div>
            <p class="tband" style="color:${d.color}">${L.band}</p>
            <p>${esc(L.blurb)}</p>
            <div class="tags">${L.words.map((w) => `<span class="tag"><i style="background:${d.color}"></i>${esc(w)}</span>`).join('')}</div>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  /* ─────────────────────────── copy summary ─────────────────────────── */

  function copySummary() {
    const sc = showing.scores;
    const lines = [
      'LICHNOST — a personality portrait in five strands',
      `Drawn on ${dateLabel(showing.at)}`,
      '',
      titlePlain(sc),
      '',
      ...ranked(sc).map(({ s, pct }) => {
        const d = STRANDS[s];
        const L = d.levels[levelOf(pct)];
        return `${d.name}  ${pct}%  —  ${L.band.toLowerCase()} · ${L.words.join(', ')}`;
      }),
      '',
      'Answers never leave the device. Lichnost is a mirror for reflection, not a clinical assessment.',
    ];
    const text = lines.join('\n');

    const done = () => {
      const el = $('#copy-label');
      el.textContent = 'Copied ✓';
      setTimeout(() => { el.textContent = 'Copy summary'; }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch { /* clipboard blocked */ }
    ta.remove();
  }

  /* ─────────────────────────── events ─────────────────────────── */

  function startQuiz(fresh) {
    answers = Array(25).fill(0);
    qIdx = 0;
    if (!fresh) {
      const draft = store.get(LS_QS, null);
      if (draft && Array.isArray(draft.answers)) {
        answers = draft.answers.map((a) => (a >= 1 && a <= 5 ? a : 0));
        qIdx = draft.i || 0;
        while (qIdx < 25 && answers[qIdx]) qIdx++;   // resume at first unanswered
        if (qIdx >= 25) { answers = Array(25).fill(0); qIdx = 0; }
      }
    }
    show('screen-quiz');
    drawQuestion();
  }

  /* ─────────────────────────── boot ─────────────────────────── */

  function boot() {
    /* answer picker — click, keyboard, arrow keys */
    $('#answers').addEventListener('click', (e) => {
      const opt = e.target.closest('.opt');
      if (opt) choose(Number(opt.dataset.v));
    });

    $('#btn-start').addEventListener('click', () => startQuiz(false));
    $('#btn-back').addEventListener('click', back);
    $('#btn-copy').addEventListener('click', copySummary);
    $('#btn-retake').addEventListener('click', () => startQuiz(true));

    document.addEventListener('keydown', (e) => {
      if ($('screen-quiz').hidden) return;
      if (/^[1-5]$/.test(e.key)) { choose(Number(e.key)); return; }
      if (e.key === 'Backspace') { e.preventDefault(); back(); }
    });

    /* history: open or delete a past portrait */
    document.addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]');
      if (del) { deleteHistory(Number(del.dataset.del)); return; }
      const open = e.target.closest('[data-open]');
      if (open) {
        const rec = loadHistory().find((r) => String(r.id) === open.dataset.open);
        if (rec) openRecord(rec);
      }
    });

    /* the wordmark always returns home; in the quiz the draft is autosaved */
    byClass('[data-nav-home]').forEach((b) =>
      b.addEventListener('click', () => {
        if ($('screen-quiz').hidden === false) saveDraft();
        show('screen-home');
      }));

    show('screen-home');
  }

  /* The script is deferred, so the DOM is normally ready on the first call.
     If an environment hands us the DOM late (e.g. some test harnesses),
     retry on the next tick instead of failing. */
  (function bootWhenReady() {
    if (!document.getElementById('btn-start') || !document.getElementById('answers')) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootWhenReady, { once: true });
      } else {
        setTimeout(bootWhenReady, 4);
      }
      return;
    }
    boot();
  })();
})();
