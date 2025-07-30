/// <reference types="node" />
/// <reference types="bn.js" />
import { BigNumber } from '../../../utils/types/BigNumber';
import { MMRDescriptor, MMRDescriptorJson } from '../../../pbaas/MMRDescriptor';
import { SignatureData, SignatureJsonDataInterface } from '../../../pbaas/SignatureData';
import { SerializableEntity } from '../../../utils/types/SerializableEntity';
export interface AttestationPairJson {
    mmrdescriptor: MMRDescriptorJson;
    signaturedata: SignatureJsonDataInterface;
}
export interface AttestationDetailsJson {
    version: number;
    flags?: number;
    label?: string;
    id?: string;
    timestamp?: number;
    attestations: AttestationPairJson[];
}
export declare class AttestationPair implements SerializableEntity {
    mmrDescriptor: MMRDescriptor;
    signatureData: SignatureData;
    constructor(data?: {
        mmrDescriptor?: MMRDescriptor;
        signatureData?: SignatureData;
    });
    static fromJson(data: AttestationPairJson): AttestationPair;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): AttestationPairJson;
}
export declare class AttestationDetails implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    static FLAG_LABEL: number;
    static FLAG_ID: number;
    static FLAG_TIMESTAMP: number;
    version: BigNumber;
    flags: BigNumber;
    label?: string;
    id?: string;
    timestamp?: BigNumber;
    attestations: AttestationPair[];
    constructor(data?: {
        version?: BigNumber;
        flags?: BigNumber;
        label?: string;
        id?: string;
        timestamp?: BigNumber;
        attestations?: AttestationPair[];
    });
    static fromJson(data: AttestationDetailsJson): AttestationDetails;
    /**
     * Create AttestationDetails from a single Verus node response
     * @param nodeResponse - The JSON object from Verus node: {"signaturedata": ..., "mmrdescriptor": ...}
     * @param options - Optional metadata (label, id, timestamp)
     */
    static fromNodeResponse(nodeResponse: {
        signaturedata: any;
        mmrdescriptor: any;
    }, options?: {
        label?: string;
        id?: string;
        timestamp?: number;
    }): AttestationDetails;
    /**
     * Create AttestationDetails from multiple Verus node responses
     * @param nodeResponses - Array of JSON objects from Verus node
     * @param options - Optional metadata (label, id, timestamp)
     */
    static fromNodeResponses(nodeResponses: Array<{
        signaturedata: any;
        mmrdescriptor: any;
    }>, options?: {
        label?: string;
        id?: string;
        timestamp?: number;
    }): AttestationDetails;
    hasLabel(): boolean;
    hasId(): boolean;
    hasTimestamp(): boolean;
    setLabel(label: string): void;
    setId(id: string): void;
    setTimestamp(timestamp: BigNumber): void;
    /**
     * Add a new attestation from a Verus node response
     * @param nodeResponse - The JSON object from Verus node: {"signaturedata": ..., "mmrdescriptor": ...}
     */
    addAttestation(nodeResponse: {
        signaturedata: any;
        mmrdescriptor: any;
    }): void;
    /**
     * Add multiple attestations from Verus node responses
     * @param nodeResponses - Array of JSON objects from Verus node
     */
    addAttestations(nodeResponses: Array<{
        signaturedata: any;
        mmrdescriptor: any;
    }>): void;
    /**
     * Add an existing AttestationPair to this collection
     * @param attestationPair - The AttestationPair to add
     */
    addAttestationPair(attestationPair: AttestationPair): void;
    /**
     * Get the number of attestations in this collection
     */
    getAttestationCount(): number;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    isValid(): boolean;
    toJson(): AttestationDetailsJson;
}
