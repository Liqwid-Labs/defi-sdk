import {BlockFrostAdapter} from "./adapters/blockfrost";
import {Liqwid, LiqwidLayer} from "./protocols/liqwid";


/*
* Protocol definitions (abstracts the actual protocol details
*/

// Liqwid definitions

// Utilities
/*
 * Example queries
*/

// qAda balance in address (0)
// BlockFrostAdapter.assetAmountInAddress(
  // "addr1qyeqq6whs3ydjzz9u7ppnsllmfyy2peuxe94lcscx797el5aya84qhk7xyqlpvw6cghwj2qyj03kz802dh5kwggejmksqqc90n",
  // Liqwid.markets.ADA.componentToken
// ).then(console.log)

// BlockFrostAdapter.assetAmountInAddress(
  // "addr1w9cnj8cclvf3729zxra87wmvvzv7g3mq9v4a9h6aq3k9axgfq4hx9",
  // {policyId: "ee944b56bab503197bdfb929509a177c3ef9e5083ca7e65ffa1469c8", hexTokenName: "00"}
// ).then(console.log)

// BlockFrostAdapter.assetAmountInAddress(
  // "addr1w9cnj8cclvf3729zxra87wmvvzv7g3mq9v4a9h6aq3k9axgfq4hx9",
  // {policyId: "ee944b56bab503197bdfb929509a177c3ef9e5083ca7e65ffa1469c8", hexTokenName: "01"}
// ).then(console.log)



// // qAda balance in account (a lot).
// BlockFrostAdapter.stakeAddressFromAddress(
  // "addr1qyeqq6whs3ydjzz9u7ppnsllmfyy2peuxe94lcscx797el5aya84qhk7xyqlpvw6cghwj2qyj03kz802dh5kwggejmksqqc90n"
// ).then(
  // (stakeAddress) => BlockFrostAdapter.assetAmountInStakeAddress(stakeAddress, Liqwid.markets.ADA.componentToken)
// ).then(console.log)

// // Ada market state
// BlockFrostAdapter.stateThreadDatum(Liqwid.markets.ADA.stateUtxoAddress, Liqwid.markets.ADA.stateToken, Liqwid.parseStateDatum)
// .then(console.log)

// // Ada datum state
// BlockFrostAdapter.stateThreadDatum(Liqwid.markets.ADA.loanUtxosAddress, Liqwid.markets.ADA.loanTokens[0])
// .then(console.log)

// LiqwidLayer.suppliedBalanceInMarket(BlockFrostAdapter)(Liqwid.markets.ADA, "addr1qxp5nghua3lt5064ulmmvqls727ljvjq2e5mfdptefyu4k27c9jd6wgt3qh6h3h0t22cznuxpw9elax5s564378rh0dqcd69kn")
// .then((v) => console.log(v))

LiqwidLayer.currentDebtInMarket(BlockFrostAdapter)(
  Liqwid.markets.ADA,
  "addr1qy2eptutf8yn9kms0u49tr6tkvj468xlmd6y44uqhv73wf0h6st8ttj0hacmylsme32vyqz3y830mathac4ra9p8ujussl8fw2"
).then((v) => console.log(v))
