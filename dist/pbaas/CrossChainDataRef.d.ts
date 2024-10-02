/// <reference types="node" />
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { PBaaSEvidenceRef } from './PBaaSEvidenceRef';
import { IdentityMultimapRef } from './IdentityMultimapRef';
import { URLRef } from './URLRef';
export interface CrossChainDataRefJson {
    ref: PBaaSEvidenceRef | IdentityMultimapRef | URLRef;
}
export declare class CrossChainDataRef implements SerializableEntity {
    ref: PBaaSEvidenceRef | IdentityMultimapRef | URLRef;
    static TYPE_CROSSCHAIN_DATAREF: number;
    static TYPE_IDENTITY_DATAREF: number;
    static TYPE_URL_REF: number;
    constructor(data?: PBaaSEvidenceRef | IdentityMultimapRef | URLRef | any);
    which(): number;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    isValid(): boolean;
    toJson(): {
        type: number;
    } | {
        type: number;
        version: number;
        flags: number;
        output: any;
        objectnum: number;
        subobject: number;
        systemid: string;
    } | {
        type: number;
        version: string;
        url: string;
    };
    static fromJson(data: any): CrossChainDataRef;
}
