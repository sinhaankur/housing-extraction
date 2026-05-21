# Bank map schema

The map reads from [`banks.geojson`](banks.geojson). To add or update a bank, edit that file directly — no build step.

## How to run the map

Because the page loads a `.geojson` file via `fetch()`, browsers block `file://` access. Serve the folder locally:

```bash
cd map
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, `caddy file-server`, etc).

## Feature schema

Each bank is one GeoJSON `Feature` with `Point` geometry and these properties:

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [LONGITUDE, LATITUDE]
  },
  "properties": {
    "name": "Bank legal name",
    "country": "Country (matches existing values for filter grouping)",
    "city": "City name",
    "type": "see allowed values below",
    "mortgage_market_share_pct": 0,
    "revenue_models": ["see allowed values below"],
    "how_they_make_money": "1–3 sentences. The specific mechanism — not generic 'they lend money'.",
    "notable": "Optional. Anything sharp worth flagging (regulatory, structural, historical)."
  }
}
```

GeoJSON coordinate order is **[longitude, latitude]**, not the other way around. Easy to swap by accident.

### `type` — allowed values

| Value                          | Meaning                                                  |
|--------------------------------|----------------------------------------------------------|
| `commercial_bank`              | Standard for-profit deposit-taking bank                  |
| `state_owned_bank`             | Majority government-owned                                |
| `state_development_bank`       | State-mandated, subsidised (e.g. KfW)                    |
| `state_backed_agency`          | GSE-style — securitizes loans with state guarantee       |
| `mortgage_specialist_nonbank`  | Originator, no deposit base (e.g. Rocket Mortgage)       |
| `housing_finance_specialist`   | Dedicated housing finance company (common in India)      |
| `building_society_mutual`      | Member-owned mutual (UK building societies)              |
| `cooperative_bank`             | Cooperative ownership (e.g. Rabobank)                    |

Add a new type only if existing ones genuinely don't fit — adding rare types fragments the filter UI.

### `revenue_models` — allowed values

Pick all that apply.

| Value                       | What it captures                                                       |
|-----------------------------|-------------------------------------------------------------------------|
| `origination`               | Upfront fees + the new loan goes on the books                          |
| `servicing`                 | Annual fee (~0.25% of unpaid balance) for collecting payments          |
| `servicing_resale`          | Sells the servicing rights to another firm for a one-time gain         |
| `balance_sheet_hold`        | Keeps the loan, earns the interest spread for years                    |
| `securitization`            | Bundles loans into MBS and sells / trades them                         |
| `securitization_state_backed` | Same, but with government guarantee (Fannie/Freddie/JHF model)        |
| `construction_finance`      | Lends to the developer who later sells to the bank's mortgage customers |
| `cross_border_mortgage`     | Lends in one country against property in another                       |
| `trading`                   | Buys/sells MBS and related derivatives                                 |
| `energy_efficiency_loans`   | Subsidised retrofit / efficiency lending                               |
| `origination_subsidised`    | Origination at below-market rate by mandate                            |

## When you add a country that isn't already present

The filter chip will appear automatically. If you find yourself adding country-specific notes that don't fit the schema (e.g. "this country uses adjustable-rate only"), put them in [`../analysis/`](../analysis/) instead and reference them from `notable`.

## Versioning

Bump `metadata.schema_version` if you change the shape of `properties` (rename a key, change a type, etc.). Keep it at 1 if you're only adding rows.
