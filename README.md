# Housing Value Extraction — Real Estate by Country & City

A structured reference for understanding *who actually makes money* when a home is built, bought, and sold — across countries and cities.

The thesis: housing is optimized for **transaction volume and asset price appreciation**, not for housing people. Four extractor classes capture value on every unit:

1. **Developers** — paid once per unit ever built. Largest single slice on first sale.
2. **Agents / brokers** — paid on every resale. Recurring extractor.
3. **Banks** — paid continuously, on every mortgage written against the unit. Largest cumulative slice.
4. **Governments** — paid at construction, first sale, and every resale (taxes, land transfer, dev charges).

Developer earns *once*. Governments and agents earn *each time*. Banks earn *continuously*.

## Layout

```
housing-value-extraction/
├── README.md                          ← you are here
├── analysis/
│   ├── 01-developers.md               ← margins, pre-sales, assignment flips, upgrades
│   ├── 02-agents.md                   ← commission structures, US anomaly, Sitzer-Burnett
│   ├── 03-banks.md                    ← amortization frontloading, refinance reset, MBS
│   ├── 04-governments.md              ← (placeholder — taxes, LTT, dev charges)
│   └── 05-patterns-and-trends.md      ← vertical integration, institutional landlords
├── case-studies/
│   └── toronto-condo-700k.md          ← full $700k unit breakdown, build → year 10
├── data/
│   ├── agent-commissions-by-country.csv
│   ├── mortgage-rates-by-country.csv
│   ├── developer-margins-by-country.csv
│   └── city-pricing.csv               ← extend per city
└── sources.md                         ← citations from the source material
```

## How to use

- Read `analysis/` top-to-bottom for the narrative.
- `data/` is meant to grow. Add rows for cities you care about (Bangalore, Berlin, Austin, etc.).
- `case-studies/` is the concrete dollar accounting. Add more cities as comparisons.

## Open threads

These are the drill-down branches flagged in the source material but not yet expanded:

- Mechanics of how Lodha / DLF / Godrej structure pre-sales in India.
- How mortgage-backed securities turn buyer interest payments into tradable assets banks resell.
- The Canadian condo investor leverage model — and why it's collapsing in 2025–2026.
- Vertical integration map: who owns which layers (Brookfield, Tridel, Lodha, BlackRock, Invitation Homes).
