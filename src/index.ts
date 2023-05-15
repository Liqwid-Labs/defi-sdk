import {BlockFrostAdapter} from "./adapters";
import {Liqwid, LiqwidLayer} from "./protocols";
import {Protocol, ProtocolLayer, ProtocolLoanDatum, ProtocolStateDatum, QueryLayer} from "./types";

export * from "./adapters";
export * from "./protocols";

export class SDK<P extends Protocol<ProtocolStateDatum<P>, ProtocolLoanDatum<P>>> {
  readonly protocol: ReturnType<ProtocolLayer<P>>;

  constructor (
    private readonly queryLayer: QueryLayer,
    private readonly protocolLayer: ProtocolLayer<P>
  ) {
    this.protocol = this.protocolLayer(this.queryLayer);
  };
}

export const liqwidSDK = new SDK(BlockFrostAdapter, LiqwidLayer);

/*
 * Example queries
*/

liqwidSDK.protocol.marketCirculatingSupply(Liqwid.markets.ADA).then(console.log);
