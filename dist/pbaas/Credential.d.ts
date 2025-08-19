import { BigNumber } from "../utils/types/BigNumber";
import { SerializableEntity } from "../utils/types/SerializableEntity";
export type CredentialJson = {
    version?: number;
    flags?: number;
    credentialkey?: string;
    credential?: Object;
    scopes?: Object;
    label?: string;
};
export declare class Credential implements SerializableEntity {
    static VERSION_INVALID: import("bn.js");
    static VERSION_FIRST: import("bn.js");
    static VERSION_LAST: import("bn.js");
    static VERSION_CURRENT: import("bn.js");
    static FLAG_LABEL_PRESENT: import("bn.js");
    static MAX_JSON_STRING_LENGTH: number;
    version: BigNumber;
    flags: BigNumber;
    credentialKey: string;
    credential: Object;
    scopes: Object;
    label: string;
    constructor(data?: {
        version?: BigNumber;
        flags?: BigNumber;
        credentialKey?: string;
        credential?: Object;
        scopes?: Object;
        label?: string;
    });
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    hasLabel(): boolean;
    calcFlags(): BigNumber;
    setFlags(): void;
    isValid(): boolean;
    toJson(): CredentialJson;
    static fromJson(json: CredentialJson): Credential;
}
