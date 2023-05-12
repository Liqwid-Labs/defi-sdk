import { Address } from '../types';
import * as CSL from "@emurgo/cardano-serialization-lib-nodejs";

export const addressToPaymentPubKeyHash = (address: Address): Buffer => {
  const deserializedAddress = CSL.Address.from_bech32(address);
  const parsedAddress =
    CSL.BaseAddress.from_address(deserializedAddress)
    ?? CSL.EnterpriseAddress.from_address(deserializedAddress)
    ?? CSL.PointerAddress.from_address(deserializedAddress);

  if (!parsedAddress) {
    throw new Error(`Cannot get payment pubkey hash from address: address could not be parsed: ${address}`); 
  }

  const paymentPubKeyHash = parsedAddress.payment_cred().to_keyhash()?.to_bytes();

  if (!paymentPubKeyHash) {
    throw new Error(`Cannot get payment pubkey hash from address: no payment credential found in address: ${address}`) ;
  }

  return Buffer.from(paymentPubKeyHash);
}
