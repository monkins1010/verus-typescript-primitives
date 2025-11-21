"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataResponseOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const DataResponse_1 = require("../response/DataResponse");
class DataResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new DataResponse_1.DataResponse()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_DATA_RESPONSE,
            data: request.data
        }, DataResponse_1.DataResponse);
    }
    static fromJson(details) {
        return new DataResponseOrdinalVdxfObject({
            data: DataResponse_1.DataResponse.fromJson(details.data)
        });
    }
}
exports.DataResponseOrdinalVdxfObject = DataResponseOrdinalVdxfObject;
