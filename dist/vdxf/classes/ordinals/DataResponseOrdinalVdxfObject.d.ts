import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { DataResponse, DataResponseJson } from "../response/DataResponse";
export declare class DataResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: DataResponse;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<DataResponse>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<DataResponseJson>): DataResponseOrdinalVdxfObject;
}
