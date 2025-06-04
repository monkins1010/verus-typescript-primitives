/// <reference types="bn.js" />
/// <reference types="node" />
import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
export interface URLRefJson {
    version: string;
    flags?: string;
    datahash?: string;
    url: string;
}
export declare class URLRef implements SerializableEntity {
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static HASHDATA_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static FLAG_HAS_HASH: import("bn.js");
    version: BigNumber;
    flags: BigNumber;
    data_hash: Buffer;
    url: string;
    constructor(data?: {
        version?: BigNumber;
        url?: string;
        flags?: BigNumber;
        data_hash?: Buffer;
    });
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    isValid(): boolean;
    toJson(): {
        version: number;
        flags: number;
        data_hash: string;
        url: string;
    };
    static fromJson(data: URLRefJson): URLRef;
}
