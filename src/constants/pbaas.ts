import { BN } from "bn.js";

export const DATA_TYPE_UNKNOWN = new BN("0", 10);
export const DATA_TYPE_MMRDATA = new BN("1", 10);
export const DATA_TYPE_FILENAME = new BN("2", 10);
export const DATA_TYPE_MESSAGE = new BN("3", 10);
export const DATA_TYPE_VDXFDATA = new BN("4", 10);
export const DATA_TYPE_HEX = new BN("5", 10);
export const DATA_TYPE_BASE64 = new BN("6", 10);
export const DATA_TYPE_DATAHASH = new BN("7", 10);
export const DATA_TYPE_RAWSTRINGDATA = new BN("8", 10);

export const HASH_TYPE_SHA256 = new BN("1", 10);
export const HASH_TYPE_SHA256D = new BN("2", 10);
export const HASH_TYPE_BLAKE2B = new BN("3", 10);
export const HASH_TYPE_KECCAK256 = new BN("4", 10);
export const DEFAULT_HASH_TYPE = HASH_TYPE_SHA256;

export const UINT_256_LENGTH = 32;