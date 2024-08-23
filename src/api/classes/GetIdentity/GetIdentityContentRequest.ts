import { ApiRequest } from "../../ApiRequest";
import { RequestParams, ApiPrimitiveJson } from "../../ApiPrimitive";
import { GET_IDENTITY_CONTENT } from "../../../constants/cmds";

export class GetIdentityContentRequest extends ApiRequest {
  nameOrAddress: string;
  height?: number;
  txproof?: boolean;
  txproofheight?: number;
  vdxfkey?: string;

  constructor(
    chain: string,
    nameOrAddress: string,
    height?: number,
    txproof?: boolean,
    txproofheight?: number,
    vdxfkey?: string
  ) {
    super(chain, GET_IDENTITY_CONTENT);
    this.nameOrAddress = nameOrAddress;
    this.height = height;
    this.txproof = txproof;
    this.txproofheight = txproofheight;
    this.vdxfkey = vdxfkey;
  }

  getParams(): RequestParams {
    const params = [
      this.nameOrAddress,
      this.height,
      this.txproof,
      this.txproofheight,
      this.vdxfkey
    ];

    return params.filter((x) => x != null);
  }

  static fromJson(object: ApiPrimitiveJson): GetIdentityContentRequest {
    return new GetIdentityContentRequest(
      object.chain as string,
      object.nameOrAddress as string,
      object.height != null ? (object.height as number) : undefined,
      object.txproof != null ? (object.txproof as boolean) : undefined,
      object.txproofheight != null ? (object.txproof as number) : undefined,
      object.vdxfkey != null ? (object.vdxfkey as string) : undefined
    );
  }

  toJson(): ApiPrimitiveJson {
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
