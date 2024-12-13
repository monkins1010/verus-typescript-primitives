/// <reference types="bn.js" />
/// <reference types="node" />
import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { Identity, VerusIDInitData } from './Identity';
export declare const PARTIAL_ID_CONTAINS_PARENT: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_CONTENT_MULTIMAP: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_PRIMARY_ADDRS: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_REVOCATION: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_RECOVERY: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_UNLOCK_AFTER: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_SYSTEM_ID: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_PRIV_ADDRS: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_CONTENT_MAP: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_MINSIGS: import("bn.js");
export declare const PARTIAL_ID_CONTAINS_FLAGS: import("bn.js");
export declare class PartialIdentity extends Identity implements SerializableEntity {
    contains: BigNumber;
    constructor(data?: VerusIDInitData);
    protected serializeFlags(): boolean;
    protected serializePrimaryAddresses(): boolean;
    protected serializeMinSigs(): boolean;
    protected serializeParent(): boolean;
    protected serializeSystemId(): boolean;
    protected serializeContentMap(): boolean;
    protected serializeContentMultiMap(): boolean;
    protected serializeRevocation(): boolean;
    protected serializeRecovery(): boolean;
    protected serializePrivateAddresses(): boolean;
    protected serializeUnlockAfter(): boolean;
    private toggleContainsParent;
    private toggleContainsSystemId;
    private toggleContainsContentMap;
    private toggleContainsContentMultiMap;
    private toggleContainsRevocation;
    private toggleContainsRecovery;
    private toggleContainsPrivateAddresses;
    private toggleContainsUnlockAfter;
    private toggleContainsFlags;
    private toggleContainsMinSigs;
    private toggleContainsPrimaryAddresses;
    toggleAllContains(): void;
    private getPartialIdentityByteLength;
    getByteLength(): number;
    fromBuffer(buffer: Buffer, offset?: number, parseVdxfObjects?: boolean): number;
    toBuffer(): Buffer;
}
