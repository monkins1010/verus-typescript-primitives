import { ApiResponse } from "../../ApiResponse";
import { Signature } from "../../../utils/types/Signature";
import { mmrDescriptorParameters } from "../../../utils/types/MmrDescriptor";
import { DataDescriptor } from "../../../utils/types/DataDescriptor";

export class SignDataResponse extends ApiResponse {
  result: {
    mmrdescriptor_encrypted?: mmrDescriptorParameters;
    mmrdescriptor?: mmrDescriptorParameters;
    signature?: string;
    signaturedata_encrypted?: DataDescriptor;
    signaturedata_ssk?: string;
    signaturedata?: Signature;
    system?: string;
    systemid?: string;
    hashtype?: string;
    mmrhashtype?: string;
    hash?: string;
    identity?: string;
    canonicalname?: string;
    address?: string;
    signatureheight?: number;
  };
}