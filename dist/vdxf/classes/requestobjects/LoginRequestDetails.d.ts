/**
 * LoginRequestDetails - Class for handling application login and authentication requests
 *
 * This class is used when an application is requesting authentication or login from the user,
 * including specific permissions and callback information. The request includes:
 * - Request ID for tracking the authentication session
 * - Permission sets defining what access the application is requesting
 * - Callback URIs for post-authentication redirects
 * - Optional expiry time for the authentication session
 *
 * The user's wallet can use these parameters to present a clear authentication request
 * to the user, showing exactly what permissions are being requested and where they will
 * be redirected after successful authentication. This enables secure, user-controlled
 * authentication flows with granular permission management.
 */
import { BigNumber } from "../../../utils/types/BigNumber";
import { SerializableEntity } from "../../../utils/types/SerializableEntity";
import { CompactIdAddressObject, CompactIdAddressObjectJson } from "../CompactIdAddressObject";
export interface LoginRequestDetailsInterface {
    version?: BigNumber;
    flags?: BigNumber;
    requestId: string;
    permissions?: Array<LoginPermission>;
    callbackUris?: Array<callbackUris>;
    expiryTime?: BigNumber;
}
export interface LoginPermissionJson {
    type: number;
    identity: CompactIdAddressObjectJson;
}
export interface callbackUrisJson {
    type: number;
    uri: string;
}
export interface LoginPermission {
    type: number;
    identity: CompactIdAddressObject;
}
export interface callbackUris {
    type: number;
    uri: string;
}
export interface LoginRequestDetailsJson {
    version: number;
    requestid: string;
    flags: number;
    permissions?: Array<LoginPermissionJson>;
    callbackUris?: Array<callbackUrisJson>;
    expirytime?: number;
}
export declare class LoginRequestDetails implements SerializableEntity {
    version: BigNumber;
    flags?: BigNumber;
    requestId: string;
    permissions?: Array<LoginPermission>;
    callbackUris?: Array<callbackUris>;
    expiryTime?: BigNumber;
    static DEFAULT_VERSION: import("bn.js");
    static VERSION_FIRSTVALID: import("bn.js");
    static VERSION_LASTVALID: import("bn.js");
    static FLAG_HAS_PERMISSIONS: import("bn.js");
    static FLAG_HAS_CALLBACK_URI: import("bn.js");
    static FLAG_HAS_EXPIRY_TIME: import("bn.js");
    static REQUIRED_ID: number;
    static REQUIRED_SYSTEM: number;
    static REQUIRED_PARENT: number;
    static TYPE_WEBHOOK: number;
    static TYPE_REDIRECT: number;
    static TYPE_DEEPLINK: number;
    constructor(request?: LoginRequestDetailsInterface);
    hasPermissions(): boolean;
    hascallbackUris(): boolean;
    hasExpiryTime(): boolean;
    getByteLength(): number;
    toBuffer(): Buffer;
    fromBuffer(buffer: Buffer, offset?: number): number;
    toJson(): {
        version: number;
        flags: number;
        requestid: string;
        permissions: {
            type: number;
            identity: any;
        }[];
        callbackUris: callbackUris[];
        expirytime: number;
    };
    static fromJson(data: LoginRequestDetailsJson): LoginRequestDetails;
    setFlags(): void;
    isValid(): boolean;
}
