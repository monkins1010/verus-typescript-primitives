"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataDescriptorResponseOrdinalVdxfObject = void 0;
const ordinals_1 = require("../../../constants/ordinals/ordinals");
const SerializableEntityOrdinalVdxfObject_1 = require("./SerializableEntityOrdinalVdxfObject");
const DataDescriptorResponse_1 = require("../response/DataDescriptorResponse");
class DataDescriptorResponseOrdinalVdxfObject extends SerializableEntityOrdinalVdxfObject_1.SerializableEntityOrdinalVdxfObject {
    constructor(request = {
        data: new DataDescriptorResponse_1.DataDescriptorResponse()
    }) {
        super({
            type: ordinals_1.VDXF_ORDINAL_DATA_DESCRIPTOR_RESPONSE,
            data: request.data
        }, DataDescriptorResponse_1.DataDescriptorResponse);
    }
    static fromJson(details) {
        return new DataDescriptorResponseOrdinalVdxfObject({
            data: DataDescriptorResponse_1.DataDescriptorResponse.fromJson(details.data)
        });
    }
}
exports.DataDescriptorResponseOrdinalVdxfObject = DataDescriptorResponseOrdinalVdxfObject;
