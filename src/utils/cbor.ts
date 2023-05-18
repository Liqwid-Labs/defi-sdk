/**
 * A representation of a decoded, but not yet parsed, CBOR value.
 *
 * @see [RFC 7049](https://tools.ietf.org/html/rfc7049) for more information on CBOR.
 */
export type RawCBOR =
  | number
  | bigint
  | string
  | Buffer
  | RawCBOR[]
  | { [key: string]: RawCBOR };

/**
 * Parse a CBOR constructor (represented as an array of values) into an object
 * type based on the provided decoder.
 *
 * @typeparam T - The expected type of the decoded object.
 * @typeparam V - The value type of the properties in the decoded object.
 *
 * @param rawCbor - The CBOR value to decode.
 * @param decoder - An object with decoding functions for each property of the expected object type T.
 *
 * @returns The decoded object of type T.
 *
 * @throws {Error} If the input rawCbor is not a constructor or if its length
 * doesn't match the number of properties in the decoder.
 */
export const cborConstructorToObject = <T extends { [k: string]: V }, V>(
  rawCbor: RawCBOR,
  decoder: { [k in keyof T]: (c: RawCBOR) => T[k] }
): T => {
  if (!Array.isArray(rawCbor)) {
    throw new Error(
      `Cannot decode cbor constructor: not a constructor: ${rawCbor}`
    );
  }

  if (rawCbor.length != Object.keys(decoder).length) {
    throw new Error(`Cannot decode cbor constructor: bad length: ${rawCbor}`);
  }

  return Object.fromEntries(
    Object.entries(decoder).map(([key, f], i) => [key, f(rawCbor[i])])
  ) as T;
};
