"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetIdentityContentRequest = void 0;
const ApiRequest_1 = require("../../ApiRequest");
const cmds_1 = require("../../../constants/cmds");
class GetIdentityContentRequest extends ApiRequest_1.ApiRequest {
    constructor(chain, nameOrAddress, height, txproof, txproofheight, vdxfkey) {
        super(chain, cmds_1.GET_IDENTITY_CONTENT);
        this.nameOrAddress = nameOrAddress;
        this.height = height;
        this.txproof = txproof;
        this.txproofheight = txproofheight;
        this.vdxfkey = vdxfkey;
    }
    getParams() {
        const params = [
            this.nameOrAddress,
            this.height,
            this.txproof,
            this.txproofheight,
            this.vdxfkey
        ];
        return params.filter((x) => x != null);
    }
    static fromJson(object) {
        return new GetIdentityContentRequest(object.chain, object.nameOrAddress, object.height != null ? object.height : undefined, object.txproof != null ? object.txproof : undefined, object.txproofheight != null ? object.txproof : undefined, object.vdxfkey != null ? object.vdxfkey : undefined);
    }
    toJson() {
        return {
            chain: this.chain,
            nameOrAddress: this.nameOrAddress,
            height: this.height,
            txproof: this.txproof,
            txproofheight: this.txproofheight,
            vdxfkey: this.vdxfkey
        };
    }
}
exports.GetIdentityContentRequest = GetIdentityContentRequest;
