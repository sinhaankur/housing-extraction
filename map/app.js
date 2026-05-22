/* Housing Value Extraction Monitor
 * Live counters, SVG line charts, country leaderboard, bank cards w/ filters + compare.
 * Extend data by editing banks.geojson (see SCHEMA.md) and ../data/historical/*.csv (mirrored inline below).
 */

/* ---------- Inline historical data (mirrors ../data/historical/*.csv) ---------- */
const HIST = {
  usRate: [
    [1971,7.54],[1975,9.05],[1980,13.74],[1981,16.63],[1985,12.42],[1990,10.13],
    [1995,7.93],[2000,8.06],[2005,5.87],[2008,6.03],[2009,5.04],[2012,3.66],
    [2015,3.85],[2020,3.11],[2021,2.96],[2022,5.34],[2023,6.81],[2024,6.72],
    [2025,6.65],[2026,6.63],
  ],
  usPrice: [
    [1970,23000],[1980,62200],[1990,79100],[2000,119600],[2005,232500],[2008,196600],
    [2012,154700],[2018,261600],[2020,329000],[2021,355000],[2022,429000],[2024,420000],[2026,428000],
  ],
  torontoPrice: [
    [1990,255000],[1995,203000],[2000,243000],[2005,335900],[2010,431500],[2015,622000],
    [2017,863000],[2020,929000],[2021,1095000],[2022,1339000],[2023,1126000],[2024,1063000],[2026,1015000],
  ],
  m2: [
    [1971,0.70],[1980,1.60],[1990,3.28],[2000,4.92],[2008,8.27],[2010,8.83],[2015,12.29],
    [2019,15.33],[2020,19.10],[2021,21.51],[2022,21.50],[2024,21.10],[2026,21.90],
  ],
  mbs: [
    [2007,0.00],[2008,0.00],[2009,0.91],[2010,1.13],[2012,0.93],[2014,1.74],[2018,1.66],
    [2019,1.46],[2020,2.04],[2021,2.61],[2022,2.71],[2023,2.51],[2024,2.38],[2026,2.05],
  ],
  // Annotations: [year, label]
  annotations: {
    usRate: [[1981, 'Volcker peak'],[2021, 'All-time low'],[2022, 'Fed pivots']],
    usPrice: [[2008, 'GFC'],[2022, 'COVID peak']],
    torontoPrice: [[2017, 'FBT'],[2022, 'Peak']],
    m2: [[1971, 'Bretton Woods ends'],[2020, 'COVID QE']],
    mbs: [[2008, 'Fed begins MBS'],[2022, 'Peak — QT starts']],
  },
};

/* Country leaderboard data — combines rates, debt/GDP, commission, computed interest on $500k */
const COUNTRIES = [
  { country: 'United States', rate: 6.63, debtGdp: 49, commission: 5.5, interest500k: 651000, posture: 'Reserve currency issuer' },
  { country: 'Canada',         rate: 4.10, debtGdp: 79, commission: 5.5, interest500k: 400000, posture: 'USD-coupled, renewal-reset' },
  { country: 'United Kingdom', rate: 4.50, debtGdp: 64, commission: 2.0, interest500k: 380000, posture: 'Short-fix, renewal-reset' },
  { country: 'Australia',      rate: 6.00, debtGdp: 93, commission: 2.5, interest500k: 580000, posture: 'Variable, Big 4 oligopoly' },
  { country: 'New Zealand',    rate: 5.80, debtGdp: 61, commission: 3.5, interest500k: 560000, posture: 'Anglo, USD-coupled' },
  { country: 'India',          rate: 8.50, debtGdp: 11, commission: 1.7, interest500k: 880000, posture: 'Capital-controlled, highest rate' },
  { country: 'Germany',        rate: 3.80, debtGdp: 40, commission: 3.0, interest500k: 340000, posture: 'Long-fix Pfandbrief, low rates' },
  { country: 'Japan',          rate: 1.50, debtGdp: 39, commission: 3.0, interest500k: 120000, posture: 'Strong monetary sovereignty' },
  { country: 'Netherlands',    rate: 3.90, debtGdp: 87, commission: 1.5, interest500k: 360000, posture: 'NHG state guarantee' },
  { country: 'Switzerland',    rate: 2.50, debtGdp: 121, commission: 3.0, interest500k: 220000, posture: 'Strong franc, capital absorber' },
  { country: 'Singapore',      rate: 3.50, debtGdp: 44, commission: 1.5, interest500k: 310000, posture: 'Public-private split (HDB)' },
  { country: 'Hong Kong',      rate: 4.50, debtGdp: 49, commission: 0.75, interest500k: 380000, posture: 'Cross-border conduit' },
  { country: 'South Africa',   rate: 11.00, debtGdp: 7, commission: 7.5, interest500k: 1180000, posture: 'High-rate, high-commission outlier' },
];

