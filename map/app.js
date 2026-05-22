/* Housing Extraction — visual breakdown app
 * Map · Total expense (where every dollar goes) · Value-over-time decomposition
 * · How-it-connects flow diagram · Historical lines · Bank explorer
 */

/* ────────────────────────── INLINE DATA ────────────────────────── */

// $700k Toronto condo, 10-yr cycle (purchase + 2 resales).
// All in CAD ≈ USD for clarity. See ../case-studies/toronto-condo-700k.md.
const EXPENSE = [
  { key: 'home',     label: 'The home itself',     amount: 560000, cls: 'home',    note: 'Build cost: materials, labour, land. The only layer that produces shelter.' },
  { key: 'dev',      label: 'Developer profit',    amount: 140000, cls: 'finance', note: '~20% gross margin on the first sale. Pre-sales let the developer use your deposit as construction working capital.' },
  { key: 'dtax',     label: 'Direct taxes',        amount: 144000, cls: 'currency',note: 'HST on new build $50k + Land Transfer Tax × 3 sales $45k + Property tax × 10yr $49k. Visible on closing statements.' },
  { key: 'itax',     label: 'Indirect taxes',      amount: 98000,  cls: 'currency',note: 'HST on materials/services embedded in build cost $32k + corporate tax on developer profit $35k + corporate tax on bank interest $24k + dev charges/permit fees passed through $7k.' },
  { key: 'interest', label: 'Bank interest',       amount: 190000, cls: 'finance', note: '10 years of mortgage interest, across 2 buyers and 2 renewals. Frontloaded — ~70% of every monthly payment in year 1.' },
  { key: 'realtor',  label: 'Realtor commissions', amount: 73000,  cls: 'finance', note: '5% on year-5 resale + 5% on year-10 resale. Each is the full price × 5%, regardless of value added.' },
  { key: 'ins',      label: 'Insurance & fees',    amount: 35000,  cls: 'currency',note: 'CMHC default insurance ~$30k (if <20% down) + title insurance + legal + appraisals over 3 closings.' },
];
const EXPENSE_TOTAL = EXPENSE.reduce((s,x) => s+x.amount, 0); // 1,240,000

// Stacked value-over-time decomposition. Construction is the only physical anchor;
// the financialization layer is residual after construction + land + currency.
const VALUE_STACK = {
  toronto: {
    units: 'CAD',
    rows: [
      { year:1990, construct:180, land:50,  currency:0,   finance:25  },
      { year:1995, construct:195, land:8,   currency:0,   finance:0   },
      { year:2000, construct:205, land:38,  currency:0,   finance:0   },
      { year:2005, construct:225, land:80,  currency:16,  finance:15  },
      { year:2010, construct:245, land:100, currency:45,  finance:42  },
      { year:2015, construct:270, land:120, currency:90,  finance:142 },
      { year:2017, construct:290, land:135, currency:130, finance:308 },
      { year:2020, construct:315, land:150, currency:175, finance:289 },
      { year:2022, construct:345, land:170, currency:240, finance:584 },
      { year:2024, construct:380, land:170, currency:255, finance:258 },
      { year:2026, construct:395, land:170, currency:260, finance:190 },
    ],
  },
  us: {
    units: 'USD',
    rows: [
      { year:1990, construct:60,  land:18,  currency:0,   finance:1   },
      { year:1995, construct:70,  land:29,  currency:0,   finance:0   },
      { year:2000, construct:80,  land:38,  currency:0,   finance:2   },
      { year:2005, construct:90,  land:55,  currency:25,  finance:62  },
      { year:2010, construct:100, land:55,  currency:17,  finance:0   },
      { year:2015, construct:115, land:55,  currency:34,  finance:19  },
      { year:2020, construct:140, land:65,  currency:65,  finance:59  },
      { year:2022, construct:165, land:70,  currency:100, finance:94  },
      { year:2024, construct:175, land:70,  currency:110, finance:65  },
      { year:2026, construct:185, land:70,  currency:115, finance:58  },
    ],
  },
};

// Granular Toronto year-by-year: price (CAD thousands) + what drove that year's move.
// `major` marks structural turning points; smaller dots = ordinary years.
const TORONTO_ANNUAL = [
  { year:1990, price:255, event:'Late-80s bubble peak. Rates ~14%, prices flat from \'89.', major:true },
  { year:1991, price:234, event:'Recession bites. Toronto market falls 8%.' },
  { year:1992, price:218, event:'Continued decline. Unemployment 11%.' },
  { year:1993, price:207, event:'Bottom forms. BoC cuts rates aggressively.' },
  { year:1994, price:200, event:'BoC overnight rate down to ~5%.', major:true },
  { year:1995, price:203, event:'Stabilizing. Confidence returns slowly.' },
  { year:1996, price:211, event:'Low rates lift first-time demand.' },
  { year:1997, price:220, event:'Modest growth. CMHC expands insurance access.' },
  { year:1998, price:226, event:'Asian crisis: Toronto seen as safe haven.' },
  { year:1999, price:235, event:'Tech-era confidence; broad lift.' },
  { year:2000, price:243, event:'Dot-com peak. Rates 5.75%.' },
  { year:2001, price:251, event:'9/11; BoC + Fed cut emergency.', major:true },
  { year:2002, price:275, event:'Aggressive easing transmits to housing.' },
  { year:2003, price:294, event:'Strong demand; cheap money era.' },
  { year:2004, price:315, event:'Speculation rebuilds.' },
  { year:2005, price:336, event:'Momentum builds. Sub-prime era starts in US.' },
  { year:2006, price:352, event:'Global housing froth peaks elsewhere.' },
  { year:2007, price:376, event:'Pre-GFC peak. Toronto lags US bubble.' },
  { year:2008, price:379, event:'US crashes; Canada\'s banks hold; CMHC absorbs risk.' },
  { year:2009, price:395, event:'Post-GFC: BoC at 0.25%; QE in US pumps Toronto prices.', major:true },
  { year:2010, price:432, event:'QE1 fully on; foreign capital flows arrive.' },
  { year:2011, price:466, event:'Foreign buyer wave begins; HK + China.' },
  { year:2012, price:498, event:'Mark Carney warns; rates stay near zero.' },
  { year:2013, price:523, event:'Heating up. Condo construction boom.' },
  { year:2014, price:566, event:'Sustained momentum. Loonie weakens, attracts more foreign $.' },
  { year:2015, price:622, event:'Strong year. Vancouver introduces foreign buyer tax (Aug).' },
  { year:2016, price:730, event:'Bidding wars accelerate. Detached over $1M routine.' },
  { year:2017, price:863, event:'Foreign Buyer Tax introduced (April); pre-FBT panic peak.', major:true },
  { year:2018, price:787, event:'FBT + B-20 stress test bite. -9%.' },
  { year:2019, price:819, event:'Modest recovery as buyers adapt.' },
  { year:2020, price:929, event:'COVID. BoC emergency QE. Suburbs surge.', major:true },
  { year:2021, price:1095, event:'Pandemic frenzy; ultra-low rates; +18% in one year.' },
  { year:2022, price:1339, event:'All-time peak (Feb); BoC rate hikes begin (Mar).', major:true },
  { year:2023, price:1126, event:'Rate shock; mortgage payments double; -16%.', major:true },
  { year:2024, price:1063, event:'Slow grind down. Listings rise.' },
  { year:2025, price:1040, event:'Sustained correction. High-rate regime persists.' },
  { year:2026, price:1015, event:'Soft market. Affordability still extreme.' },
];

// Wage anchor: median household income vs actual home price. The "fair" price is
// income × an internationally-recognized affordable multiplier (Demographia: 3× = affordable,
// 4× = moderately unaffordable, 5+ = severely unaffordable). The shaded gap is what
// banks + real estate added on top of what wages can sustain.
const WAGE_DATA = {
  toronto: {
    label: 'Toronto · CAD',
    units: 'k',
    multiplier: 4,
    multiplierLabel: '4× income (affordable threshold)',
    income: [
      [1990,45],[1995,49],[2000,57],[2005,64],[2010,71],[2015,79],
      [2020,92],[2021,93],[2022,95],[2023,97],[2024,98],[2025,99],[2026,100],
    ],
    price: [
      [1990,255],[1995,203],[2000,243],[2005,336],[2010,432],[2015,622],
      [2020,929],[2021,1095],[2022,1339],[2023,1126],[2024,1063],[2025,1040],[2026,1015],
    ],
  },
  us: {
    label: 'US · USD',
    units: 'k',
    multiplier: 3,
    multiplierLabel: '3× income (affordable threshold)',
    income: [
      [1990,30],[1995,35],[2000,42],[2005,46],[2010,50],[2015,56],
      [2020,67.5],[2021,71],[2022,74],[2023,77],[2024,80],[2025,82],[2026,83],
    ],
    price: [
      [1990,79],[1995,99],[2000,119],[2005,232],[2010,172],[2015,223],
      [2020,329],[2021,355],[2022,429],[2023,418],[2024,420],[2025,425],[2026,428],
    ],
  },
};

