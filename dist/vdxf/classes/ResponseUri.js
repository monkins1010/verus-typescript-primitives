"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUri = void 0;
const bn_js_1 = require("bn.js");
const varint_1 = require("../../utils/varint");
const varuint_1 = require("../../utils/varuint");
const bufferutils_1 = require("../../utils/bufferutils");
class ResponseUri {
    constructor(uri) {
        if (uri != null) {
            this.uri = uri;
        }
    }
    getUriString() {
        return this.uri.toString('utf-8');
    }
    static fromUriString(str) {
        return new ResponseUri(Buffer.from(str, 'utf-8'));
    }
    getByteLength() {
        let length = 0;
        length += varint_1.default.encodingLength(this.type);
        let uriBufLen = this.uri.length;
        length += varuint_1.default.encodingLength(uriBufLen);
        length += uriBufLen;
        return length;
    }
    toBuffer() {
        const writer = new bufferutils_1.default.BufferWriter(Buffer.alloc(this.getByteLength()));
        writer.writeVarInt(this.type);
        writer.writeVarSlice(this.uri);
        return writer.buffer;
    }
    fromBuffer(buffer, offset) {
        const reader = new bufferutils_1.default.BufferReader(buffer, offset);
        this.type = reader.readVarInt();
        this.uri = reader.readVarSlice();
        return reader.offset;
    }
    toJson() {
        return {
            type: this.type.toNumber(),
            uri: this.getUriString()
        };
    }
}
exports.ResponseUri = ResponseUri;
ResponseUri.TYPE_INVALID = new bn_js_1.BN(0, 10);
ResponseUri.TYPE_REDIRECT = new bn_js_1.BN(1, 10);
ResponseUri.TYPE_POST = new bn_js_1.BN(2, 10);
