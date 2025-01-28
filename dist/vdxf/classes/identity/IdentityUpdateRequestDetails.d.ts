/// <reference types="node" />
/// <reference types="bn.js" />
import { PartialIdentity } from '../../../pbaas/PartialIdentity';
import { PartialSignData } from '../../../pbaas/PartialSignData';
import { BigNumber } from '../../../utils/types/BigNumber';
import { IdentityID } from '../../../pbaas';
import { ResponseUri } from '../ResponseUri';
export declare type SignDataMap = Map<string, PartialSignData>;
export declare class IdentityUpdateRequestDetails {
    flags?: BigNumber;
    requestid?: BigNumber;
    createdat?: BigNumber;
    identity?: PartialIdentity;
    expiryheight?: BigNumber;
    systemid?: IdentityID;
    responseuris?: Array<ResponseUri>;
    signdatamap?: SignDataMap;
    salt?: Buffer;
    static IDENTITY_UPDATE_REQUEST_INVALID: import("bn.js");
    static IDENTITY_UPDATE_REQUEST_VALID: import("bn.js");
    static IDENTITY_UPDATE_REQUEST_CONTAINS_SIGNDATA: import("bn.js");
    static IDENTITY_UPDATE_REQUEST_EXPIRES: import("bn.js");
    static IDENTITY_UPDATE_REQUEST_CONTAINS_REDIRECT_URI: import("bn.js");
    static IDENTITY_UPDATE_REQUEST_CONTAINS_SYSTEM: import("bn.js");
    static IDENTITY_UPDATE_REQUEST_CONTAINS_SALT: import("bn.js");
    static IDENTITY_UPDATE_REQUEST_IS_TESTNET: import("bn.js");
    constructor(data?: {
        flags?: BigNumber;
        requestid?: BigNumber;
        createdat?: BigNumber;
        identity?: PartialIdentity;
        expiryheight?: BigNumber;
        systemid?: IdentityID;
        responseuris?: Array<ResponseUri>;
        signdatamap?: SignDataMap;
        salt?: Buffer;
    });
    isValid(): boolean;
    expires(): boolean;
    containsSignData(): boolean;
    containsSystem(): boolean;
    containsResponseUris(): boolean;
    containsSalt(): boolean;
    isTestnet(): boolean;
    toggleIsValid(): void;
    toggleExpires(): void;
    toggleContainsSignData(): void;
    toggleContainsSystem(): void;
    toggleContainsResponseUris(): void;
    toggleContainsSalt(): void;
    toggleIsTestnet(): void;
    toSha256(): Buffer;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
}
