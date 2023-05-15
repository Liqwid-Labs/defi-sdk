import {
  Protocol,
  ProtocolLayer,
  ProtocolLoanDatum,
  ProtocolStateDatum,
  QueryLayer,
} from "./types";

export * from "./adapters";
export * from "./protocols";

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
