import { BigNumber } from '../utils/types/BigNumber';
import { KeyID } from './KeyID';
import { SerializableEntity } from '../utils/types/SerializableEntity';
export declare const PRINCIPAL_DEFAULT_FLAGS: import("bn.js");
export declare const PRINCIPAL_VERSION_INVALID: import("bn.js");
export declare const PRINCIPAL_VERSION_CURRENT: import("bn.js");
export declare class Principal implements SerializableEntity {
    flags: BigNumber;
    version: BigNumber;
    min_sigs?: BigNumber;
    primary_addresses?: Array<KeyID>;
    constructor(data?: {
        version?: BigNumber;
        flags?: BigNumber;
        min_sigs?: BigNumber;
        primary_addresses?: Array<KeyID>;
    });
    protected containsFlags(): boolean;
    protected containsVersion(): boolean;
    protected containsPrimaryAddresses(): boolean;
    protected containsMinSigs(): boolean;
    private getSelfByteLength;
    getByteLength(): number;
    toBuffer(): Buffer<ArrayBufferLike>;
    fromBuffer(buffer: Buffer, offset?: number): number;
}
