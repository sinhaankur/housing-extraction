# 3. Banks — the silent giant that earns more than developers and agents combined

The player most people don't think about, because they don't see the cheque. Over a typical mortgage life, banks extract **more than the developer's profit margin and agent commissions combined**.

## The amortization math (the key insight)

### Classic example
A $200,000 fixed mortgage, 30 years, 4%, no down payment:
- Monthly principal + interest: **$954.83**
- Until more goes to principal than interest: **payment #153** (year 12+)
- After 5 years still owe **$180,895**
- After 10 years still owe **$157,568**
- Total interest paid: **$143,739**
[Mortgage Calculator]

### Current 2026 rates
US average 30-year mortgage rate: **6.63%**.
On a **$500,000 mortgage at 6.63% over 30 years**:
- Total interest paid: **~$651,000**
- Total repayment: **~$1.15M on a $500k loan**
- **Bank collects 2.3× what it lent.** [Bankrate]

## How the bank's profit is structured

The structure is **deliberately frontloaded** in the bank's favor.

Mechanically: each month's interest is calculated on the remaining balance. In year 1 the balance is huge → **80%+ of your payment is interest**. By year 25 the balance is small, so most goes to principal.

### The refinance / resale reset
Sell at year 7 and refinance? **The amortization clock resets to month 1.** Interest gets frontloaded *all over again*.

> If you've already paid a significant amount of interest, resetting the clock and returning to Month 1 of the amortization schedule (when interest costs are at their peak) can end up costing you more in the long run. — [Bankrate]

**The implication is brutal:** the more often a property changes hands, the more interest the banking system as a whole extracts from the same housing stock.

A property sold 5 times in 30 years generates **vastly more total mortgage interest** than the same property held by one owner for 30 years — because each new mortgage is paying interest on a fresh high-balance frontloaded schedule.

## Country comparison

| Country  | Typical 30-yr rate (2026) | Interest paid on $500k mortgage, full term |
|----------|---------------------------|--------------------------------------------|
| US       | ~6.6%                     | ~$650k                                     |
| Canada   | ~4.1% (5-yr fixed)        | ~$400k (varies with renewals)              |
| UK       | ~4.5% (2-yr fixed)        | Highly variable — most renewed             |
| Australia| ~6% (variable)            | ~$580k                                     |
| India    | ~8.5%                     | **~$880k (highest)**                       |
| Germany  | ~3.8%                     | ~$340k                                     |
| Japan    | ~1.5%                     | **~$120k (lowest in developed world)**     |

See `../data/mortgage-rates-by-country.csv` for the machine-readable version.

Indian mortgages are particularly extractive — at 8.5% over 20 years (typical there), buyers often pay **1.8–2.0× the principal** in interest. This is one reason cash purchases remain common at the upper end of the Indian market: those who can avoid the banks, do.

## The interlock: banks finance developers too

The same banks that lend to homebuyers also finance the **developer** in the first place.

> Successful pre-sales campaigns often get construction financing availability. — [LendCity Mortgages]

So: the bank lends construction money to the developer → then lends purchase money to the buyer who buys from that developer → then earns ~6% interest on both loans.

**A single condo unit generates bank revenue at construction, at first sale, and at every subsequent resale.**

The bank is the only player who profits from the entire chain in perpetuity.
