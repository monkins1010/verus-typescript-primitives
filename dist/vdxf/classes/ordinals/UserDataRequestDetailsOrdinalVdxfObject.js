"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataRequestDetailsOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const UserDataRequestDetails_1 = require("../requestobjects/UserDataRequestDetails");
class UserDataRequestDetailsOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new UserDataRequestDetails_1.UserDataRequestDetails()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_USER_DATA_REQUEST,
            data: request.data
        }, UserDataRequestDetails_1.UserDataRequestDetails);
    }
    static fromJson(details) {
        return new UserDataRequestDetailsOrdinalVdxfObject({
            data: UserDataRequestDetails_1.UserDataRequestDetails.fromJson(details.data)
        });
    }
}
exports.UserDataRequestDetailsOrdinalVdxfObject = UserDataRequestDetailsOrdinalVdxfObject;
