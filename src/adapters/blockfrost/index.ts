// Example: blockfrost adapter

import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { Address, ArrayElement, Asset, AsyncReturnType, BaseUtxo, DatumDecoder, NativeToken, Quantity, QueryLayer, ScriptUtxo, StakeAddress } from "../../types";
import {RawCBOR} from "../../utils/cbor";
import * as cbor from "cbor";

const api = new BlockFrostAPI({
  projectId: "***REMOVED***"
});

async function stateThreadDatum (scriptAddress: Address, stateThreadToken: NativeToken): Promise<RawCBOR>;
async function stateThreadDatum <D>(scriptAddress: Address, stateThreadToken: NativeToken, decoder: DatumDecoder<D>): Promise<D | null>
async function stateThreadDatum <D>(scriptAddress: Address, stateThreadToken: NativeToken, decoder?: DatumDecoder<D>): Promise<RawCBOR | D | null> {
    const [stateThreadUtxo] = await api.addressesUtxosAssetAll(scriptAddress, toBlockfrostAsset(stateThreadToken));

    if (!stateThreadUtxo) {
      throw new Error("State thread utxo not found");
    }

    if (!stateThreadUtxo.inline_datum) {
      throw new Error("State thread utxo has no inline datum");
    }

    const rawDatum: RawCBOR = cbor.decodeFirstSync(stateThreadUtxo.inline_datum, { encoding: 'hex' });

    return (decoder) ? decoder(rawDatum) : rawDatum;
}

async function assetUtxosInAddress (address: Address, asset: Asset): Promise<BaseUtxo[]>;
async function assetUtxosInAddress <D>(address: Address, asset: Asset, decoder: DatumDecoder<D>): Promise<ScriptUtxo<D>[]>;
async function assetUtxosInAddress <D>(address: Address, asset: Asset, decoder?: DatumDecoder<D>): Promise<(BaseUtxo | ScriptUtxo<D>)[]> {
  const utxos = await api.addressesUtxosAssetAll(address, toBlockfrostAsset(asset));

  const fromBlockfrostUtxo = (utxo: ArrayElement<AsyncReturnType<typeof api.addressesUtxosAssetAll>>): BaseUtxo => ({
      address: utxo.address as Address,
      txOutHash: utxo.tx_hash,
      txOutIndex: utxo.output_index,
      amount: utxo.amount.map(fromBlockfrostAmount)
    });

  if (!decoder) {
    return utxos.map(fromBlockfrostUtxo);
  }

  return utxos.map((utxo) => ({
    ...fromBlockfrostUtxo(utxo),
    parsedDatum: !utxo.inline_datum ? null : decoder(utxo.inline_datum)
  }));
}


export const BlockFrostAdapter: QueryLayer = {
  async stakeAddressFromAddress (address) {
    const addrInfo = await api.addresses(address);
    if (addrInfo.stake_address === null) {
      throw new Error(`stakeAddressFromAddress: address does not have an associated stake address: ${address}`);
    }
    return addrInfo.stake_address as StakeAddress;
  },

  async assetAmountInStakeAddress (stakeAddress, asset) {
    const assetsInAddress = await api.accountsAddressesAssetsAll(stakeAddress);
    return extractAssetQuantity(assetsInAddress, asset);
  },

  async assetAmountInAddress (address, asset) {
    const assetsInAddress = await api.addressesExtended(address);
    return extractAssetQuantity(assetsInAddress.amount, asset);
  },

  stateThreadDatum,
  assetUtxosInAddress: assetUtxosInAddress as any,
}

// Utilities

type BlockfrostQuantity = { unit: string, quantity: string };


const toBlockfrostAsset = (asset: Asset): string =>
  (asset === 'lovelace')
    ? asset
    : `${asset.policyId}${asset.hexTokenName}`;

const fromBlockfrostAsset = (unit: string): Asset =>
  (unit === 'lovelace')
    ? unit
    : {
      policyId: unit.slice(0, 56),
      hexTokenName: unit.slice(56)
    };

const blockfrostQuantityMatchesAsset = (asset: Asset) => (quantity: BlockfrostQuantity) =>
  quantity.unit === toBlockfrostAsset(asset);

const extractAssetQuantity = (quantities: BlockfrostQuantity[], asset: Asset): bigint =>
  BigInt(
    quantities
    .filter(blockfrostQuantityMatchesAsset(asset))
    .map(({quantity}) => quantity)
    .at(0)
     ?? 0
  );

const fromBlockfrostAmount = (amount: {unit: string; quantity: string}): Quantity<Asset> =>
  ({
    asset: fromBlockfrostAsset(amount.unit),
    quantity: BigInt(amount.quantity),
  });

