"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossChainDataRef = void 0;
const bufferutils_1 = require("../utils/bufferutils");
const PBaaSEvidenceRef_1 = require("./PBaaSEvidenceRef");
const IdentityMultimapRef_1 = require("./IdentityMultimapRef");
const URLRef_1 = require("./URLRef");
const { BufferReader, BufferWriter } = bufferutils_1.default;
class CrossChainDataRef {
    constructor(data) {
        this.ref = data || null;
    }
    which() {
        if (this.ref instanceof PBaaSEvidenceRef_1.PBaaSEvidenceRef) {
            return CrossChainDataRef.TYPE_CROSSCHAIN_DATAREF;
        }
        else if (this.ref instanceof IdentityMultimapRef_1.IdentityMultimapRef) {
            return CrossChainDataRef.TYPE_IDENTITY_DATAREF;
        }
        else if (this.ref instanceof URLRef_1.URLRef) {
            return CrossChainDataRef.TYPE_URL_REF;
        }
    }
    getByteLength() {
        let byteLength = 1; //type uint8
        byteLength += this.ref.getByteLength();
        return byteLength;
    }
    toBuffer() {
        const bufferWriter = new BufferWriter(Buffer.alloc(this.getByteLength()));
        bufferWriter.writeUInt8(this.which());
        bufferWriter.writeSlice(this.ref.toBuffer());
        return bufferWriter.buffer;
    }
    fromBuffer(buffer, offset = 0) {
        const reader = new BufferReader(buffer, offset);
        const type = reader.readUInt8();
        if (type == CrossChainDataRef.TYPE_CROSSCHAIN_DATAREF) {
            this.ref = new PBaaSEvidenceRef_1.PBaaSEvidenceRef();
        }
        else if (type == CrossChainDataRef.TYPE_IDENTITY_DATAREF) {
            this.ref = new IdentityMultimapRef_1.IdentityMultimapRef();
        }
        else if (type == CrossChainDataRef.TYPE_URL_REF) {
            this.ref = new URLRef_1.URLRef();
        }
        offset = this.ref.fromBuffer(buffer, reader.offset);
        return reader.offset;
    }
    isValid() {
        return (typeof (this.ref) == typeof (PBaaSEvidenceRef_1.PBaaSEvidenceRef) && this.ref.isValid()) ||
            (typeof (this.ref) == typeof (IdentityMultimapRef_1.IdentityMultimapRef) && this.ref.isValid()) ||
            (typeof (this.ref) == typeof (URLRef_1.URLRef) && this.ref.isValid());
    }
    toJson() {
        return this.ref.toJson();
    }
}
exports.CrossChainDataRef = CrossChainDataRef;
CrossChainDataRef.TYPE_CROSSCHAIN_DATAREF = 0;
CrossChainDataRef.TYPE_IDENTITY_DATAREF = 1;
CrossChainDataRef.TYPE_URL_REF = 2;