const PRESETS = {
  all:           {},
  state:         { type: new Set(['state_owned_bank','state_development_bank','state_backed_agency']) },
  mutual:        { type: new Set(['building_society_mutual','cooperative_bank']) },
  crossborder:   { revenue: new Set(['cross_border_mortgage']) },
  securitizers:  { revenue: new Set(['securitization','securitization_state_backed']) },
  construction:  { revenue: new Set(['construction_finance']) },
  asia:          { country: new Set(['India','Japan','Hong Kong','Singapore']) },
  anglo:         { country: new Set(['United States','Canada','United Kingdom','Australia']) },
};

/* ---------- State ---------- */
const state = {
  features: [],
  filters: { country: new Set(), type: new Set(), revenue: new Set() },
  search: '',
  preset: 'all',
  pinned: new Set(),
  markersByName: new Map(),
  hoverName: null,
  startTs: Date.now(),
};

/* ---------- Helpers ---------- */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nice = s => String(s ?? '').replaceAll('_',' ');
const uniqSorted = a => [...new Set(a)].sort();
const fmtMoney = n => '$' + Math.round(n).toLocaleString();
const fmtMoneyShort = n => {
  if (n >= 1e12) return '$' + (n/1e12).toFixed(2) + 'T';
  if (n >= 1e9)  return '$' + (n/1e9).toFixed(2) + 'B';
  if (n >= 1e6)  return '$' + (n/1e6).toFixed(1) + 'M';
  return '$' + Math.round(n).toLocaleString();
};

/* ---------- Live counters ---------- */
const SECS_PER_YEAR = 365 * 24 * 3600;
const counterDefs = [
  { id: 'counter-global',   annualUsd: 1.5e12 },   // global mortgage interest
  { id: 'counter-us',       annualUsd: 5.85e11 },  // US mortgage interest
  { id: 'counter-ca',       annualUsd: 9.0e10 },   // Canadian
  { id: 'counter-in',       annualUsd: 2.5e10 },   // India
  { id: 'counter-realtors', annualUsd: 7.5e10 },   // US realtor commissions
  { id: 'counter-presales', annualUsd: 5.0e11 },   // global pre-sale deposits held
  { id: 'counter-qt',       annualUsd: 3.3e11 },   // Fed MBS QT
];

function startCounters() {
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
  function tick() {
    const now = Date.now();
    const elapsedYearSec = (now - yearStart) / 1000;
    for (const def of counterDefs) {
      const el = document.getElementById(def.id);
      if (!el) continue;
      const perSec = def.annualUsd / SECS_PER_YEAR;
      const val = elapsedYearSec * perSec;
      el.textContent = fmtMoney(val);
    }
    requestAnimationFrame(tick);
  }
  tick();
}

/* ---------- Map ---------- */
const map = L.map('map', { worldCopyJump: true, zoomControl: true }).setView([28, 12], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19, attribution: '&copy; OSM',
}).addTo(map);
const markerLayer = L.layerGroup().addTo(map);

