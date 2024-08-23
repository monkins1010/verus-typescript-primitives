import { ApiRequest } from "../../ApiRequest";
import { RequestParams, ApiPrimitiveJson } from "../../ApiPrimitive";
export declare class GetIdentityContentRequest extends ApiRequest {
    nameOrAddress: string;
    height?: number;
    txproof?: boolean;
    txproofheight?: number;
    vdxfkey?: string;
    constructor(chain: string, nameOrAddress: string, height?: number, txproof?: boolean, txproofheight?: number, vdxfkey?: string);
    getParams(): RequestParams;
    static fromJson(object: ApiPrimitiveJson): GetIdentityContentRequest;
    toJson(): ApiPrimitiveJson;
}
