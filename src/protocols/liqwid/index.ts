import { Address, isStakeAddress, Protocol, ProtocolLayer, Quantity, QueryLayer, StakeAddress, ValueOf } from "../../types";
import { RawCBOR, cborConstructorToObject } from "../../utils/cbor";
import { addressToPaymentPubKeyHash } from "../../utils/cardano";

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

const parseStateDatum = (rawCbor: RawCBOR): LiqwidStateDatum => { // TODO: this needs to be more robust
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
};

export type LiqwidLoanDatum = {
  owner: Tagged<"PubKeyHash", Buffer>;
  principal: Tagged<"Underlying", bigint>;
  interest: Tagged<"Underlying", bigint>;
  minInterest: Tagged<"Underlying", bigint>;
  index: Tagged<"InterestIndex", FixedDecimal<9>>;
};

const parseLoanDatum = (rawCbor: RawCBOR): LiqwidLoanDatum => {
  const toBigInt = (x: RawCBOR): bigint => {
    switch (typeof(x)) {
      case 'bigint': return x;
      case 'number': return BigInt(x);
      default: throw new Error(`Cannot decode state datum: Cannot interpret as bigint: ${x}`);
    };
  };

  const decoder: {[k in keyof LiqwidLoanDatum]: (c: RawCBOR) => LiqwidLoanDatum[k]} = {
    owner: (x) => x as LiqwidLoanDatum['owner'],
    principal: (x) => toBigInt(x as any) as LiqwidLoanDatum['principal'],
    interest: (x) => toBigInt(x as any) as LiqwidLoanDatum['interest'],
    minInterest: (x) => toBigInt(x) as LiqwidLoanDatum['minInterest'],
    index: (x) => ({ decimals: 9, value: toBigInt(x) }) as LiqwidLoanDatum['index'],
  };

  return cborConstructorToObject(rawCbor, decoder);
};

export const Liqwid: Protocol<LiqwidStateDatum, LiqwidLoanDatum> = {
  name: "Liqwid",
  markets: {
    ADA: {
      underlyingAsset: 'lovelace',
      componentToken: {
        policyId: "a04ce7a52545e5e33c2867e148898d9e667a69602285f6a1298f9d68",
        hexTokenName: ""
      },
      stateToken: {
        policyId: "5a3cb4f52fb3a00ab5abe62080618623811ccafab9c760d0b686e44c",
        hexTokenName: ""
      },
      stateUtxoAddress: "addr1wy8arwz5w2wju2ffp4rlugtnxxd2u0zv3pdf2hwzq0mjwkg77hygh",
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
      loanUtxosAddress: "addr1w9cnj8cclvf3729zxra87wmvvzv7g3mq9v4a9h6aq3k9axgfq4hx9"
    },
    DJED: {
      underlyingAsset: {
        policyId: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61",
        hexTokenName: "446a65644d6963726f555344",
      },
      componentToken: {
        policyId: "6df63e2fdde8b2c3b3396265b0cc824aa4fb999396b1c154280f6b0c",
        hexTokenName: ""
      },
      stateToken: {
        policyId: "43c4bdac04537dbd338935d00a8a0746a078d4f03d7ac302a4bf5d3d",
        hexTokenName: ""
      },
      stateUtxoAddress: "addr1w93av4qclpq7nyqatmnrfnq8xa7v52l8lv4hjl3lpcxcxdqfjuerl",
      loanTokens: [
        {
          policyId: "5409708a3eff94524d978ca12f97c318bd011308f71eee232575eb9e",
          hexTokenName: "00"
        },
        {
          policyId: "5409708a3eff94524d978ca12f97c318bd011308f71eee232575eb9e",
          hexTokenName: "01"
        }
      ],
      loanUtxosAddress: "addr1w9al35tmf6n6t2a4a4t0wr82s0evvp23srw4mwhgdfzct9getn2u0"
    },
    SHEN: {
      underlyingAsset: {
        policyId: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61",
        hexTokenName: "5368656e4d6963726f555344"
      },
      componentToken: {
        policyId: "e1ff3557106fe13042ba0f772af6a2e43903ccfaaf03295048882c93",
        hexTokenName: ""
      },
      stateToken: {
        policyId: "7bff651a687fd87f2f6ffe705f7a36c39941248e80ecf8b0b10a4949",
        hexTokenName: ""
      },
      stateUtxoAddress: "addr1wxy75y6cmq28l6677xr4lwk5f8m9wxww6cgzectqp0cf8fcv6qvgw",
      loanTokens: [
        {
          policyId: "98cccc642a74eeb1fe7a22f43a814068b54f9f9afa583a73b74e36ba",
          hexTokenName: "00"
        },
        {
          policyId: "98cccc642a74eeb1fe7a22f43a814068b54f9f9afa583a73b74e36ba",
          hexTokenName: "01"
        }
      ],
      loanUtxosAddress: "addr1wy6e4crd5ndamykxxapcq0mtuxl36fz8wezumh4q0f00kxcpq94y0"
    }
  },
  parseStateDatum,
  parseLoanDatum
}

const suppliedBalanceInMarket = (Query: QueryLayer) => async <M extends ValueOf<typeof Liqwid['markets']>>(market: M, address: Address | StakeAddress): Promise<Quantity<M['underlyingAsset']>> => {
  const componentTokenBalance = isStakeAddress(address)
    ? await Query.assetAmountInStakeAddress(address, market.componentToken)
    : await Query.assetAmountInAddress(address, market.componentToken);

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
};

const currentDebtInMarket = (Query: QueryLayer) => async <M extends ValueOf<typeof Liqwid['markets']>>(market: M, address: Address | StakeAddress): Promise<Quantity<M['underlyingAsset']>> => {
    const pubKeyHashes = isStakeAddress(address)
      ? (await Query.stakeAddressAddresses(address)).map(addressToPaymentPubKeyHash)
      : [addressToPaymentPubKeyHash(address)];

    const loansInMarket = (
      await Promise.all(
        market.loanTokens.map(
          (loanToken) => Query.assetUtxosInAddress(market.loanUtxosAddress, loanToken, Liqwid.parseLoanDatum)
        ))).flat(); // TODO: query all tokens at once from loan validator utxos

    const getLoanDebt = (loan: LiqwidLoanDatum) =>
      loan.principal + loan.minInterest + loan.interest;  // TODO: review this minInterest part

    const totalDebt =
      loansInMarket
        .filter(({parsedDatum}) => pubKeyHashes.some((pkh) => parsedDatum?.owner.equals(pkh)))
        .reduce((acc, loanUtxo) => acc + getLoanDebt(loanUtxo.parsedDatum!), 0n) // TODO: make this more robust

    return {
      asset: market.underlyingAsset,
      quantity: totalDebt
    };
  }

  export const LiqwidLayer: ProtocolLayer<typeof Liqwid> = (Query: QueryLayer) => ({
    suppliedBalanceInMarket: suppliedBalanceInMarket(Query),
    currentDebtInMarket: currentDebtInMarket(Query),

    async currentDebt (address) {
      const debts = await Promise.all(
        Object.values(Liqwid.markets)
        .map((market) => currentDebtInMarket(Query)(market, address))
      );

      return debts.filter(({quantity}) => quantity > 0);
    },

    async suppliedBalance (address) {
      const balances = await Promise.all(
        Object.values(Liqwid.markets)
        .map((market) => suppliedBalanceInMarket(Query)(market, address))
      );

      return balances.filter(({quantity}) => quantity > 0);
    },
  });