// Historical lines.
const HIST = {
  usRate: [[1971,7.54],[1981,16.63],[1985,12.42],[1990,10.13],[1995,7.93],[2000,8.06],[2005,5.87],[2008,6.03],[2009,5.04],[2012,3.66],[2015,3.85],[2020,3.11],[2021,2.96],[2022,5.34],[2023,6.81],[2024,6.72],[2025,6.65],[2026,6.63]],
  torontoPrice: [[1990,255],[1995,203],[2000,243],[2005,336],[2010,432],[2015,622],[2017,863],[2020,929],[2021,1095],[2022,1339],[2023,1126],[2024,1063],[2025,1040],[2026,1015]],
  m2: [[1971,0.70],[1980,1.60],[1990,3.28],[2000,4.92],[2008,8.27],[2010,8.83],[2015,12.29],[2019,15.33],[2020,19.10],[2021,21.51],[2022,21.50],[2024,21.10],[2026,21.90]],
  mbs: [[2007,0.00],[2008,0.00],[2009,0.91],[2010,1.13],[2012,0.93],[2014,1.74],[2018,1.66],[2019,1.46],[2020,2.04],[2021,2.61],[2022,2.71],[2023,2.51],[2024,2.38],[2026,2.05]],
  annot: {
    usRate: [[1981,'Volcker'],[2021,'low'],[2022,'pivot']],
    torontoPrice: [[2017,'FBT'],[2022,'peak']],
    m2: [[1971,'BW ends'],[2020,'COVID']],
    mbs: [[2008,'Fed buys MBS'],[2022,'QT']],
  },
};

// Flow diagram: nodes with positions (viewBox 1400×640) and edges.
// `t` on an edge is label position along the path (0-1). Stagger to avoid collisions.
const FLOW_NODES = [
  // [id,             label,              role,        x,     y,    sub]
  ['buyer',           'Buyer / Occupier', 'occupier',  700,   60,   'every dollar in'],
  // Layer 1: direct extractors
  ['bank',            'Bank',             'extractor', 140,   240,  'interest · servicing'],
  ['developer',       'Developer',        'extractor', 420,   240,  'one-time margin'],
  ['govt',            'Government',       'state',     700,   240,  'direct + indirect tax'],
  ['agent',           'Realtor',          'extractor', 980,   240,  'commission on resale'],
  ['insurer',         'Insurer',          'extractor', 1260,  240,  'CMHC + title'],
  // Layer 2: markets / inputs
  ['mbs',             'MBS Market',       'market',    140,   420,  'loans → bonds'],
  ['construction',    'Construction',     'market',    360,   420,  'labour + materials'],
  ['land',            'Land owner',       'market',    560,   420,  'site cost'],
  ['public',          'Public services',  'state',     780,   420,  'schools · transit · debt'],
  ['reinsurer',       'Reinsurer',        'market',    1260,  420,  'risk laid off'],
  // Layer 3: system
  ['cb',              'Central bank',     'state',     140,   590,  'QE buys MBS'],
  ['foreign',         'Foreign capital',  'market',    600,   590,  'condos · deposits'],
  ['oil',             'Oil exporter',     'market',    960,   590,  'petrodollar source'],
];

// Each edge: [source, target, weight, label, t (position along path 0-1), curve]
const FLOW_EDGES = [
  ['buyer',     'bank',         'heavy',  'mortgage interest $190k', 0.55, 'down'],
  ['buyer',     'developer',    'heavy',  'purchase $700k',          0.45, 'down'],
  ['buyer',     'govt',         'medium', 'direct taxes $144k',      0.55, 'down'],
  ['buyer',     'agent',        'medium', 'commissions $73k',        0.45, 'down'],
  ['buyer',     'insurer',      'light',  'premiums $35k',           0.55, 'down'],
  ['bank',      'mbs',          'heavy',  'loans → MBS',             0.5,  'down'],
  ['bank',      'govt',         'light',  'corp tax',                0.4,  'down-right'],
  ['developer', 'construction', 'medium', 'build cost',              0.5,  'down'],
  ['developer', 'land',         'medium', 'land cost',               0.5,  'down-right'],
  ['developer', 'govt',         'medium', 'dev charges',             0.4,  'down-right-short'],
  ['agent',     'govt',         'light',  'income tax',              0.6,  'down-left'],
  ['insurer',   'reinsurer',    'light',  'reinsurance',             0.5,  'down'],
  ['mbs',       'cb',           'heavy',  'QE buys MBS',             0.5,  'down'],
  ['foreign',   'bank',         'medium', 'deposits → lending',      0.6,  'up'],
  ['oil',       'foreign',      'medium', 'petrodollar recycling',   0.5,  'left'],
  ['cb',        'bank',         'heavy',  'reserves → lending',      0.5,  'feedback-up'],
];

// Per-node detail panel content (shown on hover / click).
const FLOW_DETAIL = {
  buyer: {
    headline: 'Pays for everything',
    takes: ['shelter (use value)', 'sometimes: nominal appreciation'],
    gives: [
      ['Bank',       'mortgage interest + servicing'],
      ['Developer',  'purchase price'],
      ['Government', 'HST + LTT + property tax'],
      ['Realtor',    'commission on each resale'],
      ['Insurer',    'CMHC + title premiums'],
    ],
    note: 'Every node above the buyer collects on every transaction. Most "appreciation" is currency expansion, not real growth — see section 03.',
  },
  bank: {
    headline: 'The continuous extractor',
    takes: [
      ['Buyer',         'interest + servicing'],
      ['Foreign capital','cheap deposit funding'],
      ['Central bank',  'reserves (post-QE)'],
    ],
    gives: [
      ['MBS market',  'loans bundled as bonds'],
      ['Government',  'corporate tax (indirect)'],
    ],
    note: 'The only extractor that earns continuously. Each cycle resets the amortization clock — frontloaded interest schedule restarts for the next buyer.',
  },
  developer: {
    headline: 'One-time extractor',
    takes: [['Buyer', 'purchase price']],
    gives: [
      ['Construction', 'labour + materials'],
      ['Land owner',   'site cost'],
      ['Government',   'dev charges + corp tax'],
    ],
    note: '15–25% gross margins typical. Uses pre-sale deposits as construction working capital — the buyer carries the risk before completion.',
  },
  govt: {
    headline: 'Direct + indirect taxer',
    takes: [
      ['Buyer',     'HST + LTT + property tax'],
      ['Bank',      'corp tax'],
      ['Developer', 'dev charges + corp tax'],
      ['Realtor',   'income tax'],
    ],
    gives: [['Public services', 'schools, transit, debt servicing']],
    note: 'Strong fiscal incentive to keep transaction volume up — aligns government with the other extractors and against affordability.',
  },
  agent: {
    headline: 'Recurring matcher',
    takes: [['Buyer', 'commission on every resale']],
    gives: [['Government', 'income tax']],
    note: '5–6% in US/Canada is a global outlier. UK/Australia: 1–3%. The buyer-agent commission is paid by the seller but recommended by the buyer\'s own agent — that\'s why internet disruption never collapsed it.',
  },
  insurer: {
    headline: 'Risk channel',
    takes: [['Buyer', 'CMHC + title premiums']],
    gives: [['Reinsurer', 'reinsurance premiums']],
    note: 'CMHC transfers mortgage default risk to the federal government in Canada. Banks keep the interest, taxpayers absorb the defaults.',
  },
  mbs: {
    headline: 'Financialization conduit',
    takes: [['Bank', 'mortgage pools']],
    gives: [['Central bank', 'MBS sold under QE']],
    note: 'Turns frontloaded interest into a tradeable security. Each derivative layer (CDO, CDS) generates fees without adding shelter.',
  },
  construction: {
    headline: 'The only physical input',
    takes: [['Developer', 'build payment']],
    gives: [['Government', 'corporate + payroll tax']],
    note: '~$665–775 per sqft to actually build a downtown Toronto condo. The real cost of shelter, before everything else stacks on top.',
  },
  land: {
    headline: 'Site value',
    takes: [['Developer', 'land cost']],
    gives: [],
    note: 'Restrictive zoning + demand growth, not absolute scarcity, drives land prices in most major markets.',
  },
  public: {
    headline: 'Notional return on taxes',
    takes: [['Government', 'tax revenue']],
    gives: [['Buyer (indirect)', 'transit, schools, services']],
    note: 'Much of public revenue services existing debt and pensions before reaching new services.',
  },
  reinsurer: {
    headline: 'Tail risk',
    takes: [['Insurer', 'premiums']],
    gives: [],
    note: 'Backstops insurer balance sheets — invisible to buyers but sets the floor of insurable risk.',
  },
  cb: {
    headline: 'Unlimited backstop',
    takes: [['MBS market', 'MBS via QE']],
    gives: [['Bank', 'reserves → lending capacity']],
    note: 'Post-2008, central banks became structural MBS buyers. The housing-credit loop now has an explicit policy backstop — and the housing inflation that follows.',
  },
  foreign: {
    headline: 'Capital recycling',
    takes: [['Oil exporter', 'petrodollar inflow']],
    gives: [
      ['Bank',  'cheap funding'],
      ['Buyer market', 'direct condo purchases'],
    ],
    note: 'USD reserve-currency status routes surplus capital from oil + trade-surplus economies into US/Anglosphere real estate.',
  },
  oil: {
    headline: 'Petrodollar origin',
    takes: ['oil revenue (USD)'],
    gives: [['Foreign capital', 'recycled into USD assets']],
    note: '1974 Saudi-US agreement is still load-bearing in 2026. Its slow erosion is the current open question.',
  },
};

