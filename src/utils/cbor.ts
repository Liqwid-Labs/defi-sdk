export type RawCBORPrimitive = number | bigint | string | Buffer;
export type RawCBORComplex<T> =
  | T
  | RawCBORComplex<T>[]
  | { [key: string]: RawCBORComplex<T> };
export type RawCBOR = RawCBORComplex<RawCBORPrimitive>;

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
