import { bech32 } from "bech32";

export const fromBech32 = (address: string): { version: number, prefix: string, data: Buffer } => {
  var result = bech32.decode(address);
  var data = bech32.fromWords(result.words);

  return {
    version: result.words[0],
    prefix: result.prefix,
    data: Buffer.from(data)
  }
}

export const toBech32 = (prefix: string, data: Buffer): string => {
  const words = bech32.toWords(data);
  var result = bech32.encode(prefix, words);

  return result;
}

export const convertBits = (data: Buffer, from: number, to: number, strictMode: boolean): Buffer => {
  const length = strictMode
    ? Math.floor((data.length * from) / to)
    : Math.ceil((data.length * from) / to);
  const mask = (1 << to) - 1;
  const result = Buffer.alloc(length);
  let index = 0;
  let accumulator = 0;
  let bits = 0;

  for (const value of data) {
    accumulator = (accumulator << from) | value;
    bits += from;
    while (bits >= to) {
      bits -= to;
      result[index] = (accumulator >> bits) & mask;
      ++index;
    }
  }

  if (!strictMode) {
    if (bits > 0) {
      result[index] = (accumulator << (to - bits)) & mask;
      ++index;
    }
  } else {
    throw new Error("Bits cannot be converted")
  }

  return result;
}

export const decodeSaplingAddress = (address: string): { d: Buffer, pk_d: Buffer } => {
  const result = fromBech32(address);

  //const data = convertBits(result.data, 5, 8, false);

  if (result.data.length !== 43) {
    throw new Error('Invalid sapling address');
  }

  return { d: Buffer.from(result.data.subarray(0, 11)), pk_d: Buffer.from(result.data.subarray(11)) };
}

export const encodeSaplingAddress = (data: { d: Buffer, pk_d: Buffer }): string => {
  const buffer = Buffer.concat([data.d, data.pk_d]);

  //const data = convertBits(buffer, 8, 5, false);

  return toBech32('zs', buffer);
}