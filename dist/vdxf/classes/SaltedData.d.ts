import { VDXFData } from '../../';
export declare class SaltedData extends VDXFData {
    salt: Buffer;
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    constructor(data?: Buffer, salt?: Buffer);
    static fromJson(data: any): SaltedData;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): any;
    getHash(hw: (data: Buffer) => Buffer): Buffer;
}
