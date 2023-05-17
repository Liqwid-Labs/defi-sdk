# DeFi SDK

A library providing methods for querying high-level information about market participants (such as supplied balance and debt) and general market state in DeFi protocols. Currently, only [Liqwid](https://liqwid.finance) is supported.

## Table of Contents

- [Installation](#installation)
- [Docs](#docs)
- [Usage](#usage)

## Installation

```bash
npm install <replace-with-package-when-done>
```

## Docs

Up-to-date API documentation can be generated using `npm run generate-docs`.

## Usage

```typescript
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { Address, BlockFrostAdapter, mkLiqwidLayer, SDK } from "../src/index";

const blockfrostApi = new BlockFrostAPI({
  projectId: "<your api key here>"
})

const queryAdapter = new BlockFrostAdapter(blockfrostApi);
const sdk = new SDK(queryAdapter, mkLiqwidLayer);

const printUserDebtInAllMarkets = async (address: Address): Promise<void> => {
  const userDebt = await sdk.protocol.currentDebt(address);
  console.log(userDebt);
}

printUserDebtInAllMarkets(
  "addr1q8anl7qusc8aklly4sw80czujnt69f5tqu8xa4kryyujsldxj95970vfr9pzmygfauqtx8x6aanhda3azwz2m2js3dqq93jg0q"
);

/*
Output:
    [
      { asset: 'lovelace', quantity: 14032583507n },
      {
        asset: {
          policyId: '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61',
          hexTokenName: '446a65644d6963726f555344'
        },
        quantity: 3713403928n
      }
    ]
*/
```
