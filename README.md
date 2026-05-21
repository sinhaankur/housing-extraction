# Housing Value Extraction — Real Estate by Country & City

A structured reference and **analysis tool** (to be extended over time) for understanding *who actually makes money* when a home is built, bought, and sold — across countries and cities.

The thesis: housing is optimized for **transaction volume and asset price appreciation**, not for housing people. The system has five extraction layers, plus a monetary substrate beneath all of them:

| # | Layer            | Earns when                              | See                                          |
|---|------------------|-----------------------------------------|----------------------------------------------|
| 1 | Developers       | Once per unit ever built                | [analysis/01-developers.md](analysis/01-developers.md) |
| 2 | Agents / brokers | Every resale                            | [analysis/02-agents.md](analysis/02-agents.md) |
| 3 | Banks            | Continuously, on every mortgage         | [analysis/03-banks.md](analysis/03-banks.md) · interactive: [map/](map/) |
| 4 | Governments      | At construction, first sale, every resale, ongoing | [analysis/04-governments.md](analysis/04-governments.md) |
| 5 | Financial markets | On every derivative spun off the mortgage — even when no one moves | [analysis/06-financialization.md](analysis/06-financialization.md) |
| 0 | The currency system itself | Continuously, by expanding the unit of account | [analysis/08-currency-and-monetary.md](analysis/08-currency-and-monetary.md) |

The proposed counter: **one universal housing standard** that distinguishes housing-for-people from asset-class units, so the rest of the system can finally be regulated against shelter outcomes rather than transaction volume. See [analysis/07-universal-housing-standard.md](analysis/07-universal-housing-standard.md).

## The interactive bank map

[`map/index.html`](map/index.html) — open in a browser (served locally; see [map/SCHEMA.md](map/SCHEMA.md) for the one-command serve). Each pin is a bank or lender, with:

- Country, city, type (commercial / state / mutual / mortgage specialist / GSE)
- Mortgage market share
- The **specific mechanism** that lender uses to extract value (origination, servicing, securitization, balance-sheet hold, construction finance, cross-border, etc.)

Filters: country, type, revenue model. Combine to compare — e.g. "show me all building societies and cooperatives across countries" or "show me everyone doing cross-border mortgage capture."

The map is data-driven: edit [`map/banks.geojson`](map/banks.geojson) to add lenders. No build step.

## Layout

```
housing-value-extraction/
├── README.md                          ← you are here
├── analysis/
│   ├── 01-developers.md               ← margins, pre-sales, assignment flips, upgrades
│   ├── 02-agents.md                   ← commission structures, US anomaly, Sitzer-Burnett
│   ├── 03-banks.md                    ← amortization frontloading, refinance reset, MBS
│   ├── 04-governments.md              ← (skeleton) taxes, LTT, dev charges
│   ├── 05-patterns-and-trends.md      ← vertical integration, institutional landlords
│   ├── 06-financialization.md         ← creating value out of something that isn't value
│   ├── 07-universal-housing-standard.md ← the proposed counter-standard
│   └── 08-currency-and-monetary.md    ← petrodollar, QE, the loop under everything
├── case-studies/
│   └── toronto-condo-700k.md          ← full $700k unit accounting, build → year 10
├── data/
│   ├── agent-commissions-by-country.csv
│   ├── mortgage-rates-by-country.csv
│   ├── developer-margins-by-country.csv
│   └── city-pricing.csv               ← extend per city
├── map/
│   ├── index.html                     ← the analysis tool
│   ├── app.js
│   ├── styles.css
│   ├── banks.geojson                  ← edit this to add banks
│   └── SCHEMA.md                      ← how to add data
└── sources.md
```

## How to use this as a tool

The point is to make the extraction visible *concretely*, by country and city, and to keep the underlying data editable so the picture stays current. Two loops:

1. **Add data** — edit the geojson and CSVs as you encounter new banks, new cities, new mortgage rate prints. The schema in [map/SCHEMA.md](map/SCHEMA.md) keeps it consistent.
2. **Add analysis** — each numbered `analysis/` file is a discrete argument. Add `09-...md` etc. for new threads (the open drill-downs are listed below).

## Open threads (drill-down candidates)

- Mechanics of how Lodha / DLF / Godrej structure pre-sales in India
- Fed MBS holdings 2008 → 2024 (the central-bank-as-housing-backstop in numbers)
- Canadian condo investor leverage model — and why it's collapsing in 2025–2026
- Vertical integration map (Brookfield, Tridel, Lodha, BlackRock, Invitation Homes)
- BIS data on cross-border mortgage flows
- Japan 1989 → present — what happens when the housing-credit loop reverses in a high-fiat system
- BRICS settlement systems and what their success would do to Anglo housing
