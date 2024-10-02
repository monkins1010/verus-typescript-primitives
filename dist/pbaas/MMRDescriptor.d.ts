/// <reference types="bn.js" />
/// <reference types="node" />
import { BigNumber } from '../utils/types/BigNumber';
import { DataDescriptor } from './DataDescriptor';
import { EHashTypes } from './DataDescriptor';
import { SerializableEntity } from '../utils/types/SerializableEntity';
export declare class MMRDescriptor implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static DEFAULT_VERSION: import("bn.js");
    version: BigNumber;
    objectHashType: EHashTypes;
    mmrHashType: EHashTypes;
    mmrRoot: DataDescriptor;
    mmrHashes: DataDescriptor;
    dataDescriptors: DataDescriptor[];
    constructor(data?: {
        version?: BigNumber;
        objectHashType?: EHashTypes;
        mmrHashType?: EHashTypes;
        mmrRoot?: DataDescriptor;
        mmrHashes?: DataDescriptor;
        dataDescriptors?: DataDescriptor[];
    });
    static fromJson(data: any): MMRDescriptor;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    HasData(): boolean;
    isValid(): boolean;
    toJson(): {
        version: string;
        objecthashtype: EHashTypes;
        mmrhashtype: EHashTypes;
        mmrroot: {
            version: string;
            flags: string;
        };
        mmrhashes: {
            version: string;
            flags: string;
        };
        datadescriptors: {
            version: string;
            flags: string;
        }[];
    };
}
