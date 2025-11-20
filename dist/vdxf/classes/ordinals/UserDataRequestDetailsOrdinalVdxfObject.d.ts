import { SerializableDataEntity } from "../../../utils/types/SerializableEntity";
import { OrdinalVdxfObjectInterfaceTemplate, OrdinalVdxfObjectJsonTemplate } from "./OrdinalVdxfObject";
import { SerializableEntityOrdinalVdxfObject } from "./SerializableEntityOrdinalVdxfObject";
import { UserDataRequestDetails, UserDataRequestDetailsJson } from "../requestobjects/UserDataRequestDetails";
export declare class UserDataRequestDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject implements SerializableDataEntity {
    data: UserDataRequestDetails;
    constructor(request?: OrdinalVdxfObjectInterfaceTemplate<UserDataRequestDetails>);
    static fromJson(details: OrdinalVdxfObjectJsonTemplate<UserDataRequestDetailsJson>): UserDataRequestDetailsOrdinalVdxfObject;
}