// Presets for bank explorer (set after features load).
const PRESETS = {
  all:          {},
  state:        { type: new Set(['state_owned_bank','state_development_bank','state_backed_agency']) },
  mutual:       { type: new Set(['building_society_mutual','cooperative_bank']) },
  crossborder:  { revenue: new Set(['cross_border_mortgage']) },
  securitizers: { revenue: new Set(['securitization','securitization_state_backed']) },
  construction: { revenue: new Set(['construction_finance']) },
  asia:         { country: new Set(['India','Japan','Hong Kong','Singapore']) },
  anglo:        { country: new Set(['United States','Canada','United Kingdom','Australia']) },
};

/* ────────────────────────── STATE + HELPERS ────────────────────────── */

const state = {
  features: [],
  filters: { country: new Set(), type: new Set(), revenue: new Set() },
  search: '',
  preset: 'all',
  pinned: new Set(),
  markersByName: new Map(),
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nice = s => String(s ?? '').replaceAll('_',' ');
const uniqSorted = a => [...new Set(a)].sort();
const fmtK = n => '$' + Math.round(n/1000) + 'k';
const fmtM = n => '$' + (n/1e6).toFixed(2) + 'M';

/* ────────────────────────── MAP ────────────────────────── */

const map = L.map('map', { worldCopyJump: true, zoomControl: true, attributionControl: true }).setView([28, 12], 2);
// CartoDB Dark Matter — the closest free OSM-based equivalent of the Snazzymaps "black and grey" style:
// black background, grey roads, minimal labels in light grey.
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  subdomains: 'abcd',
  attribution: '&copy; OSM, &copy; CARTO',
}).addTo(map);
const markerLayer = L.layerGroup().addTo(map);
$('#map-fit').addEventListener('click', () => map.setView([28, 12], 2));

function makeMarker(feature) {
  const p = feature.properties;
  const icon = L.divIcon({
    className: '',
    html: `<div class="bank-marker marker-${p.type}"></div>`,
    iconSize: [10,10], iconAnchor: [5,5],
  });
  const m = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon, riseOnHover: true });
  m.on('mouseover', () => setHover(p.name));
  m.on('mouseout', () => setHover(null));
  m.on('click', () => {
    document.getElementById('banks').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      const card = document.querySelector(`.bank-card[data-name="${CSS.escape(p.name)}"]`);
      if (card) { card.scrollIntoView({ behavior:'smooth', block:'center' }); openDetail(p); }
    }, 500);
  });
  return m;
}

function setHover(name) {
  for (const [n, m] of state.markersByName) {
    const el = m.getElement()?.querySelector('.bank-marker');
    if (el) el.classList.toggle('hover', n === name);
  }
  $$('.bank-card').forEach(c => c.classList.toggle('hovered', c.dataset.name === name));
}

/* ────────────────────────── BANK EXPLORER ────────────────────────── */

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
  return state.features.filter(passesFilters)
    .sort((a,b) => (b.properties.mortgage_market_share_pct||0) - (a.properties.mortgage_market_share_pct||0));
}

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
        <button class="card-pin" title="Pin to compare">${state.pinned.has(p.name) ? '✓' : '+'}</button>
      </div>
      <div class="card-share">
        <span>Share</span>
        <div class="share-bar-track"><div class="share-bar" style="width:${Math.min(share*3,100)}%"></div></div>
        <span class="share-pct">${share}%</span>
      </div>
      <div class="card-mech">${esc(p.how_they_make_money || '')}</div>
      <div class="card-badges">${(p.revenue_models||[]).map(r => `<span class="rev-badge">${esc(nice(r))}</span>`).join('')}</div>
    `;
    card.addEventListener('mouseenter', () => setHover(p.name));
    card.addEventListener('mouseleave', () => setHover(null));
    card.addEventListener('click', e => {
      if (e.target.closest('.card-pin')) { togglePin(p.name); return; }
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

function renderCount(n) { $('#count').textContent = `${n} of ${state.features.length}`; }

function renderActiveChips() {
  const c = $('#active-filters'); c.innerHTML = '';
  for (const key of ['country','type','revenue']) {
    for (const val of state.filters[key]) {
      const chip = document.createElement('span');
      chip.className = 'active-chip';
      chip.innerHTML = `${esc(nice(val))} <button>×</button>`;
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
  const any = state.filters.country.size || state.filters.type.size || state.filters.revenue.size || state.search;
  $('#reset-filters').hidden = !any;
}

function buildFilterPanels() {
  buildPanel('country', uniqSorted(state.features.map(f => f.properties.country)));
  buildPanel('type', uniqSorted(state.features.map(f => f.properties.type)));
  buildPanel('revenue', uniqSorted(state.features.flatMap(f => f.properties.revenue_models||[])));
}

function buildPanel(key, values) {
  const panel = document.querySelector(`.filter-dropdown[data-key="${key}"] .filter-panel`);
  panel.innerHTML = '';
  for (const v of values) {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" data-key="${esc(key)}" data-value="${esc(v)}" /> <span>${esc(nice(v))}</span>`;
    label.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) state.filters[key].add(v); else state.filters[key].delete(v);
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

