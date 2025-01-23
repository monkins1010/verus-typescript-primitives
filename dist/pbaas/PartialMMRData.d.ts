/// <reference types="node" />
/// <reference types="bn.js" />
import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
export declare type PartialMMRDataUnit = {
    type: BigNumber;
    data: Buffer;
};
export declare type PartialMMRDataInitData = {
    flags?: BigNumber;
    data?: Array<PartialMMRDataUnit>;
    salt?: Array<Buffer>;
    mmrhashtype?: BigNumber;
    priormmr?: Array<Buffer>;
};
export declare class PartialMMRData implements SerializableEntity {
    flags: BigNumber;
    data: Array<PartialMMRDataUnit>;
    mmrhashtype?: BigNumber;
    salt?: Array<Buffer>;
    priormmr?: Array<Buffer>;
    static CONTAINS_SALT: import("bn.js");
    static CONTAINS_PRIORMMR: import("bn.js");
    constructor(data?: PartialMMRDataInitData);
    protected serializeSalt(): boolean;
    protected serializePriorMMR(): boolean;
    private toggleContainsSalt;
    private toggleContainsPriorMMR;
    private getPartialMMRDataByteLength;
    getByteLength(): number;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toBuffer(): Buffer;
}
