import { Protocol, ProtocolLayer } from "../../types";
import { RawCBOR, cborConstructorToObject } from "../../utils/cbor";

export type Tagged<tag, T> = {_tag: tag} & T;

export type Ratio<T> = { numerator: T, denominator: T }

export type FixedDecimal<N extends number> = {decimals: N, value: bigint}

export type LiqwidStateDatum = {
  supply: Tagged<"Underlying", bigint>;
  reserve: Tagged<"Underlying", bigint>;
  qTokens: Tagged<"QToken", bigint>;
  principal: Tagged<"Underlying", bigint>;
  interest: Tagged<"Underlying", bigint>;
  interestIndex: Tagged<"InterestIndex", FixedDecimal<9>>;
  interestRate: Tagged<"InterestRate", Ratio<bigint>>;
  lastInterestTime: Tagged<"Time", bigint>;
  lastBatch: Tagged<"POSIXTime", bigint>;
  qTokenRate: Tagged<"ExchangeRate", Ratio<bigint>>;
  minAda: Tagged<"Ada", bigint>;
}

export type LiqwidLoanDatum = {
  owner: Tagged<"PubKeyHash", string>;
  principal: Tagged<"Underlying", string>;
  interest: Tagged<"Underlying", string>;
  minInterest: Tagged<"Underlying", string>;
  index: Tagged<"InterestIndex", FixedDecimal<9>>;
};

export const Liqwid: Protocol<LiqwidStateDatum, LiqwidLoanDatum> = {
  name: "Liqwid",
  markets: {
    ADA: {
      underlyingAsset: 'lovelace' as const,
      componentToken: {
        policyId: "a04ce7a52545e5e33c2867e148898d9e667a69602285f6a1298f9d68",
        hexTokenName: ""
      },
      stateToken: {
        policyId: "5a3cb4f52fb3a00ab5abe62080618623811ccafab9c760d0b686e44c",
        hexTokenName: ""
      },
      stateUtxoAddress: "addr1wy8arwz5w2wju2ffp4rlugtnxxd2u0zv3pdf2hwzq0mjwkg77hygh" as const,
      loanTokens: [
        {
          policyId: "ee944b56bab503197bdfb929509a177c3ef9e5083ca7e65ffa1469c8",
          hexTokenName: "00"
        },
        {
          policyId: "ee944b56bab503197bdfb929509a177c3ef9e5083ca7e65ffa1469c8",
          hexTokenName: "01"
        }
      ],
      loanUtxosAddress: "addr1w9cnj8cclvf3729zxra87wmvvzv7g3mq9v4a9h6aq3k9axgfq4hx9" as const
    },
  },
  parseStateDatum (rawCbor: RawCBOR): LiqwidStateDatum { // TODO: this needs to be more robust
    const toBigInt = (x: RawCBOR): bigint => {
      switch (typeof(x)) {
        case 'bigint': return x;
        case 'number': return BigInt(x);
        default: throw new Error(`Cannot decode state datum: Cannot interpret as bigint: ${x}`);
      };
    };

    const decoder: {[k in keyof LiqwidStateDatum]: (c: RawCBOR) => LiqwidStateDatum[k]} = {
      // TODO: make this more robust
      supply: (x) => toBigInt(x) as LiqwidStateDatum['supply'],
      reserve: (x) => toBigInt(x) as LiqwidStateDatum['reserve'],
      qTokens: (x) => toBigInt(x) as LiqwidStateDatum['qTokens'],
      principal: (x) => toBigInt(x) as LiqwidStateDatum['principal'],
      interest: (x) => toBigInt(x) as LiqwidStateDatum['interest'],
      interestIndex: (x) => ({ decimals: 9, value: toBigInt(x) }) as LiqwidStateDatum['interestIndex'],
      interestRate: (x) => ({numerator: toBigInt((x as any)[0]), denominator: toBigInt((x as any)[1])}) as LiqwidStateDatum['interestRate'],
      lastInterestTime: (x) => toBigInt(x) as LiqwidStateDatum['lastInterestTime'],
      lastBatch: (x) => toBigInt(x) as LiqwidStateDatum['lastBatch'],
      qTokenRate: (x) => ({numerator: toBigInt((x as any)[0]), denominator: toBigInt((x as any)[1])}) as LiqwidStateDatum['qTokenRate'],
      minAda: (x) => toBigInt(x) as LiqwidStateDatum['minAda'],
    };

    return cborConstructorToObject(rawCbor, decoder);
  },
  parseLoanDatum (rawCbor: RawCBOR): LiqwidLoanDatum {
    return rawCbor as any;
  }
}

export const LiqwidLayer: ProtocolLayer<typeof Liqwid> = {
  suppliedBalanceInMarket: (Query) => async (market, address) => {
    // const stakeAddress = await Query.stakeAddressFromAddress(address);
    // const componentTokenBalance = await Query.assetAmountInStakeAddress(stakeAddress, market.componentToken);
    const componentTokenBalance = await Query.assetAmountInAddress(address, market.componentToken);

    if (componentTokenBalance === 0n) {
      return {
        asset: market.underlyingAsset,
        quantity: 0n
      };
    }

    const stateDatum = await Query.stateThreadDatum(market.stateUtxoAddress, market.stateToken, Liqwid.parseStateDatum);
    const componentTokenRate = stateDatum.qTokenRate;
    return {
      asset: market.underlyingAsset,
      quantity: (componentTokenBalance * componentTokenRate.denominator) / componentTokenRate.numerator
    };
  },

  currentDebtInMarket: (Query) => async (market, address) => {
    const stakeAddress = await Query.stakeAddressFromAddress(address);
    return undefined as any;
  },
}
