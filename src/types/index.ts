import { RawCBOR } from "../utils/cbor";

// General types

/**
 * A payment address, represented as Bech32 string.
 */
export type Address = `addr${string}`;

/**
 * Check if the provided string is a valid payment address.
 */
export const isAddress = (maybeAddress: string): maybeAddress is Address =>
  maybeAddress.startsWith("addr");

/**
 * A staking address, represented as a Bech32 string.
 * Staking addresses are used as "accounts" in this library.
 * Methods that accept a `StakeAddress` will fetch results for every `Address`
 * that shares the same staking credential.
 */
export type StakeAddress = `stake${string}`;

/** Check if the provided string is a valid staking address. */
export const isStakeAddress = (
  maybeAddress: string
): maybeAddress is StakeAddress => maybeAddress.startsWith("stake");

export type Asset = "lovelace" | NativeToken;

/**
 * A Cardano native token, composed of a minting policy id and a hex-encoded
 * token name.
 */
export type NativeToken = {
  /** The hash of the token's minting policy script. */
  policyId: string;
  /** The hex-encoded representation of the token's name */
  hexTokenName: string;
};

/**
 * A market is a lending pool in a protocol that mints liquidity tokens for its
 * suppliers.
 *
 * Fields:
 * - underlyingAsset: the underlying token being lent
 * - liquidityToken: the liquidity token minted by the market
 * - stateToken: a token used to identify the market's state
 * - stateUtxoAddress: the address of the UTxO where the market's state is stored
 * - loanTokens: an array of tokens that represent the loans made by the market
 * - loanUtxosAddress: the address of the UTxO where the market's loans are stored
 *
 * Assumptions:
 * - The market assumes that all loans are made in the underlying asset.
 * - The market's state is stored in a datum.
 * - All the market's loans are stored in datums locked at the same address.
 */
export type Market = {
  /** The underlying token being lent */
  underlyingAsset: Asset;
  /** The market's liquidity token */
  liquidityToken: NativeToken;
  /** A state-thread token used to identify the market's state UTxO. */
  stateToken: NativeToken;
  /** The address where the market's state UTxO is stored */
  stateUtxoAddress: Address;
  /** State-thread tokens used to identify the market's loan UTxOs. */
  loanTokens: NativeToken[];
  /** The address where the market's loan UTxOs are stored. */
  loanUtxosAddress: Address;
};

/*
 * Protocol layer (abstract the protocol)
 */

/** A decentralized lending protocol. */
export type Protocol<StateDatum, LoanDatum> = {
  /** A human-readable representation of the name of the protocol. **/
  name: string;
  /** The markets available in the protocol, identified by a human-readable ticker. */
  markets: { [ticker: string]: Market }; // TODO: refine this
  /** A parser for a deserialized CBOR representation of the markets' state datums. */
  parseStateDatum: (rawCbor: RawCBOR) => StateDatum;
  /** A parser for a deserialized CBOR representation of the markets' state datums. */
  parseLoanDatum: (rawCbor: RawCBOR) => LoanDatum;
};

export type ProtocolStateDatum<P> = P extends Protocol<infer S, any>
  ? S
  : never;
export type ProtocolLoanDatum<P> = P extends Protocol<any, infer L> ? L : never;

/**
 * An integral quantity of a specific asset
 *
 * @example
 * // A quantity of 100 Ada (i.e. 100_000_000 lovelace).
 * const oneHundredAda: Quantity<"lovelace"> = { asset: "lovelace", quantity: 100_000_000n };
 *
 * @typeParam T - The type of the asset being represented.
 */
export type Quantity<T extends Asset> = {
  /** The asset in question */
  asset: T;
  /** The amount of the asset. */
  quantity: bigint;
};

/**
 * An abstraction layer for querying high-level information about a DeFi protocol.
 *
 * @typeParam P - The type of the DeFi protocol definitions (see [[Protocol]]).
 */
export type ProtocolLayer<
  P extends Protocol<ProtocolStateDatum<P>, ProtocolLoanDatum<P>>
