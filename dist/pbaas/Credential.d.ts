/// <reference types="bn.js" />
/// <reference types="node" />
import { BigNumber } from '../utils/types/BigNumber';
import { SerializableEntity } from '../utils/types/SerializableEntity';
export interface CredentialJson {
    version: number;
    flags: number;
    credentialkey: string;
    credential?: object;
    scopes: object;
    label: string;
}
export declare class Credential implements SerializableEntity {
    version: BigNumber;
    flags: BigNumber;
    credential_key: string;
    credential: object;
    scopes: object;
    label: string;
    static FIRST_VERSION: import("bn.js");
    static LAST_VERSION: import("bn.js");
    static CURRENT_VERSION: import("bn.js");
    static FLAG_LABEL_PRESENT: import("bn.js");
    static MAX_JSON_STRING_LENGTH: number;
    constructor(data?: any);
    calcFlags(): import("bn.js");
    setFlags(): void;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    isValid(): boolean;
    toJson(): CredentialJson;
    static fromJson(data: CredentialJson): Credential;
}
