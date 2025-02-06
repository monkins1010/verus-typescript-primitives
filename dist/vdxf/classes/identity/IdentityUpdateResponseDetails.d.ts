/// <reference types="node" />
/// <reference types="bn.js" />
import { BigNumber } from '../../../utils/types/BigNumber';
export declare type IdentityUpdateResponseDetailsJson = {
    flags: string;
    requestid: string;
    createdat: string;
    txid?: string;
    salt?: string;
};
export declare class IdentityUpdateResponseDetails {
    flags?: BigNumber;
    requestid?: BigNumber;
    createdat?: BigNumber;
    txid?: Buffer;
    salt?: Buffer;
    static IDENTITY_UPDATE_RESPONSE_INVALID: import("bn.js");
    static IDENTITY_UPDATE_RESPONSE_VALID: import("bn.js");
    static IDENTITY_UPDATE_RESPONSE_CONTAINS_TXID: import("bn.js");
    static IDENTITY_UPDATE_RESPONSE_CONTAINS_SALT: import("bn.js");
    constructor(data?: {
        flags?: BigNumber;
        requestid?: BigNumber;
        createdat?: BigNumber;
        txid?: Buffer;
        salt?: Buffer;
    });
    isValid(): boolean;
    containsTxid(): boolean;
    containsSalt(): boolean;
    toggleIsValid(): void;
    toggleContainsTxid(): void;
    toggleContainsSalt(): void;
    toSha256(): Buffer;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): IdentityUpdateResponseDetailsJson;
    static fromJson(json: IdentityUpdateResponseDetailsJson): IdentityUpdateResponseDetails;
}
