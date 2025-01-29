/// <reference types="bn.js" />
/// <reference types="node" />
import { VDXFObject, VerusIDSignature } from "../..";
import { BigNumber } from "../../../utils/types/BigNumber";
import { IdentityUpdateRequestDetails } from "./IdentityUpdateRequestDetails";
import { IdentityID } from "../../../pbaas";
import { IdentityUpdateResponseDetails } from "./IdentityUpdateResponseDetails";
export declare const IDENTITY_UPDATE_VERSION_CURRENT: import("bn.js");
export declare const IDENTITY_UPDATE_VERSION_FIRSTVALID: import("bn.js");
export declare const IDENTITY_UPDATE_VERSION_LASTVALID: import("bn.js");
export declare const IDENTITY_UPDATE_VERSION_SIGNED: import("bn.js");
export declare const IDENTITY_UPDATE_VERSION_MASK: import("bn.js");
export declare type IdentityUpdateDetails = IdentityUpdateRequestDetails | IdentityUpdateResponseDetails;
export interface IdentityUpdateEnvelopeInterface {
    details: IdentityUpdateDetails;
    systemid?: IdentityID;
    signingid?: IdentityID;
    signature?: string;
    version?: BigNumber;
}
export declare class IdentityUpdateEnvelope extends VDXFObject {
    systemid: IdentityID;
    signingid: IdentityID;
    signature?: VerusIDSignature;
    details: IdentityUpdateDetails;
    constructor(vdxfkey: string, request?: IdentityUpdateEnvelopeInterface);
    private createEmptyDetails;
    getVersionNoFlags(): BigNumber;
    isValidVersion(): boolean;
    isSigned(): boolean;
    setSigned(): void;
    getDetailsHash(signedBlockheight: number, signatureVersion?: number): Buffer;
    protected _dataByteLength(signer?: IdentityID): number;
    protected _toDataBuffer(signer?: IdentityID): Buffer;
    dataByteLength(): number;
    toDataBuffer(): Buffer;
    protected _fromDataBuffer(buffer: Buffer, offset?: number): number;
    fromDataBuffer(buffer: Buffer, offset?: number): number;
    toWalletDeeplinkUri(): string;
    static fromWalletDeeplinkUri(vdxfkey: string, uri: string): IdentityUpdateEnvelope;
    toQrString(): string;
    static fromQrString(vdxfkey: string, qrstring: string): IdentityUpdateEnvelope;
}
export declare class IdentityUpdateRequest extends IdentityUpdateEnvelope {
    constructor(request: IdentityUpdateEnvelopeInterface);
    static fromWalletDeeplinkUri(uri: string): IdentityUpdateRequest;
    static fromQrString(qrstring: string): IdentityUpdateRequest;
}
export declare class IdentityUpdateResponse extends IdentityUpdateEnvelope {
    constructor(response: IdentityUpdateEnvelopeInterface);
    static fromWalletDeeplinkUri(uri: string): IdentityUpdateEnvelope;
    static fromQrString(qrstring: string): IdentityUpdateResponse;
}