function makeMarker(feature) {
  const p = feature.properties;
  const icon = L.divIcon({
    className: '',
    html: `<div class="bank-marker marker-${p.type}"></div>`,
    iconSize: [11,11], iconAnchor: [5.5,5.5],
  });
  const m = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon, riseOnHover: true });
  m.on('mouseover', () => setHover(p.name));
  m.on('mouseout', () => setHover(null));
  m.on('click', () => {
    document.getElementById('banks').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const card = document.querySelector(`.bank-card[data-name="${CSS.escape(p.name)}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        openDetail(p);
      }
    }, 500);
  });
  return m;
}

function setHover(name) {
  state.hoverName = name;
  for (const [n, m] of state.markersByName) {
    const el = m.getElement()?.querySelector('.bank-marker');
    if (!el) continue;
    el.classList.toggle('hover', n === name);
  }
  $$('.bank-card').forEach(c => c.classList.toggle('hovered', c.dataset.name === name));
}

/* ---------- Filtering ---------- */
function passesFilters(f) {
  const p = f.properties, F = state.filters;
  if (F.country.size && !F.country.has(p.country)) return false;
  if (F.type.size && !F.type.has(p.type)) return false;
  if (F.revenue.size && !(p.revenue_models || []).some(r => F.revenue.has(r))) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    if (!`${p.name} ${p.city} ${p.country}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

function visible() {
  return state.features
    .filter(passesFilters)
    .sort((a,b) => (b.properties.mortgage_market_share_pct || 0) - (a.properties.mortgage_market_share_pct || 0));
}

/* ---------- Render ---------- */
function render() {
  const v = visible();
  renderCards(v);
  renderMarkers(v);
  renderCount(v.length);
  renderActiveChips();
  renderFilterButtonStates();
  renderResetVisibility();
}

function renderCards(v) {
  const grid = $('#cards-grid');
  grid.innerHTML = '';
  $('#empty-state').hidden = v.length > 0;
  for (const f of v) {
    const p = f.properties;
    const share = p.mortgage_market_share_pct || 0;
    const card = document.createElement('div');
    card.className = 'bank-card' + (state.pinned.has(p.name) ? ' pinned' : '');
    card.dataset.name = p.name;
    card.innerHTML = `
      <div class="card-head">
        <div>
          <div class="card-name">${esc(p.name)}</div>
          <div class="card-where">${esc(p.city)}, ${esc(p.country)} · <span class="type-chip">${esc(nice(p.type))}</span></div>
        </div>
        <button class="card-pin" title="Pin to compare" aria-label="Pin">${state.pinned.has(p.name) ? '✓' : '+'}</button>
      </div>
      <div class="card-share">
        <span>Share</span>
        <div class="share-bar-track"><div class="share-bar" style="width:${Math.min(share*3, 100)}%"></div></div>
        <span class="share-pct">${share}%</span>
      </div>
      <div class="card-mech">${esc(p.how_they_make_money || '')}</div>
      <div class="card-badges">${(p.revenue_models || []).map(r => `<span class="rev-badge">${esc(nice(r))}</span>`).join('')}</div>
    `;
    card.addEventListener('mouseenter', () => setHover(p.name));
    card.addEventListener('mouseleave', () => setHover(null));
    card.addEventListener('click', e => {
      if (e.target.closest('.card-pin')) {
        togglePin(p.name);
        return;
      }
      openDetail(p);
    });
    grid.appendChild(card);
  }
}

function renderMarkers(v) {
  markerLayer.clearLayers();
  state.markersByName.clear();
  for (const f of v) {
    const m = makeMarker(f);
    markerLayer.addLayer(m);
    state.markersByName.set(f.properties.name, m);
  }
}

function renderCount(n) {
  $('#count').textContent = `${n} of ${state.features.length}`;
}

function renderActiveChips() {
  const c = $('#active-filters'); c.innerHTML = '';
  for (const key of ['country','type','revenue']) {
    for (const val of state.filters[key]) {
      const chip = document.createElement('span');
      chip.className = 'active-chip';
      chip.innerHTML = `${esc(nice(val))} <button title="Remove">×</button>`;
      chip.querySelector('button').addEventListener('click', e => {
        e.stopPropagation();
        state.filters[key].delete(val);
        const cb = document.querySelector(`.filter-panel input[data-key="${key}"][data-value="${CSS.escape(val)}"]`);
        if (cb) cb.checked = false;
        state.preset = 'all';
        $$('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === 'all'));
        render();
      });
      c.appendChild(chip);
    }
  }
}

function renderFilterButtonStates() {
  for (const key of ['country','type','revenue']) {
    const dd = document.querySelector(`.filter-dropdown[data-key="${key}"]`);
    const btn = dd.querySelector('.filter-btn');
    const cnt = dd.querySelector('.filter-count');
    const n = state.filters[key].size;
    btn.classList.toggle('has-selection', n > 0);
    cnt.textContent = n || '';
  }
}

function renderResetVisibility() {
  const anyFilter = state.filters.country.size || state.filters.type.size || state.filters.revenue.size || state.search;
  $('#reset-filters').hidden = !anyFilter;
}

/* ---------- Filter panels ---------- */
function buildFilterPanels() {
  buildPanel('country', uniqSorted(state.features.map(f => f.properties.country)));
  buildPanel('type', uniqSorted(state.features.map(f => f.properties.type)));
  buildPanel('revenue', uniqSorted(state.features.flatMap(f => f.properties.revenue_models || [])));
}

function buildPanel(key, values) {
  const panel = document.querySelector(`.filter-dropdown[data-key="${key}"] .filter-panel`);
  panel.innerHTML = '';
  for (const v of values) {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" data-key="${esc(key)}" data-value="${esc(v)}" /> <span>${esc(nice(v))}</span>`;
    const cb = label.querySelector('input');
    cb.addEventListener('change', () => {
      if (cb.checked) state.filters[key].add(v);
      else state.filters[key].delete(v);
      state.preset = 'all';
      $$('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === 'all'));
      render();
    });
    panel.appendChild(label);
  }
}

function wireDropdowns() {
  $$('.filter-dropdown .filter-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const panel = btn.nextElementSibling;
      const opening = panel.hidden;
      $$('.filter-panel').forEach(p => p.hidden = true);
      panel.hidden = !opening;
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.filter-dropdown')) $$('.filter-panel').forEach(p => p.hidden = true);
  });
}

/* ---------- Presets ---------- */
function applyPreset(name) {
  state.preset = name;
  state.filters.country.clear();
  state.filters.type.clear();
  state.filters.revenue.clear();
  const preset = PRESETS[name] || {};
  for (const k of ['country','type','revenue']) if (preset[k]) state.filters[k] = new Set(preset[k]);
  $$('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === name));
  $$('.filter-panel input[type="checkbox"]').forEach(cb => {
    cb.checked = state.filters[cb.dataset.key]?.has(cb.dataset.value) || false;
  });
  render();
}

function wirePresets() {
  $$('.preset-btn').forEach(b => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
}

/* ---------- Search + reset ---------- */
function wireSearchAndReset() {
  $('#search').addEventListener('input', e => {
    state.search = e.target.value.trim();
    render();
  });
  $('#reset-filters').addEventListener('click', () => {
    applyPreset('all');
    state.search = '';
    $('#search').value = '';
    render();
  });
}

/* ---------- Detail modal ---------- */
function openDetail(p) {
  const body = $('#detail-body');
  const isPinned = state.pinned.has(p.name);
  body.className = 'detail';
  body.innerHTML = `
    <h3>${esc(p.name)}</h3>
    <div class="where">${esc(p.city)}, ${esc(p.country)} · ${esc(nice(p.type))}</div>
    <div class="stat-row">
      <div class="stat"><div class="stat-l">Mortgage market share</div><div class="stat-v">${p.mortgage_market_share_pct ?? '–'}%</div></div>
      <div class="stat"><div class="stat-l">Country</div><div class="stat-v">${esc(p.country)}</div></div>
      <div class="stat"><div class="stat-l">Type</div><div class="stat-v">${esc(nice(p.type))}</div></div>
    </div>
    <div class="label">How they make money</div>
    <div class="body">${esc(p.how_they_make_money || '')}</div>
    ${p.notable ? `<div class="label">Notable</div><div class="body">${esc(p.notable)}</div>` : ''}
    <div class="label">Revenue models</div>
    <div class="badges">${(p.revenue_models || []).map(r => `<span class="rev-badge">${esc(nice(r))}</span>`).join('')}</div>
    <div class="pin-action">
      <button class="primary-btn" id="detail-pin">${isPinned ? '✓ Pinned to compare' : '+ Pin to compare'}</button>
    </div>
  `;
  $('#detail-modal').hidden = false;
  $('#detail-pin').addEventListener('click', () => {
    togglePin(p.name);
    closeModals();
  });
}

function closeModals() {
  $('#detail-modal').hidden = true;
  $('#compare-modal').hidden = true;
}

function wireModalClose() {
  document.addEventListener('click', e => {
    if (e.target.matches('[data-close]')) closeModals();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });
}

/* ---------- Compare ---------- */
function togglePin(name) {
  if (state.pinned.has(name)) state.pinned.delete(name);
  else if (state.pinned.size >= 4) {
    flash('Max 4 pinned at once.');
    return;
  } else state.pinned.add(name);
  renderTray();
  render();
}

function renderTray() {
  const tray = $('#compare-tray');
  tray.hidden = state.pinned.size === 0;
  const pins = $('#tray-pins');
  pins.innerHTML = '';
  for (const name of state.pinned) {
    const btn = document.createElement('button');
    btn.className = 'tray-pin';
    btn.innerHTML = `${esc(name)} <span class="x">×</span>`;
    btn.addEventListener('click', () => togglePin(name));
    pins.appendChild(btn);
  }
  $('#open-compare').textContent = state.pinned.size >= 2
    ? `Side by side (${state.pinned.size}) →`
    : 'Pin 2+ to compare';
  $('#open-compare').disabled = state.pinned.size < 2;
  $('#open-compare').style.opacity = state.pinned.size < 2 ? 0.5 : 1;
}

function wireCompareTray() {
  $('#open-compare').addEventListener('click', () => {
    if (state.pinned.size < 2) return;
    const body = $('#compare-body'); body.innerHTML = '';
    for (const name of state.pinned) {
      const f = state.features.find(f => f.properties.name === name);
      if (!f) continue;
      const p = f.properties;
      const col = document.createElement('div');
      col.className = 'compare-col';
      col.innerHTML = `
        <h3>${esc(p.name)}</h3>
        <div class="where">${esc(p.city)}, ${esc(p.country)}</div>
        <div class="row"><div class="l">Type</div><div class="v">${esc(nice(p.type))}</div></div>
        <div class="row"><div class="l">Market share</div><div class="v">${p.mortgage_market_share_pct ?? '–'}%</div></div>
        <div class="row"><div class="l">Revenue models</div><div class="v">${(p.revenue_models||[]).map(r => `<span class="rev-badge">${esc(nice(r))}</span>`).join(' ')}</div></div>
        <div class="row"><div class="l">Mechanism</div><div class="v">${esc(p.how_they_make_money || '')}</div></div>
        ${p.notable ? `<div class="row"><div class="l">Notable</div><div class="v">${esc(p.notable)}</div></div>` : ''}
      `;
      body.appendChild(col);
    }
    $('#compare-modal').hidden = false;
  });
  $('#clear-compare').addEventListener('click', () => {
    state.pinned.clear();
    renderTray();
    render();
  });
}

function flash(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#161616;color:#fff;padding:8px 14px;border-radius:6px;font-size:13px;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.2)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

/* ---------- Leaderboard ---------- */
function renderLeaderboard(metric = 'mortgage_rate') {
  const tbody = $('#leaderboard-body');
  tbody.innerHTML = '';
  const sorters = {
    mortgage_rate:    (a,b) => b.rate - a.rate,
    mortgage_debt_gdp:(a,b) => b.debtGdp - a.debtGdp,
    commission_pct:   (a,b) => b.commission - a.commission,
    interest_on_500k: (a,b) => b.interest500k - a.interest500k,
  };
  const fieldMax = { rate: 'rate', mortgage_debt_gdp: 'debtGdp', commission_pct: 'commission', interest_on_500k: 'interest500k' };
  const valField = fieldMax[metric] || 'rate';
  const sorted = [...COUNTRIES].sort(sorters[metric]);
  const max = Math.max(...sorted.map(c => c[valField]));
  sorted.forEach((c, i) => {
    const tr = document.createElement('tr');
    const barFor = field => {
      const v = c[field];
      const m = Math.max(...sorted.map(x => x[field]));
      const pct = m ? (v/m)*100 : 0;
      return field === valField
        ? `<div class="bar-cell"><span class="mini-bar" style="width:${pct*0.6}px"></span>${formatField(field, v)}</div>`
        : formatField(field, v);
    };
    tr.innerHTML = `
      <td class="rank">${i+1}</td>
      <td class="country">${esc(c.country)}</td>
      <td class="num">${barFor('rate')}</td>
      <td class="num">${barFor('debtGdp')}</td>
      <td class="num">${barFor('commission')}</td>
      <td class="num">${barFor('interest500k')}</td>
      <td class="posture">${esc(c.posture)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function formatField(field, v) {
  if (field === 'rate') return v.toFixed(2) + '%';
  if (field === 'debtGdp') return v + '%';
  if (field === 'commission') return v.toFixed(2) + '%';
  if (field === 'interest500k') return fmtMoneyShort(v);
  return v;
}

function wireLeaderboard() {
  $$('.lb-btn').forEach(b => b.addEventListener('click', () => {
    $$('.lb-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    renderLeaderboard(b.dataset.metric);
  }));
}

/* ---------- SVG line chart ---------- */
function lineChart(hostId, series, opts = {}) {
  const host = document.getElementById(hostId);
  if (!host) return;
  const W = host.clientWidth || 400;
  const H = host.clientHeight || 200;
  const pad = { t: 14, r: 14, b: 26, l: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const xs = series.map(d => d[0]);
  const ys = series.map(d => d[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = 0;
  const yMax = Math.max(...ys) * 1.08;
  const x = v => pad.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const y = v => pad.t + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const path = series.map((d,i) => (i ? 'L' : 'M') + x(d[0]) + ',' + y(d[1])).join(' ');
  const area = `M${x(series[0][0])},${pad.t+innerH} ${path.replace('M','L')} L${x(series[series.length-1][0])},${pad.t+innerH} Z`;

  const yTicks = 4;
  const yTickVals = Array.from({length: yTicks+1}, (_,i) => yMin + (yMax-yMin)*i/yTicks);
  const xTickCount = 5;
  const xTickStep = Math.ceil((xMax - xMin) / xTickCount);
  const xTickVals = [];
  for (let t = xMin; t <= xMax; t += xTickStep) xTickVals.push(t);
  if (xTickVals[xTickVals.length-1] !== xMax) xTickVals.push(xMax);

  const fmtY = opts.fmtY || (v => v.toFixed(1));
  const fmtX = opts.fmtX || (v => String(v));

  const ann = (opts.annotations || []).map(([yr, lbl]) => {
    const dp = series.reduce((best,d) => Math.abs(d[0]-yr) < Math.abs(best[0]-yr) ? d : best, series[0]);
    return { yr: dp[0], val: dp[1], lbl };
  });

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <g class="axis">
        ${yTickVals.map(v => `
          <line class="tick-grid" x1="${pad.l}" x2="${pad.l+innerW}" y1="${y(v)}" y2="${y(v)}" />
          <text x="${pad.l-6}" y="${y(v)+3}" text-anchor="end">${esc(fmtY(v))}</text>
        `).join('')}
        ${xTickVals.map(v => `
          <text x="${x(v)}" y="${pad.t+innerH+16}" text-anchor="middle">${esc(fmtX(v))}</text>
        `).join('')}
        <line x1="${pad.l}" x2="${pad.l+innerW}" y1="${pad.t+innerH}" y2="${pad.t+innerH}" />
      </g>
      <path class="line-area" d="${area}" />
      <path class="line" d="${path}" />
      ${ann.map(a => `
        <circle class="annot-dot" cx="${x(a.yr)}" cy="${y(a.val)}" r="3.5" />
        <text class="annot" x="${x(a.yr)+6}" y="${y(a.val)-6}">${esc(a.lbl)}</text>
      `).join('')}
    </svg>
  `;
}

/* ---------- Bar chart (debt/GDP) ---------- */
function barChart(hostId, rows, opts = {}) {
  const host = document.getElementById(hostId);
  if (!host) return;
  const W = host.clientWidth || 400;
  const sorted = [...rows].sort((a,b) => b.v - a.v);
  const H = Math.max(200, sorted.length * 18 + 20);
  host.style.height = H + 'px';
  const max = Math.max(...sorted.map(r => r.v));
  const padL = 110, padR = 50;
  const innerW = W - padL - padR;
  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin meet">
      ${sorted.map((r,i) => {
        const yy = i * 18 + 8;
        const w = (r.v/max) * innerW;
        return `
          <text class="bar-axis-label" x="${padL-8}" y="${yy+10}" text-anchor="end">${esc(r.label)}</text>
          <rect class="bar" x="${padL}" y="${yy+2}" width="${w}" height="12" rx="2" />
          <text class="bar-label" x="${padL+w+5}" y="${yy+12}">${esc(opts.fmt ? opts.fmt(r.v) : r.v)}</text>
        `;
      }).join('')}
    </svg>
  `;
}

function drawCharts() {
  lineChart('chart-us-rate', HIST.usRate, { fmtY: v => v.toFixed(1)+'%', annotations: HIST.annotations.usRate });
  lineChart('chart-us-price', HIST.usPrice, { fmtY: v => '$'+(v/1000).toFixed(0)+'k', annotations: HIST.annotations.usPrice });
  lineChart('chart-toronto-price', HIST.torontoPrice, { fmtY: v => '$'+(v/1000).toFixed(0)+'k', annotations: HIST.annotations.torontoPrice });
  lineChart('chart-m2', HIST.m2, { fmtY: v => '$'+v.toFixed(1)+'T', annotations: HIST.annotations.m2 });
  lineChart('chart-mbs', HIST.mbs, { fmtY: v => '$'+v.toFixed(1)+'T', annotations: HIST.annotations.mbs });
  const debtRows = [
    {label:'Switzerland',v:121},{label:'Australia',v:93},{label:'Netherlands',v:87},
    {label:'Canada',v:79},{label:'Sweden',v:73},{label:'UK',v:64},
    {label:'United States',v:49},{label:'Hong Kong',v:49},{label:'Singapore',v:44},
    {label:'Germany',v:40},{label:'Japan',v:39},{label:'France',v:37},
    {label:'China',v:30},{label:'India',v:11},
  ];
  barChart('chart-debtgdp', debtRows, { fmt: v => v + '%' });
}

window.addEventListener('resize', () => {
  drawCharts();
});

/* ---------- Boot ---------- */
async function load() {
  try {
    const res = await fetch('banks.geojson');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.features = data.features;
    buildFilterPanels();
    wireDropdowns();
    wirePresets();
    wireSearchAndReset();
    wireModalClose();
    wireCompareTray();
    wireLeaderboard();
    renderLeaderboard('mortgage_rate');
    render();
    drawCharts();
    startCounters();
  } catch (err) {
    console.error(err);
    $('#empty-state').hidden = false;
    $('#empty-state').innerHTML = `
      <strong>Couldn't load banks.geojson.</strong>
      <p>Serve the <code>map/</code> folder via a local server:<br>
      <code>cd map &amp;&amp; python3 -m http.server 8000</code><br>
      then open <code>http://localhost:8000</code>.</p>
    `;
  }
}

load();