> = (Query: QueryAdapter) => {
  /**
   * Retrieves the supplied balance for a given address or stake address
   * across all markets in the protocol.
   */
  suppliedBalance(
    address: Address | StakeAddress
  ): Promise<Quantity<ValueOf<P["markets"]>["underlyingAsset"]>[]>;

  /**
   * Retrieves the supplied balance for a given address or stake address in a
   * specific market.
   */
  suppliedBalanceInMarket<M extends ValueOf<P["markets"]>>(
    market: M,
    address: Address | StakeAddress
  ): Promise<Quantity<M["underlyingAsset"]>>;

  /**
   * Retrieves the current debt for a given address or stake address across all
   * markets in the protocol.
   */
  currentDebt(
    address: Address | StakeAddress
  ): Promise<Quantity<ValueOf<P["markets"]>["underlyingAsset"]>[]>;

  /**
   * Retrieves the current debt for a given address or stake address in a specific market.
   */
  currentDebtInMarket<M extends ValueOf<P["markets"]>>(
    market: M,
    address: Address | StakeAddress
  ): Promise<Quantity<M["underlyingAsset"]>>;

  /**
   * Retrieves the circulating supply of the underlying asset in a specific market.
   */
  marketCirculatingSupply<M extends ValueOf<P["markets"]>>(
    market: M
  ): Promise<Quantity<M["underlyingAsset"]>>;

  /**
   * Retrieves the circulating supply of the underlying assets across all markets in the protocol.
   */
  circulatingSupply(): Promise<
    Quantity<ValueOf<P["markets"]>["underlyingAsset"]>[]
  >;
};

/*
 * Query layer (abstracts the indexer, serves protocol queries)
 */

export type DatumDecoder<T> = (cbor: RawCBOR) => T | null;

/**
 * An unspent transaction output (UTxO).
 */
export type BaseUtxo = {
  address: Address;
  txOutHash: string;
  txOutIndex: number;
  amount: Quantity<Asset>[];
};

/**
 * An unspent transaction output (UTXO) with an associated datum.
 *
 * @typeparam Datum - The type of the parsed datum associated with the UTXO.
 */
export type ScriptUtxo<Datum> = BaseUtxo & {
  parsedDatum: Datum | null;
};

/**
 * An abstraction layer for querying on-chain information.
 *
 * Implementations of this interface can be used to interact with various data
 * sources such as indexers, APIs, or custom-built databases.
 */
export interface QueryAdapter {
  /**
   * Returns the staking credential associated with the given address.
   */
  stakeAddressFromAddress(address: Address): Promise<StakeAddress>;

  /**
   * Returns the total amount of the given asset held by all the addresses
   * sharing the specified staking credential.
   */
  assetAmountInStakeAddress(
    stakeAddress: StakeAddress,
    asset: Asset
  ): Promise<bigint>;

  /**
   * Returns the total amount of the given asset held in the specified address.
   */
  assetAmountInAddress(address: Address, asset: Asset): Promise<bigint>;

  /**
   * Returns a list of all known addresses sharing the same staking credential
   * as the specified address.
   */
  relatedAddresses(address: Address): Promise<Address[]>;

  /**
   * Returns a list of all known addresses sharing the given stake address.
   */
  stakeAddressAddresses(stakeAddres: StakeAddress): Promise<Address[]>;

  /**
   * Returns the datum of a UTxO identified by a state-thread token.
   *
   * @typeparam T - The type of the parsed datum.
   * @param decoder - An optional decoder function to parse the raw CBOR datum into a custom type.
   */
  stateThreadDatum<T>(
    scriptAddress: Address,
    stateThreadToken: NativeToken,
    decoder?: DatumDecoder<T>
  ): Promise<typeof decoder extends undefined ? RawCBOR : T>; // TODO: this conditional is useless

  /**
   * Returns a list of unspent transaction outputs (UTXOs) containing the given
   * asset in the specified address.
   *
   * @typeparam T - The type of the datum associated with the UTXOs (if any).
   * @param decoder - An optional decoder function to parse the UTxO's datum into a custom type.
   */
  assetUtxosInAddress<T>(
    address: Address,
    asset: Asset,
    decoder?: DatumDecoder<T>
  ): Promise<(typeof decoder extends undefined ? BaseUtxo : ScriptUtxo<T>)[]>; // TODO: fix this type

  /**
   * Returns the total circulating amount of the given asset.
   */
  assetCirculatingAmount(asset: Asset): Promise<bigint>;
}

// Utility types

export type ValueOf<T> = T extends { [K in any]: infer V } ? V : never;

export type AsyncReturnType<AsyncFunction> = AsyncFunction extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : never;

export type ArrayElement<A> = A extends (infer E)[] ? E : never;
