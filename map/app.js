/* Housing Value Extraction — Bank Map
 * Loads map/banks.geojson, renders Leaflet markers, drives sidebar filters.
 *
 * To extend the map: add a Feature to banks.geojson with the schema in SCHEMA.md.
 * No build step. Reload the page after editing.
 */

const state = {
  features: [],
  filters: {
    country: new Set(),
    type: new Set(),
    revenue: new Set(),
  },
  selectedId: null,
};

const map = L.map('map', {
  worldCopyJump: true,
  zoomControl: true,
}).setView([25, 15], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

function makeMarker(feature) {
  const props = feature.properties;
  const cls = `bank-marker marker-${props.type}`;
  const icon = L.divIcon({
    className: '',
    html: `<div class="${cls}" title="${escapeHtml(props.name)}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
  const m = L.marker(
    [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
    { icon }
  );
  m.on('click', () => selectFeature(feature));
  return m;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function passesFilters(feature) {
  const p = feature.properties;
  const f = state.filters;
  if (f.country.size && !f.country.has(p.country)) return false;
  if (f.type.size && !f.type.has(p.type)) return false;
  if (f.revenue.size) {
    const hasAny = (p.revenue_models || []).some(r => f.revenue.has(r));
    if (!hasAny) return false;
  }
  return true;
}

function render() {
  markerLayer.clearLayers();
  let visible = 0;
  let countryCounts = {};
  let totalMarketShare = 0;
  for (const feature of state.features) {
    if (!passesFilters(feature)) continue;
    visible++;
    countryCounts[feature.properties.country] =
      (countryCounts[feature.properties.country] || 0) + 1;
    totalMarketShare += feature.properties.mortgage_market_share_pct || 0;
    markerLayer.addLayer(makeMarker(feature));
  }
  renderStats(visible, countryCounts, totalMarketShare);
}

function renderStats(visible, countryCounts, totalMarketShare) {
  const el = document.getElementById('stats-content');
  const rows = [];
  rows.push(`<div class="stat-row"><span>Banks visible</span><span>${visible}</span></div>`);
  rows.push(`<div class="stat-row"><span>Combined mortgage market share*</span><span>${totalMarketShare}%</span></div>`);
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  if (topCountries.length) {
    rows.push(`<div class="stat-row" style="margin-top:8px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.05em"><span>By country</span><span></span></div>`);
    for (const [c, n] of topCountries) {
      rows.push(`<div class="stat-row"><span>${escapeHtml(c)}</span><span>${n}</span></div>`);
    }
  }
  rows.push(`<div style="margin-top:8px;font-size:11px;color:#999">*Sum of per-country shares; not a global figure.</div>`);
  el.innerHTML = rows.join('');
}

function selectFeature(feature) {
  state.selectedId = feature.properties.name;
  const p = feature.properties;
  const el = document.getElementById('detail-content');
  const badges = (p.revenue_models || []).map(r =>
    `<span class="badge">${escapeHtml(r.replaceAll('_', ' '))}</span>`
  ).join('');
  el.innerHTML = `
    <h3>${escapeHtml(p.name)}</h3>
    <div class="meta">${escapeHtml(p.city)}, ${escapeHtml(p.country)} · ${escapeHtml(p.type.replaceAll('_', ' '))} · ${p.mortgage_market_share_pct ?? '–'}% market share</div>
    <div class="field-label">Revenue models</div>
    <div>${badges || '<em>None listed</em>'}</div>
    <div class="field-label">How they make money</div>
    <div>${escapeHtml(p.how_they_make_money || '')}</div>
    ${p.notable ? `<div class="field-label">Notable</div><div>${escapeHtml(p.notable)}</div>` : ''}
  `;
  map.flyTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 6, { duration: 0.6 });
}

function buildFilterChips(containerId, key, values, labelTransform) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (const v of values) {
    const btn = document.createElement('button');
    btn.textContent = labelTransform ? labelTransform(v) : v;
    btn.dataset.value = v;
    btn.addEventListener('click', () => {
      const set = state.filters[key];
      if (set.has(v)) {
        set.delete(v);
        btn.classList.remove('active');
      } else {
        set.add(v);
        btn.classList.add('active');
      }
      render();
    });
    container.appendChild(btn);
  }
}

function uniqueSorted(arr) {
  return [...new Set(arr)].sort();
}

async function loadData() {
  const res = await fetch('banks.geojson');
  if (!res.ok) {
    document.getElementById('stats-content').innerHTML =
      `<em>Failed to load banks.geojson. If you opened this file directly (file://), serve the directory with <code>python3 -m http.server</code> from the <code>map/</code> folder and reload.</em>`;
    return;
  }
  const data = await res.json();
  state.features = data.features;

  const countries = uniqueSorted(state.features.map(f => f.properties.country));
  const types = uniqueSorted(state.features.map(f => f.properties.type));
  const revenues = uniqueSorted(
    state.features.flatMap(f => f.properties.revenue_models || [])
  );

  const niceLabel = v => v.replaceAll('_', ' ');
  buildFilterChips('filter-country', 'country', countries);
  buildFilterChips('filter-type', 'type', types, niceLabel);
  buildFilterChips('filter-revenue', 'revenue', revenues, niceLabel);

  render();
}

document.getElementById('reset-filters').addEventListener('click', () => {
  for (const key of Object.keys(state.filters)) state.filters[key].clear();
  document.querySelectorAll('.filter-chips button.active')
    .forEach(b => b.classList.remove('active'));
  render();
});

loadData();
