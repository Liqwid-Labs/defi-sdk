# DeFi SDK

## API Documentation

`npm run generate-docs`

## Example usage

```typescript
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { Address, BlockFrostAdapter, LiqwidLayer, SDK } from "@liqwid-labs/defi-sdk";

const blockfrostApi = new BlockFrostAPI({
  projectId: "mainnetDLkhcr1mPRpgmsL62OitgwmEwfypnmXQ"
})

const queryAdapter = new BlockFrostAdapter(blockfrostApi);
const sdk = new SDK(queryAdapter, LiqwidLayer);

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
