import {
  Protocol,
  ProtocolLayer,
  ProtocolLoanDatum,
  ProtocolStateDatum,
  QueryAdapter,
} from "./types";

export { BlockFrostAdapter } from "./adapters";
export {
  Liqwid,
  mkLiqwidLayer,
  LiqwidStateDatum,
  LiqwidLoanDatum,
  Tagged,
  FixedDecimal,
  Ratio,
} from "./protocols";
export {
  Address,
  StakeAddress,
  Protocol,
  ProtocolLayer,
  QueryAdapter,
  ProtocolStateDatum,
  ProtocolLoanDatum,
  BaseUtxo,
  ScriptUtxo,
  Asset,
  DatumDecoder,
  NativeToken,
  Quantity,
  ValueOf,
  Market,
} from "./types";
export { RawCBOR, cborConstructorToObject } from "./utils";

/**
 * Main wrapper and entry-point for querying information about protocol `P`.
 *
 * @example
 * // Instantiating the SDK to query information about Liqwid using Blockfrost
 * // as the on-chain data provider.
 * import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
 * import { Address, BlockFrostAdapter, LiqwidLayer, SDK } from "../src/index";
 *
 * const blockfrostApi = new BlockFrostAPI({
 *   projectId: "mainnetDLkhcr1mPRpgmsL62OitgwmEwfypnmXQ"
 * })
 *
 * const queryAdapter = new BlockFrostAdapter(blockfrostApi);
 * const sdk = new SDK(queryAdapter, LiqwidLayer);
 *
 * // Protocol information can then be queried using the `protocol` member:
 * const printUserDebtInAllMarkets = async (address: Address): Promise<void> => {
 *   const userDebt = await sdk.protocol.currentDebt(address);
 *   console.log(userDebt);
 * }
 */
export class SDK<
  P extends Protocol<ProtocolStateDatum<P>, ProtocolLoanDatum<P>>
> {
  /**
   * Provides a set of helpers to query high-level information about the
   * protocol.
   */
  readonly protocol: ReturnType<ProtocolLayer<P>>;

  /**
   * Constructs a new SDK instance.
   *
   * @param queryAdapter - An implementation of the {@link QueryAdapter} interface for
   * querying low-level on-chain data.
   * @param protocolLayer - An implementation of the {@link ProtocolLayer}
   * interface, for querying high-level information about the protocol.
   */
  constructor(
    private readonly queryAdapter: QueryAdapter,
    private readonly protocolLayer: ProtocolLayer<P>
  ) {
    this.protocol = this.protocolLayer(this.queryAdapter);
  }
}
