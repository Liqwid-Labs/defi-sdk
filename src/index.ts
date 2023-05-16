import {
  Protocol,
  ProtocolLayer,
  ProtocolLoanDatum,
  ProtocolStateDatum,
  QueryLayer,
} from "./types";

export { BlockFrostAdapter } from "./adapters";
export {
  Liqwid,
  LiqwidLayer,
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
  QueryLayer,
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
export { RawCBOR, RawCBORComplex, RawCBORPrimitive } from "./utils";

export class SDK<
  P extends Protocol<ProtocolStateDatum<P>, ProtocolLoanDatum<P>>
> {
  readonly protocol: ReturnType<ProtocolLayer<P>>;

  constructor(
    private readonly queryLayer: QueryLayer,
    private readonly protocolLayer: ProtocolLayer<P>
  ) {
    this.protocol = this.protocolLayer(this.queryLayer);
  }
}
