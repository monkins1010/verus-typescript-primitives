import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { DataDescriptorResponse, DataDescriptorResponseJson } from "../response/DataDescriptorResponse";
export declare class DataDescriptorResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: DataDescriptorResponse;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<DataDescriptorResponse>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataDescriptorResponseJson>): DataDescriptorResponseOrdinalVdxfObject;
}