function applyPreset(name) {
  state.preset = name;
  state.filters.country.clear();
  state.filters.type.clear();
  state.filters.revenue.clear();
  const p = PRESETS[name] || {};
  for (const k of ['country','type','revenue']) if (p[k]) state.filters[k] = new Set(p[k]);
  $$('.preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === name));
  $$('.filter-panel input[type="checkbox"]').forEach(cb => {
    cb.checked = state.filters[cb.dataset.key]?.has(cb.dataset.value) || false;
  });
  render();
}

function wirePresets() {
  $$('.preset-btn').forEach(b => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
}

function wireSearchAndReset() {
  $('#search').addEventListener('input', e => { state.search = e.target.value.trim(); render(); });
  $('#reset-filters').addEventListener('click', () => {
    applyPreset('all'); state.search = ''; $('#search').value = ''; render();
  });
}

/* ────────────────────────── DETAIL + COMPARE ────────────────────────── */

function openDetail(p) {
  const body = $('#detail-body');
  const isPinned = state.pinned.has(p.name);
  body.className = 'detail';
  body.innerHTML = `
    <h3>${esc(p.name)}</h3>
    <div class="where">${esc(p.city)}, ${esc(p.country)} · ${esc(nice(p.type))}</div>
    <div class="stat-row">
      <div class="stat"><div class="stat-l">Mortgage share</div><div class="stat-v">${p.mortgage_market_share_pct ?? '–'}%</div></div>
      <div class="stat"><div class="stat-l">Country</div><div class="stat-v">${esc(p.country)}</div></div>
      <div class="stat"><div class="stat-l">Type</div><div class="stat-v" style="font-size:14px">${esc(nice(p.type))}</div></div>
    </div>
    <div class="label">How they make money</div>
    <div class="body">${esc(p.how_they_make_money || '')}</div>
    ${p.notable ? `<div class="label">Notable</div><div class="body">${esc(p.notable)}</div>` : ''}
    <div class="label">Revenue models</div>
    <div class="badges">${(p.revenue_models||[]).map(r => `<span class="rev-badge">${esc(nice(r))}</span>`).join('')}</div>
    <div class="pin-action"><button class="primary-btn" id="detail-pin">${isPinned ? '✓ Pinned' : '+ Pin to compare'}</button></div>
  `;
  $('#detail-modal').hidden = false;
  $('#detail-pin').addEventListener('click', () => { togglePin(p.name); closeModals(); });
}

function closeModals() { $('#detail-modal').hidden = true; $('#compare-modal').hidden = true; }

function wireModalClose() {
  document.addEventListener('click', e => { if (e.target.matches('[data-close]')) closeModals(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });
}

function togglePin(name) {
  if (state.pinned.has(name)) state.pinned.delete(name);
  else if (state.pinned.size >= 4) return flash('Max 4 pinned.');
  else state.pinned.add(name);
  renderTray(); render();
}

function renderTray() {
  $('#compare-tray').hidden = state.pinned.size === 0;
  const pins = $('#tray-pins'); pins.innerHTML = '';
  for (const name of state.pinned) {
    const btn = document.createElement('button');
    btn.className = 'tray-pin';
    btn.innerHTML = `${esc(name)} <span style="opacity:0.5">×</span>`;
    btn.addEventListener('click', () => togglePin(name));
    pins.appendChild(btn);
  }
  const open = $('#open-compare');
  open.textContent = state.pinned.size >= 2 ? `Side by side (${state.pinned.size}) →` : 'Pin 2+ to compare';
  open.disabled = state.pinned.size < 2;
  open.style.opacity = state.pinned.size < 2 ? 0.5 : 1;
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
        <div class="row"><div class="l">Revenue</div><div class="v">${(p.revenue_models||[]).map(r => `<span class="rev-badge">${esc(nice(r))}</span>`).join(' ')}</div></div>
        <div class="row"><div class="l">Mechanism</div><div class="v">${esc(p.how_they_make_money||'')}</div></div>
        ${p.notable ? `<div class="row"><div class="l">Notable</div><div class="v">${esc(p.notable)}</div></div>` : ''}
      `;
      body.appendChild(col);
    }
    $('#compare-modal').hidden = false;
  });
  $('#clear-compare').addEventListener('click', () => { state.pinned.clear(); renderTray(); render(); });
}

function flash(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:oklch(0.985 0 0);color:oklch(0.145 0 0);padding:8px 14px;border-radius:6px;font-size:13px;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,0.4);font-family:Geist Mono';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

/* ────────────────────────── EXPENSE CHART (segmented bar) ────────────────────────── */

const COLORS = {
  home:     'oklch(0.4 0.08 200)',
  finance:  'oklch(0.62 0.22 25)',
  currency: 'oklch(0.7 0.18 70)',
  land:     'oklch(0.55 0.12 160)',
};

function drawExpense() {
  const host = $('#expense-chart');
  const W = host.clientWidth || 800;
  const H = 480;
  host.innerHTML = '';
  const pad = { t: 50, r: 30, b: 30, l: 30 };
  const innerW = W - pad.l - pad.r;
  const barH = 100;
  const barY = pad.t + 80;

  let x = pad.l;
  const segments = EXPENSE.map(s => {
    const w = (s.amount / EXPENSE_TOTAL) * innerW;
    const seg = { ...s, x, w };
    x += w;
    return seg;
  });

  const svg = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <text x="${pad.l}" y="22" class="annot" style="fill:var(--muted-foreground);font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Total billed over 10 years</text>
      <text x="${pad.l}" y="55" style="font-family:Fraunces,serif;font-size:34px;font-weight:500;fill:var(--foreground);letter-spacing:-0.01em">${fmtM(EXPENSE_TOTAL)}</text>
      <text x="${pad.l + 240}" y="55" style="font-family:Geist,sans-serif;font-size:13px;fill:var(--muted-foreground)">on a $700,000 sticker price</text>

      ${segments.map(s => `
        <g class="expense-seg" data-key="${s.key}">
          <rect x="${s.x}" y="${barY}" width="${s.w}" height="${barH}"
                fill="${COLORS[s.cls]}" fill-opacity="${s.cls==='home'?0.55:0.9}" stroke="oklch(0.145 0 0)" stroke-width="1"/>
          ${s.w > 70 ? `
            <text x="${s.x + 8}" y="${barY + 24}" style="font-family:Geist Mono,monospace;font-size:11px;letter-spacing:0.04em;fill:oklch(0.985 0 0);font-weight:500">${esc(s.label.toUpperCase())}</text>
            <text x="${s.x + 8}" y="${barY + 46}" style="font-family:Fraunces,serif;font-size:20px;font-weight:500;fill:oklch(0.985 0 0)">${fmtK(s.amount)}</text>
            <text x="${s.x + 8}" y="${barY + 64}" style="font-family:Geist Mono,monospace;font-size:10px;fill:oklch(0.985 0 0 / 0.7)">${(s.amount/EXPENSE_TOTAL*100).toFixed(0)}%</text>
          ` : `
            <text x="${s.x + s.w/2}" y="${barY + barH + 14}" text-anchor="middle" style="font-family:Geist Mono,monospace;font-size:10px;fill:var(--muted-foreground)">${(s.amount/EXPENSE_TOTAL*100).toFixed(0)}%</text>
          `}
        </g>
      `).join('')}

      <!-- Bracket: home cost vs. extraction overlay -->
      <line x1="${segments[0].x}" x2="${segments[0].x + segments[0].w}"
            y1="${barY + barH + 32}" y2="${barY + barH + 32}"
            stroke="oklch(0.4 0.08 200)" stroke-width="2"/>
      <text x="${segments[0].x + segments[0].w/2}" y="${barY + barH + 52}" text-anchor="middle"
            style="font-family:Geist Mono,monospace;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;fill:oklch(0.6 0.1 200)">
        The home itself · $560k
      </text>

      <line x1="${segments[1].x}" x2="${segments[segments.length-1].x + segments[segments.length-1].w}"
            y1="${barY + barH + 32}" y2="${barY + barH + 32}"
            stroke="oklch(0.62 0.22 25)" stroke-width="2"/>
      <text x="${(segments[1].x + segments[segments.length-1].x + segments[segments.length-1].w)/2}" y="${barY + barH + 52}" text-anchor="middle"
            style="font-family:Geist Mono,monospace;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;fill:oklch(0.7 0.22 25)">
        Extraction overlay · $680k
      </text>

      <!-- Caption -->
      <text x="${pad.l}" y="${H - 12}" style="font-family:Geist Mono,monospace;font-size:10px;fill:var(--muted-foreground);letter-spacing:0.02em">
        Toronto pre-construction condo · 20% down · 5-yr fixed @ 4.1% · resold yr 5 + yr 10 · all numbers Toronto market 2026
      </text>
    </svg>
  `;
  host.innerHTML = svg;
}

/* ────────────────────────── GRANULAR PRICE TIMELINE ────────────────────────── */

function drawGranularPrice() {
  const host = $('#granular-chart');
  if (!host) return;
  const W = host.clientWidth || 900;
  const H = host.clientHeight || 340;
  const pad = { t: 30, r: 30, b: 32, l: 56 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const data = TORONTO_ANNUAL;
  const xMin = data[0].year, xMax = data[data.length-1].year;
  const yMax = Math.max(...data.map(d => d.price)) * 1.05;
  const x = v => pad.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const y = v => pad.t + innerH - (v / yMax) * innerH;
  const path = data.map((d,i) => (i ? 'L' : 'M') + x(d.year) + ',' + y(d.price)).join(' ');
  const area = `M${x(data[0].year)},${pad.t+innerH} ${path.replace('M','L')} L${x(data[data.length-1].year)},${pad.t+innerH} Z`;

  const yTicks = 5;
  const yTickVals = Array.from({length: yTicks+1}, (_,i) => yMax * i / yTicks);
  const xTickVals = data.filter((_,i) => data[i].year % 5 === 0 || i === 0 || i === data.length-1).map(d => d.year);

  // Compute year-over-year change for hover readout
  const yoy = data.map((d,i) => i === 0 ? 0 : ((d.price - data[i-1].price) / data[i-1].price * 100));

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <g class="axis">
        ${yTickVals.map(v => `
          <line class="tick-grid" x1="${pad.l}" x2="${pad.l+innerW}" y1="${y(v)}" y2="${y(v)}" />
          <text x="${pad.l-6}" y="${y(v)+3}" text-anchor="end">$${Math.round(v)}k</text>
        `).join('')}
        ${xTickVals.map(v => `<text x="${x(v)}" y="${pad.t+innerH+18}" text-anchor="middle">${v}</text>`).join('')}
        <line x1="${pad.l}" x2="${pad.l+innerW}" y1="${pad.t+innerH}" y2="${pad.t+innerH}" />
      </g>
      <path class="line-area" d="${area}" />
      <path class="line" d="${path}" stroke="oklch(0.7 0.22 25)" stroke-width="1.8" />
      ${data.map((d,i) => `
        <g class="granular-pt" data-i="${i}">
          <circle cx="${x(d.year)}" cy="${y(d.price)}" r="${d.major ? 4.5 : 2.5}"
                  fill="${d.major ? 'oklch(0.7 0.22 25)' : 'oklch(0.5 0.05 25)'}"
                  stroke="oklch(0.145 0 0)" stroke-width="1"/>
          <!-- Invisible hit area for hover -->
          <circle cx="${x(d.year)}" cy="${y(d.price)}" r="12" fill="transparent" style="cursor:pointer"/>
        </g>
      `).join('')}
      <g id="granular-marker" style="display:none">
        <line class="granular-marker-line" y1="${pad.t}" y2="${pad.t+innerH}" stroke="oklch(0.985 0 0 / 0.3)" stroke-width="1" stroke-dasharray="2 2"/>
        <circle r="6" fill="none" stroke="oklch(0.985 0 0)" stroke-width="2"/>
      </g>
    </svg>
  `;

  const readout = $('#granular-readout');
  const marker = host.querySelector('#granular-marker');
  const markerLine = marker.querySelector('line');
  const markerDot = marker.querySelector('circle');
  function showPoint(i) {
    const d = data[i];
    marker.style.display = '';
    markerLine.setAttribute('x1', x(d.year));
    markerLine.setAttribute('x2', x(d.year));
    markerDot.setAttribute('cx', x(d.year));
    markerDot.setAttribute('cy', y(d.price));
    const change = yoy[i];
    const sign = change > 0 ? '+' : '';
    const changeColor = change > 0 ? 'oklch(0.7 0.22 25)' : change < 0 ? 'oklch(0.7 0.17 162)' : 'var(--muted-foreground)';
    readout.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:14px;color:var(--foreground);font-family:Geist,sans-serif">
        <div>
          <div style="font-family:Geist Mono,monospace;font-size:10px;letter-spacing:0.08em;color:var(--muted-foreground)">${d.year}${d.major ? ' · MAJOR' : ''}</div>
          <div style="font-family:Fraunces,serif;font-size:22px;font-weight:500;margin-top:2px">$${d.price}k <span style="color:${changeColor};font-size:13px;font-family:Geist Mono;margin-left:6px">${sign}${change.toFixed(1)}%</span></div>
        </div>
      </div>
      <div style="margin-top:6px;font-size:12px;color:var(--muted-foreground);line-height:1.45;text-align:left">${esc(d.event)}</div>
    `;
  }

  host.querySelectorAll('.granular-pt').forEach(g => {
    const i = +g.dataset.i;
    g.addEventListener('mouseenter', () => showPoint(i));
    g.addEventListener('click', () => showPoint(i));
  });
  host.addEventListener('mouseleave', () => {
    marker.style.display = 'none';
    readout.innerHTML = 'Hover the line to read each year.';
  });

  // Show 2022 (peak) by default
  const peakIdx = data.findIndex(d => d.year === 2022);
  if (peakIdx >= 0) showPoint(peakIdx);
}

/* ────────────────────────── VALUE-OVER-TIME STACKED ────────────────────────── */

let valueStackCity = 'toronto';

function drawValueStack() {
  const host = $('#value-stack');
  const W = host.clientWidth || 900;
  const H = 380;
  const pad = { t: 24, r: 30, b: 38, l: 60 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const data = VALUE_STACK[valueStackCity].rows;
  const units = VALUE_STACK[valueStackCity].units;

  const yMax = Math.max(...data.map(d => d.construct + d.land + d.currency + d.finance)) * 1.05;
  const xMin = data[0].year, xMax = data[data.length-1].year;
  const x = v => pad.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const y = v => pad.t + innerH - (v / yMax) * innerH;

  // Build cumulative stacks
  const layers = ['construct','land','currency','finance'];
  const classes = { construct: 'stack-area-construct', land: 'stack-area-land', currency: 'stack-area-currency', finance: 'stack-area-finance' };
  const stacks = {};
  for (const k of layers) stacks[k] = data.map(d => ({ year: d.year, v: d[k] }));

  const cum = data.map(() => 0);
  const areas = layers.map(k => {
    const top = data.map((d, i) => { cum[i] += d[k]; return cum[i]; });
    const bottom = data.map((d, i) => cum[i] - d[k]);
    const path = [
      ...data.map((d,i) => `${i===0?'M':'L'}${x(d.year)},${y(top[i])}`),
      ...data.map((d,i) => `L${x(d.year)},${y(bottom[i])}`).reverse(),
      'Z',
    ].join(' ');
    return `<path d="${path}" class="${classes[k]}" />`;
  }).join('');

  // Y axis ticks
  const yTicks = 4;
  const yTickVals = Array.from({length: yTicks+1}, (_,i) => yMax * i / yTicks);

  // X axis ticks
  const xTickVals = data.filter((_,i) => i===0 || i===data.length-1 || data[i].year % 5 === 0).map(d => d.year);

  // Total line on top
  const totalPath = data.map((d,i) => `${i===0?'M':'L'}${x(d.year)},${y(d.construct+d.land+d.currency+d.finance)}`).join(' ');

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <g class="axis">
        ${yTickVals.map(v => `
          <line class="tick-grid" x1="${pad.l}" x2="${pad.l+innerW}" y1="${y(v)}" y2="${y(v)}" />
          <text x="${pad.l-8}" y="${y(v)+3}" text-anchor="end">$${Math.round(v)}k</text>
        `).join('')}
        ${xTickVals.map(v => `<text x="${x(v)}" y="${pad.t+innerH+18}" text-anchor="middle">${v}</text>`).join('')}
      </g>
      ${areas}
      <path d="${totalPath}" fill="none" stroke="oklch(0.985 0 0)" stroke-width="1.5" stroke-dasharray="3 3" />
      <text x="${pad.l}" y="${pad.t - 8}" class="annot" style="font-size:10.5px;letter-spacing:0.04em">
        ${valueStackCity === 'toronto' ? 'Toronto avg home price ($000s CAD)' : 'US median home price ($000s USD)'}
      </text>
    </svg>
  `;
}

function wireValueStack() {
  $$('.bd-btn').forEach(b => b.addEventListener('click', () => {
    $$('.bd-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    valueStackCity = b.dataset.city;
    drawValueStack();
    drawWageGap();
  }));
}

/* ────────────────────────── WAGE ANCHOR (price vs income-anchored fair price) ────────────────────────── */

function drawWageGap() {
  const host = $('#wage-chart');
  if (!host) return;
  const W = host.clientWidth || 900;
  const H = host.clientHeight || 340;
  const pad = { t: 30, r: 30, b: 38, l: 56 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const d = WAGE_DATA[valueStackCity];
  const incomeMap = new Map(d.income);
  const points = d.price.map(([yr, p]) => {
    // For years that have no income point, interpolate linearly between neighbors.
    let income = incomeMap.get(yr);
    if (income == null) {
      const before = d.income.filter(([y]) => y < yr).pop();
      const after  = d.income.find(([y]) => y > yr);
      if (before && after) {
        const frac = (yr - before[0]) / (after[0] - before[0]);
        income = before[1] + (after[1] - before[1]) * frac;
      } else {
        income = (before || after)[1];
      }
    }
    return { year: yr, actual: p, income, fair: income * d.multiplier };
  });

  const xMin = points[0].year, xMax = points[points.length-1].year;
  const yMax = Math.max(...points.map(p => p.actual)) * 1.05;
  const x = v => pad.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const y = v => pad.t + innerH - (v / yMax) * innerH;

  const actualPath = points.map((p,i) => (i ? 'L' : 'M') + x(p.year) + ',' + y(p.actual)).join(' ');
  const fairPath   = points.map((p,i) => (i ? 'L' : 'M') + x(p.year) + ',' + y(p.fair)).join(' ');
  // Shaded gap between fair and actual (clipped to whichever is on top — here actual ≥ fair)
  const gapPath = [
    ...points.map((p,i) => `${i===0?'M':'L'}${x(p.year)},${y(p.actual)}`),
    ...points.slice().reverse().map(p => `L${x(p.year)},${y(p.fair)}`),
    'Z',
  ].join(' ');

  const yTicks = 5;
  const yTickVals = Array.from({length: yTicks+1}, (_,i) => yMax * i / yTicks);
  const xTickStep = 5;
  const xTickVals = [];
  for (let t = xMin; t <= xMax; t += xTickStep) xTickVals.push(t);
  if (xTickVals[xTickVals.length-1] !== xMax) xTickVals.push(xMax);

  // Latest values for the stats row
  const last = points[points.length-1];
  const gap = last.actual - last.fair;
  const gapPct = (gap / last.fair) * 100;
  const pir = last.actual / last.income;

  // Update the stats row outside the SVG
  const stats = $('#wage-stats');
  if (stats) {
    stats.innerHTML = `
      <div class="wage-stat">
        <div class="label">Wage-anchored fair price (${last.year})</div>
        <div class="value good">$${Math.round(last.fair)}${d.units}</div>
        <div class="caption">median income $${Math.round(last.income)}${d.units} × ${d.multiplier}</div>
      </div>
      <div class="wage-stat">
        <div class="label">Actual price (${last.year})</div>
        <div class="value bad">$${Math.round(last.actual).toLocaleString()}${d.units}</div>
        <div class="caption">price-to-income ratio: ${pir.toFixed(1)}×</div>
      </div>
      <div class="wage-stat">
        <div class="label">Bank / RE premium</div>
        <div class="value bad">+$${Math.round(gap)}${d.units}</div>
        <div class="caption">${gapPct.toFixed(0)}% above wage-anchored value</div>
      </div>
    `;
  }

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <g class="axis">
        ${yTickVals.map(v => `
          <line class="tick-grid" x1="${pad.l}" x2="${pad.l+innerW}" y1="${y(v)}" y2="${y(v)}" />
          <text x="${pad.l-6}" y="${y(v)+3}" text-anchor="end">$${Math.round(v)}${d.units}</text>
        `).join('')}
        ${xTickVals.map(v => `<text x="${x(v)}" y="${pad.t+innerH+18}" text-anchor="middle">${v}</text>`).join('')}
        <line x1="${pad.l}" x2="${pad.l+innerW}" y1="${pad.t+innerH}" y2="${pad.t+innerH}" />
      </g>
      <path d="${gapPath}" class="wage-gap-area" />
      <path d="${fairPath}" class="wage-fair-line" />
      <path d="${actualPath}" class="wage-actual-line" />
      <!-- Labels at the right edge -->
      <text x="${x(last.year) - 8}" y="${y(last.actual) - 8}" text-anchor="end"
            style="font-family:Geist Mono,monospace;font-size:10px;fill:oklch(0.65 0.22 25);letter-spacing:0.04em">
        ACTUAL · $${Math.round(last.actual)}${d.units}
      </text>
      <text x="${x(last.year) - 8}" y="${y(last.fair) + 14}" text-anchor="end"
            style="font-family:Geist Mono,monospace;font-size:10px;fill:oklch(0.7 0.17 162);letter-spacing:0.04em">
        FAIR · $${Math.round(last.fair)}${d.units}
      </text>
      <!-- Subtitle -->
      <text x="${pad.l}" y="${pad.t - 10}"
            style="font-family:Geist Mono,monospace;font-size:10.5px;fill:var(--muted-foreground);letter-spacing:0.06em;text-transform:uppercase">
        ${esc(d.label)} · ${esc(d.multiplierLabel)}
      </text>
    </svg>
  `;
}

/* ────────────────────────── HOW-IT-CONNECTS FLOW DIAGRAM ────────────────────────── */

function drawFlow() {
  const host = $('#flow-diagram');
  const W = 1400, H = 660;
  const nodeW = 158, nodeH = 56;
  const nodesById = Object.fromEntries(
    FLOW_NODES.map(([id,label,role,x,y,sub]) => [id, {id,label,role,x,y,sub}])
  );

  // Compute a smooth cubic Bezier path from a source node to a target node,
  // depending on the desired curve shape. Each curve returns {path, p0, c1, c2, p1}.
  function edgeGeom(s, t, curve) {
    if (curve === 'feedback-up') {
      // From central bank LEFT side, arching up around the left of the diagram, back to bank LEFT side.
      const p0 = { x: s.x - nodeW/2 - 8, y: s.y };
      const p1 = { x: t.x - nodeW/2 - 8, y: t.y };
      const c1 = { x: p0.x - 90, y: p0.y - 30 };
      const c2 = { x: p1.x - 90, y: p1.y + 30 };
      return { p0, c1, c2, p1 };
    }
    if (curve === 'up') {
      const p0 = { x: s.x, y: s.y - nodeH/2 };
      const p1 = { x: t.x, y: t.y + nodeH/2 };
      const mx = (p0.x + p1.x) / 2;
      const c1 = { x: mx, y: p0.y - 60 };
      const c2 = { x: mx, y: p1.y + 60 };
      return { p0, c1, c2, p1 };
    }
    if (curve === 'left') {
      const p0 = { x: s.x - nodeW/2, y: s.y };
      const p1 = { x: t.x + nodeW/2, y: t.y };
      const c1 = { x: p0.x - 30, y: p0.y };
      const c2 = { x: p1.x + 30, y: p1.y };
      return { p0, c1, c2, p1 };
    }
    if (curve === 'down-right-short') {
      // Tight bend to avoid colliding with adjacent edges (developer→govt).
      const p0 = { x: s.x + 30, y: s.y + nodeH/2 };
      const p1 = { x: t.x - 30, y: t.y - nodeH/2 };
      const c1 = { x: p0.x + 30, y: p0.y + 60 };
      const c2 = { x: p1.x - 30, y: p1.y - 30 };
      return { p0, c1, c2, p1 };
    }
    if (curve === 'down-right' || curve === 'down-left') {
      const sign = curve === 'down-right' ? 1 : -1;
      const p0 = { x: s.x + sign * 20, y: s.y + nodeH/2 };
      const p1 = { x: t.x - sign * 20, y: t.y - nodeH/2 };
      const c1 = { x: p0.x, y: (p0.y + p1.y) / 2 };
      const c2 = { x: p1.x, y: (p0.y + p1.y) / 2 };
      return { p0, c1, c2, p1 };
    }
    // default 'down'
    const p0 = { x: s.x, y: s.y + nodeH/2 };
    const p1 = { x: t.x, y: t.y - nodeH/2 };
    const dy = p1.y - p0.y;
    const c1 = { x: p0.x, y: p0.y + dy * 0.5 };
    const c2 = { x: p1.x, y: p1.y - dy * 0.5 };
    return { p0, c1, c2, p1 };
  }

  // Evaluate cubic Bezier at parameter t (0..1) — used to place the label.
  function bezierPoint(g, t) {
    const u = 1 - t;
    return {
      x: u*u*u*g.p0.x + 3*u*u*t*g.c1.x + 3*u*t*t*g.c2.x + t*t*t*g.p1.x,
      y: u*u*u*g.p0.y + 3*u*u*t*g.c1.y + 3*u*t*t*g.c2.y + t*t*t*g.p1.y,
    };
  }

  function pathStr(g) {
    return `M${g.p0.x},${g.p0.y} C${g.c1.x},${g.c1.y} ${g.c2.x},${g.c2.y} ${g.p1.x},${g.p1.y}`;
  }

  // Build edge SVG with associated source/target ids so we can highlight on hover.
  const edges = FLOW_EDGES.map(([sId, tId, weight, label, t, curve], i) => {
    const s = nodesById[sId], tgt = nodesById[tId];
    if (!s || !tgt) return '';
    const g = edgeGeom(s, tgt, curve);
    const pos = bezierPoint(g, t);

    // Place label slightly offset so it doesn't sit on top of the path.
    const dx = g.p1.x - g.p0.x;
    const dy = g.p1.y - g.p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; // unit normal
    const labelOffset = 9;
    const labelX = pos.x + nx * labelOffset;
    const labelY = pos.y + ny * labelOffset + 3;

    return `
      <g class="flow-edge-g" data-source="${sId}" data-target="${tId}">
        <path d="${pathStr(g)}" class="flow-edge ${weight}" />
        <g class="flow-edge-label-wrap">
          <text class="flow-edge-label ${weight}" x="${labelX}" y="${labelY}" text-anchor="middle"
                paint-order="stroke" stroke="oklch(0.145 0 0)" stroke-width="3" stroke-linejoin="round">${esc(label)}</text>
        </g>
      </g>
    `;
  }).join('');

  const nodes = FLOW_NODES.map(([id,label,role,x,y,sub]) => `
    <g class="flow-node" data-id="${id}" tabindex="0">
      <rect class="flow-node-rect role-${role}" x="${x - nodeW/2}" y="${y - nodeH/2}" width="${nodeW}" height="${nodeH}" rx="9" />
      <text class="flow-node-text" x="${x}" y="${y - 2}" text-anchor="middle">${esc(label)}</text>
      <text class="flow-node-sub" x="${x}" y="${y + 16}" text-anchor="middle">${esc(sub)}</text>
    </g>
  `).join('');

  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.55 0 0)"/>
        </marker>
        <marker id="flow-arrow-pop" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.645 0.246 16.439)"/>
        </marker>
        <marker id="flow-arrow-warm" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="oklch(0.769 0.188 70.08)"/>
        </marker>
      </defs>
      <g class="flow-edges-layer">${edges}</g>
      <g class="flow-nodes-layer">${nodes}</g>
    </svg>
  `;

  wireFlowInteractivity();
  // Open buyer by default so the panel is populated.
  selectFlowNode('buyer');
}

let flowLockedId = null;

function wireFlowInteractivity() {
  const svg = $('#flow-diagram svg');
  if (!svg) return;
  svg.querySelectorAll('.flow-node').forEach(node => {
    const id = node.dataset.id;
    node.addEventListener('mouseenter', () => { if (!flowLockedId) highlightFlow(id); });
    node.addEventListener('mouseleave', () => { if (!flowLockedId) clearFlowHighlight(); });
    node.addEventListener('click', e => {
      e.stopPropagation();
      if (flowLockedId === id) {
        flowLockedId = null;
        clearFlowHighlight();
        selectFlowNode('buyer');
      } else {
        flowLockedId = id;
        highlightFlow(id);
        selectFlowNode(id);
      }
    });
    node.addEventListener('focus', () => { highlightFlow(id); selectFlowNode(id); });
  });
  svg.addEventListener('click', e => {
    if (!e.target.closest('.flow-node')) {
      flowLockedId = null;
      clearFlowHighlight();
      selectFlowNode('buyer');
    }
  });
}

function highlightFlow(id) {
  const svg = $('#flow-diagram svg');
  if (!svg) return;
  svg.classList.add('has-active');
  svg.querySelectorAll('.flow-node').forEach(n => {
    n.classList.toggle('active', n.dataset.id === id);
    n.classList.toggle('dim', n.dataset.id !== id);
  });
  svg.querySelectorAll('.flow-edge-g').forEach(eg => {
    const linked = eg.dataset.source === id || eg.dataset.target === id;
    eg.classList.toggle('active', linked);
    eg.classList.toggle('dim', !linked);
    // Also highlight nodes on the other end of active edges
    if (linked) {
      const other = eg.dataset.source === id ? eg.dataset.target : eg.dataset.source;
      const otherNode = svg.querySelector(`.flow-node[data-id="${other}"]`);
      if (otherNode) {
        otherNode.classList.remove('dim');
        otherNode.classList.add('linked');
      }
    }
  });
}

function clearFlowHighlight() {
  const svg = $('#flow-diagram svg');
  if (!svg) return;
  svg.classList.remove('has-active');
  svg.querySelectorAll('.flow-node').forEach(n => n.classList.remove('active','dim','linked'));
  svg.querySelectorAll('.flow-edge-g').forEach(e => e.classList.remove('active','dim'));
}

function selectFlowNode(id) {
  const panel = $('#flow-panel');
  if (!panel) return;
  const d = FLOW_DETAIL[id];
  const node = FLOW_NODES.find(n => n[0] === id);
  if (!d || !node) return;
  const [_, label, role, , , sub] = node;
  const renderList = list => list.length === 0
    ? '<li class="flow-panel-empty">—</li>'
    : list.map(item => {
        if (Array.isArray(item)) return `<li><span class="flow-panel-other">${esc(item[0])}</span> <span class="flow-panel-detail">${esc(item[1])}</span></li>`;
        return `<li class="flow-panel-detail">${esc(item)}</li>`;
      }).join('');
  panel.innerHTML = `
    <div class="flow-panel-eyebrow">${esc(role.toUpperCase())} · ${esc(sub)}</div>
    <h3 class="flow-panel-title">${esc(label)}</h3>
    <div class="flow-panel-headline">${esc(d.headline)}</div>
    <div class="flow-panel-section">
      <div class="flow-panel-label">Takes from</div>
      <ul>${renderList(d.takes)}</ul>
    </div>
    <div class="flow-panel-section">
      <div class="flow-panel-label">Pays / sends to</div>
      <ul>${renderList(d.gives)}</ul>
    </div>
    <p class="flow-panel-note">${esc(d.note)}</p>
  `;
}

/* ────────────────────────── CYCLE ENGINE ────────────────────────── */

const CYCLE_DEFAULTS = {
  price: 700000,
  appr: 4,      // % annual appreciation
  hold: 5,      // years per cycle
  cycles: 3,
  rate: 4.5,    // mortgage rate %
  down: 20,     // %
};
const CYCLE_CONST = {
  termYears: 30,
  inflation: 2.5,
  commission: 5,      // %
  ltt: 3,             // % land transfer tax
  propTax: 0.65,      // % annual
  maintenance: 1,     // % annual
  closing: 3000,      // fixed $
};

const cycleState = { ...CYCLE_DEFAULTS };

// Standard mortgage payment formula
function pmt(principal, annualRatePct, termYears) {
  const r = (annualRatePct / 100) / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * r / (1 - Math.pow(1 + r, -n));
}

// Outstanding balance after m monthly payments
function remainingBalance(principal, annualRatePct, termYears, monthsHeld) {
  const r = (annualRatePct / 100) / 12;
  const n = termYears * 12;
  const m = monthsHeld;
  if (r === 0) return principal * (1 - m/n);
  return principal * (Math.pow(1+r, n) - Math.pow(1+r, m)) / (Math.pow(1+r, n) - 1);
}

function runCycleEngine(params = cycleState) {
  const C = CYCLE_CONST;
  const cycles = [];
  let currentPrice = params.price;

  for (let k = 0; k < params.cycles; k++) {
    const purchasePrice = currentPrice;
    const down = purchasePrice * params.down / 100;
    const mortgage = purchasePrice - down;
    const ltt = purchasePrice * C.ltt / 100;
    const monthlyPmt = pmt(mortgage, params.rate, C.termYears);
    const months = params.hold * 12;

    const totalPayments = monthlyPmt * months;
    const remaining = remainingBalance(mortgage, params.rate, C.termYears, months);
    const principalPaid = mortgage - remaining;
    const interestPaid = totalPayments - principalPaid;

    const propTaxTotal = purchasePrice * (C.propTax/100) * params.hold;
    const maintTotal = purchasePrice * (C.maintenance/100) * params.hold;

    const resalePrice = purchasePrice * Math.pow(1 + params.appr/100, params.hold);
    const commission = resalePrice * C.commission / 100;
    const saleProceedsNet = resalePrice - commission;
    const cashAtClose = saleProceedsNet - remaining;

    // Buyer's outlay over the hold:
    const totalOutflow = down + totalPayments + ltt + propTaxTotal + maintTotal + C.closing;
    const totalInflow = cashAtClose;
    const nominalNet = totalInflow - totalOutflow;

    // Real (inflation-adjusted) net at end of cycle
    const inflFactor = Math.pow(1 + C.inflation/100, params.hold);
    const realNet = nominalNet / inflFactor;

    cycles.push({
      k: k + 1,
      purchasePrice,
      resalePrice,
      down,
      mortgage,
      monthlyPmt,
      totalPayments,
      interestPaid,
      principalPaid,
      remaining,
      ltt,
      propTaxTotal,
      maintTotal,
      commission,
      cashAtClose,
      totalOutflow,
      totalInflow,
      nominalNet,
      realNet,
      equityKept: principalPaid + (resalePrice - purchasePrice),  // a buyer's share that survives
    });

    currentPrice = resalePrice;
  }

  // Aggregate across cycles
  const totalInterest = cycles.reduce((s,c) => s + c.interestPaid, 0);
  const totalCommissions = cycles.reduce((s,c) => s + c.commission, 0);
  const totalLTT = cycles.reduce((s,c) => s + c.ltt, 0);
  const totalPropTax = cycles.reduce((s,c) => s + c.propTaxTotal, 0);
  const totalMaint = cycles.reduce((s,c) => s + c.maintTotal, 0);
  const totalNominalNet = cycles.reduce((s,c) => s + c.nominalNet, 0);
  const totalRealNet = cycles.reduce((s,c) => s + c.realNet, 0);

  const startPrice = params.price;
  const endPrice = cycles[cycles.length - 1].resalePrice;
  const totalYears = params.hold * params.cycles;
  const realEnd = endPrice / Math.pow(1 + C.inflation/100, totalYears);
  const totalExtraction = totalInterest + totalCommissions + totalLTT + totalPropTax + totalMaint;

  // Counterfactual: same property held for same total years by ONE buyer
  const singleHoldMortgage = params.price * (1 - params.down/100);
  const singleHoldPmt = pmt(singleHoldMortgage, params.rate, C.termYears);
  const singleHoldMonths = Math.min(totalYears * 12, C.termYears * 12);
  const singleHoldRemain = remainingBalance(singleHoldMortgage, params.rate, C.termYears, singleHoldMonths);
  const singleHoldPrincipalPaid = singleHoldMortgage - singleHoldRemain;
  const singleHoldInterest = singleHoldPmt * singleHoldMonths - singleHoldPrincipalPaid;
  // Single hold: only 1 LTT, 1 commission at the end (if sold)
  const singleHoldCommission = endPrice * C.commission / 100;
  const singleHoldLTT = params.price * C.ltt / 100;
  const singleHoldExtraction = singleHoldInterest + singleHoldCommission + singleHoldLTT
                                + params.price * (C.propTax/100) * totalYears
                                + params.price * (C.maintenance/100) * totalYears;
  const cyclePremium = totalExtraction - singleHoldExtraction;

  return {
    cycles, params,
    totals: {
      totalInterest, totalCommissions, totalLTT, totalPropTax, totalMaint,
      totalNominalNet, totalRealNet, totalExtraction,
      startPrice, endPrice, totalYears, realEnd,
      singleHoldInterest, singleHoldExtraction, cyclePremium,
    },
  };
}

const fmtUSD = n => '$' + Math.round(n).toLocaleString();
const fmtUSDShort = n => {
  const abs = Math.abs(n);
  if (abs >= 1e6) return (n < 0 ? '-' : '') + '$' + Math.abs(n/1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n < 0 ? '-' : '') + '$' + Math.round(Math.abs(n)/1e3) + 'k';
  return (n < 0 ? '-' : '') + '$' + Math.round(Math.abs(n));
};

function renderCycleEngine() {
  const r = runCycleEngine(cycleState);

  // ── USER LENS ──
  const avgRealNet = r.totals.totalRealNet / r.params.cycles;
  const userVerdict = r.totals.totalRealNet > 0
    ? `<span style="color:oklch(0.78 0.16 162)">Net positive</span>`
    : `<span style="color:oklch(0.72 0.22 25)">Net negative</span>`;
  $('#lens-user-headline').innerHTML = `${fmtUSDShort(r.totals.totalRealNet)} <span style="font-size:0.5em;color:var(--muted-foreground);font-weight:400">total real net, all buyers</span>`;
  $('#lens-user-meta').innerHTML = `${userVerdict} · ${fmtUSDShort(avgRealNet)} avg per cycle, in today's dollars`;
  $('#lens-user-rows').innerHTML = r.cycles.map(c => `
    <li>
      <span class="row-l">Cycle ${c.k} buyer</span>
      <span class="row-v ${c.realNet >= 0 ? 'pos' : 'neg'}">${fmtUSDShort(c.realNet)}</span>
      <span class="row-sub">paid ${fmtUSDShort(c.totalOutflow)} · got ${fmtUSDShort(c.totalInflow)} (real)</span>
    </li>
  `).join('');

  // ── BANK LENS ──
  $('#lens-bank-headline').innerHTML = `${fmtUSDShort(r.totals.totalInterest)} <span style="font-size:0.5em;color:var(--muted-foreground);font-weight:400">total interest across ${r.params.cycles} mortgages</span>`;
  const pctOfPrice = (r.totals.totalInterest / r.totals.endPrice * 100).toFixed(0);
  $('#lens-bank-meta').innerHTML = `Each cycle resets the amortization clock. Frontloaded interest restarts. <strong>${pctOfPrice}%</strong> of the final price went to banks.`;
  $('#lens-bank-rows').innerHTML = r.cycles.map(c => `
    <li>
      <span class="row-l">Cycle ${c.k}</span>
      <span class="row-v">${fmtUSDShort(c.interestPaid)}</span>
      <span class="row-sub">${(c.interestPaid / c.totalPayments * 100).toFixed(0)}% of buyer's payments · principal: ${fmtUSDShort(c.principalPaid)}</span>
    </li>
  `).join('');

  // ── MARKET LENS ──
  const nominalGrowthPct = ((r.totals.endPrice / r.totals.startPrice) - 1) * 100;
  const realGrowthPct = ((r.totals.realEnd / r.totals.startPrice) - 1) * 100;
  $('#lens-market-headline').innerHTML = `${fmtUSDShort(r.totals.startPrice)} → ${fmtUSDShort(r.totals.endPrice)}`;
  $('#lens-market-meta').innerHTML = `Sticker grew ${nominalGrowthPct.toFixed(0)}% nominal · <strong>${realGrowthPct.toFixed(0)}%</strong> real (after ${CYCLE_CONST.inflation}% inflation × ${r.totals.totalYears}yr)`;
  $('#lens-market-rows').innerHTML = `
    <li><span class="row-l">Total extraction layer</span><span class="row-v">${fmtUSDShort(r.totals.totalExtraction)}</span>
      <span class="row-sub">interest + commissions + LTT + property tax + maintenance, all cycles</span></li>
    <li><span class="row-l">vs. real appreciation</span><span class="row-v">${fmtUSDShort(r.totals.endPrice - r.totals.startPrice)}</span>
      <span class="row-sub">nominal price growth across the chain</span></li>
    <li><span class="row-l">Real value change</span><span class="row-v ${realGrowthPct >= 0 ? 'pos' : 'neg'}">${fmtUSDShort(r.totals.realEnd - r.totals.startPrice)}</span>
      <span class="row-sub">in today's dollars · what actually grew</span></li>
  `;

  // ── COUNTERFACTUAL: cycle premium ──
  $('#engine-counterfactual').innerHTML = `
    <div class="cf-card">
      <div class="cf-eyebrow">Counterfactual · same property, one buyer, full ${r.totals.totalYears} years</div>
      <div class="cf-grid">
        <div class="cf-cell">
          <div class="cf-l">Extraction with ${r.params.cycles} cycles</div>
          <div class="cf-v cf-bad">${fmtUSDShort(r.totals.totalExtraction)}</div>
        </div>
        <div class="cf-cell">
          <div class="cf-l">Extraction with 0 cycles</div>
          <div class="cf-v cf-good">${fmtUSDShort(r.totals.singleHoldExtraction)}</div>
        </div>
        <div class="cf-cell">
          <div class="cf-l">Cycle premium</div>
          <div class="cf-v cf-bad">+${fmtUSDShort(r.totals.cyclePremium)}</div>
          <div class="cf-sub">paid to the system because the property changed hands</div>
        </div>
      </div>
    </div>
  `;

  // ── PER-CYCLE STACKED CHART ──
  drawCycleChart(r);
}

function drawCycleChart(result) {
  const host = $('#cycle-chart');
  if (!host) return;
  const W = host.clientWidth || 700;
  const H = host.clientHeight || 280;
  const pad = { t: 16, r: 16, b: 28, l: 60 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const cycles = result.cycles;
  const segments = cycles.map(c => ({
    k: c.k,
    equity: Math.max(0, c.nominalNet), // buyer's net cash kept (if positive)
    interest: c.interestPaid,
    taxes: c.ltt + c.propTaxTotal,
    commission: c.commission,
    maint: c.maintTotal + CYCLE_CONST.closing,
  }));

  const totals = segments.map(s => s.equity + s.interest + s.taxes + s.commission + s.maint);
  const max = Math.max(...totals) * 1.08;
  const barW = innerW / cycles.length * 0.55;
  const colors = {
    equity: 'oklch(0.4 0.08 200)',
    interest: 'oklch(0.65 0.22 25)',
    taxes: 'oklch(0.7 0.18 70)',
    commission: 'oklch(0.55 0.12 160)',
    maint: 'oklch(0.5 0.05 0)',
  };
  const y = v => pad.t + innerH - (v / max) * innerH;
  const cx = i => pad.l + innerW * (i + 0.5) / cycles.length;

  const yTicks = 4;
  const yTickVals = Array.from({length: yTicks+1}, (_,i) => max * i / yTicks);

  let svg = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <g class="axis">
        ${yTickVals.map(v => `
          <line class="tick-grid" x1="${pad.l}" x2="${pad.l+innerW}" y1="${y(v)}" y2="${y(v)}" />
          <text x="${pad.l-6}" y="${y(v)+3}" text-anchor="end">${fmtUSDShort(v).replace('$','$')}</text>
        `).join('')}
      </g>
  `;
  segments.forEach((s, i) => {
    const stack = ['interest','taxes','commission','maint','equity'];
    let yCursor = pad.t + innerH;
    for (const k of stack) {
      const v = s[k];
      if (v <= 0) continue;
      const h = (v / max) * innerH;
      yCursor -= h;
      svg += `<rect x="${cx(i) - barW/2}" y="${yCursor}" width="${barW}" height="${h}" fill="${colors[k]}" stroke="oklch(0.145 0 0)" stroke-width="0.5"/>`;
    }
    svg += `<text x="${cx(i)}" y="${pad.t+innerH+18}" text-anchor="middle" style="fill:var(--muted-foreground);font-family:Geist Mono;font-size:10.5px;letter-spacing:0.03em">CYCLE ${s.k}</text>`;
    svg += `<text x="${cx(i)}" y="${y(totals[i]) - 6}" text-anchor="middle" style="fill:var(--foreground);font-family:Geist Mono;font-size:10.5px">${fmtUSDShort(totals[i])}</text>`;
  });
  svg += '</svg>';
  host.innerHTML = svg;
}

function wireCycleEngine() {
  const wire = (id, key, fmt) => {
    const input = $('#' + id);
    if (!input) return;
    const valEl = $('#v-' + id.split('-')[1]);
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      cycleState[key] = v;
      if (valEl) valEl.textContent = fmt(v);
      renderCycleEngine();
    });
  };
  wire('p-price',  'price',  v => '$' + v.toLocaleString());
  wire('p-appr',   'appr',   v => v.toFixed(1) + '%');
  wire('p-hold',   'hold',   v => v + (v === 1 ? ' yr' : ' yrs'));
  wire('p-cycles', 'cycles', v => v);
  wire('p-rate',   'rate',   v => v.toFixed(2) + '%');
  wire('p-down',   'down',   v => v + '%');

  $('#engine-reset').addEventListener('click', () => {
    Object.assign(cycleState, CYCLE_DEFAULTS);
    $('#p-price').value = CYCLE_DEFAULTS.price;
    $('#p-appr').value  = CYCLE_DEFAULTS.appr;
    $('#p-hold').value  = CYCLE_DEFAULTS.hold;
    $('#p-cycles').value = CYCLE_DEFAULTS.cycles;
    $('#p-rate').value  = CYCLE_DEFAULTS.rate;
    $('#p-down').value  = CYCLE_DEFAULTS.down;
    $('#v-price').textContent  = '$' + CYCLE_DEFAULTS.price.toLocaleString();
    $('#v-appr').textContent   = CYCLE_DEFAULTS.appr.toFixed(1) + '%';
    $('#v-hold').textContent   = CYCLE_DEFAULTS.hold + ' yrs';
    $('#v-cycles').textContent = CYCLE_DEFAULTS.cycles;
    $('#v-rate').textContent   = CYCLE_DEFAULTS.rate.toFixed(2) + '%';
    $('#v-down').textContent   = CYCLE_DEFAULTS.down + '%';
    renderCycleEngine();
  });
}

/* ────────────────────────── HISTORICAL LINE CHARTS ────────────────────────── */

function lineChart(hostId, series, opts = {}) {
  const host = document.getElementById(hostId);
  if (!host) return;
  const W = host.clientWidth || 400, H = host.clientHeight || 200;
  const pad = { t: 14, r: 14, b: 26, l: 44 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const xs = series.map(d => d[0]), ys = series.map(d => d[1]);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMax = Math.max(...ys) * 1.08;
  const x = v => pad.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const y = v => pad.t + innerH - (v / yMax) * innerH;
  const path = series.map((d,i) => (i ? 'L' : 'M') + x(d[0]) + ',' + y(d[1])).join(' ');
  const area = `M${x(series[0][0])},${pad.t+innerH} ${path.replace('M','L')} L${x(series[series.length-1][0])},${pad.t+innerH} Z`;
  const yTicks = 4;
  const yTickVals = Array.from({length: yTicks+1}, (_,i) => yMax * i / yTicks);
  const xTickStep = Math.ceil((xMax - xMin) / 5);
  const xTickVals = [];
  for (let t = xMin; t <= xMax; t += xTickStep) xTickVals.push(t);
  if (xTickVals[xTickVals.length-1] !== xMax) xTickVals.push(xMax);
  const fmtY = opts.fmtY || (v => v.toFixed(1));
  const ann = (opts.annotations || []).map(([yr,lbl]) => {
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
        ${xTickVals.map(v => `<text x="${x(v)}" y="${pad.t+innerH+16}" text-anchor="middle">${v}</text>`).join('')}
        <line x1="${pad.l}" x2="${pad.l+innerW}" y1="${pad.t+innerH}" y2="${pad.t+innerH}" />
      </g>
      <path class="line-area" d="${area}" />
      <path class="line" d="${path}" />
      ${ann.map(a => `
        <circle class="annot-dot" cx="${x(a.yr)}" cy="${y(a.val)}" r="3" />
        <text class="annot" x="${x(a.yr)+6}" y="${y(a.val)-6}">${esc(a.lbl)}</text>
      `).join('')}
    </svg>
  `;
}

function drawHistoricalCharts() {
  lineChart('chart-us-rate', HIST.usRate, { fmtY: v => v.toFixed(1)+'%', annotations: HIST.annot.usRate });
  lineChart('chart-toronto-price', HIST.torontoPrice, { fmtY: v => '$'+v+'k', annotations: HIST.annot.torontoPrice });
  lineChart('chart-m2', HIST.m2, { fmtY: v => '$'+v.toFixed(1)+'T', annotations: HIST.annot.m2 });
  lineChart('chart-mbs', HIST.mbs, { fmtY: v => '$'+v.toFixed(1)+'T', annotations: HIST.annot.mbs });
}

/* ────────────────────────── BOOT ────────────────────────── */

window.addEventListener('resize', () => {
  drawExpense();
  drawGranularPrice();
  drawValueStack();
  drawWageGap();
  drawFlow();
  drawHistoricalCharts();
  renderCycleEngine();
});

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
    wireValueStack();
    wireCycleEngine();
    render();
    drawExpense();
    drawGranularPrice();
    drawValueStack();
    drawWageGap();
    drawFlow();
    drawHistoricalCharts();
    renderCycleEngine();
  } catch (err) {
    console.error(err);
    $('#empty-state').hidden = false;
    $('#empty-state').innerHTML = `
      <strong>Couldn't load banks.geojson.</strong>
      <p>Serve the <code>map/</code> folder:<br>
      <code>cd map &amp;&amp; python3 -m http.server 8000</code></p>
    `;
  }
}

load();
