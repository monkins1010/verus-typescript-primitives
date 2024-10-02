/// <reference types="node" />
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { PBaaSEvidenceRef } from './PBaaSEvidenceRef';
import { IdentityMultimapRef } from './IdentityMultimapRef';
import { URLRef } from './URLRef';
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
    toJson(): any;
}
