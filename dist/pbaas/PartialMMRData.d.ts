/// <reference types="node" />
/// <reference types="bn.js" />
import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
import { AllowedHashes } from '../constants/pbaas';
import { VdxfUniValue, VdxfUniValueJson } from './VdxfUniValue';
export declare type PartialMMRDataUnit = {
    type: BigNumber;
    data: Buffer | VdxfUniValue;
};
export declare type PartialMMRDataInitData = {
    flags?: BigNumber;
    data?: Array<PartialMMRDataUnit>;
    salt?: Array<Buffer>;
    mmrhashtype?: BigNumber;
    priormmr?: Array<Buffer>;
};
export declare type PartialMMRDataJson = {
    flags?: string;
    data?: Array<{
        type: string;
        data: string | VdxfUniValueJson;
    }>;
    salt?: Array<string>;
    mmrhashtype?: string;
    priormmr?: Array<string>;
};
export declare type CLIMMRDataStringKey = "filename" | "serializedhex" | "serializedbase64" | "message" | "datahash";
export declare type CLIMMRDataKey = CLIMMRDataStringKey | "vdxfdata";
export declare type SingleKeyMMRData = {
    [K in CLIMMRDataStringKey]: {
        [P in K]: string;
    };
}[CLIMMRDataStringKey];
export declare type PartialMMRDataCLIJson = {
    mmrdata: Array<SingleKeyMMRData | string | {
        ['vdxfdata']: VdxfUniValueJson;
    }>;
    mmrsalt?: Array<string>;
    mmrhashtype?: AllowedHashes;
    priormmr?: Array<string>;
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
    protected containsSalt(): boolean;
    protected containsPriorMMR(): boolean;
    private toggleContainsSalt;
    private toggleContainsPriorMMR;
    private getPartialMMRDataByteLength;
    getByteLength(): number;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toBuffer(): Buffer;
    toJson(): PartialMMRDataJson;
    static fromJson(json: PartialMMRDataJson): PartialMMRData;
    toCLIJson(): PartialMMRDataCLIJson;
    static fromCLIJson(json: PartialMMRDataCLIJson): PartialMMRData;
}
