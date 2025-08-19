import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { IdentityID } from './IdentityID';
export declare class DefinedKey implements SerializableEntity {
    version: BigNumber;
    flags: BigNumber;
    vdxfuri?: string;
    combinedvdxfkey?: IdentityID;
    combinedhash?: Buffer;
    indexnum?: BigNumber;
    static DEFINEDKEY_DEFAULT_FLAGS: import("bn.js");
    static DEFINEDKEY_COMBINES_KEY: import("bn.js");
    static DEFINEDKEY_COMBINES_HASH: import("bn.js");
    static DEFINEDKEY_COMBINES_INDEXNUM: import("bn.js");
    static DEFINEDKEY_CONTAINS_SCHEMA: import("bn.js");
    static DEFINEDKEY_VERSION_INVALID: import("bn.js");
    static DEFINEDKEY_VERSION_CURRENT: import("bn.js");
    constructor(data?: {
        version?: BigNumber;
        flags?: BigNumber;
        vdxfuri?: string;
        combinedvdxfkey?: IdentityID;
        combinedhash?: Buffer;
        indexnum?: BigNumber;
    });
    protected containsSchema(): boolean;
    combinesKey(): boolean;
    combinesHash(): boolean;
    combinesIndexNum(): boolean;
    getFqnBuffer(): Buffer<ArrayBuffer>;
    private getDataKey;
    getIAddr(testnet?: boolean): string;
    getNameSpaceID(testnet?: boolean): string;
    private getSelfByteLength;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
}
