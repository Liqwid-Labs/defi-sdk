import {RawCBOR} from "../utils/cbor";

// General types

export type Address = `addr${string}`;
export const isAddress = (maybeAddress: string): maybeAddress is Address =>
  maybeAddress.startsWith('addr');

export type StakeAddress = `stake${string}`;
export const isStakeAddress = (maybeAddress: string): maybeAddress is StakeAddress =>
  maybeAddress.startsWith('stake');

export type Asset = 'lovelace' | NativeToken;

export type NativeToken = {
  policyId: string;
  hexTokenName: string;
};

export type Market = {
  underlyingAsset: Asset;
  componentToken: NativeToken;
  stateToken: NativeToken;
  stateUtxoAddress: Address;
  loanTokens: NativeToken[];
  loanUtxosAddress: Address;
}

/*
 * Protocol layer (abstract the protocol)
*/

export type Protocol<StateDatum, LoanDatum> = {
  name: string;
  markets: {[ticker: string]: Market}; // TODO: refine this
  parseStateDatum: (rawCbor: RawCBOR) => StateDatum;
  parseLoanDatum: (rawCbor: RawCBOR) => LoanDatum;
};

export type ProtocolStateDatum<P> = P extends Protocol<infer S, any> ? S : never;
export type ProtocolLoanDatum<P> = P extends Protocol<any, infer L> ? L : never;


export type Quantity<T extends Asset> = {asset: T, quantity: bigint};

export type ProtocolLayer<P extends Protocol<ProtocolStateDatum<P>, ProtocolLoanDatum<P>>> = (Query: QueryLayer) => {
  suppliedBalance (address: Address | StakeAddress): Promise<Quantity<ValueOf<P['markets']>['underlyingAsset']>[]>;
  suppliedBalanceInMarket <M extends ValueOf<P['markets']>>(market: M, address: Address | StakeAddress): Promise<Quantity<M['underlyingAsset']>>;
  currentDebt (address: Address | StakeAddress): Promise<Quantity<ValueOf<P['markets']>['underlyingAsset']>[]>;
  currentDebtInMarket <M extends ValueOf<P['markets']>>(market: M, address: Address | StakeAddress): Promise<Quantity<M['underlyingAsset']>>;
  marketCirculatingSupply <M extends ValueOf<P['markets']>>(market: M): Promise<Quantity<M['underlyingAsset']>>;
  circulatingSupply (): Promise<Quantity<ValueOf<P['markets']>['underlyingAsset']>[]>;
}

/*
 * Query layer (abstracts the indexer, serves protocol queries)
*/

export type DatumDecoder<T> = (cbor: RawCBOR) => T | null;

export type BaseUtxo = {
  address: Address;
  txOutHash: string;
  txOutIndex: number;
  amount: Quantity<Asset>[];
}

export type ScriptUtxo<Datum> = BaseUtxo & {
  parsedDatum: Datum | null
}

export interface QueryLayer {
  stakeAddressFromAddress (address: Address): Promise<StakeAddress>;
  assetAmountInStakeAddress (stakeAddress: StakeAddress, asset: Asset): Promise<bigint>;
  assetAmountInAddress (address: Address, asset: Asset): Promise<bigint>;
  relatedAddresses (address: Address): Promise<Address[]>;
  stakeAddressAddresses (stakeAddres: StakeAddress): Promise<Address[]>;
  stateThreadDatum <T>(scriptAddress: Address, stateThreadToken: NativeToken, decoder?: DatumDecoder<T>): Promise<typeof decoder extends undefined ? RawCBOR : T>; // TODO: this conditional is useless
  assetUtxosInAddress <T>(address: Address, asset: Asset, decoder?: DatumDecoder<T>): Promise<(typeof decoder extends undefined ? BaseUtxo : ScriptUtxo<T>)[]>; // TODO: fix this type
  assetCirculatingAmount (asset: Asset): Promise<bigint>;
}

// Utility types

export type ValueOf<T> = T extends {[K in any]: infer V} ? V : never;

export type AsyncReturnType<AsyncFunction> =
  AsyncFunction extends ((...args: any[]) => Promise<infer R>)
    ? R
    : never;

export type ArrayElement<A> = A extends (infer E)[] ? E : never;
