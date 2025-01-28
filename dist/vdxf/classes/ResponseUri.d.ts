/// <reference types="node" />
/// <reference types="bn.js" />
import { BigNumber } from "../../utils/types/BigNumber";
import { SerializableEntity } from "../../utils/types/SerializableEntity";
export declare class ResponseUri implements SerializableEntity {
    uri: Buffer;
    type: BigNumber;
    static TYPE_INVALID: import("bn.js");
    static TYPE_REDIRECT: import("bn.js");
    static TYPE_POST: import("bn.js");
    constructor(uri?: Buffer);
    getUriString(): string;
    static fromUriString(str: string): ResponseUri;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): {
        type: number;
        uri: string;
    };
}
