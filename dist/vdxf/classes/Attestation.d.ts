/// <reference types="node" />
import { VDXFObject } from "../";
import { MMR } from "./MMR";
export interface AttestationData {
    attestationKey?: string;
    salt?: string;
    value?: string;
}
export declare class Attestation extends VDXFObject {
    components: Map<number, AttestationData>;
    signatures: {
        [attestor: string]: {
            signature: string;
            system: string;
        };
    };
    mmr: MMR;
    constructor(vdxfkey?: string, data?: {
        components?: Map<number, AttestationData>;
        signatures?: {
            [attestor: string]: {
                signature: string;
                system: string;
            };
        };
        mmr?: MMR;
    });
    dataByteLength(): number;
    toDataBuffer(): Buffer;
    fromDataBuffer(buffer: Buffer, offset?: number): number;
    createMMR(): Promise<MMR>;
    routeHash(): Promise<any>;
    getProof(keys: Array<number>): Promise<Attestation>;
    checkProof(): Promise<void>;
    getHash(key: any): Buffer;
}
